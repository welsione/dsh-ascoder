/**
 * CodeGraph 相关 Agent 工具：查看索引覆盖率、触发后台索引。
 *
 * 提示词里一直引用 ascoder_codegraph_status / ascoder_codegraph_index，
 * 但此前没有注册这两个工具，模型调用会直接失败；这里补齐，并让返回体保持紧凑。
 */
import { defineTool, type ToolDefinition } from '@deepseek-ai/dsh-tools'
import type { CodegraphFacade } from './codegraphService.ts'

/** 工具依赖：编排 Facade + 项目列表（宽容解析 id）+ 会话作用域推断。 */
export interface CodegraphToolDeps {
  codegraph: CodegraphFacade
  projects?: { state(): Promise<Array<{ id: string; name: string }>> }
  /** 从工具执行上下文推断当前分支空间（projectId/branch 可省略）。 */
  scope?: (exec: unknown) => Promise<{ projectId?: string; spaceId?: string; branch?: string } | undefined>
}

/**
 * 宽容解析项目 id：模型常传短 id 前缀或项目名（其它工具都支持），
 * 这里对齐同一契约，避免"项目不存在：f6b68ba6"这类无谓失败。
 */
async function resolveProjectId(deps: CodegraphToolDeps, ref: string): Promise<string> {
  const raw = ref.trim()
  if (raw === '') throw new Error('projectId 不能为空')
  if (!deps.projects) return raw
  const projects = await deps.projects.state()
  const exact = projects.find((project) => project.id === raw)
  if (exact) return exact.id
  const byName = projects.find((project) => project.name === raw)
  if (byName) return byName.id
  const byPrefix = projects.filter((project) => project.id.startsWith(raw) || project.id.startsWith('project-' + raw))
  if (byPrefix.length === 1) return byPrefix[0].id
  throw new Error(`找不到项目：${raw}（可用：${projects.map((project) => `${project.name}=${project.id}`).join('，')}）`)
}

/**
 * 宽容匹配分支名：模型常把 `hotfix/5.6.0` 写成 `hotfix-5.6.0`（工作区目录 slug），
 * 也可能大小写不同。先精确匹配，再按斜杠/横杠归一化匹配。
 */
function matchBranch<T extends { branch: string }>(spaces: T[], wanted: string): T | undefined {
  const raw = wanted.trim()
  const exact = spaces.find((space) => space.branch === raw)
  if (exact) return exact
  const normalize = (value: string): string => value.replace(/[-_]/g, '/').toLowerCase()
  const target = normalize(raw)
  return spaces.find((space) => normalize(space.branch) === target)
}

/** 渲染用的空间索引视图（与工具输出结构一致，不需要 CLI 的 dir 字段）。 */
interface StatusRow {
  branch?: string
  spaceId?: string
  indexedCount: number
  memberCount: number
  available: boolean
  detail?: string
  members: Array<{
    alias: string
    indexed: boolean
    files?: number
    symbols?: number
    lastIndexed?: string
    error?: string
  }>
}

/** 状态行的紧凑渲染。 */
function renderStatus(status: StatusRow): string {
  const members = status.members ?? []
  const head = `- ${status.branch ?? '(空间)'}: ${status.indexedCount}/${status.memberCount} 个仓库已索引`
    + (status.available ? '' : '（codegraph 不可用）')
  const memberLines = members
    .map((member) => {
      const stats = member.indexed
        ? `已索引${typeof member.files === 'number' ? ` · ${member.files} 文件` : ''}${typeof member.symbols === 'number' ? ` · ${member.symbols} 符号` : ''}`
        : '未索引'
      const error = member.error ? `（${member.error.slice(0, 60)}）` : ''
      return `  - ${member.alias}: ${stats}${error}`
    })
    .join('\n')
  return [head, memberLines].filter((line) => line !== '').join('\n')
}

/**
 * 构建 CodeGraph 工具。
 * @param deps - 索引编排依赖
 */
export function buildCodegraphTools(deps: CodegraphToolDeps): ToolDefinition[] {
  const status = defineTool({
    name: 'ascoder_codegraph_status',
    description:
      '查看分支空间的 CodeGraph 索引覆盖率（按成员列出是否已索引、文件/符号数与索引时间）。'
      + '语义检索前先用它确认索引状态；空间首次准备成功后会自动建一次索引。',
    parameters: {
      projectId: { type: 'string', description: '项目 id 或项目名（会话在分支空间里时可省略）' },
      branch: { type: 'string', description: '只看某个分支空间（省略则返回项目下全部空间）' },
      spaceId: { type: 'string', description: '分支空间 id，可代替 branch' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          available: { type: 'boolean' },
          detail: { type: 'string' },
          spaces: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                branch: { type: 'string', required: true },
                spaceId: { type: 'string' },
                indexedCount: { type: 'number', required: true },
                memberCount: { type: 'number', required: true },
                available: { type: 'boolean', required: true },
                detail: { type: 'string' },
                members: {
                  type: 'array',
                  required: true,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    properties: {
                      alias: { type: 'string', required: true },
                      indexed: { type: 'boolean', required: true },
                      files: { type: 'number' },
                      symbols: { type: 'number' },
                      lastIndexed: { type: 'string' },
                      error: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      render: (_args, value) => {
        const spaces = value.spaces ?? []
        if (spaces.length === 0) return [{ type: 'text', text: '没有分支空间' }]
        return [{ type: 'text', text: spaces.map((space) => renderStatus(space)).join('\n') }]
      },
    },
    async execute(args, exec) {
      const inferred = await deps.scope?.(exec)
      const projectId = args.projectId
        ? await resolveProjectId(deps, args.projectId)
        : inferred?.projectId
      if (!projectId) throw new Error('缺少 projectId：当前会话不在分支空间里；请传 projectId（可先用 ascoder_project_list 获取）')
      const spaces = await deps.codegraph.statusForProject(projectId)
      const wanted = args.spaceId
        ? (spaces.find((space) => space.spaceId === args.spaceId)?.branch ?? '')
        : args.branch
      let filtered = spaces
      if (wanted) {
        const hit = matchBranch(spaces, wanted)
        if (!hit) {
          throw new Error(
            `项目下找不到分支空间：${wanted}（可用：${spaces.map((space) => space.branch).join('、')}）`,
          )
        }
        filtered = [hit]
      }
      return {
        available: filtered.every((space) => space.available),
        ...(filtered[0]?.detail ? { detail: filtered[0].detail } : {}),
        spaces: filtered.map((space) => ({
          branch: space.branch,
          spaceId: space.spaceId,
          indexedCount: space.indexedCount,
          memberCount: space.memberCount,
          available: space.available,
          ...(space.detail ? { detail: space.detail } : {}),
          members: space.members.map((member) => ({
            alias: member.alias,
            indexed: member.indexed,
            ...(typeof member.files === 'number' ? { files: member.files } : {}),
            ...(typeof member.symbols === 'number' ? { symbols: member.symbols } : {}),
            ...(member.lastIndexed ? { lastIndexed: member.lastIndexed } : {}),
            ...(member.error ? { error: member.error } : {}),
          })),
        })),
      }
    },
    presentCall(args) {
      return { card: 'generic', title: `查看代码索引状态${args.branch ? `：${args.branch}` : ''}`, kind: 'read' }
    },
  })

  const index = defineTool({
    name: 'ascoder_codegraph_index',
    description:
      '为分支空间建立或更新 CodeGraph 语义索引（后台任务，可能几分钟）。返回 taskId，'
      + '用 ascoder_task_list 看进度；索引期间语义查询会被拒绝。空间首次准备成功后会尝试自动建一次。',
    parameters: {
      projectId: { type: 'string', required: true, description: '项目 id 或项目名（支持短 id 前缀）' },
      branch: { type: 'string', description: '分支空间的分支名（与 spaceId 二选一）' },
      spaceId: { type: 'string', description: '分支空间 id，可代替 branch' },
      mode: {
        type: 'string',
        enum: ['create', 'update'],
        description: 'create 全量建立（默认按每个成员是否有索引自动选择）；update 增量同步',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          taskId: { type: 'string', required: true },
          message: { type: 'string' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: value.message ?? `已开始索引，任务 ${value.taskId}` }],
    },
    async execute(args) {
      const projectId = await resolveProjectId(deps, args.projectId)
      if (!args.branch && !args.spaceId) throw new Error('需要 branch 或 spaceId')
      const spaces = await deps.codegraph.statusForProject(projectId)
      const wantedBranch = args.spaceId
        ? spaces.find((space) => space.spaceId === args.spaceId)?.branch
        : args.branch
      const hit = wantedBranch ? matchBranch(spaces, wantedBranch) : undefined
      if (!hit) {
        throw new Error(
          `项目下找不到分支空间：${args.spaceId ?? args.branch}（可用：${spaces.map((space) => space.branch).join('、')}）`,
        )
      }
      const { project, space } = await deps.codegraph.resolveSpace(projectId, hit.branch)
      const task = await deps.codegraph.start(project.id, space.id, args.mode)
      return {
        taskId: task.id,
        message: `已开始索引「${space.branch}」（任务 ${task.id.slice(0, 8)}），用 ascoder_task_list 查看进度`,
      }
    },
    presentCall(args) {
      return { card: 'generic', title: `建立代码索引：${args.branch}`, kind: 'edit' }
    },
  })

  const query = defineTool({
    name: 'ascoder_codegraph_query',
    description:
      '在分支空间的 CodeGraph 语义索引里检索符号（query）或探索某个主题的相关代码（explore / context）。'
      + '返回符号名、文件与行号等结构化结果，适合“某功能/类在哪、谁调用了它”这类问题；'
      + '索引未就绪时会报错，先用 ascoder_codegraph_status 确认、ascoder_codegraph_index 建立。',
    parameters: {
      projectId: { type: 'string', description: '项目 id 或项目名（会话在分支空间里时可省略）' },
      branch: { type: 'string', description: '分支空间的分支名（可省略，按会话推断）' },
      spaceId: { type: 'string', description: '分支空间 id，可代替 branch' },
      search: { type: 'string', required: true, description: '要检索的符号名、关键词或任务描述' },
      mode: {
        type: 'string',
        enum: ['query', 'explore', 'context'],
        description: 'query（默认，按符号名检索）/ explore（探索相关代码与调用路径）/ context（按任务收集上下文）',
      },
      limit: { type: 'integer', description: 'query 模式最多返回多少条结果（默认 10，上限 50）；结果太杂时调小' },
      kind: { type: 'string', description: 'query 模式只保留某种节点类型（class / interface / method / field / enum 等）' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          mode: { type: 'string', required: true },
          output: { type: 'string', required: true },
          truncated: { type: 'boolean', required: true },
        },
      },
      render: (_args, value) => {
        // 空输出必须给出可执行的下一步，否则模型只看到一张空白卡片
        const body = value.output.trim() === ''
          ? `（${value.mode} 没有匹配结果：换更短的检索词，或先用 ascoder_code_search 确认拼写）`
          : value.output + (value.truncated ? '\n（输出已截断，收窄检索词或调小 limit 可看更多）' : '')
        return [{ type: 'text', text: body }]
      },
    },
    async execute(args, exec) {
      const inferred = await deps.scope?.(exec)
      const projectId = args.projectId
        ? await resolveProjectId(deps, args.projectId)
        : inferred?.projectId
      if (!projectId) throw new Error('缺少 projectId：当前会话不在分支空间里；请传 projectId（可先用 ascoder_project_list 获取）')
      let branch = (args.branch ?? '').trim()
      const spaceId = (args.spaceId ?? '').trim()
      if (branch === '' && spaceId !== '') {
        // 只给 spaceId 时换成 branch（query 接口按分支名定位空间）
        const spaces = await deps.codegraph.statusForProject(projectId)
        branch = spaces.find((space) => space.spaceId === spaceId)?.branch ?? ''
      }
      if (branch === '' && spaceId === '') {
        // scope 里空间字段叫 spaceBranch
        branch = inferred?.branch ?? (inferred as { spaceBranch?: string } | undefined)?.spaceBranch ?? ''
      }
      if (branch === '') throw new Error('缺少 branch：当前会话不在分支空间里；请传 branch 或 spaceId')
      const mode = args.mode ?? 'query'
      const search = args.search.trim()
      if (search === '') throw new Error('search 不能为空')
      const argv = [mode, search]
      // query 支持收窄：结果太杂时模型可以自己限条数与节点类型，避免一次吃掉上万字符
      if (mode === 'query') {
        const limit = Number(args.limit ?? 0)
        if (Number.isFinite(limit) && limit > 0) argv.push('-l', String(Math.min(Math.floor(limit), 50)))
        const kind = (args.kind ?? '').trim()
        if (kind !== '') argv.push('-k', kind)
      }
      const { output } = await deps.codegraph.query(projectId, branch, argv)
      // CLI 输出可能很大（explore 会给源码片段），统一截断避免一次吃掉上下文
      const MAX = 12_000
      const truncated = output.length > MAX
      return { mode, output: truncated ? output.slice(0, MAX) : output, truncated }
    },
    presentCall(args) {
      return { card: 'generic', title: `语义检索：${args.search}`, kind: 'read' }
    },
  })

  return [status as ToolDefinition, index as ToolDefinition, query as ToolDefinition]
}
