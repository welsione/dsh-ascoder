/**
 * 知识库门面：内存快照 + 查询/排序 + 串行化持久化。
 *
 * 介质由通用存储后端提供（storage hub KV 或文件回退），本层不关心落盘细节。
 */
import { createFileBackend, createKvBackend, type RecordBackend } from './storage.ts'
import {
  type KnowledgeEntry,
  type KnowledgeKind,
  type KnowledgeQuery,
  type KnowledgeQueryResult,
  type KnowledgeSaveInput,
  type KnowledgeScope,
  knowledgeKey,
} from './types.ts'

/** 检索默认返回条数。 */
const DEFAULT_SEARCH_LIMIT = 8
/** KV 表名。 */
const TABLE = 'entries'
/** 文件回退中记录数组的字段名。 */
const FILE_FIELD = 'entries'

/** 知识库只读写视图：工具层面向此接口，异步打开完成前可挂 lazy 代理。 */
export interface KnowledgeStoreView {
  /** 库内条目总数。 */
  readonly total: number
  /**
   * 当前快照。
   * @param scope - 传入时只返回该作用域可见的条目（全局 + 同分支空间）；省略表示全部（管理用）
   */
  list(scope?: KnowledgeScope): KnowledgeEntry[]
  /**
   * 关键词检索。
   * @param scope - 传入时只检索该作用域可见的条目
   */
  search(input: KnowledgeQuery, scope?: KnowledgeScope): KnowledgeQueryResult
  /**
   * 新增或覆盖更新。
   * @param scope - 传入时条目归属该分支空间（缺省为全局）
   */
  save(input: KnowledgeSaveInput, scope?: KnowledgeScope): Promise<string>
  /** 删除条目。 */
  forget(id: string): Promise<boolean>
  /** 标记一次命中。 */
  recordHit(ids: string[]): Promise<void>
}

/** 条目对给定作用域是否可见：全局条目始终可见，分支条目只在同一空间可见。 */
function visibleIn(entry: KnowledgeEntry, scope?: KnowledgeScope): boolean {
  if (!scope) return true
  if (!entry.spaceId) return true
  return entry.spaceId === scope.spaceId
}

/** 作用域去重键：全局与分支分开，避免同名条目跨分支互相覆盖。 */
function scopedKey(kind: KnowledgeKind, term: string, scope?: KnowledgeScope): string {
  return `${knowledgeKey(kind, term)}|${scope?.spaceId ?? ''}`
}

/** 知识库门面。 */
export class KnowledgeStore implements KnowledgeStoreView {
  private entries: KnowledgeEntry[] = []
  private queue: Promise<void> = Promise.resolve()
  private closed = false

  private constructor(private readonly backend: RecordBackend<KnowledgeEntry>) {}

  /** 打开知识库并载入既有快照。 */
  static async open(backend: RecordBackend<KnowledgeEntry>): Promise<KnowledgeStore> {
    const store = new KnowledgeStore(backend)
    store.entries = await backend.load()
    return store
  }

  /** 库内条目总数。 */
  get total(): number {
    return this.entries.length
  }

  /** 当前快照（按创建时间升序）。 */
  list(scope?: KnowledgeScope): KnowledgeEntry[] {
    return this.entries
      .filter((entry) => visibleIn(entry, scope))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  }

  /** 关键词检索：term/definition/tags 全字段大小写不敏感子串匹配，加种类与标签过滤。 */
  search(input: KnowledgeQuery, scope?: KnowledgeScope): KnowledgeQueryResult {
    const query = input.query.trim().toLowerCase()
    const tags = (input.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter((tag) => tag !== '')
    const limit = input.limit ?? DEFAULT_SEARCH_LIMIT
    const visible = this.entries.filter((entry) => visibleIn(entry, scope))
    const matched = visible.filter((entry) => {
      if (input.kind && entry.kind !== input.kind) return false
      if (tags.length > 0 && !tags.some((tag) => entry.tags.map((item) => item.toLowerCase()).includes(tag))) return false
      if (query === '') return true
      return [entry.term, entry.definition, entry.tags.join(' ')].join(' ').toLowerCase().includes(query)
    })
    matched.sort((a, b) => scoreOf(b, query) - scoreOf(a, query) || a.createdAt.localeCompare(b.createdAt))
    return { entries: matched.slice(0, limit), total: visible.length }
  }

  /** 新增或按 (kind, term, 作用域) 覆盖更新，返回条目 id。 */
  async save(input: KnowledgeSaveInput, scope?: KnowledgeScope): Promise<string> {
    const key = scopedKey(input.kind, input.term, scope)
    const existing = this.entries.find((entry) => scopedKey(entry.kind, entry.term, { spaceId: entry.spaceId }) === key)
    if (existing) {
      existing.definition = input.definition
      existing.tags = input.tags ?? existing.tags
      await this.enqueue()
      return existing.id
    }
    const entry: KnowledgeEntry = {
      id: crypto.randomUUID(),
      kind: input.kind,
      term: input.term.trim(),
      definition: input.definition,
      tags: input.tags ?? [],
      createdAt: new Date().toISOString(),
      hits: 0,
      ...(scope?.projectId ? { projectId: scope.projectId } : {}),
      ...(scope?.spaceId ? { spaceId: scope.spaceId } : {}),
      ...(scope?.spaceBranch ? { spaceBranch: scope.spaceBranch } : {}),
    }
    this.entries.push(entry)
    await this.enqueue()
    return entry.id
  }

  /** 删除条目；返回是否真的删除。 */
  async forget(id: string): Promise<boolean> {
    const before = this.entries.length
    this.entries = this.entries.filter((entry) => entry.id !== id)
    if (this.entries.length === before) return false
    await this.enqueue()
    return true
  }

  /** 标记一次命中：刷新 lastHitAt、累加 hits 并持久化。 */
  async recordHit(ids: string[]): Promise<void> {
    if (ids.length === 0) return
    const now = new Date().toISOString()
    for (const entry of this.entries) {
      if (ids.includes(entry.id)) {
        entry.lastHitAt = now
        entry.hits += 1
      }
    }
    await this.enqueue()
  }

  /** 释放底层介质。 */
  async close(): Promise<void> {
    this.closed = true
    await this.queue
    await this.backend.close()
  }

  /** 串行排队一次全量同步；关闭后直接返回。 */
  private enqueue(): Promise<void> {
    if (this.closed) return Promise.resolve()
    // 单次落盘失败不能毒化队列：否则之后的保存全部不执行、close 也会抛错。
    // 与事件日志/任务存储保持同样的"吞掉并继续"策略（下次写入会带上最新快照）。
    this.queue = this.queue
      .then(() => this.backend.save(this.entries))
      .catch(() => undefined)
    return this.queue
  }
}

/** 检索排序分：term 精确/前缀/子串命中权重递减，定义命中次之。 */
function scoreOf(entry: KnowledgeEntry, query: string): number {
  if (query === '') return 0
  const term = entry.term.toLowerCase()
  if (term === query) return 3
  if (term.startsWith(query)) return 2
  if (term.includes(query)) return 1
  if (entry.definition.toLowerCase().includes(query)) return 1
  return 0
}

/** 由已打开的 KV 单元构造知识库后端。 */
export function openKvBackend(unit: Parameters<typeof createKvBackend>[0]): RecordBackend<KnowledgeEntry> {
  return createKvBackend<KnowledgeEntry>(unit, TABLE)
}

/** 由文件路径构造知识库后端（原子替换写）。 */
export function openFileBackend(file: string): RecordBackend<KnowledgeEntry> {
  return createFileBackend<KnowledgeEntry>(file, FILE_FIELD)
}

export type { KnowledgeEntry, KnowledgeKind, KnowledgeQuery, KnowledgeQueryResult, KnowledgeSaveInput }
