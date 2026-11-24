/**
 * 知识层工具装配：knowledge_search / knowledge_save / knowledge_list / knowledge_forget。
 *
 * 全部走 defineTool + ctx.tools.register（注册即 effect，卸载自动清理）。
 */
import { defineTool, type ToolDefinition } from '@deepseek-ai/dsh-tools'
import type { KnowledgeStoreView } from './store.ts'
import { isKnowledgeKind, type KnowledgeKind, type KnowledgeScope } from './types.ts'

/** 搜索默认上限。 */
const SEARCH_LIMIT_DEFAULT = 8
/** 搜索上限硬顶（防一次拉爆上下文）。 */
const SEARCH_LIMIT_MAX = 25
/** 工具渲染时单条 definition 截断长度。 */
const RENDER_DEFINITION_MAX = 400

/** 知识层工具的可选依赖（事件日志 + 作用域推断）。 */
export interface KnowledgeToolOptions {
  /** 事件日志发射器；未接入时删除不留痕（仅测试/独立使用）。 */
  events?: { emit(type: 'knowledge.forgotten', payload: Record<string, unknown>): Promise<unknown> }
  /**
   * 从工具执行上下文推断当前分支空间，用于读写隔离：
   * 传了作用域就只读写"全局 + 本空间"的条目，缺省视为全局条目。
   */
  scope?: (exec: unknown) => Promise<KnowledgeScope | undefined>
}

/** 读取本次调用所属作用域（推断失败时按全局处理）。 */
async function scopeOf(options: KnowledgeToolOptions, exec: unknown): Promise<KnowledgeScope | undefined> {
  try {
    return await options.scope?.(exec)
  } catch {
    return undefined
  }
}

/** 渲染条目的紧凑文本行。 */
function renderEntryLine(entry: { id: string; kind: string; term: string; definition: string; tags: string[] }): string {
  const body = entry.definition.length > RENDER_DEFINITION_MAX
    ? `${entry.definition.slice(0, RENDER_DEFINITION_MAX)}…`
    : entry.definition
  const tags = entry.tags.length > 0 ? ` #${entry.tags.join(' #')}` : ''
  return `- [${entry.kind}] ${entry.term}${tags}：${body} (id: ${entry.id})`
}

/** 统一归一化字符串数组参数。 */
function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  return tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter((tag) => tag !== '')
}

/** 校验并归一化 kind 参数。 */
function parseKind(value: unknown, required: boolean): KnowledgeKind | undefined {
  if (value === undefined) {
    if (required) throw new Error('kind is required')
    return undefined
  }
  if (!isKnowledgeKind(value)) throw new Error(`kind must be one of: term, knowledge, experience`)
  return value
}

/** 构造全部知识层工具。 */
export function buildKnowledgeTools(store: KnowledgeStoreView, options: KnowledgeToolOptions = {}): ToolDefinition[] {
  const searchTool = defineTool({
    name: 'knowledge_search',
    description: '在 Ascoder 团队知识库中检索术语、结论与踩坑经验。回答涉及团队业务概念或历史决策的代码问题前应先调用。',
    parameters: {
      query: { type: 'string', required: true, description: '检索关键词，大小写不敏感，匹配术语/内容/标签' },
      kind: { type: 'string', enum: ['term', 'knowledge', 'experience'], description: '可选：按种类过滤' },
      tags: { type: 'array', items: { type: 'string' }, description: '可选：按标签过滤（任一匹配即可）' },
      limit: { type: 'integer', description: `返回条数上限，默认 ${SEARCH_LIMIT_DEFAULT}，最大 ${SEARCH_LIMIT_MAX}` },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          total: { type: 'integer', required: true },
          entries: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string', required: true },
                kind: { type: 'string', required: true },
                term: { type: 'string', required: true },
                definition: { type: 'string', required: true },
                tags: { type: 'array', items: { type: 'string' }, required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.entries.length === 0
          ? '知识库中没有匹配条目。'
          : [`共 ${value.total} 条，命中 ${value.entries.length} 条：`, ...value.entries.map(renderEntryLine)].join('\n'),
      }],
    },
    async execute(args, exec) {
      const limit = args.limit === undefined ? SEARCH_LIMIT_DEFAULT : args.limit
      if (!Number.isInteger(limit) || limit < 1 || limit > SEARCH_LIMIT_MAX) {
        throw new Error(`limit must be an integer in [1, ${SEARCH_LIMIT_MAX}]`)
      }
      const kind = parseKind(args.kind, false)
      const scope = await scopeOf(options, exec)
      const result = store.search({ query: args.query, kind, tags: normalizeTags(args.tags), limit }, scope)
      await store.recordHit(result.entries.map((entry) => entry.id))
      return {
        total: result.total,
        entries: result.entries.map((entry) => ({
          id: entry.id,
          kind: entry.kind,
          term: entry.term,
          definition: entry.definition,
          tags: entry.tags,
        })),
      }
    },
    presentCall(args) {
      return { card: 'generic', title: `检索知识库：${args.query}`, kind: 'search' }
    },
  })

  const saveTool = defineTool({
    name: 'knowledge_save',
    description: '把一条团队知识（业务术语、机制结论、踩坑经验）写入 Ascoder 知识库。相同 kind+term 会覆盖更新。',
    parameters: {
      kind: { type: 'string', enum: ['term', 'knowledge', 'experience'], required: true, description: '条目种类' },
      term: { type: 'string', required: true, description: '术语、标题或主题（唯一键的一部分）' },
      definition: { type: 'string', required: true, description: '正文解释' },
      tags: { type: 'array', items: { type: 'string' }, description: '可选标签' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', required: true },
          total: { type: 'integer', required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: `已保存（id: ${value.id}），知识库现有 ${value.total} 条。`,
      }],
    },
    async execute(args, exec) {
      const scope = await scopeOf(options, exec)
      const term = args.term.trim()
      if (term === '') throw new Error('term must not be empty')
      const definition = args.definition.trim()
      if (definition === '') throw new Error('definition must not be empty')
      const id = await store.save({
        kind: parseKind(args.kind, true) as KnowledgeKind,
        term,
        definition,
        tags: normalizeTags(args.tags),
      }, scope)
      return { id, total: store.list(scope).length }
    },
    presentCall(args) {
      return { card: 'generic', title: `保存知识：${args.term}`, kind: 'edit' }
    },
  })

  const listTool = defineTool({
    name: 'knowledge_list',
    description: '列出 Ascoder 知识库全部条目（按创建时间），用于盘点或让用户确认库内容。',
    parameters: {},
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          total: { type: 'integer', required: true },
          entries: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string', required: true },
                kind: { type: 'string', required: true },
                term: { type: 'string', required: true },
                hits: { type: 'integer', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.entries.length === 0
          ? '知识库为空。'
          : [`共 ${value.total} 条：`, ...value.entries.map((entry) => `- [${entry.kind}] ${entry.term} (id: ${entry.id}, 命中 ${entry.hits})`)].join('\n'),
      }],
    },
    async execute(_args, exec) {
      const scope = await scopeOf(options, exec)
      const visible = store.list(scope)
      return {
        total: visible.length,
        entries: visible.map((entry) => ({ id: entry.id, kind: entry.kind, term: entry.term, hits: entry.hits })),
      }
    },
    presentCall() {
      return { card: 'generic', title: '列出知识库条目', kind: 'read' }
    },
  })

  const forgetTool = defineTool({
    name: 'knowledge_forget',
    description: '从 Ascoder 知识库删除一条不再成立的知识。需要条目 id（可先用 knowledge_search/knowledge_list 获取）与删除理由；'
      + '删除动作会写入事件日志供审计，因此只有在新结论已覆盖旧条目、或用户明确要求时才删除。',
    parameters: {
      id: { type: 'string', required: true, description: '要删除的条目 id' },
      reason: { type: 'string', required: true, description: '删除理由（例如"已被 2026-11-12 的新结论覆盖"），会写入事件日志' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          removed: { type: 'boolean', required: true },
          total: { type: 'integer', required: true },
          reason: { type: 'string' },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: value.removed ? `已删除，知识库现有 ${value.total} 条。` : `未找到该条目，知识库现有 ${value.total} 条。`,
      }],
    },
    async execute(args) {
      const id = args.id.trim()
      const reason = args.reason.trim()
      if (reason === '') throw new Error('reason 不能为空：删除知识必须说明理由（会记入事件日志）')
      // 删除前先取条目信息，事件日志里才能留下"删了哪条"
      const entry = store.list().find((item) => item.id === id)
      const removed = await store.forget(id)
      if (removed) {
        await options.events?.emit('knowledge.forgotten', {
          id,
          reason,
          ...(entry ? { kind: entry.kind, term: entry.term } : {}),
        })
      }
      return { removed, total: store.total, ...(removed ? { reason } : {}) }
    },
    presentCall(args) {
      return { card: 'generic', title: `删除知识 ${args.id}`, kind: 'delete' }
    },
  })

  return [searchTool, saveTool, listTool, forgetTool]
}
