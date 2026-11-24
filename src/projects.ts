/**
 * 项目、分支空间与会话的关系（对齐 legacy Ascoder 的三层结构）：
 *
 *   Project（项目：名字/描述/仓库成员）
 *     └── ProjectSpace（分支空间：一组成员仓库在同一个分支上的物化目录）
 *           └── DSH workspace（会话挂在这里，因此会话按分支空间隔离）
 *
 * 分支空间是显式对象：可以创建、进入、删除，状态可见（待准备/就绪/失败）。
 */
import { mkdir, rm, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { RecordBackend } from './storage.ts'
import type { WorkspaceLinker, WorkspaceLike } from './workspaces.ts'
import type { EventLog } from './events.ts'
import {
  GitError,
  assertBranchName,
  checkoutBranch,
  checkoutTrackingBranch,
  cloneLocalRepository,
  cloneRepository,
  currentBranch,
  dirtyCount,
  fetchAll,
  isDirectory,
  isGitRepository,
  listBranches,
  pullFastForward,
  pullFastForwardWithAuth,
  resetHardToUpstream,
  canFastForward,
  cloneRepositoryWithAuth,
  fetchAllWithAuth,
  setRemoteUrl,
  setUpstream,
  fetchBranchFromRemote,
  aheadBehind,
  commitDiffStat,
  commitFiles,
  grepRepository,
  headInfo,
  listRepositoryFiles,
  importRefFromSource,
  remoteUrlOf,
  friendlyGitError,
  hasGitDir,
  type GitAuth,
} from './git.ts'

/** 从分支名里提取版本与用途 token（hotfix/release/pre-release/master）。 */
function branchTokens(branch: string): { versions: string[]; kinds: string[] } {
  const lower = branch.toLowerCase()
  const versions = [...lower.matchAll(/v?(\d+(?:\.\d+)+)/g)].map((hit) => hit[1])
  const kinds = ['hotfix', 'release', 'pre-release', 'master', 'main'].filter((kind) => lower.includes(kind))
  return { versions, kinds }
}

/**
 * 候选分支打分：同名最高，其次同类用途+最近提交，再次版本号接近。
 * `picked` 是当前已选的值，保持其排在前面便于界面展示。
 */
function branchScore(
  branch: string,
  picked: string | undefined,
  wanted: string,
  tokens: { versions: string[]; kinds: string[] },
  committedAt?: number,
): number {
  const lower = branch.toLowerCase()
  let score = 0
  if (branch === picked) score += 500
  if (branch === wanted) score += 1000
  for (const kind of tokens.kinds) {
    if (lower.includes(kind)) score += 60
    if (lower.endsWith(kind)) score += 40
  }
  for (const version of tokens.versions) {
    if (lower.includes(version)) score += 120
    const wantedMajor = version.split('.')[0]
    if (wantedMajor && lower.includes(`v${wantedMajor}.`)) score += 20
  }
  if (lower.includes('hotfix')) score += 10
  if (lower.includes('release')) score += 8
  // 最近提交（一周内的按小时折算，最多 240 分）
  if (committedAt) {
    const days = (Date.now() / 1000 - committedAt) / 86400
    score += Math.max(0, 240 - days * 2)
  }
  return score
}

/** 成员物化状态。 */
export type MemberStatus = 'unprepared' | 'ready' | 'error'

/** 分支空间状态。 */
export type SpaceStatus = 'unprepared' | 'ready' | 'failed'

/** 仓库：全局登记，可被多个项目引用。 */
export interface Repository {
  id: string
  /** 展示名。 */
  name: string
  /** 本地仓库路径；与 remoteUrl 二选一。 */
  path?: string
  /** 远程仓库地址；与 path 二选一。 */
  remoteUrl?: string
  /** 默认分支（仅本地仓库可推断）。 */
  defaultBranch?: string
  /** 远程仓库使用的凭证 id。 */
  credentialId?: string
  lastSyncAt?: string
  createdAt: string
}

/** 项目成员：引用一个仓库。分支由分支空间决定。 */
export interface ProjectMember {
  id: string
  /** 物化目录名。 */
  alias: string
  /** 引用的仓库 id。 */
  repositoryId: string
}

/** 凭证解析器：由 index 注入，避免 projects 直接依赖凭证存储。 */
export interface CredentialResolver {
  has(id: string): boolean
  reveal(id: string): Promise<GitAuth>
}

/** 成员视图：附带仓库信息，供界面直接渲染。 */
export interface MemberView extends ProjectMember {
  repository?: Repository
}

/** 分支空间：成员仓库在某一分支上的物化结果。 */
export interface ProjectSpace {
  id: string
  /** 默认分支（项目内唯一，也用于空间命名/去重）。 */
  branch: string
  /** 按成员覆盖的分支：key 是成员别名，缺省用 branch。 */
  memberBranches?: Record<string, string>
  createdAt: string
  lastOpenedAt?: string
  /** 物化根目录。 */
  root?: string
  /** 最近一次准备结果。 */
  status: SpaceStatus
  /** 准备失败原因。 */
  error?: string
  /** CodeGraph 索引状态。 */
  indexStatus?: 'none' | 'indexing' | 'ready' | 'stale'
  /** 最近一次索引完成时间（ISO 8601）。 */
  indexedAt?: string
  /** 最近一次索引的文件数（单成员空间取该成员）。 */
  indexFiles?: number
  /** 最近一次索引的节点数。 */
  indexSymbols?: number
}

/** 项目。 */
export interface Project {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt?: string
  members: ProjectMember[]
  /** 空间基目录（分支空间都放在它下面）。 */
  dir?: string
  spaces: ProjectSpace[]
}

/** 空间实时视图。 */
export interface SpaceView extends ProjectSpace {
  /** 成员已在空间的目录数。 */
  preparedCount: number
  /** 成员总数。 */
  memberCount: number
}

/** 项目实时视图。 */
export interface ProjectView {
  id: string
  name: string
  description?: string
  createdAt: string
  members: MemberView[]
  spaces: SpaceView[]
  memberCount: number
  spaceCount: number
  /** 全部已物化成员的未提交改动数。 */
  dirty: number
}

/** 新建项目入参。 */
export interface ProjectCreateInput {
  name: string
  description?: string
}

/** 添加成员入参：引用已登记仓库。 */
export interface MemberAddInput {
  repositoryId: string
  alias?: string
}

/** 项目服务。 */
/** 陈旧 index.lock 判定阈值：超过这个时长的锁视为被中断的 git 进程残留。 */
export const STALE_INDEX_LOCK_MS = 10 * 60 * 1000

/**
 * 清理被中断的 git 进程留下的 index.lock。
 *
 * 容器/部署重启会杀掉正在跑的 git，锁文件不再释放，之后所有同步都会报
 * "index.lock: File exists"。只在锁明显过期时删除，避免误删真正在跑的操作
 * （本函数的调用方已持有空间级互斥）。
 * @param dir - 成员仓库目录（不是空间根）
 * @returns 是否删除了锁
 */
export async function clearStaleIndexLock(dir: string, operationStartedAt?: number): Promise<boolean> {
  const lock = join(dir, '.git', 'index.lock')
  try {
    const info = await stat(lock)
    // 两种都算残留：
    // 1) 锁比本次操作还早 —— 同一空间有互斥，不可能是本次操作产生的
    // 2) 锁超过阈值仍未释放 —— 被中断的 git 进程
    const olderThanOperation = operationStartedAt !== undefined && info.mtimeMs < operationStartedAt
    const staleByAge = Date.now() - info.mtimeMs > STALE_INDEX_LOCK_MS
    if (!olderThanOperation && !staleByAge) return false
    await rm(lock, { force: true })
    return true
  } catch {
    return false
  }
}

/** 项目名上限：项目名会进入工作区标题、页面标题与任务名。 */
const PROJECT_NAME_MAX = 60
/** 项目描述上限。 */
const PROJECT_DESCRIPTION_MAX = 500

export class ProjectService {
  private projects: Project[] = []

  private repositories: Repository[] = []

  private constructor(
    private readonly backend: RecordBackend<Project>,
    private readonly repositoriesBackend: RecordBackend<Repository>,
    private readonly projectsDir: string,
    private readonly linker: WorkspaceLinker | undefined,
    private readonly credentials: CredentialResolver | undefined,
    private readonly events: EventLog | undefined,
  ) {}

  /** 记录领域事件（无日志时忽略）。 */
  private emit(type: Parameters<EventLog['emit']>[0], payload: Record<string, unknown>): void {
    void this.events?.emit(type, payload)
  }

  /**
   * 打开服务并载入注册表，旧记录会迁移成「项目 + 分支空间」。
   * @param backend - 持久化后端
   * @param projectsDir - 分支空间根目录的父目录
   * @param linker - 可选 workspace 联动器
   */
  static async open(
    backend: RecordBackend<Project>,
    repositoriesBackend: RecordBackend<Repository>,
    projectsDir: string,
    linker?: WorkspaceLinker,
    credentials?: CredentialResolver,
    events?: EventLog,
  ): Promise<ProjectService> {
    const service = new ProjectService(backend, repositoriesBackend, projectsDir, linker, credentials, events)
    service.repositories = await repositoriesBackend.load()
    const loaded = await backend.load()
    const repositoriesBefore = service.repositories.length
    let changed = false
    service.projects = loaded.map((record) => {
      const migrated = migrate(record, service.repositories)
      if (migrated !== record) changed = true
      return migrated
    })
    // 旧版迁移只写了项目、没写仓库表；这里补写，并从已物化克隆的 origin 自愈丢失的仓库
    const healed = await service.healRepositories()
    if (changed) await service.persist()
    if (healed || service.repositories.length !== repositoriesBefore) {
      await service.repositoriesBackend.save(service.repositories)
    }
    return service
  }

  /**
   * 自愈：成员引用了不存在的仓库时，尝试从已物化空间的 origin 反推原始来源，
   * 用同一个 id 重建仓库记录，保证引用不丢。
   * @returns 是否有新增记录
   */
  private async healRepositories(): Promise<boolean> {
    let added = false
    for (const project of this.projects) {
      for (const member of project.members) {
        if (this.repositories.some((item) => item.id === member.repositoryId)) continue
        let source: string | null = null
        for (const space of project.spaces) {
          if (!space.root) continue
          const target = join(space.root, member.alias)
          if (!(await isGitRepository(target))) continue
          source = await remoteUrlOf(target)
          if (source) break
        }
        if (!source) continue
        const isRemote = /^[a-z][a-z0-9+.-]*:\/\//i.test(source) || source.includes('@')
        this.repositories.push({
          id: member.repositoryId,
          name: member.alias,
          ...(isRemote ? { remoteUrl: source } : { path: source }),
          createdAt: new Date().toISOString(),
        })
        added = true
      }
    }
    return added
  }

  /** 全部已登记仓库。 */
  listRepositories(): Repository[] {
    return [...this.repositories].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  /** 取仓库；找不到抛错。 */
  requireRepository(id: string): Repository {
    const repository = this.repositories.find((item) => item.id === id)
    if (!repository) throw new GitError(`仓库不存在: ${id}`)
    return repository
  }

  /**
   * 登记一个仓库（同路径/同地址视为同一仓库，重复登记直接返回已有记录）。
   * @param input - 仓库来源
   */
  async addRepository(input: {
    name?: string
    path?: string
    remoteUrl?: string
    defaultBranch?: string
    credentialId?: string
  }): Promise<Repository> {
    const path = input.path?.trim()
    let remoteUrl = input.remoteUrl?.trim()
    let remoteUrlFromPath: string | undefined
    if (!path && !remoteUrl) throw new GitError('必须提供本地路径或远程地址')
    if (path && remoteUrl) throw new GitError('本地路径与远程地址只能二选一')

    const existing = this.repositories.find((item) =>
      (path && item.path === path) || (remoteUrl && item.remoteUrl === remoteUrl))
    if (existing) return existing

    let defaultBranch: string | undefined = input.defaultBranch?.trim() || undefined
    if (path) {
      if (!(await isDirectory(path))) throw new GitError(`目录不存在: ${path}`)
      if (!(await isGitRepository(path))) throw new GitError(`不是 Git 仓库: ${path}`)
      defaultBranch = defaultBranch ?? (await currentBranch(path).catch(() => null)) ?? undefined
      remoteUrlFromPath = (await remoteUrlOf(path).catch(() => null)) ?? undefined
    }
    const credentialId = input.credentialId?.trim() || undefined
    if (credentialId && !this.credentials?.has(credentialId)) throw new GitError(`凭证不存在: ${credentialId}`)
    const repository: Repository = {
      id: randomUUID(),
      name: input.name?.trim() || aliasOf(path ?? (remoteUrl as string)),
      ...(path ? { path } : {}),
      ...(remoteUrl || remoteUrlFromPath ? { remoteUrl: remoteUrl ?? remoteUrlFromPath } : {}),
      ...(defaultBranch ? { defaultBranch } : {}),
      ...(credentialId ? { credentialId } : {}),
      createdAt: new Date().toISOString(),
    }
    this.repositories.push(repository)
    await this.repositoriesBackend.save(this.repositories)
    this.emit('repository.added', { repositoryId: repository.id, name: repository.name })
    return repository
  }

  /** 删除仓库（仍被项目引用时拒绝）。 */
  async removeRepository(id: string): Promise<boolean> {
    const used = this.projects.find((project) => project.members.some((member) => member.repositoryId === id))
    if (used) throw new GitError(`仓库仍被项目「${used.name}」使用，先从项目中移除`)
    const before = this.repositories.length
    this.repositories = this.repositories.filter((item) => item.id !== id)
    if (this.repositories.length === before) return false
    await this.repositoriesBackend.save(this.repositories)
    this.emit('repository.removed', { repositoryId: id })
    return true
  }

  /** 给仓库绑定（或解绑）凭证：迁移历史数据、换令牌时用。 */
  async setRepositoryCredential(id: string, credentialId?: string): Promise<Repository> {
    const repository = this.requireRepository(id)
    const next = credentialId?.trim() || undefined
    if (next && !this.credentials?.has(next)) throw new GitError(`凭证不存在: ${next}`)
    if (next) repository.credentialId = next
    else delete repository.credentialId
    await this.repositoriesBackend.save(this.repositories)
    this.emit('repository.updated', { repositoryId: repository.id, name: repository.name })
    return repository
  }

  /** 给仓库补设远端地址（本地克隆 + 远端抓取分支时用）。 */
  async setRepositoryRemote(id: string, remoteUrl?: string): Promise<Repository> {
    const repository = this.requireRepository(id)
    const next = remoteUrl?.trim() || undefined
    if (next) repository.remoteUrl = next
    else delete repository.remoteUrl
    await this.repositoriesBackend.save(this.repositories)
    this.emit('repository.updated', { repositoryId: repository.id, name: repository.name })
    return repository
  }

  /**
   * 检出空间需要的分支：本地分支 → origin/<branch> → 从远端抓取后重试。
   *
   * 历史克隆可能只有 refs/remotes/origin/*（旧版 Ascoder 就是这样），
   * 本地克隆到目标目录后既没有本地分支也没有跟踪分支，必须回源抓一次。
   */
  private async checkoutSpaceBranch(target: string, repository: Repository, branch: string): Promise<void> {
    const name = branch.trim()
    try {
      await checkoutBranch(target, name)
      return
    } catch {
      // 本地没有该分支，继续尝试远端跟踪分支
    }
    try {
      await checkoutTrackingBranch(target, name)
      return
    } catch {
      // 跟踪分支也没有，回源抓取
    }
    // 其次从源克隆的远端引用导入（旧版克隆布局，无需网络）
    if (repository.path) {
      try {
        await importRefFromSource(target, repository.path, name)
        await checkoutTrackingBranch(target, name)
        return
      } catch {
        // 源克隆里也没有，继续回源抓取
      }
    }
    if (!repository.remoteUrl) {
      throw new GitError(`分支 ${name} 在本地克隆里不存在，仓库 ${repository.name} 也没有配置远端地址`)
    }
    const auth = await this.authOf(repository)
    await fetchBranchFromRemote(target, repository.remoteUrl, name, auth)
    await checkoutTrackingBranch(target, name)
  }

  /** 同步仓库（本地仓库 fetch）。 */
  async syncRepository(id: string): Promise<void> {
    const repository = this.requireRepository(id)
    if (!repository.path) throw new GitError('远程仓库无法在本机同步')
    await fetchAll(repository.path)
    repository.lastSyncAt = new Date().toISOString()
    await this.repositoriesBackend.save(this.repositories)
    this.emit('repository.synced', { repositoryId: repository.id, name: repository.name })
  }

  /** 仓库可选分支。 */
  async repositoryBranches(id: string): Promise<{ current: string | null; local: string[]; remote: string[] }> {
    const repository = this.requireRepository(id)
    if (!repository.path) {
      return { current: repository.defaultBranch ?? null, local: [], remote: [] }
    }
    const snapshot = await listBranches(repository.path)
    const byRecency = <T extends { name: string; committedAt?: number }>(a: T, b: T) =>
      (b.committedAt ?? 0) - (a.committedAt ?? 0) || a.name.localeCompare(b.name)
    return {
      current: snapshot.current ?? repository.defaultBranch ?? null,
      local: [...snapshot.local].sort(byRecency).map((branch) => branch.name),
      remote: [...snapshot.remote]
        .filter((branch) => !branch.name.endsWith('/HEAD'))
        .sort(byRecency)
        .map((branch) => branch.name.replace(/^origin\//, '')),
    }
  }

  /** 宿主是否具备 workspace 联动能力。 */
  get hasWorkspaceLink(): boolean {
    return this.linker?.available === true
  }

  /** 空间根目录父路径。 */
  get root(): string {
    return this.projectsDir
  }

  /** 全部项目（按创建时间升序）。 */
  list(): Project[] {
    return [...this.projects].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  /** 按 id 取项目；找不到抛错。 */
  require(id: string): Project {
    const project = this.projects.find((item) => item.id === id)
    if (!project) throw new GitError(`项目不存在: ${id}`)
    return project
  }

  /** 取项目下的分支空间；找不到抛错。 */
  requireSpace(projectId: string, spaceId: string): { project: Project; space: ProjectSpace } {
    const project = this.require(projectId)
    const space = project.spaces.find((item) => item.id === spaceId)
    if (!space) throw new GitError(`分支空间不存在: ${spaceId}`)
    return { project, space }
  }

  /** 全部项目实时视图。 */
  async state(): Promise<ProjectView[]> {
    this.fillWorkspaceIds()
    return Promise.all(this.list().map((project) => this.view(project)))
  }

  /**
   * 单个项目实时视图。
   *
   * 只做「纯文件系统」探测（空间目录在不在、成员有没有 `.git`），不跑任何 git 命令：
   * 列表页每次刷新都会走这里，而 `git status` 在大仓库上要几百毫秒，30 成员的项目
   * 一次就要好几秒。未提交改动数改为按需查询（`spaceDirty`），列表里不显示，
   * 所以这里不再算（原来的实现算了却没人用）。
   */
  async view(project: Project): Promise<ProjectView> {
    const spaces: SpaceView[] = []
    const probes = await Promise.all(project.spaces.map(async (space) => {
      const root = space.root
      if (!root || !(await isDirectory(root))) return { prepared: 0 }
      const prepared = await Promise.all(
        project.members.map((member) => hasGitDir(join(root, member.alias))),
      )
      return { prepared: prepared.filter(Boolean).length }
    }))
    project.spaces.forEach((space, index) => {
      spaces.push({ ...space, preparedCount: probes[index].prepared, memberCount: project.members.length })
    })
    const members: MemberView[] = project.members.map((member) => {
      const repository = this.repositories.find((item) => item.id === member.repositoryId)
      return { ...member, ...(repository ? { repository } : {}) }
    })
    return {
      id: project.id,
      name: project.name,
      ...(project.description ? { description: project.description } : {}),
      createdAt: project.createdAt,
      members,
      spaces,
      memberCount: project.members.length,
      spaceCount: spaces.length,
      // 列表不再统计未提交改动（要跑 git status，太慢）；需要时用 spaceDirty 按空间查
      dirty: 0,
    }
  }

  /**
   * 按需统计某个分支空间里的未提交改动数。
   *
   * 列表页不显示这个数字，只有用户主动点「检查改动」时才值得付出 `git status` 的代价。
   * @param projectId - 项目 id
   * @param spaceId - 分支空间 id
   * @returns 成员别名 → 脏文件数
   */
  async spaceDirty(projectId: string, spaceId: string): Promise<Record<string, number>> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    const result: Record<string, number> = {}
    if (!space.root) return result
    await Promise.all(project.members.map(async (member) => {
      const target = join(space.root as string, member.alias)
      if (!(await hasGitDir(target))) return
      result[member.alias] = await dirtyCount(target).catch(() => 0)
    }))
    return result
  }

  /** 新建项目。 */
  async create(input: ProjectCreateInput): Promise<Project> {
    const name = input.name.trim()
    if (name === '') throw new GitError('项目名称不能为空')
    if (name.length > PROJECT_NAME_MAX) throw new GitError(`项目名称最多 ${PROJECT_NAME_MAX} 字`)
    const description = input.description?.trim() ?? ''
    if (description.length > PROJECT_DESCRIPTION_MAX) throw new GitError(`项目描述最多 ${PROJECT_DESCRIPTION_MAX} 字`)
    const now = new Date().toISOString()
    const project: Project = {
      id: randomUUID(),
      name,
      ...(description ? { description } : {}),
      createdAt: now,
      updatedAt: now,
      members: [],
      spaces: [],
    }
    this.projects.push(project)
    await this.persist()
    this.emit('project.created', { projectId: project.id, name: project.name })
    return project
  }

  /** 更新项目基础信息。 */
  async update(id: string, patch: { name?: string; description?: string }): Promise<Project> {
    const project = this.require(id)
    if (patch.name !== undefined) {
      const name = patch.name.trim()
      if (name === '') throw new GitError('项目名称不能为空')
      if (name.length > PROJECT_NAME_MAX) throw new GitError(`项目名称最多 ${PROJECT_NAME_MAX} 字`)
      project.name = name
    }
    if (patch.description !== undefined) {
      const description = patch.description.trim()
      if (description.length > PROJECT_DESCRIPTION_MAX) throw new GitError(`项目描述最多 ${PROJECT_DESCRIPTION_MAX} 字`)
      project.description = description || undefined
    }
    project.updatedAt = new Date().toISOString()
    await this.persist()
    this.emit('project.updated', { projectId: project.id, name: project.name })
    return project
  }

  /** 删除项目（连同全部分支空间目录与 workspace 记录）。 */
  async remove(id: string): Promise<boolean> {
    const project = this.projects.find((item) => item.id === id)
    if (!project) return false
    for (const space of project.spaces) {
      if (space.root) await rm(space.root, { recursive: true, force: true }).catch(() => undefined)
    }
    if (project.dir) await rm(project.dir, { recursive: true, force: true }).catch(() => undefined)
    this.projects = this.projects.filter((item) => item.id !== id)
    await this.persist()
    this.emit('project.removed', { projectId: id })
    return true
  }

  /** 添加一个仓库成员。 */
  async addMember(id: string, input: MemberAddInput): Promise<ProjectMember> {
    const project = this.require(id)
    const repository = this.requireRepository(input.repositoryId)
    if (project.members.some((member) => member.repositoryId === repository.id)) {
      throw new GitError(`仓库已在项目中: ${repository.name}`)
    }
    const alias = normalizeAlias(input.alias?.trim() || repository.name)
    if (project.members.some((member) => member.alias === alias)) {
      throw new GitError(`成员别名已存在: ${alias}`)
    }
    const member: ProjectMember = { id: randomUUID(), alias, repositoryId: repository.id }
    project.members.push(member)
    project.updatedAt = new Date().toISOString()
    await this.persist()
    return member
  }

  /** 移除成员，并清理已物化空间里的该成员目录。 */
  async removeMember(id: string, memberId: string): Promise<boolean> {
    const project = this.require(id)
    const member = project.members.find((item) => item.id === memberId)
    if (!member) return false
    project.members = project.members.filter((item) => item.id !== memberId)
    for (const space of project.spaces) {
      if (space.root) await rm(join(space.root, member.alias), { recursive: true, force: true }).catch(() => undefined)
    }
    project.updatedAt = new Date().toISOString()
    await this.persist()
    return true
  }

  /**
   * 项目可选分支：全部本地成员仓库的本地分支并集。
   * @param id - 项目 id
   */
  async branches(id: string): Promise<{ current: string | null; local: string[]; remote: string[] }> {
    const project = this.require(id)
    const localDates = new Map<string, number>()
    const remoteDates = new Map<string, number>()
    let current: string | null = null
    const keepLatest = (dates: Map<string, number>, name: string, committedAt?: number) => {
      dates.set(name, Math.max(dates.get(name) ?? 0, committedAt ?? 0))
    }
    for (const member of project.members) {
      const repository = this.repositories.find((item) => item.id === member.repositoryId)
      const base = repository?.path
      if (!base || !(await isGitRepository(base))) continue
      const snapshot = await listBranches(base)
      for (const item of snapshot.local) keepLatest(localDates, item.name, item.committedAt)
      for (const item of snapshot.remote) {
        keepLatest(remoteDates, item.name.replace(/^origin\//, ''), item.committedAt)
      }
      if (!current) current = snapshot.current
    }
    for (const name of [...remoteDates.keys()]) {
      if (localDates.has(name)) remoteDates.delete(name)
      if (name === 'HEAD') remoteDates.delete(name)
    }
    // 旧仓库动辄上万条分支，按最近提交时间倒序排，菜单先看到最可能用到的
    const byRecency = (dates: Map<string, number>) => (a: string, b: string) =>
      (dates.get(b) ?? 0) - (dates.get(a) ?? 0) || a.localeCompare(b)
    return {
      current,
      local: [...localDates.keys()].sort(byRecency(localDates)),
      remote: [...remoteDates.keys()].sort(byRecency(remoteDates)),
    }
  }

  /**
   * 创建分支空间（同一分支已存在则直接返回，便于幂等进入）。
   * @param projectId - 项目 id
   * @param branch - 分支名
   */
  async createSpace(
    projectId: string,
    branch: string,
    memberBranches?: Record<string, string>,
  ): Promise<ProjectSpace> {
    const project = this.require(projectId)
    const name = branch.trim()
    if (name === '') throw new GitError('分支不能为空')
    if (project.members.length === 0) throw new GitError('项目还没有仓库成员，先添加仓库')

    // 覆盖项只保留项目里真实存在的成员，避免脏数据
    const overrides: Record<string, string> = {}
    if (memberBranches) {
      for (const [alias, value] of Object.entries(memberBranches)) {
        if (!project.members.some((member) => member.alias === alias)) continue
        const trimmed = assertBranchName(value.trim())
        if (trimmed !== name) overrides[alias] = trimmed
      }
    }
    const existing = project.spaces.find((space) => space.branch === name)
    if (existing) return existing
    const space: ProjectSpace = {
      id: randomUUID(),
      branch: name,
      ...(Object.keys(overrides).length > 0 ? { memberBranches: overrides } : {}),
      createdAt: new Date().toISOString(),
      status: 'unprepared',
    }
    project.spaces.push(space)
    project.updatedAt = space.createdAt
    await this.persist()
    this.emit('space.created', { projectId: project.id, spaceId: space.id, branch: space.branch })
    return space
  }

  /** 删除分支空间（目录 + 记录）。 */
  async removeSpace(projectId: string, spaceId: string): Promise<boolean> {
    const project = this.require(projectId)
    const space = project.spaces.find((item) => item.id === spaceId)
    if (!space) return false
    if (space.root) await rm(space.root, { recursive: true, force: true }).catch(() => undefined)
    project.spaces = project.spaces.filter((item) => item.id !== spaceId)
    project.updatedAt = new Date().toISOString()
    await this.persist()
    this.emit('space.removed', { projectId: project.id, spaceId })
    return true
  }

  /**
   * 准备分支空间：把每个成员仓库按该分支物化到 `<dir>/<branch>/<alias>`。
   * @param projectId - 项目 id
   * @param spaceId - 分支空间 id
   */
  async prepareSpace(
    projectId: string,
    spaceId: string,
    onStep?: (alias: string, index: number, total: number) => void,
    shouldCancel?: () => boolean,
  ): Promise<ProjectSpace> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    project.dir = project.dir ?? join(this.projectsDir, slugOf(project.name) + '-' + project.id.slice(0, 8))
    space.root = join(project.dir, slugOf(space.branch))
    await mkdir(space.root, { recursive: true })

    let failed: string | undefined
    const total = project.members.length
    const prepareStartedAt = Date.now()
    for (let memberIndex = 0; memberIndex < project.members.length; memberIndex += 1) {
      // 大仓库材料化要几分钟，任务被取消时在这里停下（已准备的成员下次会复用）
      if (shouldCancel?.() === true) {
        failed = '准备被取消（已准备的成员会复用）'
        break
      }
      const member = project.members[memberIndex]
      onStep?.(member.alias, memberIndex, total)
      const target = join(space.root, member.alias)
      // 是否是本次新建的克隆：只有新建失败才清理，避免误删已准备好的仓库
      let freshClone = false
      try {
        // 上一次被中断的 git 可能留下 index.lock，准备空间前也先清掉
        await clearStaleIndexLock(target, prepareStartedAt)
        if (await isGitRepository(target)) {
          const wanted = space.memberBranches?.[member.alias] ?? space.branch
          const repository = this.repositories.find((item) => item.id === member.repositoryId)
          if (!repository) throw new GitError(`成员 ${member.alias} 引用的仓库已不存在`)
          await this.checkoutSpaceBranch(target, repository, wanted)
          await this.ensureOrigin(target, repository, wanted)
          continue
        }
        if (await isDirectory(target)) await rm(target, { recursive: true, force: true })
        const repository = this.repositories.find((item) => item.id === member.repositoryId)
        if (!repository) throw new GitError(`成员 ${member.alias} 引用的仓库已不存在`)
        freshClone = true
        if (repository.path) {
          // 共享对象库：同一仓库物化到多个分支空间时，避免把对象重复拷贝好几份
          const reference = process.env.ASC_LOCAL_CLONE === 'reference'
          await cloneLocalRepository(repository.path, target, { reference })
        }
        else if (repository.remoteUrl) {
          const auth = await this.authOf(repository)
          await cloneRepositoryWithAuth(repository.remoteUrl, target, auth)
        } else throw new GitError(`仓库 ${repository.name} 没有可用来源`)
        const wantedBranch = space.memberBranches?.[member.alias] ?? space.branch
        await this.checkoutSpaceBranch(target, repository, wantedBranch)
        await this.ensureOrigin(target, repository, wantedBranch)
      } catch (error) {
        failed = `${member.alias}：${friendlyGitError(error instanceof Error ? error.message : String(error))}`
        // 半成品克隆没有保留价值，清掉释放磁盘（大仓库单成员可达数 GB）；已就绪的仓库绝不删除
        if (freshClone) await rm(target, { recursive: true, force: true }).catch(() => undefined)
        break
      }
    }

    space.status = failed ? 'failed' : 'ready'
    space.error = failed
    project.updatedAt = new Date().toISOString()
    if (!failed) await this.writeSpaceManifest(project, space)
    await this.persist()
    if (failed) this.emit('space.failed', { projectId, spaceId, branch: space.branch, error: failed })
    else this.emit('space.prepared', { projectId, spaceId, branch: space.branch, members: total })
    return space
  }

  /**
   * 进入分支空间：准备 + 对齐 DSH workspace，返回 workspace id。
   * @param projectId - 项目 id
   * @param spaceId - 分支空间 id
   */
  /**
   * 更新分支空间的索引状态。
   * @param projectId - 项目 id
   * @param spaceId - 分支空间 id
   * @param patch - 要写入的索引字段
   */
  async setIndexState(
    projectId: string,
    spaceId: string,
    patch: { indexStatus: ProjectSpace['indexStatus']; indexedAt?: string; indexFiles?: number; indexSymbols?: number },
  ): Promise<void> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    space.indexStatus = patch.indexStatus
    if (patch.indexedAt !== undefined) space.indexedAt = patch.indexedAt
    if (patch.indexFiles !== undefined) space.indexFiles = patch.indexFiles
    if (patch.indexSymbols !== undefined) space.indexSymbols = patch.indexSymbols
    project.updatedAt = new Date().toISOString()
    await this.persist()
  }

  async enterSpace(projectId: string, spaceId: string): Promise<string | undefined> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    if (!space.root || space.status !== 'ready') await this.prepareSpace(projectId, spaceId)
    if (space.status === 'failed') throw new GitError(space.error ?? '空间准备失败')
    await this.writeSpaceManifest(project, space)
    space.lastOpenedAt = new Date().toISOString()
    await this.persist()
    if (!this.linker?.available || !space.root) return undefined
    const link = await this.linker.ensure(space.root, `${project.name} · ${space.branch}`)
    return link?.workspaceId
  }

  /**
   * 更新分支空间里的代码（git fetch + pull --ff-only），不修改工作区内容。
   * @param projectId - 项目 id
   * @param spaceId - 分支空间 id
   * @returns 每个成员的更新结果
   */
  async syncSpace(
    projectId: string,
    spaceId: string,
    onStep?: (alias: string, index: number, total: number) => void,
    shouldCancel?: () => boolean,
  ): Promise<Array<{ alias: string; result: string }>> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    if (!space.root) throw new GitError('分支空间尚未准备，先进入一次再更新')
    const total = project.members.length
    // 本次同步的开始时间：早于它的 index.lock 一定是上一次被中断操作留下的
    const operationStartedAt = Date.now()
    // 各成员并行 fetch/pull：git 的网络往返是主要耗时，串行 3 个成员会等 3 倍时间
    // （实测 38-67 秒，并行后取决于最慢的那个）。同空间互斥已保证不会有两份同步在跑。
    const results = await Promise.all(project.members.map(async (member, memberIndex) => {
      if (shouldCancel?.() === true) return { alias: member.alias, result: '任务已取消，未更新' }
      onStep?.(member.alias, memberIndex, total)
      const target = join(space.root as string, member.alias)
      if (!(await isGitRepository(target))) return { alias: member.alias, result: '未物化' }
      try {
        // 上一次被中断的 git 可能留下 index.lock，先清掉再操作
        await clearStaleIndexLock(target, operationStartedAt)
        const repository = this.repositories.find((item) => item.id === member.repositoryId)
        const wantedBranch = space.memberBranches?.[member.alias] ?? space.branch
        if (repository) await this.ensureOrigin(target, repository, wantedBranch)
        const auth = repository ? await this.authOf(repository) : undefined
        try {
          if (auth) {
            await fetchAllWithAuth(target, auth)
            await pullFastForwardWithAuth(target, auth)
          } else {
            await fetchAll(target)
            await pullFastForward(target)
          }
          return { alias: member.alias, result: '已更新' }
        } catch (error) {
          // 只读分析空间：只在与上游分叉（不能快进）时回落，避免掩盖权限/网络错误。
          // 用 merge-base --is-ancestor 判断，而不是匹配 git 的错误文案（会被本地化）。
          if (await canFastForward(target)) throw error
          await resetHardToUpstream(target)
          return { alias: member.alias, result: '已重置到远端' }
        }
      } catch (error) {
        return { alias: member.alias, result: error instanceof Error ? error.message : String(error) }
      }
    }))
    project.updatedAt = new Date().toISOString()
    await this.persist()
    this.emit('space.synced', { projectId, spaceId, branch: space.branch, results })
    return results
  }

  /**
   * 让物化目录的 origin 指向仓库的真实远端，并把当前分支的上游设好。
   *
   * 本地克隆出来时 origin 指向旧版的仓库目录（那里可能没有 refs/heads），
   * 直接 pull 会报 "no such ref was fetched"；这里统一纠正成远端地址。
   */
  private async ensureOrigin(target: string, repository: Repository, branch: string): Promise<void> {
    if (!repository.remoteUrl) return
    const current = await remoteUrlOf(target).catch(() => null)
    if (current !== repository.remoteUrl) await setRemoteUrl(target, repository.remoteUrl)
    await setUpstream(target, branch).catch(() => undefined)
  }

  /**
   * 修改空间里各成员的检出分支（任意项目通用）。
   *
   * 旧版 Ascoder 的空间天然是"每成员一条分支"；新建空间时只给了统一分支名，
   * 成员没有该分支就会准备失败。这里允许之后逐个成员改分支，空间回到待准备状态，
   * 重新准备时只切换分支、不重新克隆。
   */
  async setSpaceBranches(
    projectId: string,
    spaceId: string,
    memberBranches: Record<string, string>,
  ): Promise<ProjectSpace> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    const aliases = new Set(project.members.map((member) => member.alias))
    const next: Record<string, string> = {}
    for (const [alias, value] of Object.entries(memberBranches)) {
      if (!aliases.has(alias)) continue
      const name = assertBranchName(String(value).trim())
      if (name !== space.branch) next[alias] = name
    }
    if (Object.keys(next).length > 0) space.memberBranches = next
    else delete space.memberBranches
    // 回到待准备：下次进入/重新准备时按新映射切换分支
    space.status = 'unprepared'
    delete space.error
    project.updatedAt = new Date().toISOString()
    await this.persist()
    this.emit('space.updated', { projectId: project.id, spaceId: space.id, branch: space.branch })
    return space
  }

  /**
   * 空间里每个成员的候选分支（按相关度+最近提交排序），供管理界面与 Agent 探索使用。
   *
   * @param projectId - 项目 id
   * @param wanted - 期望分支（通常是空间分支名）
   * @param current - 当前已选映射（alias -> branch），用于给已是当前值的分支加分
   */
  async branchCandidates(
    projectId: string,
    wanted: string,
    current: Record<string, string> = {},
  ): Promise<Array<{
    alias: string
    repositoryId: string
    repositoryName: string
    branch: string
    matched: boolean
    local: boolean
    committedAt?: number
    score: number
  }>> {
    const project = this.require(projectId)
    const wantedName = wanted.trim()
    const tokens = branchTokens(wantedName)
    const rows: Array<{
      alias: string
      repositoryId: string
      repositoryName: string
      branch: string
      matched: boolean
      local: boolean
      committedAt?: number
      score: number
    }> = []
    for (const member of project.members) {
      const repository = this.repositories.find((item) => item.id === member.repositoryId)
      const base = repository?.path
      const picked = current[member.alias]
      const name = repository?.name ?? member.alias
      if (!base || !(await isGitRepository(base))) {
        if (picked) {
          rows.push({ alias: member.alias, repositoryId: member.repositoryId, repositoryName: name, branch: picked, matched: true, local: true, score: 1000 })
        }
        continue
      }
      const snapshot = await listBranches(base).catch(() => null)
      if (!snapshot) continue
      const seen = new Set<string>()
      const push = (branch: string, isLocal: boolean, committedAt?: number) => {
        if (seen.has(branch) || branch.endsWith('/HEAD')) return
        seen.add(branch)
        rows.push({
          alias: member.alias,
          repositoryId: member.repositoryId,
          repositoryName: name,
          branch,
          matched: branch === wantedName,
          local: isLocal,
          ...(committedAt ? { committedAt } : {}),
          score: branchScore(branch, name === picked ? branch : picked, wantedName, tokens, committedAt),
        })
      }
      for (const branch of snapshot.local) push(branch.name, true, branch.committedAt)
      for (const branch of snapshot.remote) push(branch.name.replace(/^origin\//, ''), false, branch.committedAt)
    }
    return rows.sort((a, b) => b.score - a.score)
  }

  /**
   * 自动规划一个分支空间：成员有同名分支就用同名，没有就取候选里分数最高的。
   *
   * 这是「点了之后后台自动处理」的实现：确定性部分（候选打分）直接算，
   * 算不出来的成员记进 unresolved，交给界面/Agent 再确认。
   */
  async autoPlanSpace(
    projectId: string,
    branch: string,
    onStep?: (message: string, index: number, total: number) => void,
    shouldCancel?: () => boolean,
  ): Promise<{
    spaceId: string
    branch: string
    mapping: Record<string, string>
    unresolved: string[]
    status: SpaceStatus
    error?: string
  }> {
    const project = this.require(projectId)
    const wanted = assertBranchName(branch.trim())
    const existing = project.spaces.find((item) => item.branch === wanted)
    const space = existing ?? (await this.createSpace(projectId, wanted))

    onStep?.('匹配各成员分支', 0, project.members.length + 1)
    const candidates = await this.branchCandidates(projectId, wanted)
    const mapping: Record<string, string> = {}
    const unresolved: string[] = []
    for (const member of project.members) {
      // 30 仓库项目的光分支匹配就可能跑很久，取消时在这里停下
      if (shouldCancel?.() === true) {
        return { spaceId: space.id, branch: wanted, mapping, unresolved, status: 'failed', error: '自动规划已取消' }
      }
      const rows = candidates.filter((row) => row.alias === member.alias)
      if (rows.some((row) => row.branch === wanted)) continue
      const best = rows[0]
      if (!best) {
        unresolved.push(member.alias)
        continue
      }
      mapping[member.alias] = best.branch
    }
    if (unresolved.length > 0) {
      return { spaceId: space.id, branch: wanted, mapping, unresolved, status: space.status }
    }

    await this.setSpaceBranches(projectId, space.id, mapping)
    const prepared = await this.prepareSpace(projectId, space.id, (alias, index, total) => {
      onStep?.(`准备 ${alias}`, index + 1, total + 1)
    }, shouldCancel)
    return {
      spaceId: space.id,
      branch: prepared.branch,
      mapping,
      unresolved,
      status: prepared.status,
      ...(prepared.error ? { error: prepared.error } : {}),
    }
  }

  /**
   * 在空间根目录写一份清单，说明「根目录不是 git 仓库、成员目录才是」。
   *
   * Agent 的 cwd 就是空间根目录，不知道这一点时会直接在根上跑 git，
   * 立刻得到 "not a git repository"（公有云这类 30 仓库的空间尤其明显）。
   */
  private async writeSpaceManifest(project: Project, space: ProjectSpace): Promise<void> {
    if (!space.root) return
    const rows = project.members.map((member) => {
      const branch = space.memberBranches?.[member.alias] ?? space.branch
      return `| ${member.alias} | ${branch} | ./${member.alias}/ |`
    })
    const body = [
      `# ${project.name} · ${space.branch}`,
      '',
      '这是一个**分支空间**：根目录本身不是 git 仓库，下面每个成员目录才是一个仓库。',
      '运行 git、构建或测试命令前，先进入对应的成员目录（例如 `cd cloud-webapp`），不要在根目录执行 git。',
      '需要按仓库排查时，先 `ls` 看有哪些成员目录，再决定进入哪个。',
      '',
      '| 成员 | 分支 | 目录 |',
      '| --- | --- | --- |',
      ...rows,
      '',
      `> 由 Ascoder 自动生成（${new Date().toISOString()}），请勿依赖其内容做修改。`,
    ].join('\n')
    await writeFile(join(space.root, '.ascoder-space.md'), `${body}\n`, 'utf8').catch(() => undefined)
  }

  /** 列出分支空间里各成员的有界文件清单（替代 `find . -type f | sort`）。 */
  async listSpaceFiles(
    projectId: string,
    spaceId: string,
    options: { pathPrefix?: string; glob?: string; maxFiles?: number } = {},
  ): Promise<{ groups: Array<{ alias: string; files: string[] }>; truncated: boolean }> {
    const prefixOf = (alias: string): string | undefined => {
      const raw = options.pathPrefix?.trim()
      if (!raw) return undefined
      // 模型常把成员别名写进前缀（private-java/sign），在成员目录内部要去掉
      return raw.startsWith(`${alias}/`) ? raw.slice(alias.length + 1) : raw === alias ? undefined : raw
    }
    const { project, space } = this.requireSpace(projectId, spaceId)
    if (!space.root) throw new GitError('分支空间尚未准备，先进入一次再列文件')
    const maxFiles = Math.min(Math.max(options.maxFiles ?? 80, 1), 300)
    const perMember = Math.max(Math.ceil(maxFiles / Math.max(project.members.length, 1)), 10)
    const groups: Array<{ alias: string; files: string[] }> = []
    let truncated = false
    let total = 0
    for (const member of project.members) {
      if (total >= maxFiles) {
        truncated = true
        break
      }
      const target = join(space.root, member.alias)
      if (!(await isGitRepository(target))) continue
      const memberPrefix = prefixOf(member.alias)
      const result = await listRepositoryFiles(target, {
        ...(memberPrefix ? { pathPrefix: memberPrefix } : {}),
        ...(options.glob ? { glob: options.glob } : {}),
        maxFiles: perMember,
      })
      if (result.truncated) truncated = true
      const remaining = maxFiles - total
      const files = result.files.slice(0, remaining)
      if (files.length < result.files.length) truncated = true
      if (files.length > 0) groups.push({ alias: member.alias, files })
      total += files.length
    }
    return { groups, truncated }
  }

  /**
   * 在分支空间里检索代码（按成员仓库逐个 `git grep`）。
   *
   * 没有这个工具时，模型会用 10+ 次 bash 手拼 grep/find，单次返回可到 5KB。
   *
   * @param query 关键词或正则；不能以 `-` 开头（避免被当作选项）
   * @param options 路径前缀与命中上限
   */
  async searchCode(
    projectId: string,
    spaceId: string,
    query: string,
    options: { pathPrefix?: string; maxMatches?: number; countOnly?: boolean; queries?: string[] } = {},
  ): Promise<{
    matches: Array<{ alias: string; file: string; line: number; text: string }>
    truncated: boolean
    counts?: Array<{ alias: string; count: number }>
  }> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    const extra = (options.queries ?? []).map((item) => item.trim()).filter((item) => item !== '')
    const keyword = query.trim()
    const parts = [keyword, ...extra].filter((item) => item !== '')
    if (parts.length === 0) throw new GitError('检索关键词不能为空')
    for (const part of parts) {
      if (part.startsWith('-')) throw new GitError(`检索关键词不能以 - 开头: ${part}`)
      if (part.length > 300) {
        throw new GitError('检索关键词过长（最多 300 字符）；请拆成 2-3 个短词分别调用，或先用 countOnly 判断范围')
      }
    }
    // 多个关键词用扩展正则做 OR，一次扫描替代多次调用
    const pattern = parts.length === 1 ? parts[0] : `(${parts.join(')|(')})`
    const extendedRegex = parts.length > 1
    if (!space.root) throw new GitError('分支空间尚未准备，先进入一次再检索')
    const maxMatches = Math.min(Math.max(options.maxMatches ?? 30, 1), 100)
    const prefixOf = (alias: string): string | undefined => {
      const raw = options.pathPrefix?.trim()
      if (!raw) return undefined
      return raw.startsWith(`${alias}/`) ? raw.slice(alias.length + 1) : raw === alias ? undefined : raw
    }
    const perMember = Math.max(Math.ceil(maxMatches / Math.max(project.members.length, 1)), 3)
    const rows: Array<{ alias: string; file: string; line: number; text: string }> = []
    const counts: Array<{ alias: string; count: number }> = []
    let truncated = false
    // 各成员并行 grep：git grep 在 7GB 级仓库上单个就要 2-3 秒，
    // 原来串行遍历 3 个成员约 9 秒、30 个成员要一分钟；并行后只等于最慢的那个成员。
    const memberScans = await Promise.all(project.members.map(async (member) => {
      const target = join(space.root as string, member.alias)
      if (!(await isGitRepository(target))) return null
      const memberPrefix = prefixOf(member.alias)
      const result = await grepRepository(target, pattern, {
        ...(memberPrefix ? { pathPrefix: memberPrefix } : {}),
        ...(extendedRegex ? { extendedRegex: true } : {}),
        maxMatches: options.countOnly ? 1000 : perMember,
      })
      return { alias: member.alias, result }
    }))
    // 合并仍按成员顺序，保证结果稳定、截断可预期
    for (const scan of memberScans) {
      if (scan === null) continue
      const { alias, result } = scan
      if (options.countOnly) {
        counts.push({ alias, count: result.matches.length })
        continue
      }
      if (result.truncated) truncated = true
      const seen = new Set(rows.map((item) => `${item.alias}:${item.file}:${item.line}`))
      for (const match of result.matches) {
        const key = `${alias}:${match.file}:${match.line}`
        if (seen.has(key)) continue
        seen.add(key)
        rows.push({ alias, ...match })
        if (rows.length >= maxMatches) {
          truncated = true
          break
        }
      }
    }
    return options.countOnly ? { matches: rows, truncated, counts } : { matches: rows, truncated }
  }

  /**
   * 分支空间快照：一次给出每个成员的当前分支、HEAD 提交、工作树改动与领先/落后。
   *
   * 没有这个工具时，模型要查"这个分支现在什么状态"会用 4-6 次 bash（git log/status/rev-list）。
   */
  async spaceSnapshot(
    projectId: string,
    spaceId: string,
    options: { files?: boolean } = {},
  ): Promise<Array<{
    alias: string
    branch: string
    head: string
    subject: string
    committedAt: string
    remote: string
    changedCount?: number
    changedFiles?: string[]
    insertions?: number
    deletions?: number
    dirty: number
    ahead: number | null
    behind: number | null
    error?: string
  }>> {
    const { project, space } = this.requireSpace(projectId, spaceId)
    const rows: Array<{
      alias: string
      branch: string
      head: string
      subject: string
      committedAt: string
      remote: string
      changedCount?: number
      changedFiles?: string[]
      dirty: number
      ahead: number | null
      behind: number | null
      error?: string
    }> = []
    const root = space.root
    for (const member of project.members) {
      const wanted = space.memberBranches?.[member.alias] ?? space.branch
      const target = root ? join(root, member.alias) : ''
      if (!root || !(await isGitRepository(target))) {
        rows.push({ alias: member.alias, branch: wanted, head: '', subject: '', committedAt: '', remote: '', dirty: 0, ahead: null, behind: null, error: '未物化' })
        continue
      }
      const info = await headInfo(target)
      const changed = options.files
        ? await Promise.all([
          commitFiles(target, 20).catch(() => ({ count: 0, files: [] })),
          commitDiffStat(target).catch(() => ({ insertions: 0, deletions: 0 })),
        ]).then(([files, stat]) => ({ ...files, ...stat }))
        : undefined
      const [dirty, divergence, remote] = await Promise.all([
        dirtyCount(target).catch(() => 0),
        aheadBehind(target),
        remoteUrlOf(target).catch(() => null),
      ])
      rows.push({
        alias: member.alias,
        branch: wanted,
        head: info.sha,
        subject: info.subject,
        committedAt: info.committedAt,
        remote: remote ?? '',
        ...(changed
          ? { changedCount: changed.count, changedFiles: changed.files, insertions: changed.insertions, deletions: changed.deletions }
          : {}),
        dirty,
        ahead: divergence?.ahead ?? null,
        behind: divergence?.behind ?? null,
      })
    }
    return rows
  }

  /** 仓库的 git 凭证（无凭证或解析器缺失时返回 undefined）。 */
  private async authOf(repository: Repository): Promise<GitAuth | undefined> {
    if (!repository.credentialId || !this.credentials) return undefined
    return this.credentials.reveal(repository.credentialId)
  }

  /** 属于 Ascoder 空间的分组标题（侧栏只展示这些）。 */
  spaceTitles(): string[] {
    if (!this.linker?.available) return []
    const byPath = this.linker.snapshot()
    const titles: string[] = []
    for (const project of this.projects) {
      for (const space of project.spaces) {
        if (!space.root) continue
        const workspace = byPath.get(space.root)
        if (workspace) titles.push(workspace.title)
      }
    }
    return titles
  }

  /** 同步成员对应的仓库（本地仓库 fetch）。 */
  async syncMember(id: string, memberId: string): Promise<void> {
    const project = this.require(id)
    const member = project.members.find((item) => item.id === memberId)
    if (!member) throw new GitError(`成员不存在: ${memberId}`)
    await this.syncRepository(member.repositoryId)
  }

  /** 侧栏 workspace 收养：把 git 目录变成单成员单空间项目。 */
  async adoptWorkspaces(): Promise<number> {
    if (!this.linker?.available) return 0
    const known = new Set<string>()
    for (const project of this.projects) {
      for (const space of project.spaces) if (space.root) known.add(space.root)
      for (const member of project.members) {
        const repository = this.repositories.find((item) => item.id === member.repositoryId)
        if (repository?.path) known.add(repository.path)
      }
    }
    const workspaces: WorkspaceLike[] = [...this.linker.snapshot().values()]
    let adopted = 0
    for (const workspace of workspaces) {
      if (known.has(workspace.path)) continue
      if (!(await isGitRepository(workspace.path))) continue
      const now = new Date().toISOString()
      const repository: Repository = {
        id: randomUUID(),
        name: aliasOf(workspace.path),
        path: workspace.path,
        ...((await currentBranch(workspace.path).catch(() => null)) ? { defaultBranch: (await currentBranch(workspace.path).catch(() => null)) as string } : {}),
        createdAt: now,
      }
      this.repositories.push(repository)
      this.projects.push({
        id: randomUUID(),
        name: workspace.title,
        createdAt: workspace.createdAt ?? now,
        members: [{ id: randomUUID(), alias: normalizeAlias(basename(workspace.path)), repositoryId: repository.id }],
        dir: workspace.path,
        spaces: [{
          id: randomUUID(),
          branch: (await currentBranch(workspace.path).catch(() => null)) ?? 'default',
          createdAt: now,
          status: 'ready',
          root: workspace.path,
        }],
      })
      known.add(workspace.path)
      adopted += 1
    }
    if (adopted > 0) {
      await this.repositoriesBackend.save(this.repositories)
      await this.persist()
    }
    return adopted
  }

  /** 首次读取时收养侧栏 workspace（惰性，避免宿主服务启动竞态）。 */
  private adoptedOnce = false

  private async adoptOnce(): Promise<void> {
    if (this.adoptedOnce || !this.linker?.available) return
    this.adoptedOnce = true
    try {
      await this.adoptWorkspaces()
    } catch {
      // 收养失败不影响项目列表
    }
  }

  /** 用 workspace 快照补齐（无副作用）。 */
  private fillWorkspaceIds(): void {
    if (!this.linker?.available) return
    this.linker.snapshot()
  }

  /** 持久化。 */
  private async persist(): Promise<void> {
    await this.backend.save(this.projects)
  }

  /** 释放介质。 */
  async close(): Promise<void> {
    await this.backend.close()
    await this.repositoriesBackend.close()
  }

  /** 首次读取前收养（供插件启动时显式触发）。 */
  async bootstrap(): Promise<void> {
    await this.adoptOnce()
  }
}

/**
 * 把旧记录迁移到「项目 + 分支空间 + 仓库引用」。
 * 旧版把仓库来源直接写在成员上，这里取出并登记成全局仓库。
 * @param record - 旧记录
 * @param repositories - 仓库表（就地补齐）
 * @returns 迁移后的项目（未变化时返回原对象）
 */
function migrate(record: Project, repositories: Repository[]): Project {
  const legacy = record as Project & {
    path?: string
    remoteUrl?: string
    branch?: string
    root?: string
    spaceDir?: string
    preparedAt?: string
    members?: Array<ProjectMember & { path?: string; remoteUrl?: string; branch?: string }>
  }
  const now = new Date().toISOString()
  if (Array.isArray(legacy.spaces) && (legacy.members ?? []).every((member) => typeof member.repositoryId === 'string')) {
    return record
  }

  /** 复用或登记仓库，返回仓库 id。 */
  const ensureRepository = (path?: string, remoteUrl?: string): string => {
    const existing = repositories.find((item) =>
      (path && item.path === path) || (remoteUrl && item.remoteUrl === remoteUrl))
    if (existing) return existing.id
    const repository: Repository = {
      id: randomUUID(),
      name: aliasOf(path ?? (remoteUrl as string)),
      ...(path ? { path } : {}),
      ...(remoteUrl ? { remoteUrl } : {}),
      createdAt: now,
    }
    repositories.push(repository)
    return repository.id
  }

  const members: ProjectMember[] = (legacy.members ?? []).map((raw) => {
    const member = raw as ProjectMember & { path?: string; remoteUrl?: string }
    return {
      id: member.id,
      alias: member.alias,
      repositoryId: member.repositoryId ?? ensureRepository(member.path, member.remoteUrl),
    }
  })
  if (members.length === 0 && (legacy.path || legacy.remoteUrl)) {
    members.push({
      id: randomUUID(),
      alias: normalizeAlias(legacy.path ? basename(legacy.path) : aliasOf(legacy.remoteUrl as string)),
      repositoryId: ensureRepository(legacy.path, legacy.remoteUrl),
    })
  }

  const spaces: ProjectSpace[] = Array.isArray(legacy.spaces) ? legacy.spaces : []
  const legacyMembers = (legacy.members ?? []) as Array<ProjectMember & { branch?: string }>
  const branch = legacy.branch ?? legacyMembers.find((member) => member.branch)?.branch
  if (spaces.length === 0 && branch) {
    spaces.push({
      id: randomUUID(),
      branch,
      createdAt: record.createdAt ?? now,
      status: 'ready',
      ...(legacy.root ? { root: legacy.root } : {}),
    })
  }

  return {
    id: record.id,
    name: record.name,
    ...(record.description ? { description: record.description } : {}),
    createdAt: record.createdAt ?? now,
    members,
    ...(legacy.spaceDir ? { dir: legacy.spaceDir } : {}),
    spaces,
  }
}

/** 从路径或地址推断别名。 */
function aliasOf(source: string): string {
  const tail = source.replace(/\/+$/, '').split(/[/:]/).pop() ?? 'repo'
  return tail.replace(/\.git$/, '') || 'repo'
}

/** 别名规范化：只保留字母数字与 . _ -。 */
function normalizeAlias(alias: string): string {
  return alias.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'repo'
}

/** 目录名 slug。 */
function slugOf(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'project'
}
