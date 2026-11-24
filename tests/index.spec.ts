import { describe, it, expect } from 'vitest'
import { KnowledgeStore, openFileBackend } from '../src/store.js'
import { knowledgeKey, isKnowledgeKind, KNOWLEDGE_KINDS } from '../src/types.js'
import { resolveRole, buildKnowledgeContextText, PROMPT_LIMITS } from '../src/prompt.js'
import { ROLE_STYLES, renderRoleSection } from '../src/roles.js'
import { buildKnowledgeTools } from '../src/tools.js'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

async function openTempStore(): Promise<{ store: KnowledgeStore; file: string }> {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-ascoder-test-'))
  const file = join(dir, 'knowledge.json')
  const store = await KnowledgeStore.open(openFileBackend(file))
  return { store, file }
}

describe('knowledgeKey', () => {
  it('normalizes kind and term', () => {
    expect(knowledgeKey('term', '  合同锁  ')).toBe('term:合同锁')
    expect(knowledgeKey('experience', '重试')).not.toBe(knowledgeKey('knowledge', '重试'))
  })

  it('isKnowledgeKind guards kinds', () => {
    expect(isKnowledgeKind('term')).toBe(true)
    expect(isKnowledgeKind('other')).toBe(false)
    expect(KNOWLEDGE_KINDS).toEqual(['term', 'knowledge', 'experience'])
  })
})

describe('KnowledgeStore on file backend', () => {
  it('save/list/search/forget round-trip persists to disk', async () => {
    const { store, file } = await openTempStore()
    const id = await store.save({ kind: 'term', term: '项目空间', definition: '一组仓库分支的组合', tags: ['核心概念'] })
    await store.save({ kind: 'experience', term: '索引超时', definition: '大仓库首次索引要调大超时' })

    expect(store.total).toBe(2)

    const hit = store.search({ query: '项目空间' })
    expect(hit.total).toBe(2)
    expect(hit.entries).toHaveLength(1)
    expect(hit.entries[0].id).toBe(id)
    expect(hit.entries[0].definition).toContain('仓库分支')

    // 持久化到磁盘并可重开。
    const onDisk = JSON.parse(readFileSync(file, 'utf8')) as { entries: unknown[] }
    expect(onDisk.entries).toHaveLength(2)
    const reopened = await KnowledgeStore.open(openFileBackend(file))
    expect(reopened.total).toBe(2)

    // 覆盖更新：kind+term 相同不新增。
    await store.save({ kind: 'term', term: '项目空间', definition: '修订后的解释' })
    expect(store.total).toBe(2)

    expect(await store.forget(id)).toBe(true)
    expect(await store.forget(id)).toBe(false)
    expect(store.total).toBe(1)
    await store.close()
    rmSync(file, { force: true })
  })

  it('corrupted store file reads as empty', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'dsh-ascoder-test-'))
    const file = join(dir, 'knowledge.json')
    const { writeFileSync } = await import('node:fs')
    writeFileSync(file, 'not-json{', 'utf8')
    const store = await KnowledgeStore.open(openFileBackend(file))
    expect(store.total).toBe(0)
    rmSync(file, { force: true })
  })
})

describe('roles', () => {
  it('renders every legacy role with its rules', () => {
    for (const [key, style] of Object.entries(ROLE_STYLES)) {
      const text = renderRoleSection(style)
      expect(text).toContain(`## 回答视角：${style.label}`)
      expect(text).toContain(`回答结构：${style.structure}`)
      expect(text).toContain('结论必须在最前面')
      expect(key.length).toBeGreaterThan(0)
    }
    expect(ROLE_STYLES.product_manager.rules.join(' ')).toContain('禁止展示代码片段')
    expect(ROLE_STYLES.tester.rules.join(' ')).toContain('边界条件')
  })

  it('resolveRole falls back to developer for auto without hint', () => {
    expect(resolveRole('auto', '').label).toBe(ROLE_STYLES.developer.label)
    expect(resolveRole('tester', '').label).toBe(ROLE_STYLES.tester.label)
  })
})

describe('knowledge prompt context', () => {
  it('caps entries and truncates long definitions', () => {
    const entries = Array.from({ length: PROMPT_LIMITS.maxTerms + 5 }, (_, index) => ({
      term: `条目${index}`,
      definition: 'x'.repeat(PROMPT_LIMITS.maxEntryChars + 10),
      kind: 'term',
      hits: index,
    }))
    const text = buildKnowledgeContextText(() => entries)
    const lines = text.split('\n')
    // 标题行 + 截断到 maxTerms 的条目行。
    expect(lines).toHaveLength(PROMPT_LIMITS.maxTerms + 1)
    expect(lines[0]).toBe('## 团队知识')
  })

  it('returns empty for an empty store', () => {
    expect(buildKnowledgeContextText(() => [])).toBe('')
  })
})

describe('knowledge tools', () => {
  it('exposes the four tools with unique names', () => {
    const tools = buildKnowledgeTools({
      total: 0,
      list: () => [],
      search: () => ({ entries: [], total: 0 }),
      save: async () => 'x',
      forget: async () => true,
      recordHit: async () => {},
    })
    const names = tools.map((tool) => tool.name)
    expect(names).toEqual(['knowledge_search', 'knowledge_save', 'knowledge_list', 'knowledge_forget'])
    expect(new Set(names).size).toBe(4)
  })
})
