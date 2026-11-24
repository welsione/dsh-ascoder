/**
 * Ascoder 知识层领域类型。
 *
 * 移植自 Ascoder selflearning 模块的聚合划分：术语 / 知识项 / 经验。
 * 每个领域一个 class 风格的接口表达，字段 camelCase。
 */

/** 知识条目种类，对应 Ascoder selflearning 的三个聚合。 */
export const KNOWLEDGE_KINDS = ['term', 'knowledge', 'experience'] as const

/** 知识条目种类类型。 */
export type KnowledgeKind = (typeof KNOWLEDGE_KINDS)[number]

/** 一条可复用的团队知识。 */
export interface KnowledgeEntry {
  /** 全局唯一 id。 */
  id: string
  /** 种类：term / knowledge / experience。 */
  kind: KnowledgeKind
  /** 术语、标题或主题。 */
  term: string
  /** 正文解释。 */
  definition: string
  /** 可选关联标签。 */
  tags: string[]
  /** 创建时间（ISO 8601）。 */
  createdAt: string
  /** 最近一次命中时间（ISO 8601，未命中过为空）。 */
  lastHitAt?: string
  /** 命中次数。 */
  hits: number
  /** 作用域：项目 id；缺省表示全局（所有项目可见）。 */
  projectId?: string
  /** 作用域：分支空间 id；缺省表示全局（所有空间可见）。 */
  spaceId?: string
  /** 作用域展示用分支名（列表里显示"分支空间"标签）。 */
  spaceBranch?: string
}

/** 知识作用域：由当前会话的工作目录（分支空间根）推断。 */
export interface KnowledgeScope {
  projectId?: string
  spaceId?: string
  spaceBranch?: string
}

/** search 入参（工具层已校验）。 */
export interface KnowledgeQuery {
  /** 必填关键词，大小写不敏感。 */
  query: string
  /** 可选种类过滤。 */
  kind?: KnowledgeKind
  /** 可选标签过滤（任一匹配即可）。 */
  tags?: string[]
  /** 返回条数上限。 */
  limit?: number
}

/** search 出参。 */
export interface KnowledgeQueryResult {
  /** 命中条目。 */
  entries: KnowledgeEntry[]
  /** 库内条目总数。 */
  total: number
}

/** save 入参。 */
export interface KnowledgeSaveInput {
  kind: KnowledgeKind
  term: string
  definition: string
  tags?: string[]
}

/** 按种类与术语归一化后的唯一键。 */
export function knowledgeKey(kind: KnowledgeKind, term: string): string {
  return `${kind}:${term.trim().toLowerCase()}`
}

/** 判断任意值是否为合法知识种类。 */
export function isKnowledgeKind(value: unknown): value is KnowledgeKind {
  return typeof value === 'string' && (KNOWLEDGE_KINDS as readonly string[]).includes(value)
}
