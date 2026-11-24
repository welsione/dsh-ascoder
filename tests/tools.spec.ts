import { describe, it, expect } from 'vitest'
import { buildProjectTools } from '../src/projectTools.js'
import type { ProjectView } from '../src/projects.js'
import type { AscoderEvent } from '../src/events.js'
import type { TaskView } from '../src/tasks.js'

/** 构造最小可用的工具依赖（任务/事件为桩数据）。 */
function makeService(tasks: TaskView[], events: AscoderEvent[], cursor = 3) {
  const projectView: ProjectView = {
    id: 'p1',
    name: 'Ascoder',
    createdAt: '2026-01-01T00:00:00.000Z',
    members: [],
    spaces: [],
    memberCount: 0,
    spaceCount: 0,
    dirty: 0,
  }
  return {
    root: '/tmp/spaces',
    state: async () => [projectView],
    create: async () => ({ id: 'p1', name: 'Ascoder' }),
    addMember: async () => ({ id: 'm1', alias: 'ascoder' }),
    createSpace: async () => ({ id: 's1', branch: 'main' }),
    prepareSpace: async () => ({ id: 's1', branch: 'main', status: 'ready' }),
    syncSpace: async () => [],
    tasks: { list: () => tasks, running: () => tasks.filter((task) => task.status === 'running') },
    events: { list: () => events, cursor },
  }
}

const runningTask: TaskView = {
  id: 't1',
  kind: 'space.prepare' as TaskView['kind'],
  title: '准备分支空间',
  status: 'running',
  progress: { done: 1, total: 2 },
  message: '准备 ascoder（2/2）',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:01.000Z',
}

const failedTask: TaskView = {
  id: 't0',
  kind: 'space.sync' as TaskView['kind'],
  title: '更新空间代码',
  status: 'failed',
  progress: { done: 1, total: 1 },
  error: 'git pull 失败',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:05.000Z',
  finishedAt: '2026-01-01T00:00:05.000Z',
}

const event: AscoderEvent = {
  id: 'e1',
  seq: 3,
  type: 'space.failed',
  at: '2026-01-01T00:00:05.000Z',
  payload: { branch: 'main', error: 'git pull 失败' },
}

describe('ascoder_task_list tool', () => {
  it('reports running tasks, recent results and events', async () => {
    const tools = buildProjectTools(makeService([runningTask, failedTask], [event]))
    const tool = tools.find((item) => item.name === 'ascoder_task_list')
    expect(tool).toBeTruthy()
    const result = await tool!.execute({ limit: 5 }, {} as never)
    expect(result.cursor).toBe(3)
    expect(result.running).toHaveLength(1)
    expect(result.running[0].progress).toBe('1/2')
    const failed = result.tasks.find((task) => task.status === 'failed')
    expect(failed).toBeTruthy()
    expect(failed!.error).toContain('git pull 失败')
    expect(result.events[0].type).toBe('space.failed')
    expect(result.events[0].summary).toContain('main')
  })

  it('survives a runtime without task or event stores', async () => {
    const service = makeService([], [])
    const bare = { ...service, tasks: undefined, events: undefined }
    const tool = buildProjectTools(bare).find((item) => item.name === 'ascoder_task_list')!
    const result = await tool.execute({}, {} as never)
    expect(result.running).toEqual([])
    expect(result.tasks).toEqual([])
    expect(result.events).toEqual([])
    expect(result.cursor).toBe(0)
  })
})
