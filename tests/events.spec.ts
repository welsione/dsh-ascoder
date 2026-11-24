import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { EventLog } from '../src/events.js'
import { createFileBackend } from '../src/storage.js'

describe('event log persistence', () => {
  it('keeps every concurrently emitted event on disk', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-events-'))
    try {
      const backend = createFileBackend(join(dir, 'events.json'), 'events')
      const log = await EventLog.open(backend)
      await Promise.all(
        Array.from({ length: 20 }, (_, index) =>
          log.emit('repository.synced', { alias: `repo-${index}` })),
      )
      await log.close()

      const reopened = await EventLog.open(createFileBackend(join(dir, 'events.json'), 'events'))
      const rows = reopened.list(0, 100)
      expect(rows.length).toBe(20)
      expect(rows[rows.length - 1].payload.alias).toBe('repo-19')
      await reopened.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
