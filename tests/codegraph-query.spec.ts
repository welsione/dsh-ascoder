import { describe, it, expect } from 'vitest'
import { buildCodegraphTools } from '../src/codegraphTools.js'

function makeFacade(outputSize = 100) {
  const calls: Array<{ projectRef: string; branch: string; args: string[] }> = []
  const facade = {
    statusForProject: async () => [],
    start: async () => ({ id: 't1' }),
    resolveSpace: async () => ({ project: { id: 'p1', name: 'Ascoder' }, space: { id: 's1', branch: 'main', status: 'ready' } }),
    query: async (projectRef: string, branch: string, args: string[]) => {
      calls.push({ projectRef, branch, args })
      return { output: 'x'.repeat(outputSize), dir: '/tmp/s1' }
    },
  }
  return { facade, calls }
}

describe('ascoder_codegraph_query', () => {
  it('runs the CLI mode with the search term and truncates huge output', async () => {
    const { facade, calls } = makeFacade(20_000)
    const tools = buildCodegraphTools({ codegraph: facade as never, scope: async () => ({ projectId: 'p1', spaceBranch: 'hotfix/5.6.x' }) })
    const tool = tools.find((item) => item.name === 'ascoder_codegraph_query')!
    const value = await tool.execute({ search: 'SignService', mode: 'explore' }, {} as never) as { output: string; truncated: boolean; mode: string }
    expect(calls[0].args).toEqual(['explore', 'SignService'])
    expect(calls[0].branch).toBe('hotfix/5.6.x')
    expect(value.truncated).toBe(true)
    expect(value.output.length).toBe(12_000)
  })

  it('passes limit and kind through to the CLI in query mode', async () => {
    const { facade, calls } = makeFacade(10)
    const tools = buildCodegraphTools({ codegraph: facade as never, scope: async () => ({ projectId: 'p1', spaceBranch: 'main' }) })
    const tool = tools.find((item) => item.name === 'ascoder_codegraph_query')!
    await tool.execute({ search: 'JSONArray', mode: 'query', limit: 5, kind: 'class' }, {} as never)
    expect(calls[0].args).toEqual(['query', 'JSONArray', '-l', '5', '-k', 'class'])
  })

  it('caps an oversized limit and ignores it in explore mode', async () => {
    const { facade, calls } = makeFacade(10)
    const tools = buildCodegraphTools({ codegraph: facade as never, scope: async () => ({ projectId: 'p1', spaceBranch: 'main' }) })
    const tool = tools.find((item) => item.name === 'ascoder_codegraph_query')!
    await tool.execute({ search: 'JSONArray', mode: 'query', limit: 500 }, {} as never)
    expect(calls[0].args).toEqual(['query', 'JSONArray', '-l', '50'])
    await tool.execute({ search: 'JSONArray', mode: 'explore', limit: 5 }, {} as never)
    expect(calls[1].args).toEqual(['explore', 'JSONArray'])
  })

  it('renders an actionable hint when the CLI returned nothing', async () => {
    const { facade } = makeFacade(0)
    const tools = buildCodegraphTools({ codegraph: facade as never, scope: async () => ({ projectId: 'p1', spaceBranch: 'main' }) })
    const tool = tools.find((item) => item.name === 'ascoder_codegraph_query')!
    const value = await tool.execute({ search: 'nothing', mode: 'explore' }, {} as never)
    const blocks = tool.output.render?.({ search: 'nothing' }, value as never) ?? []
    const text = String((blocks[0] as { text?: string }).text ?? '')
    expect(text).toContain('没有匹配结果')
    expect(text).toContain('ascoder_code_search')
  })

  it('falls back to the session scope for status too', async () => {
    const { facade, calls } = makeFacade(10)
    const tools = buildCodegraphTools({ codegraph: facade as never, scope: async () => ({ projectId: 'p1', spaceBranch: 'hotfix/5.6.x' }) })
    const tool = tools.find((item) => item.name === 'ascoder_codegraph_status')!
    await tool.execute({}, {} as never)
    expect(calls).toHaveLength(0)
  })

  it('explains what is missing when there is no scope to infer from', async () => {
    const { facade } = makeFacade(10)
    const tools = buildCodegraphTools({ codegraph: facade as never })
    const tool = tools.find((item) => item.name === 'ascoder_codegraph_query')!
    await expect(tool.execute({ search: 'SignService' }, {} as never)).rejects.toThrow(/缺少 projectId/)
  })
})
