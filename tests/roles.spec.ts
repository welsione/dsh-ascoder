import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { RoleStore } from '../src/roleStore.js'
import { createFileBackend } from '../src/storage.js'

async function openStore(dataDir: string, fallback = 'auto'): Promise<RoleStore> {
  return RoleStore.open(createFileBackend(join(dataDir, 'roles.json'), 'roles'), fallback)
}

describe('answer roles', () => {
  it('ships the three builtin roles and defaults to developer', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-role-'))
    try {
      const store = await openStore(dir)
      expect(store.list().map((role) => role.id)).toEqual(['developer', 'product_manager', 'tester'])
      expect(store.selected().id).toBe('developer')
      expect(store.section()).toContain('回答视角：开发者')
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('selects, persists and rejects unknown roles', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-role-'))
    try {
      const store = await openStore(dir)
      await store.select('tester')
      expect(store.section()).toContain('测试工程师')
      await expect(store.select('nope')).rejects.toThrow()
      await store.close()

      const reopened = await openStore(dir)
      expect(reopened.selected().id).toBe('tester')
      await reopened.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('caps custom role fields so the system prompt cannot balloon', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-roles-cap-'))
    try {
      const store = await openStore(dir)
    await expect(store.save({ name: 'x'.repeat(41), instruction: 'ok' })).rejects.toThrow(/名称最多 40 字/)
    await expect(store.save({ name: 'ok', instruction: 'x'.repeat(4001) })).rejects.toThrow(/要求最多 4000 字/)
      await expect(store.save({ name: 'ok', instruction: 'ok', description: 'x'.repeat(201) })).rejects.toThrow(/描述最多 200 字/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('adds, edits and removes custom roles', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-role-'))
    try {
      const store = await openStore(dir)
      const created = await store.save({ name: '架构师', description: '架构取舍', instruction: '结论先行\n只讲分层', structure: '结论 → 取舍 → 风险' })
      expect(created.builtin).toBe(false)
      expect(store.list()).toHaveLength(4)

      const edited = await store.save({ id: created.id, name: '架构师（改）', instruction: '结论先行' })
      expect(edited.name).toBe('架构师（改）')

      await store.select(created.id)
      expect(store.selected().name).toBe('架构师（改）')

      await expect(store.save({ id: 'developer', name: 'x', instruction: 'y' })).rejects.toThrow()
      await expect(store.remove('developer')).rejects.toThrow()
      await expect(store.save({ name: '', instruction: 'x' })).rejects.toThrow()

      expect(await store.remove(created.id)).toBe(true)
      await store.close()

      const reopened = await openStore(dir)
      // 删除当前选中视角后回退到 developer
      expect(reopened.selected().id).toBe('developer')
      await reopened.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
