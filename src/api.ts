/**
 * Ascoder 浏览器 API：注册在 Connection 的已鉴权 exact fetch 路由上。
 *
 * 路由位于 `/api/ascoder/*`；Transport 只放行同源 owner peer，其余 403，
 * 因此这里不再自建鉴权。响应统一 `{ ok, data | error }`，业务错误用 200 + ok:false。
 */
import { readFile } from 'node:fs/promises'
import type { Context } from '@deepseek-ai/cordis'
import type { RoleEntry } from './roleStore.ts'
import type { AscoderEvent, AscoderEventType } from './events.ts'
import type { KnowledgeEntry, KnowledgeScope } from './types.ts'
import type { CodegraphFacade } from './codegraphService.ts'
import { readVersion } from './version.ts'
import type { TaskView } from './tasks.ts'
import type { CredentialStore } from './credentials.ts'
import {
  listBitbucketProjects,
  listBitbucketRepos,
  listGithubRepos,
  normalizeBase,
  type ImportProvider,
} from './importers.ts'
import type {
  MemberAddInput,
  Project,
  ProjectCreateInput,
  ProjectMember,
  ProjectSpace,
  ProjectView,
  Repository,
} from './projects.ts'

/** 项目概览路由。 */
const STATE_PATH = '/api/ascoder/state'
/** 分支列表路由。 */
const BRANCHES_PATH = '/api/ascoder/branches'
/** 单个分支空间的详情（成员、分支、HEAD）路由。 */
const SPACE_PATH = '/api/ascoder/space'
/** 成员候选分支路由。 */
const CANDIDATES_PATH = '/api/ascoder/branch-candidates'
/** 会话默认模型路由。 */
const MODELS_PATH = '/api/ascoder/models'
/** 异步任务路由。 */
const TASKS_PATH = '/api/ascoder/tasks'
/** 事件路由。 */
const EVENTS_PATH = '/api/ascoder/events'
/** 工具路由。 */
const TOOLS_PATH = '/api/ascoder/tools'
/** CodeGraph 索引路由。 */
const CODEGRAPH_PATH = '/api/ascoder/codegraph'
/** 知识库管理路由。 */
const KNOWLEDGE_PATH = '/api/ascoder/knowledge'
/** 写操作路由。 */
const ACTION_PATH = '/api/ascoder/action'
/** JSON 响应头。 */
const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' } as const

/** Connection 服务暴露的最小形状（避免依赖其类型包做声明合并）。 */
interface ConnectionFetchRegistry {
  register(route: {
    path: string
    methods: readonly ('GET' | 'HEAD' | 'POST')[]
    requestBody: 'buffered' | 'streaming'
    fetch: (request: Request) => Promise<Response>
  }): () => Promise<void>
}

/** 浏览器 API 依赖的项目能力子集（ProjectService 结构化满足）。 */
/** 设置页密码能力（SettingsPassword 结构化满足）。 */
export interface AscoderSecurity {
  /** 是否仍在使用初始密码。 */
  readonly usesDefault: boolean
  /** 校验密码。 */
  verify(password: string): boolean
  /** 修改密码。 */
  change(current: string, next: string): Promise<void>
}

/** 异步任务能力（TaskService 结构化满足）。 */
export interface AscoderTasks {
  list(): TaskView[]
  running(): TaskView[]
  /** 按互斥键查找运行中的任务（同一空间不允许并发准备/更新）。 */
  runningByKey(key: string): TaskView | undefined
  get(id: string): TaskView | undefined
  start(
    input: { kind: 'space.prepare' | 'space.sync' | 'space.clone' | 'repository.sync'; title: string; projectId?: string; spaceId?: string; key?: string },
    work: (handle: {
      id: string
      report(message: string, done?: number, total?: number): void
      succeed(message?: string): void
      fail(error: string): void
      readonly cancelled: boolean
    }) => Promise<void>,
  ): TaskView
  cancel(id: string): boolean
}

/** 一个工具在设置页的展示条目。 */
export interface AscoderToolEntry {
  /** 工具名（模型侧名称）。 */
  name: string
  /** 工具描述。 */
  description: string
  /** 归属：Ascoder 插件工具或宿主内置工具。 */
  group: 'ascoder' | 'host'
  /** 是否可在此启停（宿主工具体不可停用）。 */
  manageable: boolean
  /** 当前是否启用。 */
  enabled: boolean
  /** 调用次数。 */
  calls: number
  /** 失败次数。 */
  errors: number
  /** 最近调用时间（ISO 8601）。 */
  lastAt?: string
  /** 最近一次耗时（毫秒）。 */
  lastMs?: number
  /** 最近一次失败原因。 */
  lastError?: string
  /** 来源说明：插件 / 宿主 / 某个 Agent 预设。 */
  source?: string
}

/** 命令行工具可用性。 */
export interface AscoderCliStatus {
  /** 命令名。 */
  name: string
  /** 用途说明。 */
  purpose: string
  /** 是否可执行。 */
  available: boolean
  /** 版本或错误摘要。 */
  detail?: string
}

/** 工具清单与启停能力。 */
export interface AscoderToolSettings {
  /** 列出可见工具及其使用统计（含各 Agent 预设注入的工具）。 */
  list(): Promise<AscoderToolEntry[]>
  /** 探测 git / codegraph 等命令行工具的可用性。 */
  clis(): Promise<AscoderCliStatus[]>
  /** 启用或停用一个 Ascoder 工具。 */
  toggle(name: string, enabled: boolean): Promise<void>
  /** 清零使用统计（指定工具或全部）。 */
  reset(name?: string): Promise<void>
}

/** 事件日志能力。 */
export interface AscoderEvents {
  list(since?: number, limit?: number): AscoderEvent[]
  readonly cursor: number
  /** 追加事件（知识删除等需要留痕的动作）。 */
  emit(type: AscoderEventType, payload?: Record<string, unknown>): Promise<AscoderEvent>
}

/** 宿主模型能力（设置页选模型）。 */
export interface AscoderModelGateway {
  list(): Promise<{
    current: { provider: string; model: string }
    options: Array<{ provider: string; providerName: string; model: string; name: string }>
  }>
  set(provider: string, model: string): Promise<void>
}

/** 回答视角能力（RoleStore 结构化满足）。 */
export interface AscoderRoles {
  list(): RoleEntry[]
  selected(): RoleEntry
  select(id: string): Promise<RoleEntry>
  save(input: { id?: string; name: string; description?: string; instruction: string; structure?: string }): Promise<RoleEntry>
  remove(id: string): Promise<boolean>
}

export interface AscoderApiService {
  /** 分支空间根目录父路径。 */
  readonly root: string
  /** 设置页密码服务。 */
  readonly security: AscoderSecurity
  /** 回答视角服务。 */
  readonly roles: AscoderRoles
  /** 会话默认模型网关。 */
  readonly models: AscoderModelGateway
  /** 异步任务服务。 */
  readonly tasks: AscoderTasks
  /** 事件日志。 */
  readonly events: AscoderEvents
  /** 知识库（管理界面只读 + 删除）。 */
  readonly knowledge: {
    readonly total: number
    list(scope?: KnowledgeScope): KnowledgeEntry[]
    search(input: { query: string; limit?: number }, scope?: KnowledgeScope): { entries: KnowledgeEntry[]; total: number }
    forget(id: string): Promise<boolean>
  }
  /** 工具清单与启停。 */
  readonly toolSettings: AscoderToolSettings
  /** CodeGraph 索引编排。 */
  readonly codegraph: CodegraphFacade
  /** 存储模式：kv 正常，file 表示退回了本地文件兜底。 */
  readonly storage: { mode: 'kv' | 'file'; fallbacks: string[] }
  /** 仓库凭证存储。 */
  readonly credentials: CredentialStore
  /** 全部项目实时视图。 */
  state(): Promise<ProjectView[]>
  /** 项目可选分支。 */
  branches(projectId: string): Promise<{ current: string | null; local: string[]; remote: string[] }>
  /** 新建项目。 */
  create(input: ProjectCreateInput): Promise<Project>
  /** 更新项目。 */
  update(id: string, patch: { name?: string; description?: string }): Promise<Project>
  /** 删除项目。 */
  remove(id: string): Promise<boolean>
  /** 全部已登记仓库。 */
  listRepositories(): Repository[]
  /** 登记仓库（远程仓库可指定凭证）。 */
  addRepository(input: {
    name?: string
    path?: string
    remoteUrl?: string
    defaultBranch?: string
    credentialId?: string
  }): Promise<Repository>
  /** 删除仓库。 */
  removeRepository(id: string): Promise<boolean>
  /** 同步仓库。 */
  syncRepository(id: string): Promise<void>
  /** 仓库分支。 */
  repositoryBranches(id: string): Promise<{ current: string | null; local: string[]; remote: string[] }>
  /** 添加成员。 */
  addMember(id: string, input: MemberAddInput): Promise<ProjectMember>
  /** 移除成员。 */
  removeMember(id: string, memberId: string): Promise<boolean>
  /** 同步成员仓库。 */
  syncMember(id: string, memberId: string): Promise<void>
  /** 创建分支空间。 */
  createSpace(projectId: string, branch: string, memberBranches?: Record<string, string>): Promise<ProjectSpace>
  /** 自动规划空间的分支映射并准备。 */
  autoPlanSpace(
    projectId: string,
    branch: string,
    onStep?: (message: string, index: number, total: number) => void,
    shouldCancel?: () => boolean,
  ): Promise<{
    spaceId: string
    branch: string
    mapping: Record<string, string>
    unresolved: string[]
    status: string
    error?: string
  }>
  /** 修改空间里各成员的检出分支。 */
  setSpaceBranches(
    projectId: string,
    spaceId: string,
    memberBranches: Record<string, string>,
  ): Promise<ProjectSpace>
  /** 空间成员快照（分支/HEAD/改动）。 */
  spaceSnapshot(
    projectId: string,
    spaceId: string,
    options?: { files?: boolean },
  ): Promise<Array<Record<string, unknown>>>
  /** 成员候选分支（按相关度排序）。 */
  branchCandidates(
    projectId: string,
    wanted: string,
    current?: Record<string, string>,
  ): Promise<Array<Record<string, unknown>>>
  setRepositoryCredential(repositoryId: string, credentialId?: string): Promise<Repository>
  setRepositoryRemote(repositoryId: string, remoteUrl?: string): Promise<Repository>
  /** 准备分支空间（onStep 用于任务进度）。 */
  prepareSpace(
    projectId: string,
    spaceId: string,
    onStep?: (alias: string, index: number, total: number) => void,
    shouldCancel?: () => boolean,
  ): Promise<ProjectSpace>
  /** 按需统计某个空间里各成员的未提交改动数（列表页不展示，避免每次刷新都跑 git status）。 */
  spaceDirty(projectId: string, spaceId: string): Promise<Record<string, number>>
  /** 删除分支空间。 */
  removeSpace(projectId: string, spaceId: string): Promise<boolean>
  /** 进入分支空间，返回 workspace id。 */
  enterSpace(projectId: string, spaceId: string): Promise<string | undefined>
  /** 更新空间代码（git fetch + pull）。 */
  syncSpace(
    projectId: string,
    spaceId: string,
    onStep?: (alias: string, index: number, total: number) => void,
    shouldCancel?: () => boolean,
  ): Promise<Array<{ alias: string; result: string }>>
  /** 属于 Ascoder 空间的分组标题。 */
  spaceTitles(): string[]
}

/** 成功响应。 */
function ok(data: unknown): Response {
  return new Response(JSON.stringify({ ok: true, data }), { headers: JSON_HEADERS })
}

/** 业务失败响应（HTTP 200，前端只看 ok）。 */
function fail(error: unknown): Response {
  const message = error instanceof Error ? error.message : String(error)
  return new Response(JSON.stringify({ ok: false, error: message }), { headers: JSON_HEADERS })
}

/** 读取并校验 JSON 请求体。 */
async function readBody(request: Request): Promise<Record<string, unknown>> {
  const parsed: unknown = await request.json().catch(() => undefined)
  if (typeof parsed !== 'object' || parsed === null) throw new Error('请求体必须是 JSON 对象')
  return parsed as Record<string, unknown>
}

/** 取必填字符串字段。 */
function requireString(body: Record<string, unknown>, field: string): string {
  const value = body[field]
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`缺少字段: ${field}`)
  return value
}

/** 取可选字符串字段。 */
function optionalString(body: Record<string, unknown>, field: string): string | undefined {
  const value = body[field]
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

/** 校验导入平台取值。 */
function requireProvider(body: Record<string, unknown>): ImportProvider {
  const value = body.provider
  if (value !== 'bitbucket' && value !== 'github') throw new Error(`不支持的平台: ${String(value)}`)
  return value
}

/** 取出凭证明文（仅进程内使用）。 */
async function revealCredential(
  service: AscoderApiService,
  credentialId: string,
): Promise<{ username: string; password: string }> {
  return service.credentials.reveal(credentialId)
}

/** 处理一个写操作。 */
async function dispatch(service: AscoderApiService, body: Record<string, unknown>): Promise<unknown> {
  const op = requireString(body, 'op')
  switch (op) {
    case 'project.create':
      return service.create({
        name: requireString(body, 'name'),
        description: optionalString(body, 'description'),
      })
    case 'project.update':
      return service.update(requireString(body, 'projectId'), {
        name: optionalString(body, 'name'),
        description: optionalString(body, 'description'),
      })
    case 'project.remove':
      return { removed: await service.remove(requireString(body, 'projectId')) }
    case 'member.add':
      return service.addMember(requireString(body, 'projectId'), {
        repositoryId: requireString(body, 'repositoryId'),
        alias: optionalString(body, 'alias'),
      })
    case 'repo.add':
      return service.addRepository({
        name: optionalString(body, 'name'),
        path: optionalString(body, 'path'),
        remoteUrl: optionalString(body, 'remoteUrl'),
        defaultBranch: optionalString(body, 'defaultBranch'),
        credentialId: optionalString(body, 'credentialId'),
      })
    case 'cred.add':
      return service.credentials.save({
        id: optionalString(body, 'credentialId'),
        name: requireString(body, 'name'),
        username: requireString(body, 'username'),
        secret: optionalString(body, 'secret'),
      })
    case 'import.projects': {
      const provider = requireProvider(body)
      const credential = await revealCredential(service, requireString(body, 'credentialId'))
      if (provider !== 'bitbucket') throw new Error('只有 Bitbucket 需要先选项目')
      return { projects: await listBitbucketProjects(requireString(body, 'baseUrl'), credential) }
    }
    case 'import.repos': {
      const provider = requireProvider(body)
      const credential = await revealCredential(service, requireString(body, 'credentialId'))
      const baseUrl = requireString(body, 'baseUrl')
      return {
        base: normalizeBase(baseUrl, provider),
        repos: provider === 'bitbucket'
          ? await listBitbucketRepos(baseUrl, requireString(body, 'projectKey'), credential)
          : await listGithubRepos(baseUrl, credential, optionalString(body, 'org')),
      }
    }
    case 'import.add': {
      const provider = requireProvider(body)
      const credentialId = requireString(body, 'credentialId')
      const credential = await revealCredential(service, credentialId)
      // 立即用凭证验证一次连通性，避免把不可访问的仓库登记进来
      await (provider === 'bitbucket'
        ? listBitbucketProjects(requireString(body, 'baseUrl'), credential)
        : listGithubRepos(requireString(body, 'baseUrl'), credential, optionalString(body, 'org')))
      const repos = Array.isArray(body.repos) ? (body.repos as Array<{ name?: unknown; remoteUrl?: unknown }>) : []
      if (repos.length === 0) throw new Error('没有选择要导入的仓库')
      const existing = new Set(service.listRepositories().map((repository) => repository.remoteUrl ?? ''))
      const added: string[] = []
      const skipped: string[] = []
      for (const item of repos) {
        const remoteUrl = typeof item.remoteUrl === 'string' ? item.remoteUrl : ''
        const name = typeof item.name === 'string' && item.name !== '' ? item.name : undefined
        if (remoteUrl === '') continue
        if (existing.has(remoteUrl)) {
          skipped.push(remoteUrl)
          continue
        }
        await service.addRepository({ name, remoteUrl, credentialId })
        existing.add(remoteUrl)
        added.push(remoteUrl)
      }
      return { added: added.length, skipped: skipped.length }
    }
    case 'cred.remove':
      return { removed: await service.credentials.remove(requireString(body, 'credentialId')) }
    case 'repo.remote':
      return service.setRepositoryRemote(
        requireString(body, 'repositoryId'),
        optionalString(body, 'remoteUrl'),
      )
    case 'repo.credential':
      return service.setRepositoryCredential(
        requireString(body, 'repositoryId'),
        optionalString(body, 'credentialId'),
      )
    case 'repo.remove':
      return { removed: await service.removeRepository(requireString(body, 'repositoryId')) }
    case 'repo.sync':
      await service.syncRepository(requireString(body, 'repositoryId'))
      return { synced: true }
    case 'member.remove':
      return {
        removed: await service.removeMember(requireString(body, 'projectId'), requireString(body, 'memberId')),
      }
    case 'member.sync':
      await service.syncMember(requireString(body, 'projectId'), requireString(body, 'memberId'))
      return { synced: true }
    case 'space.create': {
      const overrides = body.memberBranches
      const memberBranches: Record<string, string> = {}
      if (overrides && typeof overrides === 'object' && !Array.isArray(overrides)) {
        for (const [alias, value] of Object.entries(overrides as Record<string, unknown>)) {
          if (typeof value === 'string' && value.trim() !== '') memberBranches[alias] = value
        }
      }
      return service.createSpace(
        requireString(body, 'projectId'),
        requireString(body, 'branch'),
        Object.keys(memberBranches).length > 0 ? memberBranches : undefined,
      )
    }
    case 'space.autoPlan': {
      const projectId = requireString(body, 'projectId')
      const branch = requireString(body, 'branch')
      const key = `space-auto:${projectId}:${branch}`
      // 与其他空间动作保持一致：同键正在跑就复用任务，而不是报错
      const reused = service.tasks.runningByKey(key) !== undefined
      const task = service.tasks.start(
        { kind: 'space.prepare', title: `自动规划分支空间 ${branch}`, projectId, key },
        async (handle) => {
          const planned = await service.autoPlanSpace(projectId, branch, (message, index, total) => {
            handle.report(message, index, total)
          }, () => handle.cancelled)
          if (planned.unresolved.length > 0) {
            handle.fail(`这些成员没有可用分支，需要手工指定：${planned.unresolved.join('、')}`)
            return
          }
          if (planned.status === 'failed') handle.fail(planned.error ?? '空间准备失败')
          else {
            handle.succeed('空间已按自动匹配的分支准备就绪')
            service.codegraph.maybeAutoIndex(projectId, planned.spaceId)
          }
        },
      )
      return { taskId: task.id, reused }
    }
    case 'space.branches': {
      const overrides = body.memberBranches
      const memberBranches: Record<string, string> = {}
      if (overrides && typeof overrides === 'object' && !Array.isArray(overrides)) {
        for (const [alias, value] of Object.entries(overrides as Record<string, unknown>)) {
          if (typeof value === 'string' && value.trim() !== '') memberBranches[alias] = value
        }
      }
      return service.setSpaceBranches(
        requireString(body, 'projectId'),
        requireString(body, 'spaceId'),
        memberBranches,
      )
    }
    case 'space.prepare': {
      const projectId = requireString(body, 'projectId')
      const spaceId = requireString(body, 'spaceId')
      const key = `space:${spaceId}`
      const reused = service.tasks.runningByKey(key) !== undefined
      const task = service.tasks.start(
        { kind: 'space.prepare', title: '准备分支空间', projectId, spaceId, key },
        async (handle) => {
          const prepared = await service.prepareSpace(projectId, spaceId, (alias, index, total) => {
            handle.report(`准备 ${alias}（${index + 1}/${total}）`, index, total)
          }, () => handle.cancelled)
          if (prepared.status === 'failed') handle.fail(prepared.error ?? '空间准备失败')
          else {
            handle.succeed('空间已就绪')
            // 首次准备成功：排队建立 codegraph 索引（后台任务，不阻塞使用）
            service.codegraph.maybeAutoIndex(projectId, spaceId)
          }
        },
      )
      return { taskId: task.id, reused }
    }
    case 'space.dirty': {
      const dirty = await service.spaceDirty(requireString(body, 'projectId'), requireString(body, 'spaceId'))
      return { dirty }
    }
    case 'space.remove': {
      const spaceId = requireString(body, 'spaceId')
      // 正在准备/更新空间时不能删：后台任务还在写这个目录
      if (service.tasks.runningByKey(`space:${spaceId}`)) throw new Error('空间正在准备或更新，完成后再删除')
      return {
        removed: await service.removeSpace(requireString(body, 'projectId'), spaceId),
      }
    }
    case 'space.sync': {
      const projectId = requireString(body, 'projectId')
      const spaceId = requireString(body, 'spaceId')
      const key = `space:${spaceId}`
      const reused = service.tasks.runningByKey(key) !== undefined
      const task = service.tasks.start(
        { kind: 'space.sync', title: '更新空间代码', projectId, spaceId, key },
        async (handle) => {
          const results = await service.syncSpace(projectId, spaceId, (alias, index, total) => {
            handle.report(`更新 ${alias}（${index + 1}/${total}）`, index, total)
          }, () => handle.cancelled)
          const failed = results.filter((item) => !['已更新', '已是最新'].includes(item.result))
          if (failed.length > 0) handle.fail(failed.map((item) => `${item.alias}: ${item.result}`).join('; '))
          else {
            handle.succeed('代码已更新')
            // 代码变了索引就旧了：就绪的空间自动排一次增量索引，其他情况标为过期由用户决定
            const space = (await service.state()).flatMap((project) => project.spaces).find((item) => item.id === spaceId)
            if (space?.indexStatus === 'ready') {
              void service.codegraph.start(projectId, spaceId, 'update').catch(() => undefined)
            }
          }
        },
      )
      return { taskId: task.id, reused }
    }
    case 'model.set':
      await service.models.set(requireString(body, 'provider'), requireString(body, 'model'))
      return { saved: true }
    case 'role.select':
      return service.roles.select(requireString(body, 'roleId'))
    case 'role.save':
      return service.roles.save({
        id: optionalString(body, 'roleId'),
        name: requireString(body, 'name'),
        description: optionalString(body, 'description'),
        instruction: requireString(body, 'instruction'),
        structure: optionalString(body, 'structure'),
      })
    case 'role.remove':
      return { removed: await service.roles.remove(requireString(body, 'roleId')) }
    case 'space.enter': {
      const projectId = requireString(body, 'projectId')
      const spaceId = requireString(body, 'spaceId')
      const space = (await service.state()).flatMap((item) => item.spaces).find((item) => item.id === spaceId)
      // 未就绪：先起准备任务，客户端轮询完成后再进入
      if (!space || space.status !== 'ready' || space.preparedCount < space.memberCount) {
        const key = `space:${spaceId}`
        const reused = service.tasks.runningByKey(key) !== undefined
        const task = service.tasks.start(
          { kind: 'space.prepare', title: '准备分支空间', projectId, spaceId, key },
          async (handle) => {
            const prepared = await service.prepareSpace(projectId, spaceId, (alias, index, total) => {
              handle.report(`准备 ${alias}（${index + 1}/${total}）`, index, total)
            })
            if (prepared.status === 'failed') handle.fail(prepared.error ?? '空间准备失败')
            else {
              handle.succeed('空间已就绪')
              service.codegraph.maybeAutoIndex(projectId, spaceId)
            }
          },
        )
        return { taskId: task.id, workspaceId: null, pending: true, reused }
      }
      const workspaceId = await service.enterSpace(projectId, spaceId)
      return { workspaceId: workspaceId ?? null }
    }
    case 'codegraph.index': {
      const projectId = requireString(body, 'projectId')
      const spaceId = requireString(body, 'spaceId')
      const mode = body.mode === 'create' || body.mode === 'update' ? body.mode : undefined
      const task = await service.codegraph.start(projectId, spaceId, mode)
      return { taskId: task.id }
    }
    case 'tool.toggle': {
      const name = requireString(body, 'name')
      const enabled = body.enabled === true
      await service.toolSettings.toggle(name, enabled)
      return { name, enabled }
    }
    case 'knowledge.delete': {
      const id = requireString(body, 'id')
      const entry = service.knowledge.list().find((item) => item.id === id)
      const removed = await service.knowledge.forget(id)
      if (removed) {
        await service.events.emit('knowledge.forgotten', {
          id,
          reason: typeof body.reason === 'string' && body.reason.trim() !== '' ? body.reason.trim() : '用户从设置页删除',
          ...(entry ? { kind: entry.kind, term: entry.term } : {}),
        })
      }
      return { removed }
    }
    case 'tool.reset':
      await service.toolSettings.reset(typeof body.name === 'string' && body.name !== '' ? body.name : undefined)
      return { reset: true }
    case 'task.cancel':
      return { cancelled: service.tasks.cancel(requireString(body, 'taskId')) }
    case 'auth.verify':
      return { valid: service.security.verify(requireString(body, 'password')) }
    case 'auth.change':
      await service.security.change(requireString(body, 'password'), requireString(body, 'nextPassword'))
      return { changed: true }
    default:
      throw new Error(`未知操作: ${op}`)
  }
}

/**
 * 注册 Ascoder API 路由。
 * @param ctx - 宿主插件上下文（需要 connection 服务）
 * @param service - 项目服务
 */
export function registerAscoderApi(ctx: Context, service: AscoderApiService): void {
  const connection = ctx.get('connection') as unknown as { fetch: ConnectionFetchRegistry } | undefined
  if (!connection) {
    ctx.logger.warn('ascoder: connection service unavailable, browser API not registered')
    return
  }

  ctx.effect(() => connection.fetch.register({
    path: STATE_PATH,
    methods: ['GET'],
    requestBody: 'buffered',
    fetch: async () => {
      try {
        return ok({
          version: readVersion(),
          projectsDir: service.root,
          projects: await service.state(),
          repositories: service.listRepositories(),
          credentials: service.credentials.list(),
          security: { usesDefaultPassword: service.security.usesDefault },
          storage: service.storage,
          tasks: { running: service.tasks.running() },
          roles: { list: service.roles.list(), selectedId: service.roles.selected().id },
          // 侧栏过滤依据：只有这些 workspace 分组属于 Ascoder
          spaces: service.spaceTitles(),
        })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/state')

  ctx.effect(() => connection.fetch.register({
    path: BRANCHES_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        const params = new URL(request.url).searchParams
        const repositoryId = params.get('repositoryId')
        if (repositoryId) {
          return ok({ repositoryId, ...(await service.repositoryBranches(repositoryId)) })
        }
        const projectId = params.get('projectId')
        if (!projectId) throw new Error('缺少查询参数: projectId 或 repositoryId')
        return ok({ projectId, ...(await service.branches(projectId)) })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/branches')

  ctx.effect(() => connection.fetch.register({
    path: SPACE_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        const params = new URL(request.url).searchParams
        const projectId = params.get('projectId')
        const spaceId = params.get('spaceId')
        if (!projectId || !spaceId) throw new Error('缺少查询参数: projectId 与 spaceId')
        const projects = await service.state()
        const project = projects.find((item) => item.id === projectId)
        const space = project?.spaces.find((item) => item.id === spaceId)
        if (!project || !space) throw new Error('空间不存在')
        const members = await service.spaceSnapshot(projectId, spaceId)
        return ok({ projectId, space, members })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/space')


  ctx.effect(() => connection.fetch.register({
    path: MODELS_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async () => {
      try {
        return ok(await service.models.list())
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/models')

  ctx.effect(() => connection.fetch.register({
    path: CODEGRAPH_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        const params = new URL(request.url).searchParams
        const projectId = params.get('projectId')
        if (!projectId) throw new Error('缺少查询参数: projectId')
        const spaceId = params.get('spaceId')
        if (spaceId) return ok({ space: await service.codegraph.status(projectId, spaceId) })
        return ok({ spaces: await service.codegraph.statusForProject(projectId) })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/codegraph')

  ctx.effect(() => connection.fetch.register({
    path: KNOWLEDGE_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        const params = new URL(request.url).searchParams
        const query = (params.get('query') ?? '').trim()
        const limitParam = Number(params.get('limit') ?? '200')
        const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 200
        const all = service.knowledge.list()
        const filtered = query === ''
          ? all
          : service.knowledge.search({ query, limit }).entries
        // 无关键词时按最新优先；有关键词时保留检索的相似度排序，不要反转
        const entries = query === '' ? filtered.slice(-limit).reverse() : filtered.slice(0, limit)
        const globalCount = all.filter((entry) => !entry.spaceId).length
        return ok({ total: all.length, globalCount, scopedCount: all.length - globalCount, entries })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/knowledge')

  ctx.effect(() => connection.fetch.register({
    path: TOOLS_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async () => {
      try {
        const [tools, clis] = await Promise.all([service.toolSettings.list(), service.toolSettings.clis()])
        return ok({ tools, clis })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/tools')

  ctx.effect(() => connection.fetch.register({
    path: TASKS_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        const params = new URL(request.url).searchParams
        const taskId = params.get('id')
        if (taskId) return ok({ task: service.tasks.get(taskId) ?? null })
        const limitParam = Number(params.get('limit') ?? '20')
        const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 200) : 20
        const kind = params.get('kind')
        const status = params.get('status')
        let tasks = service.tasks.list()
        if (kind) tasks = tasks.filter((task) => task.kind === kind)
        if (status) tasks = tasks.filter((task) => task.status === status)
        return ok({ running: service.tasks.running(), tasks: tasks.slice(0, limit) })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/tasks')

  ctx.effect(() => connection.fetch.register({
    path: EVENTS_PATH,
    methods: ['GET', 'HEAD'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        const params = new URL(request.url).searchParams
        const since = Number(params.get('since') ?? '0')
        const limit = Number(params.get('limit') ?? '50')
        return ok({ cursor: service.events.cursor, events: service.events.list(Number.isFinite(since) ? since : 0, Number.isFinite(limit) ? limit : 50) })
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/events')

  ctx.effect(() => connection.fetch.register({
    path: ACTION_PATH,
    methods: ['POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      try {
        return ok(await dispatch(service, await readBody(request)))
      } catch (error) {
        return fail(error)
      }
    },
  }), 'ascoder: /api/ascoder/action')

  ctx.logger.info('ascoder browser API registered: %s, %s, %s', STATE_PATH, BRANCHES_PATH, ACTION_PATH)
}
