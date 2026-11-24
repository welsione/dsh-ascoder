import { describe, it, expect } from 'vitest'
import { buildKnowledgeTools } from '../src/tools.js'
import type { KnowledgeEntry } from '../src/types.js'
import type { KnowledgeStoreView } from '../src/store.ts'

/** 构造带一条知识的最小 store 桩。 */
function makeStore(entries: KnowledgeEntry[]): KnowledgeStoreView & { removed: string[] } {
  const removed: string[] = []
  let current = [...entries]
  return {
    removed,
    get total() { return current.length },
    list: () => [...current],
    search: () => ({ entries: current, total: current.length }),
    save: async () => 'new',
    forget: async (id: string) => {
      const before = current.length
      current = current.filter((entry) => entry.id !== id)
      if (current.length !== before) removed.push(id)
      return current.length !== before
    },
    recordHit: async () => undefined,
  }
}

const entry: KnowledgeEntry = {
  id: 'k1',
  kind: 'knowledge',
  term: 'sign 代码分布',
  definition: '旧结论',
  tags: [],
  createdAt: '2026-11-01T00:00:00.000Z',
  hits: 0,
}

describe('knowledge_forget', () => {
  it('records the deletion reason in the event log', async () => {
    const store = makeStore([entry])
    const emitted: Array<{ type: string; payload: Record<string, unknown> }> = []
    const tools = buildKnowledgeTools(store, {
      events: { emit: async (type, payload) => { emitted.push({ type, payload }) } },
    })
    const forget = tools.find((tool) => tool.name === 'knowledge_forget')!
    const result = await forget.execute({ id: 'k1', reason: '已被 2026-11-12 的新结论覆盖' }, {} as never) as { removed: boolean; total: number }
    expect(result.removed).toBe(true)
    expect(result.total).toBe(0)
    expect(emitted).toHaveLength(1)
    expect(emitted[0].type).toBe('knowledge.forgotten')
    expect(emitted[0].payload).toMatchObject({
      id: 'k1',
      kind: 'knowledge',
      term: 'sign 代码分布',
      reason: '已被 2026-11-12 的新结论覆盖',
    })
  })

  it('does not emit when the entry is missing and rejects an empty reason', async () => {
    const store = makeStore([entry])
    const emitted: unknown[] = []
    const tools = buildKnowledgeTools(store, { events: { emit: async (_type, payload) => { emitted.push(payload) } } })
    const forget = tools.find((tool) => tool.name === 'knowledge_forget')!
    await expect(forget.execute({ id: 'missing', reason: '过时' }, {} as never)).resolves.toMatchObject({ removed: false })
    expect(emitted).toHaveLength(0)
    await expect(forget.execute({ id: 'k1', reason: '   ' }, {} as never)).rejects.toThrow(/reason 不能为空/)
  })
})
