import { describe, it, expect } from 'vitest'
import { buildProjectTools } from '../src/projectTools.js'
import type { ProjectView } from '../src/projects.js'

/** 构造带一个分支空间的项目桩；scope 由测试注入。 */
function makeService(scopeProjectId?: string) {
  const project: ProjectView = {
    id: 'p1',
    name: 'Ascoder',
    createdAt: '2026-01-01T00:00:00.000Z',
    members: [{ id: 'm1', alias: 'private-sign', repositoryId: 'r1' }],
    spaces: [{ id: 's1', branch: 'hotfix/5.6.x', createdAt: '2026-01-01T00:00:00.000Z', status: 'ready', preparedCount: 1, memberCount: 1 }],
    memberCount: 1,
    spaceCount: 1,
    dirty: 0,
  }
  const calls: Array<{ projectId: string; spaceId: string; query: string }> = []
  const service = {
    root: '/tmp/spaces',
    state: async () => [project],
    create: async () => ({ id: 'p1', name: 'Ascoder' }),
    addMember: async () => ({ id: 'm1' }),
    createSpace: async () => ({ id: 's1', branch: 'main' }),
    prepareSpace: async () => ({ id: 's1', branch: 'main', status: 'ready' }),
    syncSpace: async () => [],
    searchCode: async (projectId: string, spaceId: string, query: string) => {
      calls.push({ projectId, spaceId, query })
      return { matches: [], truncated: false }
    },
    scope: async () => (scopeProjectId ? { projectId: scopeProjectId, spaceId: 's1', branch: 'hotfix/5.6.x' } : undefined),
    tasks: { list: () => [], running: () => [] },
  }
  return { service: service as unknown as Parameters<typeof buildProjectTools>[0], calls }
}

describe('space inference from the session workspace', () => {
  it('lets code_search run without projectId when the session sits in a space', async () => {
    const { service, calls } = makeService('p1')
    const tools = buildProjectTools(service)
    const search = tools.find((tool) => tool.name === 'ascoder_code_search')!
    await search.execute({ query: 'SignService' }, {} as never)
    expect(calls).toEqual([{ projectId: 'p1', spaceId: 's1', query: 'SignService' }])
  })

  it('infers the project when only a branch is given', async () => {
    const { service, calls } = makeService('p1')
    const tools = buildProjectTools(service)
    const search = tools.find((tool) => tool.name === 'ascoder_code_search')!
    await search.execute({ query: 'SignService', branch: 'hotfix/5.6.x' }, {} as never)
    expect(calls).toEqual([{ projectId: 'p1', spaceId: 's1', query: 'SignService' }])
  })

  it('falls back to the session space when only projectId is given', async () => {
    const { service, calls } = makeService('p1')
    const tools = buildProjectTools(service)
    const search = tools.find((tool) => tool.name === 'ascoder_code_search')!
    await search.execute({ query: 'SignService', projectId: 'p1' }, {} as never)
    expect(calls).toEqual([{ projectId: 'p1', spaceId: 's1', query: 'SignService' }])
  })

  it('explains what to do when there is nothing to infer', async () => {
    const { service } = makeService(undefined)
    const tools = buildProjectTools(service)
    const search = tools.find((tool) => tool.name === 'ascoder_code_search')!
    await expect(search.execute({ query: 'SignService' }, {} as never)).rejects.toThrow(/缺少 projectId/)
  })
})
