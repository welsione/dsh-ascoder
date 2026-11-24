/**
 * CodeGraph CLI 封装：为分支空间的每个成员仓库建立 / 更新语义索引。
 *
 * 索引产物是仓库根下的 `.codegraph/` 目录；`status --json` 读取统计。
 * 这些命令可能跑几分钟，调用方负责放进后台任务并展示进度。
 */
import { spawn } from 'node:child_process'
import { existsSync, readdirSync, renameSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { join } from 'node:path'

/** 单个成员仓库的索引状态。 */
export interface MemberIndexStatus {
  /** 成员别名（空间内的子目录名）。 */
  alias: string
  /** 仓库目录。 */
  dir: string
  /** 是否已有索引。 */
  indexed: boolean
  /** 索引文件数（可读到时）。 */
  files?: number
  /** 索引节点数（可读到时）。 */
  symbols?: number
  /** 索引边数（可读到时）。 */
  edges?: number
  /** 最近索引时间（ISO 8601）。 */
  lastIndexed?: string
  /** 统计读取失败的原因。 */
  error?: string
}

/** 一个分支空间的索引状态汇总。 */
export interface SpaceIndexStatus {
  /** 各成员明细。 */
  members: MemberIndexStatus[]
  /** 已建索引的成员数。 */
  indexedCount: number
  /** 成员总数。 */
  memberCount: number
  /** codegraph 是否可用。 */
  available: boolean
  /** codegraph 版本或不可用原因。 */
  detail?: string
  /** 索引状态：未建 / 索引中 / 就绪 / 过期（代码比索引新）。 */
  indexStatus?: 'none' | 'indexing' | 'ready' | 'stale'
}

/** 仓库是否已有索引数据库（不启动 CLI，避免与 init 抢 SQLite 锁）。 */
export function hasIndex(dir: string): boolean {
  return existsSync(join(dir, '.codegraph', 'codegraph.db'))
}

/** 索引动作：create 全量建立，update 增量同步。 */
export type CodegraphIndexMode = 'create' | 'update'

/** 全局串行队列：同一进程内所有 codegraph 索引串行执行，避免重叠任务互抢 SQLite。 */
let indexChain: Promise<unknown> = Promise.resolve()

/** 索引命令超时（毫秒）。 */
const INDEX_TIMEOUT = 30 * 60 * 1000
/** 状态命令超时（毫秒）。 */
const STATUS_TIMEOUT = 15_000

/**
 * 运行一次 codegraph 命令并收集输出。
 *
 * 用 `detached` 起独立进程组，超时按**进程组**杀：codegraph 的 CLI 是个 node shim，
 * 真正干活的是它 spawn 的子进程；只杀 shim 会留下孤儿占着 SQLite 锁，
 * 让后续 `init` 报 `database is locked`（本轮实测踩到）。
 */
function runCodegraph(
  args: string[],
  options: { cwd?: string; timeoutMs: number; maxOutput?: number },
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn('codegraph', args, { cwd: options.cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
    const limit = options.maxOutput ?? 4 * 1024 * 1024
    let stdout = ''
    let stderr = ''
    let settled = false
    const finish = (error: Error | null, code: number): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (error) reject(error)
      else resolve({ code, stdout, stderr })
    }
    const killGroup = (): void => {
      try {
        if (typeof child.pid === 'number') process.kill(-child.pid, 'SIGKILL')
      } catch {
        try { child.kill('SIGKILL') } catch { /* 已退出 */ }
      }
    }
    const timer = setTimeout(() => {
      killGroup()
      finish(new Error(`codegraph ${args[0]} 超时（${Math.round(options.timeoutMs / 1000)}s）`), -1)
    }, options.timeoutMs)
    child.stdout?.on('data', (chunk: Buffer) => { if (stdout.length < limit) stdout += chunk.toString() })
    child.stderr?.on('data', (chunk: Buffer) => { if (stderr.length < limit) stderr += chunk.toString() })
    child.on('error', (error) => finish(error, -1))
    child.on('close', (code) => finish(null, code ?? -1))
  })
}

/** 探测 codegraph 版本。 */
/** `codegraph --version` 是子进程调用，状态巡检时每个空间都会问一次，记忆化一次即可。 */
let versionCache: { at: number; value: string | undefined } | null = null
/** 版本号缓存有效期：CLI 在容器里不会中途换版本，但保留 TTL 便于升级后自愈。 */
const VERSION_TTL_MS = 10 * 60 * 1000

/**
 * codegraph CLI 版本（用于判断可用性）。
 *
 * 每次都起一个子进程，而空间状态巡检会对每个空间调一次；这里缓存 10 分钟，
 * 让「打开项目」这种入口少跑若干次 spawn。
 * @returns 版本字符串；未安装或调用失败时 undefined
 */
export async function codegraphVersion(): Promise<string | undefined> {
  if (versionCache && Date.now() - versionCache.at < VERSION_TTL_MS) return versionCache.value
  try {
    const result = await runCodegraph(['--version'], { timeoutMs: 5000 })
    const value = result.code !== 0 ? undefined : (result.stdout.trim() || 'available')
    versionCache = { at: Date.now(), value }
    return value
  } catch {
    versionCache = { at: Date.now(), value: undefined }
    return undefined
  }
}

/** 读取单个成员仓库的索引状态。 */
async function memberStatus(alias: string, dir: string): Promise<MemberIndexStatus> {
  if (!existsSync(join(dir, '.codegraph'))) {
    return { alias, dir, indexed: false }
  }
  let raw: { ok: boolean; stdout: string; error?: string }
  try {
    const result = await runCodegraph(['status', '--json', dir], { timeoutMs: STATUS_TIMEOUT, maxOutput: 4 * 1024 * 1024 })
    raw = result.code === 0
      ? { ok: true, stdout: result.stdout }
      : { ok: false, stdout: '', error: (result.stderr || result.stdout || 'codegraph status 失败').split('\n')[0].slice(0, 200) }
  } catch (error) {
    raw = { ok: false, stdout: '', error: error instanceof Error ? error.message.slice(0, 200) : 'codegraph status 失败' }
  }
  if (!raw.ok) return { alias, dir, indexed: true, ...(raw.error ? { error: raw.error } : {}) }
  try {
    const parsed = JSON.parse(raw.stdout) as Record<string, unknown>
    const files = typeof parsed.fileCount === 'number' ? parsed.fileCount
      : typeof parsed.files === 'number' ? parsed.files : undefined
    const symbols = typeof parsed.nodeCount === 'number' ? parsed.nodeCount
      : typeof parsed.symbolCount === 'number' ? parsed.symbolCount : undefined
    const edges = typeof parsed.edgeCount === 'number' ? parsed.edgeCount : undefined
    const lastIndexed = typeof parsed.lastIndexed === 'string' ? parsed.lastIndexed : undefined
    // 空库不算已索引：init 中途失败只会留下一个空数据库（实测 private-java 库仅 176K、
    // 0 files / 0 symbols，却因为 .codegraph 目录存在被判成"已索引"，界面显示 3/3 就绪、
    // 语义检索却一条也查不到）。只有真的读进文件或符号才算完成。
    const isEmpty = (files === undefined || files === 0) && (symbols === undefined || symbols === 0)
    if (isEmpty) {
      return {
        alias,
        dir,
        indexed: false,
        ...(files !== undefined ? { files } : {}),
        ...(symbols !== undefined ? { symbols } : {}),
      }
    }
    return {
      alias,
      dir,
      indexed: true,
      ...(files !== undefined ? { files } : {}),
      ...(symbols !== undefined ? { symbols } : {}),
      ...(edges !== undefined ? { edges } : {}),
      ...(lastIndexed !== undefined ? { lastIndexed } : {}),
    }
  } catch {
    return { alias, dir, indexed: true }
  }
}

/**
 * 读取一个分支空间的索引状态。
 * @param members - 成员别名与目录
 * @returns 汇总状态
 */
export async function spaceIndexStatus(
  members: ReadonlyArray<{ alias: string; dir: string }>,
): Promise<SpaceIndexStatus> {
  const version = await codegraphVersion()
  const list = await Promise.all(members.map((member) => memberStatus(member.alias, member.dir)))
  return {
    members: list,
    indexedCount: list.filter((item) => item.indexed).length,
    memberCount: list.length,
    available: version !== undefined,
    ...(version !== undefined ? { detail: version } : { detail: '未安装 codegraph CLI' }),
  }
}

/**
 * 在一个仓库目录里建立（init）或更新（sync）索引。
 * @param dir - 仓库目录
 * @param mode - create 全量建立；update 增量同步
 * @param onProgress - 每读到一行输出回调（用于任务进度文案）
 */
export function runIndex(
  dir: string,
  mode: CodegraphIndexMode,
  onProgress?: (line: string) => void,
): Promise<void> {
  // 排队：上一次索引（哪怕失败/被中断）结束后才开始下一次
  const next = indexChain.catch(() => undefined).then(() => runIndexQueued(dir, mode, onProgress))
  indexChain = next.catch(() => undefined)
  return next
}

/** 残留索引目录前缀：`.codegraph` 被改名后的形态。 */
const STALE_PREFIX = '.codegraph.stale-'

/**
 * 清理过期的索引残留目录，只保留最近一次用于排障。
 *
 * 索引被中断时会把半成品 `.codegraph` 改名为 `.codegraph.stale-<时间戳>` 再重建；
 * 单个残留 2-3GB，而部署会频繁打断索引，累积半天就能吃掉 28GB 磁盘（实测），
 * 所以改名后立刻清旧目录，只留最新一个便于事后排查。
 * @param dir - 成员仓库目录
 * @param keep - 保留几个最新的残留目录
 */
export function pruneStaleIndexDirs(dir: string, keep = 1): void {
  try {
    const names = readdirSync(dir)
      .filter((name) => name.startsWith(STALE_PREFIX))
      .sort((left, right) => {
        const leftAt = Number(left.slice(STALE_PREFIX.length))
        const rightAt = Number(right.slice(STALE_PREFIX.length))
        return (Number.isFinite(rightAt) ? rightAt : 0) - (Number.isFinite(leftAt) ? leftAt : 0)
      })
    for (const name of names.slice(keep)) {
      // 2-3GB 目录删除较慢，放后台做，不阻塞索引主流程
      void rm(join(dir, name), { recursive: true, force: true }).catch(() => undefined)
    }
  } catch {
    // 清理失败不影响索引
  }
}

/** 真正执行索引（含重试与残留隔离）。 */
async function runIndexQueued(
  dir: string,
  mode: CodegraphIndexMode,
  onProgress?: (line: string) => void,
): Promise<void> {
  // 索引进程被中断时会留下 state=indexing 的半成品数据库，之后的 sync/init 一律报
  // "database is locked"。这不是临时锁，重试救不回来：把索引目录改名为 .stale-<时间>，
  // 再重新建一次（索引是可重建产物，改名保留现场便于排查）。
  // 上次部署中断可能留下多个残留目录，开跑前先清（保留最新一个）
  pruneStaleIndexDirs(dir)
  let lastError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await runIndexOnce(dir, attempt === 0 ? mode : 'create', onProgress)
      // 索引已经建好，之前隔离的残留现场就没用了：清掉释放空间（失败的现场会留着）
      pruneStaleIndexDirs(dir, 0)
      return
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      if (attempt === 1) break
      // 需要重建的三种情况（都只能整库重来，索引是可重建产物）：
      // 1) 残留索引会话（database is locked）
      // 2) 目录在但数据库没初始化（sync 报 CodeGraph not initialized，常见于空的 .codegraph）
      // 3) 写入被 SIGKILL 打断导致库文件损坏（disk image is malformed）。
      //    注意 codegraph 有时把 malformed 也报成 "database is locked"，所以两者都要匹配。
      const rebuild = /database is locked/i.test(message)
        || /not initialized/i.test(message)
        || /disk image is malformed/i.test(message)
        || /file is not a database/i.test(message)
      if (!rebuild) break
      const indexDir = join(dir, '.codegraph')
      if (existsSync(indexDir)) {
        const stale = `${indexDir}.stale-${Date.now()}`
        try {
          renameSync(indexDir, stale)
          onProgress?.(`索引残留已隔离为 ${stale.split('/').pop()}，重新建立索引`)
          // 只保留这一个现场，更早的残留直接删掉（否则每次打断都会多占 2-3GB）
          pruneStaleIndexDirs(dir)
        } catch {
          // 改名失败就按原错误返回
          break
        }
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError))
}

/** 单次索引尝试（不含重试逻辑）。 */
function runIndexOnce(
  dir: string,
  mode: CodegraphIndexMode,
  onProgress?: (line: string) => void,
): Promise<void> {
  const args = mode === 'create' ? ['init', dir] : ['sync', dir]
  return new Promise((resolve, reject) => {
    // nice 降低索引进程优先级：索引期间会话页与聊天保持流畅
    // detached：索引进程组一起管理，超时能杀掉 codegraph 派生的子进程，不留下锁占用
    const child = spawn('nice', ['-n', '10', 'codegraph', ...args], { cwd: dir, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
    let tail = ''
    const timer = setTimeout(() => {
      try {
        if (typeof child.pid === 'number') process.kill(-child.pid, 'SIGKILL')
        else child.kill('SIGKILL')
      } catch {
        try { child.kill('SIGKILL') } catch { /* 已退出 */ }
      }
      reject(new Error('codegraph 索引超时（30 分钟）'))
    }, INDEX_TIMEOUT)
    const handle = (chunk: Buffer): void => {
      const text = chunk.toString()
      tail = (tail + text).slice(-2000)
      const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
      if (lines.length > 0) onProgress?.(lines[lines.length - 1])
    }
    child.stdout?.on('data', handle)
    child.stderr?.on('data', handle)
    child.on('error', (error) => {
      clearTimeout(timer)
      reject(error)
    })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve()
      else reject(new Error(`codegraph ${args[0]} 退出码 ${code ?? '?'}${tail ? '：' + tail.split('\n').slice(-2).join(' ') : ''}`))
    })
  })
}

/** codegraph 查询类命令的超时（毫秒）。 */
const QUERY_TIMEOUT = 60_000

/**
 * 执行一次 codegraph 查询类命令并返回文本输出。
 * @param dir - 仓库目录（索引所在目录）
 * @param args - 子命令与参数（不含 codegraph 本身）
 * @returns stdout 文本（失败时附带 stderr）
 */
export async function runCodegraphQuery(dir: string, args: string[]): Promise<string> {
  try {
    const result = await runCodegraph(args, { cwd: dir, timeoutMs: QUERY_TIMEOUT, maxOutput: 16 * 1024 * 1024 })
    if (result.code !== 0) {
      const detail = (result.stderr || result.stdout || '').trim()
      throw new Error(detail.slice(0, 800) || 'codegraph 查询失败')
    }
    return result.stdout
  } catch (error) {
    throw new Error(error instanceof Error ? error.message.slice(0, 800) : 'codegraph 查询失败')
  }
}

/**
 * 判断索引状态是否允许语义查询，并给出不可用时的原因。
 *
 * 索引建立期间与缺失/过期时都拒绝查询：result 会重复索引没覆盖的代码。
 * @param indexStatus - 空间索引状态
 * @returns 允许时返回 undefined，否则返回给使用者看的提示
 */
export function indexQueryBlocker(indexStatus: SpaceIndexStatus['indexStatus']): string | undefined {
  if (indexStatus === 'ready') return undefined
  if (indexStatus === 'indexing') return '代码索引正在建立中，稍后再查询（可用 ascoder_task_list 看进度）'
  if (indexStatus === 'stale') return '代码索引已过期（代码比索引新），请先调用 ascoder_codegraph_index 更新索引'
  return '代码索引尚未建立，请先调用 ascoder_codegraph_index 建立索引'
}
