/**
 * 事件日志：记录项目/仓库/分支空间上的关键动作，供界面与 Agent 观察。
 *
 * 只保留最近的若干条（内存 + 落盘），按递增序号读取增量。
 */
import { randomUUID } from 'node:crypto'
import type { RecordBackend, StoredRecord } from './storage.ts'

/** 事件类型。 */
export type AscoderEventType =
  | 'project.created'
  | 'project.updated'
  | 'project.removed'
  | 'repository.added'
  | 'repository.removed'
  | 'repository.synced'
  | 'repository.updated'
  | 'space.created'
  | 'space.removed'
  | 'space.prepared'
  | 'space.updated'
  | 'space.failed'
  | 'space.synced'
  | 'knowledge.forgotten'
  | 'task.started'
  | 'task.succeeded'
  | 'task.failed'

/** 单条事件。 */
export interface AscoderEvent {
  id: string
  /** 单调递增序号，便于 since 增量读取。 */
  seq: number
  type: AscoderEventType
  at: string
  payload: Record<string, unknown>
}

/** 持久化记录（一条记录装整个日志）。 */
export interface EventLogRecord extends StoredRecord {
  events: AscoderEvent[]
  seq: number
}

/** 保留的事件条数。 */
const MAX_EVENTS = 200

/** 事件日志。 */
export class EventLog {
  private seq: number
  /** 串行化落盘：并发 emit 时避免旧快照覆盖新快照（会丢事件）。 */
  private saving: Promise<void> = Promise.resolve()

  private constructor(
    private readonly backend: RecordBackend<EventLogRecord>,
    private record: EventLogRecord,
  ) {
    this.seq = record.seq
  }

  /**
   * 打开日志。
   * @param backend - 持久化后端
   */
  static async open(backend: RecordBackend<EventLogRecord>): Promise<EventLog> {
    const rows = await backend.load()
    return new EventLog(backend, rows[0] ?? { id: 'events', events: [], seq: 0 })
  }

  /**
   * 记录一条事件。
   * @param type - 事件类型
   * @param payload - 事件载荷
   * @returns 写入的事件
   */
  async emit(type: AscoderEventType, payload: Record<string, unknown> = {}): Promise<AscoderEvent> {
    this.seq += 1
    const event: AscoderEvent = {
      id: randomUUID(),
      seq: this.seq,
      type,
      at: new Date().toISOString(),
      payload,
    }
    const events = [...this.record.events, event].slice(-MAX_EVENTS)
    const snapshot: EventLogRecord = { id: 'events', events, seq: this.seq }
    this.record = snapshot
    // 串行写入：保证磁盘上最终是最新快照
    this.saving = this.saving
      .then(() => this.backend.save([snapshot]))
      .catch(() => undefined)
    await this.saving
    return event
  }

  /**
   * 读取事件（按 seq 升序）。
   * @param since - 只返回 seq 大于该值的事件
   * @param limit - 最多返回条数（取最新的 limit 条）
   */
  list(since = 0, limit = 50): AscoderEvent[] {
    const filtered = this.record.events.filter((event) => event.seq > since)
    return filtered.slice(-limit)
  }

  /** 最新序号，供客户端记录游标。 */
  get cursor(): number {
    return this.seq
  }

  /** 释放介质。 */
  async close(): Promise<void> {
    await this.backend.close()
  }
}
