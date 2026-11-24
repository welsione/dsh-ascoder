import { describe, it, expect } from 'vitest'
import { KnowledgeStore } from '../src/store.js'
import { buildKnowledgeTools } from '../src/tools.js'
import type { RecordBackend } from '../src/storage.js'
import type { KnowledgeEntry } from '../src/types.js'

function memoryBackend(): RecordBackend<KnowledgeEntry> {
  return {
    async load() { return [] },
    async save() { /* no-op */ },
    async close() { /* no-op */ },
  }
}

const scopeA = { projectId: 'p1', spaceId: 'sA', spaceBranch: 'hotfix/5.6.x' }
const scopeB = { projectId: 'p1', spaceId: 'sB', spaceBranch: 'hotfix/5.7.x' }

describe('knowledge scoping', () => {
  it('keeps branch entries inside their own space and keeps globals visible everywhere', async () => {
    const store = await KnowledgeStore.open(memoryBackend())
    await store.save({ kind: 'knowledge', term: '全局术语', definition: '所有空间都能看到' })
    await store.save({ kind: 'knowledge', term: '提交明细', definition: 'A 分支的提交' }, scopeA)
    await store.save({ kind: 'knowledge', term: '提交明细', definition: 'B 分支的提交' }, scopeB)

    expect(store.list()).toHaveLength(3)
    expect(store.list(scopeA).map((entry) => entry.definition)).toEqual(['所有空间都能看到', 'A 分支的提交'])
    expect(store.list(scopeB).map((entry) => entry.definition)).toEqual(['所有空间都能看到', 'B 分支的提交'])
    const scopedSearch = store.search({ query: '提交' }, scopeA)
    expect(scopedSearch.entries).toHaveLength(1)
    // total 是"该作用域可见条目数"（全局 + 本空间），不是命中数
    expect(scopedSearch.total).toBe(2)
  })

  it('deduplicates per scope and refreshes an existing scoped entry', async () => {
    const store = await KnowledgeStore.open(memoryBackend())
    const first = await store.save({ kind: 'knowledge', term: '提交明细', definition: 'v1' }, scopeA)
    const again = await store.save({ kind: 'knowledge', term: '提交明细', definition: 'v2' }, scopeA)
    const other = await store.save({ kind: 'knowledge', term: '提交明细', definition: 'v1' }, scopeB)
    expect(again).toBe(first)
    expect(other).not.toBe(first)
    expect(store.list(scopeA)).toHaveLength(1)
    expect(store.list(scopeA)[0].definition).toBe('v2')
    expect(store.list(scopeA)[0].spaceBranch).toBe('hotfix/5.6.x')
  })

  it('stamps the scope resolved from the tool execution context', async () => {
    const store = await KnowledgeStore.open(memoryBackend())
    const tools = buildKnowledgeTools(store, {
      scope: async (exec) => {
        const cwd = (exec as { cwd?: string }).cwd
        if (cwd === '/space/a') return scopeA
        if (cwd === '/space/b') return scopeB
        return undefined
      },
    })
    const save = tools.find((tool) => tool.name === 'knowledge_save')!
    await save.execute({ kind: 'knowledge', term: 'A 空间结论', definition: '内容' }, { cwd: '/space/a' } as never)
    await save.execute({ kind: 'knowledge', term: '全局结论', definition: '内容' }, { cwd: '/elsewhere' } as never)
    expect(store.list(scopeA).map((entry) => entry.term).sort()).toEqual(['A 空间结论', '全局结论'])
    const search = tools.find((tool) => tool.name === 'knowledge_search')!
    const result = await search.execute({ query: '结论' }, { cwd: '/space/a' } as never) as { total: number }
    expect(result.total).toBe(2)
    const fromB = await search.execute({ query: '结论' }, { cwd: '/space/b' } as never) as { total: number }
    expect(fromB.total).toBe(1)
    // knowledge_list 也要按作用域过滤：A 空间 2 条（含全局），B 空间只有全局 1 条
    const list = tools.find((tool) => tool.name === 'knowledge_list')!
    const listedA = await list.execute({}, { cwd: '/space/a' } as never) as { total: number }
    const listedB = await list.execute({}, { cwd: '/space/b' } as never) as { total: number }
    expect(listedA.total).toBe(2)
    expect(listedB.total).toBe(1)
  })
})
