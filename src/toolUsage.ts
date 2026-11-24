/**
 * 工具使用统计与启停开关。
 *
 * 记录每个 Ascoder 工具的调用次数、失败次数、最近调用时间与耗时，
 * 并保存哪些工具被用户在设置页停用。宿主内置工具只统计展示，不由本模块启停。
 */
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import type { RecordBackend, StoredRecord } from './storage.ts'

/** 单个工具的统计。 */
export interface ToolUsageEntry {
  /** 工具名（模型侧名称）。 */
  name: string
  /** 成功与失败的总调用次数。 */
  calls: number
  /** 失败次数。 */
  errors: number
  /** 最近一次调用时间（ISO 8601）。 */
  lastAt?: string
  /** 最近一次调用耗时（毫秒）。 */
  lastMs?: number
  /** 最近一次失败原因（截断后的文本）。 */
  lastError?: string
}

/** 持久化记录。 */
export interface ToolUsageRecord extends StoredRecord {
  entries: ToolUsageEntry[]
  /** 被停用的工具名。 */
  disabled: string[]
}

/** 失败原因的保留长度。 */
const MAX_ERROR_LENGTH = 300

/** 写入节流间隔（毫秒）。 */
const PERSIST_DELAY = 400

/** 工具统计与开关。 */
export class ToolUsageStore {
  private entries: ToolUsageEntry[] = []
  private disabled = new Set<string>()
  private timer: ReturnType<typeof setTimeout> | undefined
  private saving: Promise<void> = Promise.resolve()

  private constructor(private readonly backend: RecordBackend<ToolUsageRecord>) {}

  /**
   * 打开统计存储。
   * @param backend - 持久化后端
   */
  static async open(backend: RecordBackend<ToolUsageRecord>): Promise<ToolUsageStore> {
    const rows = await backend.load()
    const store = new ToolUsageStore(backend)
    store.entries = rows[0]?.entries ?? []
    store.disabled = new Set(rows[0]?.disabled ?? [])
    return store
  }

  /** 全部统计（按调用次数降序）。 */
  list(): ToolUsageEntry[] {
    return [...this.entries].sort((left, right) => right.calls - left.calls)
  }

  /** 按名称读取统计。 */
  get(name: string): ToolUsageEntry | undefined {
    return this.entries.find((entry) => entry.name === name)
  }

  /** 工具是否启用（未记录时默认启用）。 */
  isEnabled(name: string): boolean {
    return !this.disabled.has(name)
  }

  /** 停用的工具名集合。 */
  disabledNames(): string[] {
    return [...this.disabled]
  }

  /**
   * 启用或停用一个工具。
   * @param name - 工具名
   * @param enabled - true 启用，false 停用
   */
  async setEnabled(name: string, enabled: boolean): Promise<void> {
    if (enabled) this.disabled.delete(name)
    else this.disabled.add(name)
    await this.persist()
  }

  /**
   * 记录一次调用。
   * @param name - 工具名
   * @param ok - 是否成功
   * @param ms - 耗时（毫秒）
   * @param error - 失败原因（可选）
   */
  record(name: string, ok: boolean, ms: number, error?: string): void {
    let entry = this.get(name)
    if (!entry) {
      entry = { name, calls: 0, errors: 0 }
      this.entries.push(entry)
    }
    entry.calls += 1
    if (!ok) entry.errors += 1
    entry.lastAt = new Date().toISOString()
    entry.lastMs = ms
    if (ok) delete entry.lastError
    else if (error) entry.lastError = error.slice(0, MAX_ERROR_LENGTH)
    this.schedulePersist()
  }

  /**
   * 清零统计（指定工具或全部）。
   * @param name - 工具名；省略表示全部
   */
  async reset(name?: string): Promise<void> {
    if (name) this.entries = this.entries.filter((entry) => entry.name !== name)
    else this.entries = []
    await this.persist()
  }

  /** 释放介质（先落盘）。 */
  async close(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    await this.persist()
    await this.backend.close()
  }

  /** 节流落盘。 */
  private schedulePersist(): void {
    if (this.timer) return
    this.timer = setTimeout(() => {
      this.timer = undefined
      void this.persist()
    }, PERSIST_DELAY)
    this.timer.unref?.()
  }

  /** 立即落盘。 */
  private persist(): Promise<void> {
    const record: ToolUsageRecord = { id: 'tools', entries: this.entries, disabled: [...this.disabled] }
    this.saving = this.saving.then(() => this.backend.save([record])).catch(() => undefined)
    return this.saving
  }
}

/**
 * 给工具套上「停用检查 + 使用统计」。
 *
 * 包装后的工具在停用状态下直接抛错，正常调用会记录次数、失败与耗时。
 * @param definition - 原始工具定义
 * @param resolveStore - 惰性取统计存储（异步打开期间返回 undefined 时只放行不统计）
 * @returns 包装后的工具定义
 */
export function createInstrumentedTool(
  definition: ToolDefinition,
  resolveStore: () => ToolUsageStore | undefined,
): ToolDefinition {
  const original = definition.execute
  return {
    ...definition,
    async execute(args: unknown, exec: Parameters<typeof original>[1]): Promise<unknown> {
      const store = resolveStore()
      if (store && !store.isEnabled(definition.name)) {
        throw new Error(`工具 ${definition.name} 已在 Ascoder 设置中停用`)
      }
      const started = Date.now()
      try {
        const value = await original(args, exec)
        store?.record(definition.name, true, Date.now() - started)
        return value
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        store?.record(definition.name, false, Date.now() - started, message)
        throw error
      }
    },
  }
}
