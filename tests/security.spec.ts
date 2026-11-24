import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SettingsPassword, WrongPasswordError } from '../src/security.js'
import { createFileBackend } from '../src/storage.js'

async function openStore(dataDir: string, fallback = '123456'): Promise<SettingsPassword> {
  return SettingsPassword.open(
    createFileBackend(join(dataDir, 'security.json'), 'security'),
    fallback,
  )
}

describe('settings password', () => {
  it('verifies the configured default and reports it as default', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-pw-'))
    try {
      const store = await openStore(dir)
      expect(store.usesDefault).toBe(true)
      expect(store.verify('123456')).toBe(true)
      expect(store.verify('000000')).toBe(false)
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('changes the password and persists a hash, never the plaintext', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-pw-'))
    try {
      const store = await openStore(dir)
      await store.change('123456', 'new-secret')
      expect(store.usesDefault).toBe(false)
      expect(store.verify('new-secret')).toBe(true)
      expect(store.verify('123456')).toBe(false)
      await store.close()

      const reopened = await openStore(dir)
      expect(reopened.verify('new-secret')).toBe(true)
      const raw = JSON.stringify(await import('node:fs').then((fs) => fs.readFileSync(join(dir, 'security.json'), 'utf8')))
      expect(raw).not.toContain('new-secret')
      await reopened.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('rejects a wrong current password and weak/same new passwords', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-pw-'))
    try {
      const store = await openStore(dir)
      await expect(store.change('wrong', 'abcdef')).rejects.toBeInstanceOf(WrongPasswordError)
      await expect(store.change('123456', '123')).rejects.toThrow()
      await expect(store.change('123456', '123456')).rejects.toThrow()
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('locks out after repeated failures', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-pw-'))
    try {
      const store = await openStore(dir)
      for (let index = 0; index < 5; index += 1) expect(store.verify('bad')).toBe(false)
      expect(() => store.verify('123456')).toThrow(/尝试次数过多/)
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('password whitespace consistency', () => {
  it('accepts the surrounding whitespace it strips when saving', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-sec-ws-'))
    try {
      const service = await openStore(dir)
      await service.change('123456', '  newpass  ')
      expect(service.verify('newpass')).toBe(true)
      expect(service.verify('  newpass  ')).toBe(true)
      await service.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

