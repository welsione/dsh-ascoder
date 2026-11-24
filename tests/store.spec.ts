import { describe, it, expect } from 'vitest'
import { KnowledgeStore } from '../src/store.js'
import type { RecordBackend } from '../src/storage.js'
import type { KnowledgeEntry } from '../src/types.js'

function flakyBackend(failures: number): { backend: RecordBackend<KnowledgeEntry>; saved: KnowledgeEntry[][] } {
  const saved: KnowledgeEntry[][] = []
  let remaining = failures
  return {
    saved,
    backend: {
      async load() { return [] },
      async save(entries) {
        if (remaining > 0) {
          remaining -= 1
          throw new Error('disk full')
        }
        saved.push([...entries])
      },
      async close() { /* no-op */ },
    },
  }
}

describe('knowledge store persistence', () => {
  it('keeps saving after a transient write failure', async () => {
    const { backend, saved } = flakyBackend(1)
    const store = await KnowledgeStore.open(backend)
    // 第一次落盘失败：调用方不该收到拒绝（队列自己吞掉）
    await expect(store.save({ kind: 'knowledge', term: 'A', definition: 'first' })).resolves.toBeTruthy()
    // 之后的保存要能继续执行
    await store.save({ kind: 'knowledge', term: 'B', definition: 'second' })
    await store.close()
    expect(saved.length).toBeGreaterThanOrEqual(1)
    expect(saved[saved.length - 1].some((entry) => entry.term === 'B')).toBe(true)
  })

  it('deduplicates terms regardless of surrounding whitespace and case', async () => {
    const { backend } = flakyBackend(0)
    const store = await KnowledgeStore.open(backend)
    const first = await store.save({ kind: 'knowledge', term: 'Hotfix', definition: 'a' })
    const second = await store.save({ kind: 'knowledge', term: '  hotfix  ', definition: 'b' })
    expect(second).toBe(first)
    expect(store.total).toBe(1)
    await store.close()
  })
})
