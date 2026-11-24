/**
 * Git 能力封装：只通过 execFile 以参数数组调用 git，绝不经过 shell。
 *
 * 所有写操作（checkout / create / fetch / clone）都先做参数形态校验，
 * 避免以 `-` 开头的值被 git 当作选项解析。
 */
import { execFile } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { stat } from 'node:fs/promises'
import { join } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

/** 单条 git 命令的超时（克隆/拉取可能较慢）。 */
const GIT_TIMEOUT_MS = 120_000
/** 输出缓冲上限，避免超大 diff 把内存打满。 */
const GIT_MAX_BUFFER = 8 * 1024 * 1024
/** 合法分支名：首字符字母数字，之后允许 . _ / -。 */
const BRANCH_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]*$/
/** 合法远程地址：仅允许网络传输协议（http/https/ssh/git）与 scp 风格 user@host:path。 */
const REMOTE_URL_PATTERN = /^(https?:\/\/\S+|ssh:\/\/\S+|git:\/\/\S+|file:\/\/\S+|git@[^:\s]+:\S+)$/

/** Git 操作失败。 */
export class GitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GitError'
  }
}

/** 本仓库的一个本地分支。 */
export interface LocalBranch {
  name: string
  current: boolean
  upstream?: string
  /** 最近一次提交的 Unix 秒（排序用，可能缺失）。 */
  committedAt?: number
}

/** 一个远端跟踪分支。 */
export interface RemoteBranch {
  name: string
  /** 最近一次提交的 Unix 秒（排序用，可能缺失）。 */
  committedAt?: number
}

/** 分支快照。 */
export interface BranchSnapshot {
  current: string | null
  detached: boolean
  local: LocalBranch[]
  remote: RemoteBranch[]
}

/** 校验分支名，非法即抛错。 */
export function assertBranchName(branch: string): string {
  const name = branch.trim()
  if (!BRANCH_NAME_PATTERN.test(name) || name.includes('..') || name.endsWith('/')) {
    throw new GitError(`非法分支名: ${branch}`)
  }
  return name
}

/** 校验远程地址，非法即抛错。 */
export function assertRemoteUrl(url: string): string {
  const value = url.trim()
  if (value.startsWith('-') || !REMOTE_URL_PATTERN.test(value)) {
    throw new GitError(`非法远程地址: ${url}`)
  }
  return value
}

/** 远程仓库凭证（明文只在进程内使用）。 */
export interface GitAuth {
  username: string
  password: string
}

/** askpass 脚本路径：由 configureAskpass 注入，未配置时 git 会走交互/失败。 */
let askpassPath: string | null = null

/**
 * 配置凭证注入：写一个只读脚本，git 通过 GIT_ASKPASS 调用它取用户名/令牌。
 * @param dir - 存放脚本的目录（0600/0700）
 */
export async function configureAskpass(dir: string): Promise<void> {
  const { mkdir, writeFile, chmod } = await import('node:fs/promises')
  const { join } = await import('node:path')
  await mkdir(dir, { recursive: true })
  const script = join(dir, 'askpass.sh')
  // 注意：printf 的格式串必须加引号，否则未加引号的 \n 会被 shell 转义成字面 n
  // （曾导致 git 收到的用户名/密码末尾多出一个 n，认证一直失败）
  const body = [
    '#!/bin/sh',
    'case "$1" in',
    "  *sername*) printf '%s\\n' \"$ASC_USER\" ;;",
    "  *) printf '%s\\n' \"$ASC_PASS\" ;;",
    'esac',
    '',
  ].join('\n')
  await writeFile(script, body, { mode: 0o700 })
  await chmod(script, 0o700).catch(() => undefined)
  askpassPath = script
}

/**
 * 组装 git 子进程环境：有凭证时挂上 askpass，避免令牌出现在命令行或 URL 里。
 * @param auth - 可选凭证
 */
function envFor(auth?: GitAuth): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  if (auth && askpassPath) {
    env.GIT_ASKPASS = askpassPath
    env.ASC_USER = auth.username
    env.ASC_PASS = auth.password
    env.GIT_TERMINAL_PROMPT = '0'
  }
  return env
}

/** 执行一条 git 命令并返回 stdout。 */
async function git(args: string[], cwd?: string, auth?: GitAuth): Promise<string> {
  try {
    const result = await execFileAsync('git', args, {
      cwd,
      timeout: GIT_TIMEOUT_MS,
      maxBuffer: GIT_MAX_BUFFER,
      env: envFor(auth),
    })
    return result.stdout
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr?.trim()
    throw new GitError(stderr && stderr !== '' ? stderr : `git ${args[0]} 执行失败`)
  }
}

/** 一次提交的摘要信息（文件清单已限流，避免合并提交把上下文撑爆）。 */
export interface CommitDetail {
  sha: string
  shortSha: string
  author: string
  date: string
  subject: string
  parents: number
  files: string[]
  filesTotal: number
  truncated: boolean
}

/**
 * 读取某次提交的摘要与文件清单。
 *
 * 合并提交的 `git show`/`git diff` 可能一口气输出数万字符，所以这里只取
 * `--name-only` 的清单并按上限截断；需要看具体改动内容时再按文件定点读取。
 * @param cwd - 成员仓库目录
 * @param ref - 提交引用，默认 HEAD
 * @param limit - 文件清单上限，默认 40
 * @returns 提交摘要与（截断后的）文件清单
 */
export async function commitDetail(cwd: string, ref = 'HEAD', limit = 40): Promise<CommitDetail> {
  const head = await git(['log', '-1', '--format=%H%x1f%h%x1f%an%x1f%ad%x1f%s', '--date=iso', ref], cwd)
  const [sha, shortSha, author, date, subject] = head.trim().split('\u001f')
  if (!sha) throw new GitError(`找不到提交：${ref}`)
  const parentsLine = await git(['show', '--no-patch', '--format=%P', ref], cwd)
  const parents = parentsLine.trim() === '' ? 0 : parentsLine.trim().split(/\s+/).length
  // 合并提交的 `git show --name-only` 默认什么都不输出（git 不隐式展开合并差异），
  // 这里改用 first-parent 差异：即"这次合并带进本分支的改动"。
  const names = (parents > 1
    ? await git(['diff', '--name-only', `${ref}^1`, ref], cwd)
    : await git(['show', '--name-only', '--format=', ref], cwd))
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
  const files = names.slice(0, Math.max(1, limit))
  return {
    sha,
    shortSha: shortSha ?? sha.slice(0, 8),
    author: author ?? '',
    date: date ?? '',
    subject: subject ?? '',
    parents,
    files,
    filesTotal: names.length,
    truncated: names.length > files.length,
  }
}

/**
 * 读取某次提交的（有界）补丁文本。
 *
 * 想看"具体改了什么"时，模型过去会用 `git diff HEAD^1 HEAD | head -N` 分段读，
 * 一次提问能跑 5 次、三万字符。这里统一取 first-parent 差异并**按行截断**，
 * 合并提交也能给出"这次合并带进本分支的改动"。
 * @param cwd - 成员仓库目录
 * @param ref - 提交引用，默认 HEAD
 * @param limit - 最多返回多少行 diff，默认 120
 * @returns 补丁文本与是否被截断
 */
export async function commitPatch(cwd: string, ref = 'HEAD', limit = 120): Promise<{ text: string; truncated: boolean; lines: number }> {
  const parentsLine = await git(['show', '--no-patch', '--format=%P', ref], cwd)
  const parents = parentsLine.trim() === '' ? 0 : parentsLine.trim().split(/\s+/).length
  const args = parents > 1
    ? ['diff', '--no-color', '--unified=2', `${ref}^1`, ref]
    : ['show', '--no-color', '--unified=2', '--format=', ref]
  const raw = await git(args, cwd)
  const lines = raw.split('\n')
  const cap = Math.min(Math.max(limit, 20), 400)
  if (lines.length <= cap) return { text: raw.trimEnd(), truncated: false, lines: lines.length }
  return { text: lines.slice(0, cap).join('\n').trimEnd(), truncated: true, lines: lines.length }
}

/** 判断路径是否为目录。 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await stat(path)).isDirectory()
  } catch {
    return false
  }
}

/**
 * 快速判断目录里是否有 Git 仓库（只看 `.git` 在不在，不起子进程）。
 *
 * `isGitRepository` 要跑一次 `git rev-parse`，而列表页要为每个空间的每个成员判断：
 * 30 成员 × 2 空间就是 60 条子进程，首屏直接拖到数秒。Ascoder 物化出来的成员一定带
 * `.git`（普通克隆是目录，worktree 是文件），所以列表场景用这个足够；
 * 真正操作 git 之前仍会用 isGitRepository 复核。
 * @param path - 成员目录
 * @returns 是否存在 `.git` 条目
 */
export async function hasGitDir(path: string): Promise<boolean> {
  try {
    const info = await stat(join(path, '.git'))
    return info.isDirectory() || info.isFile()
  } catch {
    return false
  }
}

/** 判断路径是否为 Git 工作区根或子目录。 */
export async function isGitRepository(path: string): Promise<boolean> {
  if (!(await isDirectory(path))) return false
  try {
    return (await git(['rev-parse', '--is-inside-work-tree'], path)).trim() === 'true'
  } catch {
    return false
  }
}

/**
 * 当前分支；detached HEAD 返回 null。
 *
 * 先用 `symbolic-ref`：旧版 Ascoder 的仓库克隆 HEAD 指向不存在的分支（refs/heads 为空），
 * 这时 `rev-parse --abbrev-ref HEAD` 会直接报 "ambiguous argument 'HEAD'"，
 * 而 symbolic-ref 仍能读出约定的分支名，菜单/分支列表因此不会整体失败。
 */
export async function currentBranch(path: string): Promise<string | null> {
  try {
    const symbolic = (await git(['symbolic-ref', '--short', '--quiet', 'HEAD'], path)).trim()
    if (symbolic !== '') return symbolic
  } catch {
    // detached HEAD 或没有 HEAD：继续按提交判断
  }
  try {
    const name = (await git(['rev-parse', '--abbrev-ref', 'HEAD'], path)).trim()
    return name === '' || name === 'HEAD' ? null : name
  } catch {
    return null
  }
}

/** 工作区未提交改动条数（含未跟踪文件）。 */
export async function dirtyCount(path: string): Promise<number> {
  const output = await git(['status', '--porcelain=v1', '--untracked-files=normal'], path)
  return output.split('\n').filter((line) => line.trim() !== '').length
}

/** origin 的远程地址；没有 origin 时返回 undefined。 */
export async function originUrl(path: string): Promise<string | undefined> {
  try {
    const value = (await git(['remote', 'get-url', 'origin'], path)).trim()
    return value === '' ? undefined : value
  } catch {
    return undefined
  }
}

/** 分支快照：本地分支（含 upstream）+ 远端跟踪分支。 */
export async function listBranches(path: string): Promise<BranchSnapshot> {
  const [current, localRaw, remoteRaw] = await Promise.all([
    currentBranch(path),
    git(['for-each-ref', '--format=%(refname:short)%09%(upstream:short)%09%(committerdate:unix)', 'refs/heads'], path),
    git(['for-each-ref', '--format=%(refname:short)%09%(committerdate:unix)', 'refs/remotes'], path),
  ])
  const local: LocalBranch[] = localRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .map((line) => {
      const [name, upstream, committedAt] = line.split('\t')
      const stamp = Number(committedAt)
      return {
        name,
        current: name === current,
        ...(upstream ? { upstream } : {}),
        ...(Number.isFinite(stamp) && stamp > 0 ? { committedAt: stamp } : {}),
      }
    })
  const remote: RemoteBranch[] = remoteRaw
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.endsWith('/HEAD'))
    .map((line) => {
      const [name, committedAt] = line.split('\t')
      const stamp = Number(committedAt)
      return {
        name,
        ...(Number.isFinite(stamp) && stamp > 0 ? { committedAt: stamp } : {}),
      }
    })
  return { current, detached: current === null, local, remote }
}

/** 切换到已存在的本地分支。 */
export async function checkoutBranch(path: string, branch: string): Promise<void> {
  const name = assertBranchName(branch)
  await git(['checkout', '--quiet', name], path)
}

/** 基于当前 HEAD 新建并切换分支。 */
export async function createBranch(path: string, branch: string): Promise<void> {
  const name = assertBranchName(branch)
  await git(['checkout', '--quiet', '-b', name], path)
}

/** 基于远端跟踪分支创建本地分支并切换（`git checkout -B x origin/x`）。 */
export async function checkoutTrackingBranch(path: string, branch: string): Promise<void> {
  const name = assertBranchName(branch)
  await git(['checkout', '--quiet', '-B', name, `origin/${name}`], path)
}

/** 拉取所有远端并清理失效的跟踪分支（可带凭证）。 */
export async function fetchAllWithAuth(path: string, auth?: GitAuth): Promise<void> {
  await git(['fetch', '--all', '--prune', '--quiet'], path, auth)
}

/** HEAD 是否是上游分支的祖先（能快进）；上游不存在或命令失败时返回 false。 */
export async function canFastForward(path: string): Promise<boolean> {
  try {
    await git(['rev-parse', '--quiet', '@{upstream}'], path)
    await git(['merge-base', '--is-ancestor', 'HEAD', '@{upstream}'], path)
    return true
  } catch {
    return false
  }
}

/** 把当前分支强制对齐到上游（只读分析空间用：本地与远端分叉时替代 ff-only）。 */
export async function resetHardToUpstream(path: string): Promise<void> {
  await git(['fetch', '--quiet'], path)
  await git(['reset', '--hard', '--quiet', '@{upstream}'], path)
}

/** 快进拉取（可带凭证）。 */
export async function pullFastForwardWithAuth(path: string, auth?: GitAuth): Promise<void> {
  await git(['pull', '--ff-only', '--quiet'], path, auth)
}

/**
 * 从源克隆导入单个分支的引用（不联网）。
 *
 * 旧版 Ascoder 的仓库克隆只有 refs/remotes/origin/*、没有本地分支，
 * 本地克隆到目标目录后这些引用不会跟过来；这里用同一个对象库里的提交直接补上
 * refs/remotes/origin/<branch>，再让调用方检出。
 */
export async function importRefFromSource(
  target: string,
  source: string,
  branch: string,
): Promise<void> {
  const name = assertBranchName(branch)
  const sha = (await git(['rev-parse', '--verify', '--quiet', `refs/remotes/origin/${name}`], source)).trim()
  if (sha === '') throw new GitError(`源仓库没有 refs/remotes/origin/${name}`)
  await git(['update-ref', `refs/remotes/origin/${name}`, sha], target)
}

/** 从远端抓取单个分支到 origin/<branch>（本地克隆缺少该分支时用）。 */
export async function fetchBranchFromRemote(
  path: string,
  url: string,
  branch: string,
  auth?: GitAuth,
): Promise<void> {
  const name = assertBranchName(branch)
  const remote = assertRemoteUrl(url)
  await git(['fetch', '--quiet', '--no-tags', remote, `+refs/heads/${name}:refs/remotes/origin/${name}`], path, auth)
}

/** 带凭证克隆远程仓库。 */
export async function cloneRepositoryWithAuth(url: string, destination: string, auth?: GitAuth): Promise<void> {
  await git(['clone', '--quiet', assertRemoteUrl(url), destination], undefined, auth)
}

/** 拉取所有远端并清理失效的跟踪分支。 */
export async function fetchAll(path: string): Promise<void> {
  await git(['fetch', '--all', '--prune'], path)
}

/** 快进拉取（工作区有本地改动时失败，符合只读空间的预期）。 */
export async function pullFastForward(path: string): Promise<void> {
  await git(['pull', '--ff-only', '--quiet'], path)
}

/** 重设 origin 地址（本地克隆后指向真实远端，pull/fetch 才有分支可取）。 */
export async function setRemoteUrl(path: string, url: string): Promise<void> {
  const remote = assertRemoteUrl(url)
  await git(['remote', 'set-url', 'origin', remote], path)
}

/** 把当前分支的上游设为 origin/<branch>（同步时 pull 需要）。 */
export async function setUpstream(path: string, branch: string): Promise<void> {
  const name = assertBranchName(branch)
  await git(['branch', '--set-upstream-to', `origin/${name}`, name], path)
}

/** 把简单 glob（*、**、?）转成正则；其余字符按字面匹配。 */
function globToRegExp(glob: string): RegExp {
  let pattern = ''
  for (let index = 0; index < glob.length; index += 1) {
    const char = glob[index]
    if (char === '*') {
      if (glob[index + 1] === '*') {
        pattern += '.*'
        index += 1
      } else {
        pattern += '[^/]*'
      }
    } else if (char === '?') {
      pattern += '[^/]'
    } else {
      pattern += char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    }
  }
  return new RegExp(`^${pattern}$`)
}

/**
 * 列出仓库里已跟踪的文件（`git ls-files`），支持路径前缀与简单 glob，结果有上限。
 *
 * 用于替代 `find . -type f | sort` 这类全量列举（一次能返回 50KB）。
 */
export async function listRepositoryFiles(
  path: string,
  options: { pathPrefix?: string; glob?: string; maxFiles?: number } = {},
): Promise<{ files: string[]; truncated: boolean }> {
  const maxFiles = Math.min(Math.max(options.maxFiles ?? 80, 1), 300)
  const args = ['ls-files']
  if (options.pathPrefix) args.push('--', options.pathPrefix)
  let stdout = ''
  try {
    stdout = await git(args, path)
  } catch {
    return { files: [], truncated: false }
  }
  const rows = stdout.split('\n').filter((line) => line !== '')
  const matcher = options.glob ? globToRegExp(options.glob) : null
  const basenameMatcher = options.glob && !options.glob.includes('/') ? globToRegExp(options.glob) : null
  const matched = matcher
    ? rows.filter((file) => matcher.test(file) || (basenameMatcher?.test(file.split('/').pop() ?? '') ?? false))
    : rows
  return { files: matched.slice(0, maxFiles), truncated: matched.length > maxFiles }
}

/**
 * HEAD 提交改动的文件清单（有界）：替代 `git show --name-only` 这类一次列出上千文件、
 * 单次返回可达 50KB 的命令。
 *
 * @param path 仓库目录
 * @param limit 最多返回多少条路径（计数总是完整）
 */
export async function commitFiles(
  path: string,
  limit = 20,
): Promise<{ count: number; files: string[] }> {
  let stdout = ''
  try {
    stdout = await git(['show', '--name-only', '--format=', '--no-renames', 'HEAD'], path)
  } catch {
    return { count: 0, files: [] }
  }
  const files = stdout.split('\n').map((line) => line.trim()).filter((line) => line !== '')
  const capped = Math.min(Math.max(limit, 1), 100)
  return { count: files.length, files: files.slice(0, capped) }
}

/**
 * HEAD 提交的增删行统计（`git diff --numstat`，有界解析）：
 * 回答"改了什么"时给出行数规模，避免模型再跑 `git show --stat` 拉完整补丁。
 */
export async function commitDiffStat(path: string): Promise<{ insertions: number; deletions: number }> {
  let stdout = ''
  try {
    stdout = await git(['diff', '--numstat', 'HEAD^', 'HEAD'], path)
  } catch {
    return { insertions: 0, deletions: 0 }
  }
  let insertions = 0
  let deletions = 0
  for (const line of stdout.split('\n')) {
    const [added, removed] = line.split('\t')
    if (added === undefined || removed === undefined) continue
    const plus = Number(added)
    const minus = Number(removed)
    if (Number.isFinite(plus)) insertions += plus
    if (Number.isFinite(minus)) deletions += minus
  }
  return { insertions, deletions }
}

/** 单条检索命中。 */
export interface GrepMatch {
  file: string
  line: number
  text: string
}

/**
 * 在仓库里检索（`git grep`：只搜已跟踪文件、尊重 .gitignore、速度稳定）。
 *
 * @param path 仓库目录
 * @param query 关键词或正则（调用方负责校验，不能以 - 开头）
 * @param options 路径前缀、最多命中数、每条截断长度
 */
export async function grepRepository(
  path: string,
  query: string,
  options: { pathPrefix?: string; maxMatches?: number; maxLineLength?: number; extendedRegex?: boolean } = {},
): Promise<{ matches: GrepMatch[]; truncated: boolean }> {
  const maxMatches = options.maxMatches ?? 30
  const maxLineLength = options.maxLineLength ?? 200
  const args = ['grep', '-n', '-I', '--no-color']
  if (options.extendedRegex) args.push('-E')
  args.push('-e', query)
  // 多取一条用来判断是否被截断
  args.push('-m', String(maxMatches + 1))
  if (options.pathPrefix) args.push('--', options.pathPrefix)
  let stdout = ''
  try {
    stdout = await git(args, path)
  } catch (error) {
    // git grep 无命中时退出码为 1，会被 git() 当作失败
    const message = error instanceof Error ? error.message : ''
    if (!/^\s*$/.test(message)) return { matches: [], truncated: false }
    return { matches: [], truncated: false }
  }
  const rows: GrepMatch[] = []
  for (const raw of stdout.split('\n')) {
    if (raw === '') continue
    const first = raw.indexOf(':')
    const second = raw.indexOf(':', first + 1)
    if (first < 0 || second < 0) continue
    const line = Number(raw.slice(first + 1, second))
    if (!Number.isFinite(line)) continue
    rows.push({
      file: raw.slice(0, first),
      line,
      text: raw.slice(second + 1, second + 1 + maxLineLength).trim(),
    })
  }
  const truncated = rows.length > maxMatches
  return { matches: rows.slice(0, maxMatches), truncated }
}

/** 读取 HEAD 的短 sha、提交标题与提交时间（无提交时返回空串）。 */
export async function headInfo(path: string): Promise<{ sha: string; subject: string; committedAt: string }> {
  try {
    const raw = (await git(['log', '-1', '--pretty=%h%x09%s%x09%cI'], path)).trim()
    const [sha = '', subject = '', committedAt = ''] = raw.split('\t')
    return { sha, subject, committedAt }
  } catch {
    return { sha: '', subject: '', committedAt: '' }
  }
}

/** 与上游分支的领先/落后提交数（没有上游时返回 null）。 */
export async function aheadBehind(path: string): Promise<{ ahead: number; behind: number } | null> {
  try {
    const raw = (await git(['rev-list', '--left-right', '--count', '@{upstream}...HEAD'], path)).trim()
    const [behind, ahead] = raw.split(/\s+/).map((value) => Number(value))
    if (!Number.isFinite(ahead) || !Number.isFinite(behind)) return null
    return { ahead, behind }
  } catch {
    return null
  }
}

/** 读取仓库的 origin 地址（没有远端时返回 null）。 */
export async function remoteUrlOf(path: string): Promise<string | null> {
  try {
    const stdout = await git(['remote', 'get-url', 'origin'], path)
    const url = stdout.trim()
    return url === '' ? null : url
  } catch {
    return null
  }
}

/** 克隆本地仓库到目标目录。 */
export interface LocalCloneOptions {
  /**
   * 共享源仓库的对象（`git clone --reference`）。
   *
   * 同一个仓库被多个分支空间物化时，各自完整拷贝对象会成倍占用磁盘
   * （旧版仓库单库可达 8G）。共享模式下 `.git/objects/info/alternates` 指向源仓库，
   * 本地只存自己的增量对象与工作区。代价是源仓库不能删除。
   */
  reference?: boolean
}

/** 克隆本地仓库到目标目录（默认完整拷贝，可选共享对象库）。 */
export async function cloneLocalRepository(
  source: string,
  destination: string,
  options: LocalCloneOptions = {},
): Promise<void> {
  if (options.reference) {
    // 用 file:// 走传输协议：本地路径克隆会走 git 的 local 优化，把对象整份复制，
    // 这样 --reference 只是多写一个 alternates 文件，省不了空间。
    const url = pathToFileURL(source).href
    await git(['clone', '--quiet', '--reference', source, url, destination])
    return
  }
  await git(['clone', '--quiet', '--no-hardlinks', source, destination])
}

/** 目标仓库是否共享了源仓库的对象库。 */
export async function sharedObjectsSource(path: string): Promise<string | null> {
  const { readFile } = await import('node:fs/promises')
  const { join } = await import('node:path')
  try {
    const text = await readFile(join(path, '.git', 'objects', 'info', 'alternates'), 'utf8')
    const first = text.split('\n').map((line) => line.trim()).find((line) => line !== '')
    return first ?? null
  } catch {
    return null
  }
}

/** 克隆远程仓库到目标目录。 */
export async function cloneRepository(url: string, destination: string): Promise<void> {
  const remote = assertRemoteUrl(url)
  await git(['clone', '--quiet', remote, destination])
}

/**
 * 把常见 git 报错翻译成可操作的中文提示。
 *
 * 原始 stderr（如 `fatal: couldn't find remote ref refs/heads/hotfix/4.3.5`）对使用者
 * 没有指导意义，这里映射成"缺什么、下一步做什么"。
 * @param message - git 原始报错
 * @returns 面向使用者的提示（无法识别时原样返回）
 */
export function friendlyGitError(message: string): string {
  const text = message.trim()
  const missingRef = /couldn't find remote ref (?:refs\/heads\/)?([^\s'"]+)/i.exec(text)
  if (missingRef) return `远端没有分支 ${missingRef[1]}：确认分支名，或先更新仓库（fetch）后再试`
  if (/Remote branch .* not found/i.test(text)) return '远端没有该分支：确认分支名，或先更新仓库后再试'
  if (/Authentication failed|could not read Username|terminal prompts disabled|Permission denied \(publickey\)/i.test(text)) {
    return '仓库认证失败：检查仓库地址与凭证配置'
  }
  if (/not a git repository/i.test(text)) return '目录不是 git 仓库'
  if (/would be overwritten by checkout|Your local changes/i.test(text)) return '本地有未提交改动，无法切换分支'
  if (/could not resolve host|Connection (timed out|refused)/i.test(text)) return '无法连接远端仓库：检查网络或仓库地址'
  return text
}
