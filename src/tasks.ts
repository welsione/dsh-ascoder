/**
 * 异步任务：准备空间、同步代码这类长耗时动作放到后台执行，前端轮询进度。
 *
 * 对应 legacy Ascoder 的 TaskEngine：任务有状态机（排队/执行/成功/失败）、
 * 进度、以及事件发射（task.started / task.succeeded / task.failed）。
 */
import { randomUUID } from 'node:crypto'
import type { RecordBackend, StoredRecord } from './storage.ts'
import type { EventLog } from './events.ts'

/** 任务状态。 */
export type TaskStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled'

/** 任务种类。 */
export type TaskKind = 'space.prepare' | 'space.sync' | 'space.clone' | 'repository.sync' | 'codegraph.index'

/** 任务视图。 */
export interface TaskView {
  id: string
  kind: TaskKind
  title: string
  status: TaskStatus
  /** 已完成的步骤数与总数（未知时 total 为 0）。 */
  progress: { done: number; total: number }
  /** 最近一条进度说明。 */
  message?: string
  error?: string
  projectId?: string
  spaceId?: string
  /** 互斥键：同一键同时只允许一个任务在跑（例如同一个分支空间的 prepare/sync）。 */
  key?: string
  createdAt: string
  updatedAt: string
  finishedAt?: string
}

/** 持久化记录。 */
export interface TaskRecord extends StoredRecord {
  tasks: TaskView[]
}

/** 保留的任务条数（运行中的不裁剪）。 */
const MAX_KEPT = 50

/** 任务句柄：执行体用它汇报进度与结果。 */
export interface TaskHandle {
  readonly id: string
  /** 上报进度。 */
  report(message: string, done?: number, total?: number): void
  /** 标记成功。 */
  succeed(message?: string): void
  /** 标记失败。 */
  fail(error: string): void
  /** 是否已被请求取消。 */
  readonly cancelled: boolean
}

/** 裁剪历史时优先保留运行中的任务（运行中的任务不能被挤掉，否则界面会丢失进度）。 */
function keepRunningFirst(tasks: TaskView[], limit: number): TaskView[] {
  if (tasks.length <= limit) return tasks
  const running = tasks.filter((task) => task.status === 'running' || task.status === 'queued')
  const finished = tasks.filter((task) => task.status !== 'running' && task.status !== 'queued')
  return [...running, ...finished].slice(0, Math.max(limit, running.length))
}

/** 任务服务。 */
export class TaskService {
  private tasks: TaskView[] = []
  private readonly cancelled = new Set<string>()
  private readonly listeners = new Set<() => void>()
  private saving: Promise<void> = Promise.resolve()

  private constructor(
    private readonly backend: RecordBackend<TaskRecord>,
    private readonly events: EventLog | undefined,
  ) {}

  /**
   * 打开任务服务并载入历史。
   * @param backend - 持久化后端
   * @param events - 可选事件日志
   */
  static async open(backend: RecordBackend<TaskRecord>, events?: EventLog): Promise<TaskService> {
    const rows = await backend.load()
    const service = new TaskService(backend, events)
    // 上次进程退出时仍在执行的任务统一标记为中断
    service.tasks = (rows[0]?.tasks ?? []).map((task) =>
      task.status === 'running' || task.status === 'queued'
        ? { ...task, status: 'failed' as TaskStatus, error: '进程重启，任务中断', finishedAt: new Date().toISOString() }
        : task)
    return service
  }

  /** 全部任务（最新在前）。 */
  list(): TaskView[] {
    return [...this.tasks].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }

  /** 运行中的任务。 */
  running(): TaskView[] {
    return this.tasks.filter((task) => task.status === 'running' || task.status === 'queued')
  }

  /** 按互斥键查找运行中的任务。 */
  runningByKey(key: string): TaskView | undefined {
    return this.tasks.find(
      (task) => task.key === key && (task.status === 'running' || task.status === 'queued'),
    )
  }

  /** 按 id 取任务。 */
  get(id: string): TaskView | undefined {
    return this.tasks.find((task) => task.id === id)
  }

  /**
   * 启动一个任务并立即返回句柄；执行体在后台运行。
   * @param input - 任务元信息
   * @param work - 执行体
   */
  start(
    input: { kind: TaskKind; title: string; projectId?: string; spaceId?: string; key?: string },
    work: (handle: TaskHandle) => Promise<void>,
  ): TaskView {
    // 同一个互斥键（例如同一个分支空间）同时只允许一个任务：
    // 重复点击「更新代码」或多用户同时操作时复用已在跑的任务，避免并发写同一个目录
    if (input.key) {
      const running = this.tasks.find(
        (task) => task.key === input.key && (task.status === 'running' || task.status === 'queued'),
      )
      if (running) return running
    }
    const now = new Date().toISOString()
    const task: TaskView = {
      id: randomUUID(),
      kind: input.kind,
      title: input.title,
      status: 'running',
      progress: { done: 0, total: 0 },
      ...(input.projectId ? { projectId: input.projectId } : {}),
      ...(input.spaceId ? { spaceId: input.spaceId } : {}),
      ...(input.key ? { key: input.key } : {}),
      createdAt: now,
      updatedAt: now,
    }
    this.tasks = keepRunningFirst([task, ...this.tasks], MAX_KEPT)
    this.emit('task.started', { taskId: task.id, kind: task.kind, title: task.title })

    const handle: TaskHandle = {
      id: task.id,
      cancelled: false,
      report: (message, done, total) => {
        const target = this.get(task.id)
        if (!target || target.status !== 'running') return
        target.message = message
        target.updatedAt = new Date().toISOString()
        if (done !== undefined) target.progress = { done, total: total ?? target.progress.total }
        this.touch()
      },
      succeed: (message) => {
        const target = this.get(task.id)
        // 已取消的任务保持 cancelled：执行体晚到的完成/失败不能改写状态机
        if (!target || target.status === 'cancelled') return
        target.status = 'succeeded'
        target.message = message ?? target.message
        target.progress = { done: target.progress.total, total: target.progress.total }
        target.finishedAt = new Date().toISOString()
        target.updatedAt = target.finishedAt
        this.emit('task.succeeded', { taskId: target.id, kind: target.kind })
        this.touch()
      },
      fail: (error) => {
        const target = this.get(task.id)
        if (!target || target.status === 'cancelled') return
        target.status = 'failed'
        target.error = error
        target.finishedAt = new Date().toISOString()
        target.updatedAt = target.finishedAt
        this.emit('task.failed', { taskId: target.id, kind: target.kind, error })
        this.touch()
      },
    }
    Object.defineProperty(handle, 'cancelled', { get: () => this.cancelled.has(task.id) })

    void work(handle).catch((error: unknown) => {
      handle.fail(error instanceof Error ? error.message : String(error))
    })
    this.touch()
    return task
  }

  /**
   * 请求取消任务（执行体需要自行检查 cancelled）。
   * @param id - 任务 id
   */
  cancel(id: string): boolean {
    const task = this.get(id)
    if (!task || task.status !== 'running') return false
    this.cancelled.add(id)
    task.status = 'cancelled'
    task.finishedAt = new Date().toISOString()
    task.updatedAt = task.finishedAt
    this.touch()
    return true
  }

  /** 订阅任务变化（界面/轮询之外的低延迟推送用）。 */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  /** 通知订阅者并落盘。 */
  private touch(): void {
    for (const listener of this.listeners) listener()
    const snapshot: TaskRecord = { id: 'tasks', tasks: this.tasks }
    this.saving = this.saving
      .then(() => this.backend.save([snapshot]))
      .catch(() => undefined)
  }

  /** 发事件（无日志时忽略）。 */
  private emit(type: 'task.started' | 'task.succeeded' | 'task.failed', payload: Record<string, unknown>): void {
    void this.events?.emit(type, payload)
  }

  /** 释放介质。 */
  async close(): Promise<void> {
    await this.saving
    await this.backend.close()
  }
}
