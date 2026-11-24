import { describe, it, expect } from 'vitest'
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createFileBackend } from '../src/storage.js'

describe('file backend resilience', () => {
  it('backs up a corrupt file instead of losing it on the next save', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-storage-'))
    const file = join(dir, 'projects.json')
    try {
      writeFileSync(file, '{ not json at all', 'utf8')
      const backend = createFileBackend<{ id: string }>(file, 'projects')
      const loaded = await backend.load()
      expect(loaded).toEqual([])
      const backups = readdirSync(dir).filter((name) => name.includes('.corrupt-'))
      expect(backups.length).toBe(1)

      await backend.save([{ id: 'p1' }])
      const again = await createFileBackend<{ id: string }>(file, 'projects').load()
      expect(again).toEqual([{ id: 'p1' }])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
