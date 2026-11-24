/**
 * 项目/分支空间的 Agent 工具：对话里也能建项目、加成员、开分支空间。
 */
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { defineTool, type ToolDefinition } from '@deepseek-ai/dsh-tools'
import type { MemberAddInput, ProjectCreateInput, ProjectView } from './projects.ts'
import type { AscoderEvent } from './events.ts'
import type { TaskView } from './tasks.ts'
import type { SpaceIndexStatus } from './codegraph.ts'
import { commitDetail, commitPatch, isGitRepository } from './git.ts'

/** 项目工具依赖的能力子集（ProjectService 结构化满足）。 */
export interface AscoderProjectTools {
  readonly root: string
  state(): Promise<ProjectView[]>
  create(input: ProjectCreateInput): Promise<{ id: string; name: string }>
  addMember(id: string, input: MemberAddInput): Promise<{ id: string; alias: string }>
  listRepositories(): Array<{ id: string; name: string; path?: string; remoteUrl?: string }>
  addRepository(input: { name?: string; path?: string; remoteUrl?: string; defaultBranch?: string }): Promise<{ id: string; name: string }>
  createSpace(id: string, branch: string, memberBranches?: Record<string, string>): Promise<{ id: string; branch: string }>
  autoPlanSpace(
    id: string,
    branch: string,
  ): Promise<{
    spaceId: string
    branch: string
    mapping: Record<string, string>
    unresolved: string[]
    status: string
    error?: string
  }>
  setSpaceBranches(
    id: string,
    spaceId: string,
    memberBranches: Record<string, string>,
  ): Promise<{ id: string; branch: string; status: string; error?: string }>
  branchCandidates(
    id: string,
    wanted: string,
    current?: Record<string, string>,
  ): Promise<Array<{
    alias: string
    repositoryName: string
    branch: string
    matched: boolean
    local: boolean
    committedAt?: number
    score: number
  }>>
  prepareSpace(id: string, spaceId: string): Promise<{ id: string; branch: string; status: string; error?: string }>
  syncSpace(id: string, spaceId: string): Promise<Array<{ alias: string; result: string }>>
  /** 列出分支空间里有界文件清单（按成员仓库）。 */
  listSpaceFiles(
    projectId: string,
    spaceId: string,
    options?: { pathPrefix?: string; glob?: string; maxFiles?: number },
  ): Promise<{ groups: Array<{ alias: string; files: string[] }>; truncated: boolean }>
  /** 在分支空间里检索代码（按成员逐个 git grep）。 */
  searchCode(
    projectId: string,
    spaceId: string,
    query: string,
    options?: { pathPrefix?: string; maxMatches?: number; queries?: string[] },
  ): Promise<{ matches: Array<{ alias: string; file: string; line: number; text: string }>; truncated: boolean }>
  /**
   * 从工具执行上下文推断当前分支空间（会话工作目录就是空间根）。
   * 有了它，projectId/spaceId 可以省略，模型不必先记 id。
   */
  scope?: (exec: unknown) => Promise<{ projectId: string; spaceId?: string; branch?: string } | undefined>
  /** 分支空间快照（每个成员的分支/HEAD/改动/领先落后），用于替代多次 bash；files 时附带 HEAD 变更文件（有界）。 */
  spaceSnapshot(id: string, spaceId: string): Promise<Array<{
    alias: string
    branch: string
    head: string
    subject: string
    committedAt: string
    remote: string
    dirty: number
    ahead: number | null
    behind: number | null
    error?: string
  }>>
  /** 异步任务（可选；未接入时任务工具返回空列表）。 */
  tasks?: { list(): TaskView[]; running(): TaskView[] }
  /** 事件日志（可选）。 */
  events?: { list(since?: number, limit?: number): AscoderEvent[]; readonly cursor: number }
  /** CodeGraph 索引编排（可选）。 */
  codegraph?: {
    statusForProject(projectId: string): Promise<Array<SpaceIndexStatus & { spaceId: string; branch: string }>>
    start(projectId: string, spaceId: string, mode?: 'create' | 'update'): Promise<{ id: string }>
    resolveSpace(projectRef: string, branch: string): Promise<{
      project: { id: string; name: string }
      space: { id: string; branch: string; status: string }
    }>
    /** 索引就绪后的语义查询（未就绪会报错）。 */
    query(projectRef: string, branch: string, args: string[]): Promise<{ output: string; dir: string }>
  }
}


/** 文件骨架里单个声明的信息。 */
export interface FileSymbol {
  /** 声明所在行号（1 起）。 */
  line: number
  /** 声明种类：class / interface / enum / type / function / method / def / func / struct。 */
  kind: string
  /** 声明名。 */
  name: string
}

/** 骨架扫描结果。 */
export interface FileOutline {
  symbols: FileSymbol[]
  lines: number
  chars: number
  truncated: boolean
}

/** 单次骨架最多返回的声明数。 */
const OUTLINE_SYMBOL_LIMIT = 120
/** 骨架扫描的行数上限（避免超大文件占用时间）。 */
const OUTLINE_SCAN_LINES = 20000
/** 允许生成骨架的文件大小上限（字节）。 */
const OUTLINE_MAX_BYTES = 2 * 1024 * 1024

/** 按扩展名选用的声明规则（顺序即优先级）。 */
const OUTLINE_RULES: Array<{ kinds: string[]; re: RegExp; kind: string }> = [
  { kinds: ['java'], re: /^\s*(?:public\s+|protected\s+|private\s+|abstract\s+|final\s+|sealed\s+)*class\s+([A-Za-z_$][\w$]*)/, kind: 'class' },
  { kinds: ['java', 'ts', 'js'], re: /^\s*(?:(?:public|protected|private|abstract|final|static|sealed)\s+)*(?:export\s+)?(?:default\s+)?interface\s+([A-Za-z_$][\w$]*)/, kind: 'interface' },
  { kinds: ['java', 'ts', 'js'], re: /^\s*(?:(?:public|protected|private|static)\s+)*(?:export\s+)?enum\s+([A-Za-z_$][\w$]*)/, kind: 'enum' },
  { kinds: ['ts', 'js'], re: /^\s*(?:export\s+)?type\s+([A-Za-z_$][\w$]*)\s*[=<]/, kind: 'type' },
  { kinds: ['ts', 'js'], re: /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/, kind: 'function' },
  { kinds: ['ts', 'js'], re: /^\s*export\s+(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\(|[A-Za-z_$][\w$]*\s*=>)/, kind: 'function' },
  { kinds: ['java'], re: /^\s+(?:public|protected|private)\s+[\w<>\[\],.?\s]+\s+([A-Za-z_$][\w$]*)\s*\(/, kind: 'method' },
  { kinds: ['py'], re: /^\s*(?:async\s+)?def\s+([A-Za-z_]\w*)/, kind: 'def' },
  { kinds: ['py'], re: /^\s*class\s+([A-Za-z_]\w*)/, kind: 'class' },
  { kinds: ['go'], re: /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_]\w*)/, kind: 'func' },
  { kinds: ['go'], re: /^\s*type\s+([A-Za-z_]\w*)\s+(?:struct|interface)/, kind: 'struct' },
  { kinds: ['vue'], re: /^\s*(?:export\s+)?(?:default\s+)?(?:defineComponent|{)/, kind: 'component' },
]

/** 扩展名 → 规则族。 */
function outlineFamily(filePath: string): string {
  const ext = filePath.toLowerCase().slice(filePath.lastIndexOf('.') + 1)
  if (ext === 'java') return 'java'
  if (ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx' || ext === 'mjs') return 'ts'
  if (ext === 'py') return 'py'
  if (ext === 'go') return 'go'
  if (ext === 'vue') return 'vue'
  return ''
}

/**
 * 扫描文件内容，抽取声明与行号（纯函数，方便测试）。
 * @param content - 文件文本
 * @param filePath - 文件路径（用于选规则）
 * @param maxSymbols - 最多返回多少条声明
 */
export function scanFileOutline(content: string, filePath: string, maxSymbols = OUTLINE_SYMBOL_LIMIT): FileOutline {
  const family = outlineFamily(filePath)
  const rules = OUTLINE_RULES.filter((rule) => family === '' ? rule.kind !== 'component' : rule.kinds.includes(family))
  const lines = content.split('\n')
  const scanLines = Math.min(lines.length, OUTLINE_SCAN_LINES)
  const symbols: FileSymbol[] = []
  for (let index = 0; index < scanLines; index += 1) {
    if (symbols.length >= maxSymbols) break
    const text = lines[index]
    if (text.length === 0 || text.length > 400) continue
    for (const rule of rules) {
      const match = rule.re.exec(text)
      if (!match) continue
      symbols.push({ line: index + 1, kind: rule.kind, name: match[1] })
      break
    }
  }
  return {
    symbols,
    lines: lines.length,
    chars: content.length,
    truncated: symbols.length >= maxSymbols || lines.length > OUTLINE_SCAN_LINES,
  }
}

/** 把长文本截断到指定长度（避免工具返回过大）。 */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max)}…（共 ${text.length} 字）`
}

/**
 * 解析项目与空间 id。
 *
 * 模型经常拿不到完整 UUID：可能传目录名 `project-f6b68ba6`、id 前缀、或项目名，
 * 空间也可能只传分支名。这里统一做宽容匹配，匹配不到时把可用值告诉模型。
 */
async function resolveSpace(
  service: AscoderProjectTools,
  projectRef: string | undefined,
  spaceRef?: string | undefined,
  branchRef?: string | undefined,
  exec?: unknown,
): Promise<{ projectId: string; spaceId: string }> {
  const projects = await service.state()
  const wantedProject = (projectRef ?? '').trim()
  // 没给项目 id 时用会话工作目录推断项目（模型常只给 branch，或什么都不给）
  let projectRefResolved = wantedProject
  if (projectRefResolved === '') {
    const inferred = await service.scope?.(exec)
    if (!inferred) {
      throw new Error('缺少 projectId：当前会话不在分支空间里，无法自动推断项目；请传 projectId（可先用 ascoder_project_list 获取）')
    }
    projectRefResolved = inferred.projectId
    const inferredProject = projects.find((item) => item.id === inferred.projectId)
    if (!inferredProject) throw new Error(`找不到项目：${inferred.projectId}`)
    // 只给了项目、没给空间时直接用推断出的空间
    const wantedRef = (spaceRef ?? '').trim()
    const wantedBranch = (branchRef ?? '').trim()
    if (wantedRef === '' && wantedBranch === '') {
      const space = inferred.spaceId
        ? inferredProject.spaces.find((item) => item.id === inferred.spaceId)
        : inferredProject.spaces.find((item) => item.branch === inferred.branch)
      if (space) return { projectId: inferredProject.id, spaceId: space.id }
      throw new Error('推断出的分支空间已不存在，请传 projectId/branch')
    }
  }
  const wantedProjectResolved = projectRefResolved
  const stripped = wantedProjectResolved.replace(/^project-/, '')
  const project = projects.find((item) => item.id === wantedProjectResolved)
    ?? projects.find((item) => item.name === wantedProjectResolved)
    ?? projects.find((item) => item.id.startsWith(stripped) && stripped.length >= 6)
  if (!project) {
    const available = projects.map((item) => `${item.name}（id=${item.id}）`).join('、')
    throw new Error(`找不到项目「${wantedProject}」。可用项目：${available || '无'}`)
  }
  const ref = (spaceRef ?? '').trim()
  if (ref && project.spaces.some((space) => space.id === ref)) {
    return { projectId: project.id, spaceId: ref }
  }
  const wanted = (branchRef ?? ref).trim()
  // 只给了项目、没给空间时，用会话工作目录推断的空间（模型常这样调用）
  if (wanted === '') {
    const inferred = await service.scope?.(exec)
    const inferredSpace = inferred?.spaceId
      ? project.spaces.find((space) => space.id === inferred.spaceId)
      : inferred?.branch
        ? project.spaces.find((space) => space.branch === inferred.branch)
        : undefined
    if (inferredSpace) return { projectId: project.id, spaceId: inferredSpace.id }
  }
  const match = project.spaces.find((space) => space.branch === wanted)
    ?? project.spaces.find((space) => space.id === wanted)
    ?? project.spaces.find((space) => space.branch.replace(/\//g, '-') === wanted)
  if (!match) {
    const available = project.spaces.map((space) => `${space.branch}（id=${space.id}）`).join('、')
    throw new Error(`找不到分支空间「${wanted}」。可用空间：${available || '无'}`)
  }
  return { projectId: project.id, spaceId: match.id }
}

/** 状态中文名。 */
const STATUS_LABEL: Record<string, string> = {
  unprepared: '待准备',
  ready: '就绪',
  failed: '失败',
}

/** 构造项目工具。 */
export function buildProjectTools(service: AscoderProjectTools): ToolDefinition[] {
  const list = defineTool({
    name: 'ascoder_project_list',
    description:
      '列出 Ascoder 项目、仓库成员与分支空间。默认只给摘要（成员名、空间 id 与状态）；'
      + '需要成员的 repositoryId 时传 detail=true。',
    parameters: {
      detail: { type: 'boolean', description: '是否返回成员 repositoryId 等完整信息（默认 false）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          root: { type: 'string', required: true },
          projects: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string', required: true },
                name: { type: 'string', required: true },
                members: {
                  type: 'array',
                  required: true,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      alias: { type: 'string', required: true },
                      repositoryId: { type: 'string', required: true },
                    },
                  },
                },
                spaces: {
                  type: 'array',
                  required: true,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      id: { type: 'string', required: true },
                      branch: { type: 'string', required: true },
                      status: { type: 'string', required: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.projects.length === 0
          ? `还没有项目。新建项目 → 加仓库成员 → 开分支空间。空间根目录：${value.root}`
          : [
            `共 ${value.projects.length} 个项目（空间根目录 ${value.root}）：`,
            ...value.projects.map((project) => {
              const members = project.members.length === 0
                ? '无'
                : project.members.length > 6
                  ? `${project.members.length} 个（${project.members.slice(0, 4).map((member) => member.alias).join(', ')} 等）`
                  : project.members.map((member) => member.alias).join(', ')
              const spaces = project.spaces
                .map((space) => `${space.branch} [${space.status}] id=${space.id}`)
                .join(', ') || '无'
              return `- ${project.name} (id: ${project.id}) 仓库 ${project.members.length} 个：${members}；分支空间：${spaces}`
            }),
          ].join('\n'),
      }],
    },
    async execute(args, exec) {
      const detail = args.detail === true
      return {
        root: service.root,
        projects: (await service.state()).map((project) => ({
          id: project.id,
          name: project.name,
          members: detail
            ? project.members.map((member) => ({ alias: member.alias, repositoryId: member.repositoryId }))
            : project.members.map((member) => ({ alias: member.alias, repositoryId: '' })),
          spaces: project.spaces.map((space) => ({
            id: space.id,
            branch: space.branch,
            status: STATUS_LABEL[space.status] ?? space.status,
          })),
        })),
      }
    },
    presentCall() {
      return { card: 'generic', title: '列出 Ascoder 项目', kind: 'read' }
    },
  })

  const create = defineTool({
    name: 'ascoder_project_create',
    description: '新建 Ascoder 项目（容器），随后用 ascoder_project_member_add 加入仓库。',
    parameters: {
      name: { type: 'string', required: true, description: '项目名称' },
      description: { type: 'string', description: '项目描述' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', required: true },
          name: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `已创建项目「${value.name}」(id: ${value.id})` }],
    },
    async execute(args, exec) {
      const project = await service.create({ name: args.name, description: args.description })
      return { id: project.id, name: project.name }
    },
    presentCall(args) {
      return { card: 'generic', title: `新建项目：${args.name}`, kind: 'edit' }
    },
  })

  const addMember = defineTool({
    name: 'ascoder_project_member_add',
    description: '给项目加入一个仓库成员：给本地路径或远程地址。',
    parameters: {
      projectId: { type: 'string', required: true, description: '项目 id' },
      repositoryId: { type: 'string', required: true, description: '已登记仓库 id（先用 ascoder_repo_add 登记）' },
      alias: { type: 'string', description: '成员目录别名（默认取仓库名）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', required: true },
          alias: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `已加入成员 ${value.alias}（id: ${value.id}）` }],
    },
    async execute(args, exec) {
      const member = await service.addMember(args.projectId, {
        alias: args.alias,
        repositoryId: args.repositoryId,
      })
      return { id: member.id, alias: member.alias }
    },
    presentCall(args) {
      return { card: 'generic', title: `加入仓库成员：${args.alias ?? args.repositoryId}`, kind: 'edit' }
    },
  })

  const createSpace = defineTool({
    name: 'ascoder_space_create',
    description: '在项目下新建分支空间并把仓库成员按该分支物化，之后可进入会话。',
    parameters: {
      projectId: { type: 'string', required: true, description: '项目 id' },
      branch: { type: 'string', required: true, description: '分支名' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: { branch: { type: 'string', required: true }, status: { type: 'string', required: true } },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.status === 'ready'
          ? `分支空间 ${value.branch} 已就绪，可以进入会话提问了。`
          : `分支空间 ${value.branch} 准备失败，请检查分支是否存在。`,
      }],
    },
    async execute(args, exec) {
      const space = await service.createSpace(args.projectId, args.branch)
      const prepared = await service.prepareSpace(args.projectId, space.id)
      if (prepared.status !== 'failed') return { branch: prepared.branch, status: prepared.status }

      // 成员缺分支时自动兜底：按候选分支重新规划一次，再报告最终结果
      const plan = await service.autoPlanSpace(args.projectId, args.branch)
      if (plan.unresolved.length > 0) {
        throw new Error(
          `空间「${args.branch}」准备失败，这些成员没有可用分支：${plan.unresolved.join('、')}。`
          + '用 ascoder_branch_candidates 查候选后，再用 ascoder_set_space_branches 指定。'
        )
      }
      return {
        branch: plan.branch,
        status: plan.status,
        ...(plan.error ? { error: truncate(plan.error, 160) } : {}),
      }
    },
    presentCall(args) {
      return { card: 'generic', title: `新建分支空间：${args.branch}`, kind: 'execute' }
    },
  })

  const syncSpace = defineTool({
    name: 'ascoder_sync_space',
    description:
      '用 git 更新分支空间里的代码（fetch + pull --ff-only）。空间是只读的，这是唯一会改动工作区文件的途径；'
      + '能快进时只快进、不产生合并提交；若本地与上游已分叉（例如空间里有过改动或上游被强推），'
      + '会重置到远端（git reset --hard 到 upstream，本地改动会丢失），返回里该成员显示“已重置到远端”。',
    parameters: {
      projectId: { type: 'string', required: true, description: '项目 id' },
      spaceId: { type: 'string', description: '分支空间 id（不知道时可改用 branch）' },
      branch: { type: 'string', description: '分支空间的分支名，用来代替 spaceId' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          results: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: { alias: { type: 'string', required: true }, result: { type: 'string', required: true } },
            },
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.results.map((item) => `${item.alias}: ${item.result}`).join('\n') || '没有可更新的仓库',
      }],
    },
    async execute(args, exec) {
      const { projectId, spaceId } = await resolveSpace(service, args.projectId, args.spaceId, args.branch, exec)
      return { results: await service.syncSpace(projectId, spaceId) }
    },
    presentCall() {
      return { card: 'generic', title: '更新空间代码', kind: 'execute' }
    },
  })

  const spaceSnapshot = defineTool({
    name: 'ascoder_space_snapshot',
    description:
      '一次返回分支空间里每个仓库成员的当前分支、HEAD 短 sha、最近提交标题、工作树脏文件数、与上游的领先/落后提交数。'
      + '回答"这个分支现在什么状态 / 最近改了什么 / 有没有未提交改动 / 落后远端多少"这类问题时用它即可，'
      + '返回里已经包含脏文件数与领先/落后，**不需要再跑 git status / git log / git rev-list 去核对**。'
      + '只有需要看具体改动内容（diff、文件清单）或历史多条提交时，才继续用 bash。',
    parameters: {
      projectId: { type: 'string', required: true, description: '项目 id' },
      spaceId: { type: 'string', description: '分支空间 id（不知道时可改用 branch）' },
      branch: { type: 'string', description: '分支空间的分支名，用来代替 spaceId' },
      files: { type: 'boolean', description: '是否附带每个成员 HEAD 提交的变更文件清单与增删行数（有界，默认 20 条/成员）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          members: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                alias: { type: 'string', required: true },
                branch: { type: 'string', required: true },
                head: { type: 'string' },
                subject: { type: 'string' },
                committedAt: { type: 'string' },
                remote: { type: 'string' },
                changedCount: { type: 'number' },
                changedFiles: { type: 'array', items: { type: 'string' } },
                insertions: { type: 'number' },
                deletions: { type: 'number' },
                dirty: { type: 'number' },
                ahead: { type: 'number' },
                behind: { type: 'number' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const lines = value.members.map((member) => {
          if (member.error) return `- ${member.alias}: ${member.error}`
          const divergence = member.ahead === undefined
            ? '无上游'
            : `↑${member.ahead} ↓${member.behind ?? 0}`
          const when = member.committedAt ? ` · ${member.committedAt.slice(0, 16).replace('T', ' ')}` : ''
          const remote = member.remote ? ` · ${member.remote}` : ''
          const lines = typeof member.insertions === 'number' && typeof member.deletions === 'number'
            && (member.insertions > 0 || member.deletions > 0)
            ? `（+${member.insertions} / -${member.deletions} 行）`
            : ''
          const changed = typeof member.changedCount === 'number'
            ? ` · 变更 ${member.changedCount} 个文件${lines}${member.changedFiles && member.changedFiles.length > 0 ? '：' + member.changedFiles.slice(0, 5).join(', ') + (member.changedCount > 5 ? ' 等' : '') : ''}`
            : ''
          return `- ${member.alias} @ ${member.branch} · ${member.head || '(无提交)'}${when}${remote} · ${member.dirty} 个改动 · ${divergence}${changed} · ${member.subject || ''}`.trim()
        })
        return [{ type: 'text', text: lines.join('\n') || '空间里没有仓库成员' }]
      },
    },
    async execute(args, exec) {
      const { projectId, spaceId } = await resolveSpace(service, args.projectId, args.spaceId, args.branch, exec)
      const rows = await service.spaceSnapshot(projectId, spaceId)
      // schema 里 ahead/behind 是可选数字，null 在这里收敛成 undefined
      return {
        members: rows.map((row) => ({
          alias: row.alias,
          branch: row.branch,
          ...(row.head ? { head: row.head } : {}),
          ...(row.subject ? { subject: row.subject } : {}),
          ...(row.committedAt ? { committedAt: row.committedAt } : {}),
          ...(row.remote ? { remote: row.remote } : {}),
          dirty: row.dirty,
          ...(row.ahead === null ? {} : { ahead: row.ahead }),
          ...(row.behind === null ? {} : { behind: row.behind }),
          ...(row.error ? { error: row.error } : {}),
        })),
      }
    },
    presentCall() {
      return { card: 'generic', title: '查看分支空间快照', kind: 'read' }
    },
  })

  const codeSearch = defineTool({
    name: 'ascoder_code_search',
    description:
      '在分支空间的所有成员仓库里检索代码（内部用 git grep，只搜已跟踪文件）。'
      + '回答"某功能/接口/字段在哪些文件"这类问题时优先用它：一次调用、结果带 文件:行号 与上下文摘要、'
      + '默认最多 30 条，比手工拼 grep/find 省几十倍返回量。'
      + '想知道某个目录/模块下有哪些文件时，用 mode=listFiles 配合 glob（例如 *.java），不要跑 find/ls 全量列举。'
      + '需要同时查多个词（如 ContractSign、SignService、signatory）时，用 queries 数组一次检索（OR，自动去重），不要分多次调用。',
    parameters: {
      projectId: { type: 'string', description: '项目 id（会话在分支空间里时可省略）' },
      spaceId: { type: 'string', description: '分支空间 id（不知道时可改用 branch）' },
      branch: { type: 'string', description: '分支空间的分支名，用来代替 spaceId' },
      query: { type: 'string', description: '关键词或正则（search 模式必填，listFiles 模式可省略）；不能以 - 开头' },
      pathPrefix: { type: 'string', description: '限定路径前缀，例如 src/main/java' },
      maxMatches: { type: 'integer', description: '最多返回多少条命中（默认 30，上限 100）' },
      queries: {
        type: 'array',
        items: { type: 'string' },
        description: '要一起检索的多个关键词（OR）：一次扫描、结果去重，比多次单关键词调用省轮次',
      },
      countOnly: { type: 'boolean', description: '只返回每个成员仓库的命中数量（用于先判断哪个仓库有相关代码）' },
      mode: {
        type: 'string',
        enum: ['search', 'listFiles'],
        description: 'search（默认）检索代码；listFiles 列出文件路径（替代 find/ls 全量列举）',
      },
      glob: { type: 'string', description: 'listFiles 模式下的文件匹配，例如 *.java 或 **/sign/*.java' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          matches: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                alias: { type: 'string', required: true },
                file: { type: 'string', required: true },
                line: { type: 'number', required: true },
                text: { type: 'string' },
              },
            },
          },
          truncated: { type: 'boolean' },
          counts: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                alias: { type: 'string', required: true },
                count: { type: 'number', required: true },
              },
            },
          },
          files: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                alias: { type: 'string', required: true },
                files: { type: 'array', required: true, items: { type: 'string' } },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        if (value.files && value.files.length > 0) {
          const lines = value.files.flatMap((group) => [
            `## ${group.alias}（${group.files.length} 个文件）`,
            ...group.files,
          ])
          if (value.truncated) lines.push('（文件清单已截断，请加 pathPrefix 或更精确的 glob）')
          return [{ type: 'text', text: lines.join('\n') }]
        }
        if (value.counts && value.counts.length > 0 && value.matches.length === 0) {
          return [{
            type: 'text',
            text: value.counts.map((item) => `${item.alias}: ${item.count} 处命中`).join('\n'),
          }]
        }
        if (value.matches.length === 0) return [{ type: 'text', text: '没有命中' }]
        const lines = value.matches.map(
          (item) => `${item.alias}/${item.file}:${item.line}: ${item.text ?? ''}`.trim(),
        )
        if (value.truncated) lines.push('（结果已截断，请缩小路径前缀或关键词）')
        // 命中多文件时提示先看骨架：实测模型会直接 read 大文件（一次 7.7K 字符），
        // 而 ascoder_file_outline 只要几百字符就能给出结构
        const distinctFiles = new Set(value.matches.map((item) => `${item.alias}/${item.file}`))
        if (distinctFiles.size >= 2) {
          lines.push('（命中多个文件：建议先用 ascoder_file_outline 看骨架，再按行号定点 read，不要整文件读）')
        }
        return [{ type: 'text', text: lines.join('\n') }]
      },
    },
    async execute(args, exec) {
      const { projectId, spaceId } = await resolveSpace(service, args.projectId, args.spaceId, args.branch, exec)
      if (args.mode === 'listFiles') {
        const listed = await service.listSpaceFiles(projectId, spaceId, {
          ...(args.pathPrefix ? { pathPrefix: args.pathPrefix } : {}),
          ...(args.glob ? { glob: args.glob } : {}),
          ...(args.maxMatches ? { maxFiles: args.maxMatches } : {}),
        })
        return {
          matches: [],
          truncated: listed.truncated,
          counts: listed.groups.map((group) => ({ alias: group.alias, count: group.files.length })),
          files: listed.groups,
        }
      }
      if ((!args.query || args.query.trim() === '') && (!args.queries || args.queries.length === 0)) {
        throw new Error('search 模式需要 query 或 queries 关键词；只想列文件请用 mode=listFiles')
      }
      const result = await service.searchCode(projectId, spaceId, args.query ?? '', {
        ...(args.pathPrefix ? { pathPrefix: args.pathPrefix } : {}),
        ...(args.maxMatches ? { maxMatches: args.maxMatches } : {}),
        ...(args.countOnly ? { countOnly: true } : {}),
        ...(args.queries && args.queries.length > 0 ? { queries: args.queries } : {}),
      })
      return result
    },
    presentCall(args) {
      return { card: 'generic', title: `检索代码：${args.query}`, kind: 'read' }
    },
  })

  const taskList = defineTool({
    name: 'ascoder_task_list',
    description:
      '查看 Ascoder 的后台任务与最近事件：准备空间、更新代码这类异步任务的进度、失败原因，以及项目/仓库/空间的生命周期事件。排查"刚才那次准备/更新成功了吗"时用它。',
    parameters: {
      limit: { type: 'integer', description: '最多返回多少条任务与事件（默认 10）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          cursor: { type: 'integer', required: true },
          running: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: 'string', required: true },
                kind: { type: 'string', required: true },
                message: { type: 'string' },
                progress: { type: 'string' },
              },
            },
          },
          tasks: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                title: { type: 'string', required: true },
                kind: { type: 'string', required: true },
                status: { type: 'string', required: true },
                message: { type: 'string' },
                error: { type: 'string' },
                at: { type: 'string', required: true },
              },
            },
          },
          events: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                type: { type: 'string', required: true },
                at: { type: 'string', required: true },
                summary: { type: 'string' },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const lines: string[] = []
        if (value.running.length > 0) {
          lines.push('运行中：')
          for (const task of value.running) {
            lines.push(`- ${task.title}（${task.kind}）${task.progress ?? ''} ${task.message ?? ''}`.trim())
          }
        } else {
          lines.push('运行中：无')
        }
        if (value.tasks.length > 0) {
          lines.push('最近任务：')
          for (const task of value.tasks) {
            const detail = task.error ? `失败：${task.error}` : (task.message ?? task.status)
            lines.push(`- ${task.at} ${task.title}（${task.kind}）：${detail}`)
          }
        }
        if (value.events.length > 0) {
          lines.push('最近事件：')
          for (const event of value.events) {
            lines.push(`- ${event.at} ${event.type}${event.summary ? '：' + event.summary : ''}`)
          }
        }
        return [{ type: 'text', text: lines.join('\n') }]
      },
    },
    async execute(args, exec) {
      const limit = typeof args.limit === 'number' && args.limit > 0 ? Math.min(args.limit, 50) : 10
      const taskService = service.tasks
      const eventLog = service.events
      const running = (taskService?.running() ?? []).map((task) => ({
        title: task.title,
        kind: task.kind,
        ...(task.message ? { message: task.message } : {}),
        progress: task.progress.total > 0 ? `${task.progress.done}/${task.progress.total}` : '',
      }))
      const recent = (taskService?.list() ?? []).slice(0, limit).map((task) => ({
        title: task.title,
        kind: task.kind,
        status: task.status,
        ...(task.message ? { message: truncate(task.message, 80) } : {}),
        ...(task.error ? { error: truncate(task.error, 140) } : {}),
        at: task.finishedAt ?? task.createdAt,
      }))
      const recentEvents = (eventLog?.list(0, limit) ?? []).slice().reverse().map((event) => ({
        type: event.type,
        at: event.at,
        summary: Object.values(event.payload)
          .filter((value): value is string => typeof value === 'string')
          .slice(0, 2)
          .join(' · '),
      }))
      return { cursor: eventLog?.cursor ?? 0, running, tasks: recent, events: recentEvents }
    },
    presentCall() {
      return { card: 'generic', title: '查看任务与事件', kind: 'read' }
    },
  })

  const branchCandidates = defineTool({
    name: 'ascoder_branch_candidates',
    description:
      '列出分支空间里各成员仓库的候选分支（按“同名 > 同用途 hotfix/release > 版本号接近 > 最近提交”打分）。'
      + '新建空间或准备失败时，先用它查清楚每个成员该用哪条分支，再用 ascoder_set_space_branches 写回。',
    parameters: {
      projectId: { type: 'string', required: true, description: '项目 id 或项目名' },
      branch: { type: 'string', required: true, description: '空间期望的分支名（通常是空间分支）' },
      perMember: { type: 'number', description: '每个成员返回几个候选（默认 5，最多 10）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          members: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                alias: { type: 'string', required: true },
                repository: { type: 'string', required: true },
                hasWanted: { type: 'boolean', required: true },
                candidates: {
                  type: 'array',
                  required: true,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      branch: { type: 'string', required: true },
                      score: { type: 'number', required: true },
                      committedAt: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const lines: string[] = []
        for (const member of value.members) {
          lines.push(`${member.alias}${member.hasWanted ? '（有同名分支）' : '（缺该分支）'}`)
          for (const candidate of member.candidates) {
            const when = candidate.committedAt ? ` · ${candidate.committedAt.slice(0, 10)}` : ''
            lines.push(`  - ${candidate.branch}${when}`)
          }
        }
        return [{ type: 'text', text: lines.join('\n') || '没有候选分支' }]
      },
    },
    async execute(args, exec) {
      const wanted = args.branch.trim()
      const rows = await service.branchCandidates(args.projectId, wanted)
      const limit = typeof args.perMember === 'number' && args.perMember > 0 ? Math.min(args.perMember, 10) : 5
      const grouped = new Map<string, { alias: string; repository: string; hasWanted: boolean; candidates: Array<{ branch: string; score: number; committedAt?: string }> }>()
      for (const row of rows) {
        const entry = grouped.get(row.alias)
          ?? { alias: row.alias, repository: row.repositoryName, hasWanted: false, candidates: [] }
        if (row.matched) entry.hasWanted = true
        entry.candidates.push({
          branch: row.branch,
          score: row.score,
          ...(row.committedAt ? { committedAt: new Date(row.committedAt * 1000).toISOString() } : {}),
        })
        grouped.set(row.alias, entry)
      }
      const members = [...grouped.values()].map((entry) => ({
        ...entry,
        candidates: entry.candidates.slice(0, limit),
      }))
      return { members }
    },
    presentCall(args) {
      return { card: 'generic', title: `查候选分支：${args.branch}`, kind: 'read' }
    },
  })

  const setSpaceBranches = defineTool({
    name: 'ascoder_set_space_branches',
    description:
      '给分支空间里各成员指定检出分支（只传需要改的成员），随后按新映射重新准备空间。'
      + '准备失败的空间用它修复；新建空间时成员缺分支也用它补。',
    parameters: {
      projectId: { type: 'string', required: true, description: '项目 id 或项目名' },
      spaceId: { type: 'string', description: '空间 id（不知道时改用 branch）' },
      branch: { type: 'string', description: '空间分支名，用来代替 spaceId' },
      branches: { type: 'string', required: true, description: 'JSON 对象：成员别名 → 分支名，例如 {"private-common":"v4.2.x/hotfix"}' },
      prepare: { type: 'boolean', description: '写回后是否立即重新准备（默认 true）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          branch: { type: 'string', required: true },
          status: { type: 'string', required: true },
          error: { type: 'string' },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.status === 'ready'
          ? `分支空间 ${value.branch} 已按新映射准备就绪。`
          : `新映射已写入，但准备失败：${value.error ?? '未知原因'}`,
      }],
    },
    async execute(args, exec) {
      const resolved = await resolveSpace(service, args.projectId, args.spaceId, args.branch, exec)
      let mapping: Record<string, string> = {}
      try {
        const parsed = JSON.parse(args.branches) as Record<string, unknown>
        for (const [alias, value] of Object.entries(parsed)) {
          if (typeof value === 'string' && value.trim() !== '') mapping[alias] = value.trim()
        }
      } catch {
        throw new Error('branches 必须是 JSON 对象，例如 {"private-common":"v4.2.x/hotfix"}')
      }
      const current = await service.state()
      const project = current.find((item) => item.id === resolved.projectId)
      const space = project?.spaces.find((item) => item.id === resolved.spaceId)
      const merged = { ...(space?.memberBranches ?? {}), ...mapping }
      if (space?.branch) merged[space.branch] = merged[space.branch] ?? space.branch
      const updated = await service.setSpaceBranches(resolved.projectId, resolved.spaceId, merged)
      if (args.prepare === false) return { branch: updated.branch, status: updated.status }
      const prepared = await service.prepareSpace(resolved.projectId, resolved.spaceId)
      return {
        branch: prepared.branch,
        status: prepared.status,
        ...(prepared.error ? { error: truncate(prepared.error, 200) } : {}),
      }
    },
    presentCall(args) {
      return { card: 'generic', title: `指定成员分支：${args.branches}`, kind: 'execute' }
    },
  })


  const commitDetailTool = defineTool({
    name: 'ascoder_commit_detail',
    description:
      '查看分支空间某个成员最近一次（或指定）提交的摘要：sha、作者、时间、标题、是否合并提交、改动文件清单（每个成员最多 40 条）。'
      + '回答"最近这次提交改了什么"时用它即可，**不要用 git show / git diff 输出合并提交的完整差异**（实测一次可达 49,931 字符）。'
      + '需要看具体改动内容时，按文件用 ascoder_code_search 或 read 定点读。',
    parameters: {
      projectId: { type: 'string', description: '项目 id 或项目名（会话在分支空间里时可省略）' },
      branch: { type: 'string', description: '分支名（可省略，按会话推断）' },
      spaceId: { type: 'string', description: '分支空间 id，可代替 branch' },
      alias: { type: 'string', description: '成员别名；省略时返回空间内全部成员的最近提交' },
      ref: { type: 'string', description: '提交引用（默认 HEAD，也可传 sha 或分支名）' },
      limit: { type: 'integer', description: '每个成员最多列多少文件（默认 40，上限 200）' },
      patch: { type: 'boolean', description: '是否附带改动内容（unified diff，已按行截断）；想看具体改了什么时用它，不要用 git diff 分段读' },
      patchLines: { type: 'integer', description: '每个成员最多返回多少行 diff（默认按成员数摊销共约 180 行，上限 400）；只想看某个成员时配合 alias' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          members: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                alias: { type: 'string', required: true },
                shortSha: { type: 'string', required: true },
                author: { type: 'string', required: true },
                date: { type: 'string', required: true },
                subject: { type: 'string', required: true },
                parents: { type: 'integer', required: true },
                files: { type: 'array', required: true, items: { type: 'string' } },
                filesTotal: { type: 'integer', required: true },
                truncated: { type: 'boolean', required: true },
                patch: { type: 'string' },
                patchTruncated: { type: 'boolean' },
                error: { type: 'string' },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const lines: string[] = []
        for (const member of value.members) {
          if (member.error) {
            lines.push(`${member.alias}: ${member.error}`)
            continue
          }
          const kind = member.parents > 1 ? `合并提交（${member.parents} 个父提交）` : '普通提交'
          lines.push(`${member.alias} · ${member.shortSha} · ${member.date.slice(0, 16).replace('T', ' ')} · ${member.author} · ${kind}`)
          lines.push(`  标题：${member.subject}`)
          lines.push(`  文件 ${member.filesTotal} 个${member.truncated ? `（只列前 ${member.files.length} 个）` : ''}：`)
          for (const file of member.files) lines.push(`    ${file}`)
          if (member.patch) {
            lines.push(`  改动内容${member.patchTruncated ? '（已截断，需要更多请指定 alias 只看一个成员）' : ''}：`)
            lines.push(member.patch)
          }
        }
        return [{ type: 'text', text: lines.join('\n') || '没有可展示的提交' }]
      },
    },
    async execute(args, exec) {
      const { projectId, spaceId } = await resolveSpace(service, args.projectId, args.spaceId, args.branch, exec)
      const projects = await service.state()
      const project = projects.find((item) => item.id === projectId)
      if (!project) throw new Error(`找不到项目：${projectId}`)
      const space = project.spaces.find((item) => item.id === spaceId)
      if (!space || !space.root) throw new Error('分支空间尚未准备，先进入一次再查看提交')
      const limit = Math.min(Math.max(Number(args.limit ?? 40) || 40, 1), 200)
      const ref = (args.ref ?? 'HEAD').trim() || 'HEAD'
      const alias = (args.alias ?? '').trim()
      const members = project.members.filter((member) => alias === '' || member.alias === alias)
      if (members.length === 0) {
        throw new Error(`空间里没有名为 ${alias} 的成员，可用：${project.members.map((member) => member.alias).join('、')}`)
      }
      interface CommitRow {
        alias: string
        shortSha: string
        author: string
        date: string
        subject: string
        parents: number
        files: string[]
        filesTotal: number
        truncated: boolean
        patch?: string
        patchTruncated?: boolean
        error?: string
      }
      const rows: CommitRow[] = []
      for (const member of members) {
        const dir = join(space.root, member.alias)
        const base = { alias: member.alias, shortSha: '', author: '', date: '', subject: '', parents: 0, files: [] as string[], filesTotal: 0, truncated: false }
        if (!(await isGitRepository(dir))) {
          rows.push({ ...base, error: '该成员还没有物化到空间里' })
          continue
        }
        try {
          const detail = await commitDetail(dir, ref, limit)
          const row: CommitRow = {
            ...base,
            shortSha: detail.shortSha,
            author: detail.author,
            date: detail.date,
            subject: detail.subject,
            parents: detail.parents,
            files: detail.files,
            filesTotal: detail.filesTotal,
            truncated: detail.truncated,
          }
          // 只要 patch 时才算 diff：按行截断，代替模型自己用 git diff 分段读（一次提问能刷三万字符）
          if (args.patch === true) {
            // 默认给所有成员各 40 行、总量按 180 行摊销：实测每个成员都给 120 行时，
            // 一次调用就有 20K 字符，比它替代掉的那几次 git diff 还多，没必要。
            const budget = 180
            const share = Math.max(20, Math.floor(budget / Math.max(members.length, 1)))
            const requested = Number(args.patchLines ?? 0)
            const patchLines = Number.isFinite(requested) && requested > 0
              ? Math.min(Math.max(requested, 20), 400)
              : Math.min(share, 120)
            const diff = await commitPatch(dir, ref, patchLines)
            row.patch = diff.text
            row.patchTruncated = diff.truncated
          }
          rows.push(row)
        } catch (error) {
          rows.push({ ...base, error: (error as Error).message.slice(0, 200) })
        }
      }
      return { members: rows }
    },
  })

  const fileOutline = defineTool({
    name: 'ascoder_file_outline',
    description:
      '查看分支空间里某个文件的骨架：返回类/接口/方法/导出函数等声明及其行号，不返回实现细节。'
      + '入选建议：需要理解一个上千行的大文件时，先用它看结构，再按行号用 read 的 offset/limit 只读相关片段，避免一次性读入数万字符。',
    parameters: {
      projectId: { type: 'string', description: '项目 id 或项目名（会话在分支空间里时可省略）' },
      branch: { type: 'string', description: '分支空间的分支名（与 spaceId 二选一）' },
      spaceId: { type: 'string', description: '分支空间 id，可代替 branch' },
      path: { type: 'string', required: true, description: '文件路径：可带成员别名前缀（private-sign/src/…），也可只写成员内相对路径' },
      maxSymbols: { type: 'integer', description: `最多返回多少条声明，默认 ${OUTLINE_SYMBOL_LIMIT}，最大 300` },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          alias: { type: 'string', required: true },
          path: { type: 'string', required: true },
          lines: { type: 'integer', required: true },
          chars: { type: 'integer', required: true },
          truncated: { type: 'boolean', required: true },
          symbols: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                line: { type: 'integer', required: true },
                kind: { type: 'string', required: true },
                name: { type: 'string', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const head = `${value.alias}/${value.path} · ${value.lines} 行 / ${value.chars} 字符${value.truncated ? '（已截断）' : ''}`
        const rows = value.symbols.map((symbol) => `  ${String(symbol.line).padStart(5)}  ${symbol.kind.padEnd(9)} ${symbol.name}`)
        return [{ type: 'text', text: [head, ...rows].join('\n') + (rows.length === 0 ? '\n（没有识别到声明，可直接 read 少量片段）' : '') }]
      },
    },
    async execute(args, exec) {
      const projects = await service.state()
      const ref = (args.projectId ?? '').trim()
      const wantedSpaceArg = (args.spaceId ?? args.branch ?? '').trim()
      // 省略 projectId 时按会话工作目录推断项目（即使给了 branch 也适用）
      let inferredSpaceId = ''
      let inferredProjectId = ''
      if (ref === '') {
        const inferred = await service.scope?.(exec)
        if (!inferred) throw new Error('缺少 projectId：当前会话不在分支空间里；请传 projectId（可先用 ascoder_project_list 获取）')
        const inferredProject = projects.find((item) => item.id === inferred.projectId)
        if (!inferredProject) throw new Error(`找不到项目：${inferred.projectId}`)
        inferredProjectId = inferredProject.id
        if (wantedSpaceArg === '') {
          const inferredSpace = inferred.spaceId
            ? inferredProject.spaces.find((item) => item.id === inferred.spaceId)
            : inferredProject.spaces.find((item) => item.branch === inferred.branch)
          if (!inferredSpace) throw new Error('推断出的分支空间已不存在，请传 projectId/branch')
          inferredSpaceId = inferredSpace.id
        }
      }
      const effectiveRef = ref === '' ? inferredProjectId : ref
      const stripped = effectiveRef.replace(/^project-/, '')
      const project = projects.find((item) => item.id === effectiveRef)
        ?? projects.find((item) => item.name === effectiveRef)
        ?? projects.find((item) => item.id.startsWith(stripped) && stripped.length >= 6)
      if (!project) throw new Error(`找不到项目：${effectiveRef}`)
      const wantedSpace = inferredSpaceId !== '' ? inferredSpaceId : wantedSpaceArg
      const normalize = (value: string): string => value.replace(/[-_]/g, '/').toLowerCase()
      const space = project.spaces.find((item) => item.id === wantedSpace)
        ?? project.spaces.find((item) => item.branch === wantedSpace)
        ?? project.spaces.find((item) => normalize(item.branch) === normalize(wantedSpace))
      if (!space) {
        const available = project.spaces.map((item) => item.branch).join('、')
        throw new Error(`项目下找不到分支空间：${wantedSpace}（可用：${available}）`)
      }
      if (!space.root || space.status !== 'ready') throw new Error(`分支空间「${space.branch}」尚未准备完成，无法读文件`)
      const wanted = (args.path ?? '').trim().replace(/\\/g, '/').replace(/^\/+/, '')
      if (wanted === '') throw new Error('path 不能为空')
      if (wanted.split('/').includes('..')) throw new Error('path 不能包含 ..')
      const first = wanted.split('/')[0]
      const aliasHit = project.members.find((member) => member.alias === first)
      let alias = ''
      let relPath = wanted
      if (aliasHit) {
        alias = aliasHit.alias
        relPath = wanted.slice(alias.length + 1)
      } else {
        const found = project.members.find((member) => existsSync(join(space.root ?? '', member.alias, wanted)))
        if (!found) {
          const aliases = project.members.map((member) => member.alias).join('、')
          throw new Error(`找不到文件「${wanted}」：可加成员别名前缀（例如 private-sign/${wanted}）；可用成员：${aliases}`)
        }
        alias = found.alias
      }
      const abs = join(space.root, alias, relPath)
      if (!existsSync(abs)) throw new Error(`文件不存在：${alias}/${relPath}`)
      const stat = statSync(abs)
      if (!stat.isFile()) throw new Error(`不是文件：${alias}/${relPath}`)
      if (stat.size > OUTLINE_MAX_BYTES) throw new Error(`文件过大（${Math.round(stat.size / 1024)}KB），请改用 ascoder_code_search 定位行号后再 read 片段`)
      const limit = Math.min(Math.max(args.maxSymbols ?? OUTLINE_SYMBOL_LIMIT, 1), 300)
      const outline = scanFileOutline(readFileSync(abs, 'utf8'), abs, limit)
      return { alias, path: relPath, lines: outline.lines, chars: outline.chars, truncated: outline.truncated, symbols: outline.symbols }
    },
    presentCall(args) {
      return { card: 'generic', title: `查看文件骨架：${args.path}`, kind: 'read' }
    },
  })

  return [list, create, addMember, createSpace, branchCandidates, setSpaceBranches, syncSpace, spaceSnapshot, codeSearch, fileOutline, commitDetailTool, taskList]
}
