import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { TaskService } from '../src/tasks.js'
import { EventLog } from '../src/events.js'
import { createFileBackend } from '../src/storage.js'

async function openStores(dir: string) {
  const events = await EventLog.open(createFileBackend<{ id: string; events: never[]; seq: number }>(join(dir, 'events.json'), 'events'))
  const tasks = await TaskService.open(createFileBackend(join(dir, 'tasks.json'), 'tasks'), events)
  return { events, tasks }
}

describe('async tasks', () => {
  it('runs a task, reports progress and records lifecycle events', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-task-'))
    try {
      const { events, tasks } = await openStores(dir)
      const handleSeen: string[] = []
      tasks.start({ kind: 'space.prepare', title: '准备空间', projectId: 'p1', spaceId: 's1' }, async (handle) => {
        handle.report('准备 a（1/2）', 0, 2)
        handleSeen.push(handle.id)
        handle.report('准备 b（2/2）', 1, 2)
        handle.succeed('空间已就绪')
      })
      await new Promise((resolve) => setTimeout(resolve, 30))

      const [task] = tasks.list()
      expect(task.status).toBe('succeeded')
      expect(task.progress).toEqual({ done: 2, total: 2 })
      expect(task.message).toBe('空间已就绪')
      expect(handleSeen).toHaveLength(1)

      const types = events.list().map((event) => event.type)
      expect(types).toContain('task.started')
      expect(types).toContain('task.succeeded')
      await tasks.close()
      await events.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('marks failures and persists history across reopen', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-task-'))
    try {
      const { events, tasks } = await openStores(dir)
      tasks.start({ kind: 'space.sync', title: '更新代码' }, async () => {
        throw new Error('git pull 失败')
      })
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(tasks.list()[0].status).toBe('failed')
      expect(tasks.list()[0].error).toContain('git pull 失败')
      await tasks.close()

      const reopened = await TaskService.open(createFileBackend(join(dir, 'tasks.json'), 'tasks'), events)
      expect(reopened.list()[0].status).toBe('failed')
      await reopened.close()
      await events.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('marks queued/running tasks as interrupted when the process restarts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-task-'))
    try {
      const file = join(dir, 'tasks.json')
      const { events, tasks } = await openStores(dir)
      tasks.start({ kind: 'space.prepare', title: '准备空间' }, () => new Promise(() => undefined))
      await new Promise((resolve) => setTimeout(resolve, 20))
      await tasks.close()
      await events.close()

      const reopened = await TaskService.open(createFileBackend(file, 'tasks'), undefined)
      expect(reopened.list()[0].status).toBe('failed')
      expect(reopened.list()[0].error).toContain('中断')
      await reopened.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('supports cancellation requests', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-task-'))
    try {
      const { events, tasks } = await openStores(dir)
      const task = tasks.start({ kind: 'space.prepare', title: '准备空间' }, () => new Promise(() => undefined))
      expect(tasks.cancel(task.id)).toBe(true)
      expect(tasks.list()[0].status).toBe('cancelled')
      expect(tasks.cancel(task.id)).toBe(false)
      await tasks.close()
      await events.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('event log', () => {
  it('emits incremental events with increasing seq and caps history', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-event-'))
    try {
      const log = await EventLog.open(createFileBackend<{ id: string; events: never[]; seq: number }>(join(dir, 'events.json'), 'events'))
      const first = await log.emit('project.created', { projectId: 'p1' })
      const second = await log.emit('space.prepared', { spaceId: 's1' })
      expect(second.seq).toBe(first.seq + 1)
      expect(log.list(first.seq)).toHaveLength(1)
      expect(log.cursor).toBe(second.seq)
      await log.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('space task mutex', () => {
  it('reuses the running task for the same key instead of starting a second one', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-task-mutex-'))
    try {
      const service = await TaskService.open(createFileBackend(join(dir, 'tasks.json'), 'tasks'))
      let release: () => void = () => {}
      const gate = new Promise<void>((resolve) => { release = resolve })
      let runs = 0

      const first = service.start({ kind: 'space.sync', title: '更新空间代码', key: 'space:s1' }, async (handle) => {
        runs += 1
        await gate
        handle.succeed('done')
      })
      const second = service.start({ kind: 'space.sync', title: '更新空间代码', key: 'space:s1' }, async () => {
        runs += 1
      })

      expect(second.id).toBe(first.id)
      expect(service.runningByKey('space:s1')?.id).toBe(first.id)
      expect(runs).toBe(1)

      release()
      await gate
      await new Promise((resolve) => setTimeout(resolve, 20))
      // 任务结束后互斥键释放，可以再起新任务
      expect(service.runningByKey('space:s1')).toBeUndefined()
      const third = service.start({ kind: 'space.prepare', title: '准备分支空间', key: 'space:s1' }, async (handle) => {
        handle.succeed('done')
      })
      expect(third.id).not.toBe(first.id)
      await service.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('never trims a running task away when history is full', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-task-trim-'))
    try {
      const service = await TaskService.open(createFileBackend(join(dir, 'tasks.json'), 'tasks'))
      let release: () => void = () => {}
      const gate = new Promise<void>((resolve) => { release = resolve })
      const longRunning = service.start({ kind: 'space.prepare', title: '长任务', key: 'space:long' }, async () => {
        await gate
      })
      for (let index = 0; index < 60; index += 1) {
        service.start({ kind: 'repository.sync', title: `t${index}` }, async () => {})
      }
      expect(service.get(longRunning.id)?.status).toBe('running')
      release()
      await gate
      await service.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('task cancellation', () => {
  it('keeps a cancelled task cancelled when the work finishes later', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-task-cancel-'))
    try {
      const service = await TaskService.open(createFileBackend(join(dir, 'tasks.json'), 'tasks'))
      let release: () => void = () => {}
      const gate = new Promise<void>((resolve) => { release = resolve })
      const task = service.start({ kind: 'space.sync', title: '更新空间代码', key: 'space:x' }, async () => {
        await gate
      })
      expect(service.cancel(task.id)).toBe(true)
      expect(service.get(task.id)?.status).toBe('cancelled')
      // 执行体在取消后才完成，状态不能被改写
      release()
      await new Promise((resolve) => setTimeout(resolve, 30))
      expect(service.get(task.id)?.status).toBe('cancelled')
      await service.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

