/**
 * dsh-ascoder — Ascoder 团队代码理解能力的 DSH 插件形态。
 *
 * 两块能力：
 * 1. 自学习知识层：术语 / 知识 / 经验的检索、沉淀、遗忘（替代 legacy selflearning）。
 * 2. 项目与分支管理：登记本地/远程 Git 仓库、查看与切换分支、同步远端，
 *    并提供浏览器 API 与设置页界面。
 *
 * 不包含：codegraph 索引（代码排查交给 DSH 原生工具）、会话与 LLM 适配、任务框架。
 */
import { isAbsolute, join } from 'node:path'
import { existsSync } from 'node:fs'
import { openFileBackend, KnowledgeStore, openKvBackend as openKnowledgeKv, type KnowledgeStoreView } from './store.ts'
import { createFileBackend, createKvBackend, type RecordBackend } from './storage.ts'
import { ProjectService, type Project, type Repository } from './projects.ts'
import { SettingsPassword, type SecurityRecord } from './security.ts'
import { RoleStore, type RoleStateRecord } from './roleStore.ts'
import { EventLog, type EventLogRecord } from './events.ts'
import { TaskService, type TaskRecord } from './tasks.ts'
import { ToolUsageStore, createInstrumentedTool, type ToolUsageRecord } from './toolUsage.ts'
import { detectClis, type CliStatus } from './cliTools.ts'
import { createCodegraphFacade } from './codegraphService.ts'
import { CredentialStore, type CredentialRecord, askpassDirOf } from './credentials.ts'
import { configureAskpass } from './git.ts'
import { WorkspaceLinker, type WorkspaceRegistryLike } from './workspaces.ts'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import { registerAscoderApi, type AscoderApiService, type AscoderToolEntry, type AscoderToolSettings } from './api.ts'
/** 宿主 Agent 预设注册表的最小形状（本插件不依赖该包的类型）。 */
interface AgentPresetRegistryLike {
  /** 当前预设清单。 */
  remoteExportList(): Promise<{ presets: ReadonlyArray<{ id: string; name?: string; broken?: string }> }>
  /** 借用某个预设的作用域以读取其工具视图。 */
  acquireScope(id?: string): Promise<{ key: never } & AsyncDisposable>
}
import { buildKnowledgeTools } from './tools.ts'
import { buildProjectTools } from './projectTools.ts'
import { buildCodegraphTools } from './codegraphTools.ts'
import {
  buildGuideSection,
  buildIdentitySection,
  buildKnowledgeContextText,
  resolveRole,
  SECTION_ORDERS,
  type RoleName,
} from './prompt.ts'
import { renderRoleSection } from './roles.ts'
import { buildReadOnlySection } from './prompt.ts'
import type { KnowledgeEntry, KnowledgeScope } from './types.ts'
import type { Context } from '@deepseek-ai/cordis'
import type { KvUnit } from '@deepseek-ai/dsh-storage'
import z from '@deepseek-ai/schemastery'

/** Cordis 插件名。 */
export const name = 'ascoder'

/** 依赖的服务：工具、系统提示词、浏览器连接。 */
export const inject = ['tools', 'systemPrompt', 'connection']

/** 默认数据目录名（相对路径挂在 $DSH_HOME 下）。 */
const FALLBACK_DIR = 'ascoder'
/** 知识库回退数据文件名。 */
const FALLBACK_FILE = 'knowledge.json'
/** 项目注册表回退数据文件名。 */
const PROJECTS_FILE = 'projects.json'
/** 克隆项目根目录名（相对 dataDir）。 */
const PROJECTS_DIRNAME = 'projects'
/** 知识库 KV 单元名。 */
const KNOWLEDGE_UNIT = 'ascoder'
/** 项目注册表 KV 单元名（须匹配 storage UNIT_NAME_RE：^[a-z][a-z0-9_]*$）。 */
const PROJECTS_UNIT = 'ascoder_projects'
/** 仓库注册表的回退文件名（storage hub 不可用时使用）。 */
const REPOSITORIES_FILE = 'repositories.json'
/** 仓库注册表的 KV 单元名（必须匹配 /^[a-z][a-z0-9_]*$/）。 */
const REPOSITORIES_UNIT = 'ascoder_repositories'
/** 仓库注册表的表名。 */
const REPOSITORIES_TABLE = 'repositories'
/** 设置页密码的回退文件名。 */
const SECURITY_FILE = 'security.json'
/** 设置页密码的 KV 单元名。 */
const SECURITY_UNIT = 'ascoder_security'
/** 设置页密码的表名。 */
const SECURITY_TABLE = 'security'
/** 回答视角的回退文件名。 */
const ROLES_FILE = 'roles.json'
/** 回答视角的 KV 单元名。 */
const ROLES_UNIT = 'ascoder_roles'
/** 回答视角的表名。 */
const ROLES_TABLE = 'roles'
/** 事件日志的回退文件名。 */
const EVENTS_FILE = 'events.json'
/** 事件日志的 KV 单元名。 */
const EVENTS_UNIT = 'ascoder_events'
/** 事件日志的表名。 */
const EVENTS_TABLE = 'events'
/** 工具统计的回退文件名。 */
const TOOL_USAGE_FILE = 'tool-usage.json'
/** 工具统计的 KV 单元名。 */
const TOOL_USAGE_UNIT = 'ascoder_tool_usage'
/** 工具统计的表名。 */
const TOOL_USAGE_TABLE = 'usage'
/** 异步任务的回退文件名。 */
const TASKS_FILE = 'tasks.json'
/** 异步任务的 KV 单元名。 */
const TASKS_UNIT = 'ascoder_tasks'
/** 异步任务的表名。 */
const TASKS_TABLE = 'tasks'
/** 仓库凭证的回退文件名。 */
const CREDENTIALS_FILE = 'credentials.json'
/** 仓库凭证的 KV 单元名。 */
const CREDENTIALS_UNIT = 'ascoder_credentials'
/** 仓库凭证的表名。 */
const CREDENTIALS_TABLE = 'credentials'
/** 凭证密钥文件名。 */
const CREDENTIAL_KEY_FILE = 'credentials.key'
/** 知识条目表名。 */
const KNOWLEDGE_TABLE = 'entries'
/** 项目表名。 */
const PROJECTS_TABLE = 'projects'
/** 知识 context 相对 WEB_SURFACE 的槽位偏移。 */
const KNOWLEDGE_CONTEXT_OFFSET = 10
/** storage 单元打开超时：超时视为后端不可用，回退文件存储。 */
const STORAGE_OPEN_TIMEOUT_MS = 8000

/** 插件配置。 */
export interface Config {
  /** 回答风格角色：auto 按环境提示推断，否则固定角色。 */
  style: RoleName
  /** 数据目录：绝对路径原样使用；相对路径挂到 $DSH_HOME 下。 */
  dataDir: string
  /** 是否把团队知识注入每轮系统提示词。 */
  injectKnowledge: boolean
  /** 进入 DSH 设置页所需密码（出厂默认 change-me，请在 profile 配置覆盖）。 */
  adminPassword: string
}

/** 配置 schema（cordis 加载时校验并填默认值）。 */
export const Config: z<Config> = z.object({
  style: z.union(['auto', 'developer', 'product_manager', 'tester']).default('auto') as z<RoleName>,
  dataDir: z.string().default(FALLBACK_DIR),
  injectKnowledge: z.boolean().default(true),
  adminPassword: z.string().default('change-me'),
})

/** 解析数据目录：绝对路径原样使用，相对路径挂在 DSH_HOME 下（无 DSH_HOME 时挂 cwd）。 */
function resolveDataDir(configured: string): string {
  if (isAbsolute(configured)) return configured
  const home = process.env.DSH_HOME
  return join(home !== undefined && home !== '' ? home : process.cwd(), configured)
}

/** 从运行环境推断角色线索（style=auto 时）：取 cwd 末两级目录名。 */
function detectRoleHint(): string {
  const parts = process.cwd().split('/')
  return parts.slice(-2).join(' ')
}

/** 宿主 storage hub 的 kv 门面。 */
interface KvFacet {
  open(descriptor: {
    name: string
    version: number
    tables: readonly string[]
    hasGlobal: boolean
  }): Promise<KvUnit>
}

/** 取 storage hub 的 json 后端 kv facet；宿主未提供时返回 undefined。 */
function resolveKv(ctx: Context): KvFacet | undefined {
  const storage = ctx.get('storage') as unknown as
    | { backend: { get(name: string): { kv?: KvFacet } } }
    | undefined
  if (!storage) return undefined
  try {
    return storage.backend.get('json').kv
  } catch {
    return undefined
  }
}

/** 打开一个 KV 单元；失败或超时返回 undefined（调用方回退文件存储）。 */
async function openUnit(
  kv: KvFacet | undefined,
  name: string,
  table: string,
  onFallback?: (name: string) => void,
): Promise<KvUnit | undefined> {
  if (!kv) {
    onFallback?.(name)
    return undefined
  }
  try {
    return await Promise.race([
      kv.open({ name, version: 1, tables: [table], hasGlobal: true }),
      new Promise<never>((_resolve, reject) => {
        setTimeout(() => reject(new Error(`open timeout after ${STORAGE_OPEN_TIMEOUT_MS}ms`)), STORAGE_OPEN_TIMEOUT_MS)
      }),
    ])
  } catch (error) {
    console.error(`[dsh-ascoder] storage unit "${name}" unavailable, falling back to file store:`, error)
    onFallback?.(name)
    return undefined
  }
}

/** 代理目标类型：ProjectService 加上配置注入字段。 */
type AscoderApiServiceProxy = AscoderApiService

/** 插件入口。 */
export function apply(ctx: Context, config: Config): void {
  /** 打不开 KV 单元、退回文件存储的单元名（多实例同 profile 时会出现）。 */
  const storageFallbacks: string[] = []
  const trackOpen = async (kv: KvFacet | undefined, name: string, table: string): Promise<KvUnit | undefined> =>
    openUnit(kv, name, table, (unit) => {
      if (!storageFallbacks.includes(unit)) storageFallbacks.push(unit)
    })
  const style = resolveRole(config.style, detectRoleHint())
  ctx.logger.info('ascoder applying, style=%s dataDir=%s', style.label, config.dataDir)

  // 两个领域都用「异步打开 + lazy 代理」：注册同步完成，数据就绪后自动生效。
  const knowledgeHolder: { store?: KnowledgeStore } = {}
  const projectHolder: { service?: ProjectService } = {}

  const requireKnowledge = (): KnowledgeStore => {
    if (!knowledgeHolder.store) throw new Error('ascoder knowledge store is still loading, retry in a moment')
    return knowledgeHolder.store
  }
  const credentialsHolder: { service?: CredentialStore } = {}
  const requireCredentials = (): CredentialStore => {
    if (!credentialsHolder.service) throw new Error('ascoder credential store is still loading, retry in a moment')
    return credentialsHolder.service
  }

  const eventsHolder: { service?: EventLog } = {}
  const requireEvents = (): EventLog => {
    if (!eventsHolder.service) throw new Error('ascoder event log is still loading, retry in a moment')
    return eventsHolder.service
  }

  const toolUsageHolder: { store?: ToolUsageStore } = {}
  const requireToolUsage = (): ToolUsageStore => {
    if (!toolUsageHolder.store) throw new Error('ascoder tool usage store is still loading, retry in a moment')
    return toolUsageHolder.store
  }

  /** 把工具包装成带停用检查与使用统计的版本。 */
  /** 本插件自己注册的工具名（只有这些允许启停，宿主工具不受我们管理）。 */
  const ownedToolNames = new Set<string>()
  const instrumentTool = (definition: ToolDefinition): ToolDefinition => {
    ownedToolNames.add(definition.name)
    return createInstrumentedTool(definition, () => toolUsageHolder.store)
  }

  const tasksHolder: { service?: TaskService } = {}
  const requireTasks = (): TaskService => {
    if (!tasksHolder.service) throw new Error('ascoder task service is still loading, retry in a moment')
    return tasksHolder.service
  }

  const rolesHolder: { service?: RoleStore } = {}
  const requireRoles = (): RoleStore => {
    if (!rolesHolder.service) throw new Error('ascoder role store is still loading, retry in a moment')
    return rolesHolder.service
  }

  const securityHolder: { service?: SettingsPassword } = {}
  const requireSecurity = (): SettingsPassword => {
    if (!securityHolder.service) throw new Error('ascoder security store is still loading, retry in a moment')
    return securityHolder.service
  }

  const requireProjects = (): ProjectService => {
    if (!projectHolder.service) throw new Error('ascoder project registry is still loading, retry in a moment')
    return projectHolder.service
  }

  const lazyKnowledge: KnowledgeStoreView = {
    get total() { return requireKnowledge().total },
    list: (scope) => requireKnowledge().list(scope),
    search: (input, scope) => requireKnowledge().search(input, scope),
    save: async (input, scope) => requireKnowledge().save(input, scope),
    forget: async (id) => requireKnowledge().forget(id),
    recordHit: async (ids) => { await requireKnowledge().recordHit(ids) },
  }

  /**
   * 从工具执行上下文推断当前分支空间（会话工作目录就是空间根）。
   * 推断失败返回 undefined：按全局知识处理，不影响功能。
   */
  const scopeFromExec = async (exec: unknown): Promise<KnowledgeScope | undefined> => {
    const session = (exec as { agent?: { session?: { cwd?: string; header?: { cwd?: string } } } } | undefined)?.agent?.session
    // cwd 是会话头元数据（SessionHeader.cwd），不是 Session 的直属字段
    const cwd = session?.cwd ?? session?.header?.cwd
    if (!cwd) return undefined
    try {
      const projects = await requireProjects().state()
      for (const project of projects) {
        for (const space of project.spaces) {
          const root = space.root
          if (!root) continue
          if (cwd === root || cwd.startsWith(root + '/')) {
            return { projectId: project.id, spaceId: space.id, spaceBranch: space.branch }
          }
        }
      }
    } catch {
      // 项目未就绪时按全局处理
    }
    return undefined
  }

  const dataDir = resolveDataDir(config.dataDir)
  const projectsDir = join(dataDir, PROJECTS_DIRNAME)

  const bootstrap = (async () => {
    const kv = resolveKv(ctx)

    const knowledgeUnit = await trackOpen(kv, KNOWLEDGE_UNIT, KNOWLEDGE_TABLE)
    const projectsUnit = await trackOpen(kv, PROJECTS_UNIT, PROJECTS_TABLE)

    const knowledgeStore = await KnowledgeStore.open(
      knowledgeUnit
        ? openKnowledgeKv(knowledgeUnit)
        : openFileBackend(join(dataDir, FALLBACK_FILE)),
    )
    knowledgeHolder.store = knowledgeStore

    const securityUnit = await trackOpen(kv, SECURITY_UNIT, SECURITY_TABLE)
    const securityBackend: RecordBackend<SecurityRecord> = securityUnit
      ? createKvBackend<SecurityRecord>(securityUnit, SECURITY_TABLE)
      : createFileBackend<SecurityRecord>(join(dataDir, SECURITY_FILE), SECURITY_TABLE)
    securityHolder.service = await SettingsPassword.open(securityBackend, config.adminPassword)

    const rolesUnit = await trackOpen(kv, ROLES_UNIT, ROLES_TABLE)
    const rolesBackend: RecordBackend<RoleStateRecord> = rolesUnit
      ? createKvBackend<RoleStateRecord>(rolesUnit, ROLES_TABLE)
      : createFileBackend<RoleStateRecord>(join(dataDir, ROLES_FILE), ROLES_TABLE)
    rolesHolder.service = await RoleStore.open(rolesBackend, config.style)

    const credentialsUnit = await trackOpen(kv, CREDENTIALS_UNIT, CREDENTIALS_TABLE)
    const credentialsBackend: RecordBackend<CredentialRecord> = credentialsUnit
      ? createKvBackend<CredentialRecord>(credentialsUnit, CREDENTIALS_TABLE)
      : createFileBackend<CredentialRecord>(join(dataDir, CREDENTIALS_FILE), CREDENTIALS_TABLE)
    const credentialStore = await CredentialStore.open(credentialsBackend, join(dataDir, CREDENTIAL_KEY_FILE))
    credentialsHolder.service = credentialStore
    // git 通过 GIT_ASKPASS 取凭证，避免令牌进 URL / 命令行
    await configureAskpass(askpassDirOf(dataDir))

    const toolUsageUnit = await trackOpen(kv, TOOL_USAGE_UNIT, TOOL_USAGE_TABLE)
    const toolUsageBackend: RecordBackend<ToolUsageRecord> = toolUsageUnit
      ? createKvBackend<ToolUsageRecord>(toolUsageUnit, TOOL_USAGE_TABLE)
      : createFileBackend<ToolUsageRecord>(join(dataDir, TOOL_USAGE_FILE), TOOL_USAGE_TABLE)
    toolUsageHolder.store = await ToolUsageStore.open(toolUsageBackend)

    const eventsUnit = await trackOpen(kv, EVENTS_UNIT, EVENTS_TABLE)
    const eventsBackend: RecordBackend<EventLogRecord> = eventsUnit
      ? createKvBackend<EventLogRecord>(eventsUnit, EVENTS_TABLE)
      : createFileBackend<EventLogRecord>(join(dataDir, EVENTS_FILE), EVENTS_TABLE)
    eventsHolder.service = await EventLog.open(eventsBackend)

    const tasksUnit = await trackOpen(kv, TASKS_UNIT, TASKS_TABLE)
    const tasksBackend: RecordBackend<TaskRecord> = tasksUnit
      ? createKvBackend<TaskRecord>(tasksUnit, TASKS_TABLE)
      : createFileBackend<TaskRecord>(join(dataDir, TASKS_FILE), TASKS_TABLE)
    tasksHolder.service = await TaskService.open(tasksBackend, eventsHolder.service)

    const repositoryUnit = await trackOpen(kv, REPOSITORIES_UNIT, REPOSITORIES_TABLE)
    const projectBackend: RecordBackend<Project> = projectsUnit
      ? createKvBackend<Project>(projectsUnit, PROJECTS_TABLE)
      : createFileBackend<Project>(join(dataDir, PROJECTS_FILE), PROJECTS_TABLE)
    const repositoryBackend: RecordBackend<Repository> = repositoryUnit
      ? createKvBackend<Repository>(repositoryUnit, REPOSITORIES_TABLE)
      : createFileBackend<Repository>(join(dataDir, REPOSITORIES_FILE), REPOSITORIES_TABLE)
    const projectService = await ProjectService.open(
      projectBackend,
      repositoryBackend,
      projectsDir,
      // 惰性取服务：apply 时 workspaceRegistry 可能尚未就绪
      new WorkspaceLinker(() => ctx.get('workspaceRegistry') as unknown as WorkspaceRegistryLike | undefined),
      // 凭证存储同样是异步打开的，这里给惰性解析器
      {
        has: (id: string) => credentialStore.has(id),
        reveal: (id: string) => credentialStore.reveal(id),
      },
      eventsHolder.service,
    )
    await projectService.bootstrap()
    projectHolder.service = projectService

    ctx.logger.info(
      'ascoder stores ready: knowledge=%d projects=%d projectsDir=%s',
      knowledgeStore.total,
      projectHolder.service.list().length,
      projectsDir,
    )
  })()
  bootstrap.catch((error) => {
    console.error('[dsh-ascoder] bootstrap failed:', error)
    ctx.logger.error('ascoder bootstrap failed: %s', String(error))
  })

  // 工具：知识层 + 项目/分支。
  for (const tool of buildKnowledgeTools(lazyKnowledge, {
    // 知识删除写入事件日志，便于审计"谁在什么时候删了哪条、为什么"
    events: { emit: (type, payload) => requireEvents().emit(type, payload) },
    // 读写按当前分支空间隔离（全局条目对所有空间可见）
    scope: scopeFromExec,
  })) ctx.tools.register(instrumentTool(tool))
  // 项目能力在注册表就绪前先挂 lazy 代理，避免工具与路由注册被异步打开阻塞。
  const lazyProjects = new Proxy({} as ProjectService, {
    get(_target, property: string) {
      const service = requireProjects()
      const value = Reflect.get(service, property, service) as unknown
      return typeof value === 'function' ? (value as (...args: unknown[]) => unknown).bind(service) : value
    },
  })

  /** CodeGraph 索引编排：API 与 Agent 工具共用。 */
  const codegraphFacade = createCodegraphFacade({
    projects: () => requireProjects(),
    tasks: () => requireTasks(),
  })

  // 工具侧代理：额外暴露任务与事件，供 ascoder_task_list 使用。
  const lazyTools = new Proxy(lazyProjects as unknown as Parameters<typeof buildProjectTools>[0], {
    get(target, property: string) {
      if (property === 'tasks') return requireTasks()
      if (property === 'events') return requireEvents()
      if (property === 'codegraph') return codegraphFacade
      if (property === 'scope') return scopeFromExec
      if (property === 'storage') return storageInfo()
      return Reflect.get(target, property, target) as unknown
    },
  })
  for (const tool of buildProjectTools(lazyTools)) ctx.tools.register(instrumentTool(tool))
  // CodeGraph 工具：提示词里引用的 ascoder_codegraph_status / ascoder_codegraph_index
  for (const tool of buildCodegraphTools({
    codegraph: (lazyTools as unknown as { codegraph: Parameters<typeof buildCodegraphTools>[0]['codegraph'] }).codegraph,
    projects: lazyProjects as unknown as { state(): Promise<Array<{ id: string; name: string }>> },
    scope: scopeFromExec,
  })) {
    ctx.tools.register(instrumentTool(tool))
  }

  // 会话默认模型：读写宿主 agentDefaultModel，模型目录来自 llm 服务。
  const modelGateway = {
    async list() {
      const llm = ctx.get('llm') as unknown as {
        listProviders(): Array<{ id: string; name: string }>
        listModels(provider: string): Promise<Array<{ id: string; name?: string }>>
      } | undefined
      const defaultModel = ctx.get('agentDefaultModel') as unknown as {
        currentSelection(): { provider: string; model: string }
      } | undefined
      if (!llm || !defaultModel) throw new Error('宿主未提供模型服务')
      const options: Array<{ provider: string; providerName: string; model: string; name: string }> = []
      for (const provider of llm.listProviders()) {
        const models = await llm.listModels(provider.id).catch(() => [])
        for (const model of models) {
          options.push({
            provider: provider.id,
            providerName: provider.name,
            model: model.id,
            name: model.name ?? model.id,
          })
        }
      }
      const current = defaultModel.currentSelection()
      return { current: { provider: current.provider, model: current.model }, options }
    },
    async set(provider: string, model: string) {
      const defaultModel = ctx.get('agentDefaultModel') as unknown as {
        saveSelection(next: { provider: string; model: string }): Promise<void>
      } | undefined
      if (!defaultModel) throw new Error('宿主未提供模型服务')
      await defaultModel.saveSelection({ provider, model })
    },
  }

  /** Ascoder 插件工具名前缀：这些工具在设置页可以启停。 */
  const ASC_TOOL_PREFIXES = ['ascoder_', 'knowledge_']

  // 工具清单 + 使用统计 + 启停（设置页「工具」）。
  /** 把一组定义转成设置页条目（按名字去重，先到先得）。 */
  const toEntries = (
    definitions: readonly ToolDefinition[],
    source: string,
    seen: Set<string>,
  ): AscoderToolEntry[] => {
    const store = toolUsageHolder.store
    const entries: AscoderToolEntry[] = []
    for (const definition of definitions) {
      if (seen.has(definition.name)) continue
      seen.add(definition.name)
      const usage = store?.get(definition.name)
      const manageable = ASC_TOOL_PREFIXES.some((prefix) => definition.name.startsWith(prefix))
      entries.push({
        name: definition.name,
        description: definition.description ?? '',
        group: manageable ? 'ascoder' : 'host',
        manageable,
        enabled: store ? store.isEnabled(definition.name) : true,
        calls: usage?.calls ?? 0,
        errors: usage?.errors ?? 0,
        source,
        ...(usage?.lastAt ? { lastAt: usage.lastAt } : {}),
        ...(usage?.lastMs !== undefined ? { lastMs: usage.lastMs } : {}),
        ...(usage?.lastError ? { lastError: usage.lastError } : {}),
      })
    }
    return entries
  }

  /** 当前存储模式：任一单元退回文件存储即为 file。 */
  const storageInfo = (): { mode: 'kv' | 'file'; fallbacks: string[] } => ({
    mode: storageFallbacks.length > 0 ? 'file' : 'kv',
    fallbacks: [...storageFallbacks],
  })

  const toolSettings: AscoderToolSettings = {
    async list(): Promise<AscoderToolEntry[]> {
      const seen = new Set<string>()
      const entries = toEntries(ctx.tools.definitions(), '宿主', seen)
      // 预设里注入的宿主工具（bash / read / grep …）不在全局视图里，逐个预设取一次
      const presets = ctx.get('agentPresets') as AgentPresetRegistryLike | undefined
      if (presets) {
        try {
          const roster = await presets.remoteExportList()
          for (const preset of roster.presets) {
            if (preset.broken) continue
            const lease = await presets.acquireScope(preset.id)
            try {
              entries.push(...toEntries(ctx.tools.definitions(lease.key), preset.name ?? preset.id, seen))
            } finally {
              await lease[Symbol.asyncDispose]()
            }
          }
        } catch {
          // 预设不可读时保留全局视图
        }
      }
      return entries.sort((left, right) => {
        if (left.group !== right.group) return left.group === 'ascoder' ? -1 : 1
        return left.name.localeCompare(right.name)
      })
    },
    async clis(): Promise<CliStatus[]> {
      // 克隆一份再用：探测结果有缓存，直接改会重复追加
      const list = (await detectClis()).map((cli) => ({ ...cli }))
      // codegraph 需要仓库内存在 .codegraph 索引，这里统计分支空间的索引覆盖率
      const codegraph = list.find((cli) => cli.name === 'codegraph')
      const projects = projectHolder.service
      if (codegraph && codegraph.available && projects) {
        try {
          const spaces = (await projects.state()).flatMap((project) => project.spaces)
          const ready = spaces.filter((space) => space.status === 'ready' && space.root)
          const indexed = ready.filter((space) => space.root && existsSync(join(space.root, '.codegraph')))
          codegraph.detail = `${codegraph.detail ?? ''} · ${indexed.length}/${ready.length} 个就绪分支空间已建索引`.trim()
        } catch {
          // 读取项目失败时保留版本信息
        }
      }
      return list
    },
    async toggle(name: string, enabled: boolean): Promise<void> {
      // 只允许启停本插件注册的工具：宿主内置工具（bash/read/…）不归我们管理，
      // 写进停用集合只会造成"显示了已停用但实际照常可用"的假象。
      if (!ownedToolNames.has(name)) {
        throw new Error(`只能启停 Ascoder 插件自己的工具：${name}`)
      }
      await requireToolUsage().setEnabled(name, enabled)
    },
    async reset(name?: string): Promise<void> {
      await requireToolUsage().reset(name)
    },
  }

  // 浏览器 API：注册即 effect，卸载自动撤销。
  registerAscoderApi(ctx, new Proxy(lazyProjects as unknown as AscoderApiServiceProxy, {
    get(target, property: string) {
      if (property === 'security') return requireSecurity()
      if (property === 'roles') return requireRoles()
      if (property === 'models') return modelGateway
      if (property === 'tasks') return requireTasks()
      if (property === 'events') return requireEvents()
      if (property === 'credentials') return requireCredentials()
      if (property === 'scope') return scopeFromExec
      if (property === 'knowledge') return requireKnowledge()
      if (property === 'toolSettings') return toolSettings
      if (property === 'codegraph') return codegraphFacade
      if (property === 'storage') return storageInfo()
      return Reflect.get(target, property, target) as unknown
    },
  }))

  // 知识工作方式 section。
  // 身份 section：语气/自称都收敛到 Ascoder，不提宿主与实现细节。
  ctx.systemPrompt.section({
    name: 'ascoder:identity',
    order: ctx.systemPrompt.getSectionOrder(SECTION_ORDERS.role) - 1,
    text: buildIdentitySection(),
  })

  ctx.systemPrompt.section({
    name: 'ascoder:guide',
    order: ctx.systemPrompt.getSectionOrder(SECTION_ORDERS.guide),
    text: buildGuideSection(),
  })

  // 只读约定 section：权限是只读的，唯一改动代码的途径是 ascoder_sync_space。
  ctx.systemPrompt.section({
    name: 'ascoder:read-only',
    order: ctx.systemPrompt.getSectionOrder(SECTION_ORDERS.guide) + 1,
    text: buildReadOnlySection(),
  })

  // 团队知识动态 context：每轮组装时读取快照，空库返回空文本（DSH 跳过）。
  ctx.systemPrompt.context({
    name: 'ascoder:knowledge',
    order: ctx.systemPrompt.getContextOrder('WEB_SURFACE') + KNOWLEDGE_CONTEXT_OFFSET,
    text: () => (config.injectKnowledge ? buildKnowledgeContextText(() => knowledgeHolder.store?.list() ?? []) : ''),
  })

  // 角色风格 section：persona suffix 位置。
  ctx.systemPrompt.section({
    name: 'ascoder:answer-style',
    order: ctx.systemPrompt.getSectionOrder(SECTION_ORDERS.role),
    // 视角可在设置里切换，因此每次组装系统提示词时实时读取
    text: () => (rolesHolder.service ? requireRoles().section() : renderRoleSection(style)),
  })

  // 启动自愈：容器被重建会杀掉正在跑的索引任务，空间状态却停在 indexing。
  // 这里在启动时统一改回 stale（可点「更新索引」重建），避免界面一直显示"索引中"
  // 又没有任何任务在跑；同时配合 maybeAutoIndex 的中断保护，不再自动开一轮全量重建。
  void bootstrap.then(async () => {
    try {
      const projects = await projectHolder.service?.state()
      for (const project of projects ?? []) {
        for (const space of project.spaces) {
          if (space.indexStatus !== 'indexing') continue
          await projectHolder.service?.setIndexState(project.id, space.id, { indexStatus: 'stale' })
          console.log(`[dsh-ascoder] 索引状态自愈：${project.name} · ${space.branch} indexing → stale`)
        }
      }
    } catch {
      // 自愈失败不影响插件加载
    }
  })

  // 卸载：先等数据就绪，再释放介质。
  ctx.effect(() => async () => {
    await bootstrap.catch(() => undefined)
    // 五个介质都要释放：知识库/项目/凭证（可能是 KV 单元）/事件日志/工具统计
    // 工具统计有自己的节流定时器，不 close 会丢最后一批计数并泄漏 KV 单元
    await knowledgeHolder.store?.close()
    await projectHolder.service?.close()
    await credentialsHolder.service?.close()
    await eventsHolder.service?.close()
    await toolUsageHolder.store?.close()
  })

  console.log('[dsh-ascoder] plugin ready')
}

export { KnowledgeStore, openFileBackend } from './store.ts'
export { ProjectService } from './projects.ts'
export { buildKnowledgeTools } from './tools.ts'
export { buildProjectTools } from './projectTools.ts'
export { registerAscoderApi } from './api.ts'
export {
  buildGuideSection,
  buildIdentitySection,
  buildKnowledgeContextText,
  resolveRole,
} from './prompt.ts'
export { ROLE_STYLES, renderRoleSection } from './roles.ts'
export type { RoleName } from './prompt.ts'
export { KNOWLEDGE_KINDS, knowledgeKey, isKnowledgeKind } from './types.ts'
export type { KnowledgeEntry, KnowledgeKind } from './types.ts'
export type { KnowledgeEntry as AscoderKnowledgeEntry } from './types.ts'
