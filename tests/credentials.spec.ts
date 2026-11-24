import { describe, it, expect } from 'vitest'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { CredentialStore } from '../src/credentials.js'
import { createFileBackend } from '../src/storage.js'

function openStore(dir: string): Promise<CredentialStore> {
  return CredentialStore.open(
    createFileBackend(join(dir, 'credentials.json'), 'credentials'),
    join(dir, 'credentials.key'),
  )
}

describe('credential field caps', () => {
  it('rejects names, usernames and secrets above the caps', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-cred-cap-'))
    try {
      const store = await openStore(dir)
      await expect(store.save({ name: 'x'.repeat(61), username: 'u', secret: 's' })).rejects.toThrow(/名称最多 60 字/)
      await expect(store.save({ name: 'ok', username: 'u'.repeat(201), secret: 's' })).rejects.toThrow(/用户名最多 200 字/)
      await expect(store.save({ name: 'ok', username: 'u', secret: 's'.repeat(4097) })).rejects.toThrow(/最多 4096 字符/)
      await store.save({ name: '正常凭证', username: 'user', secret: 'token' })
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('credential key handling', () => {
  it('creates a 32-byte key on first run and reuses it', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-cred-key-'))
    try {
      const first = await openStore(dir)
      await first.save({ name: 'bitbucket', username: 'u', secret: 'token-value' })
      const secret = await first.reveal((await first.list())[0].id)
      expect(secret.password).toBe('token-value')
      await first.close()
      const keyBytes = Buffer.from(readFileSync(join(dir, 'credentials.key'), 'utf8').trim(), 'base64')
      expect(keyBytes.length).toBe(32)

      const second = await openStore(dir)
      const again = await second.reveal((await second.list())[0].id)
      expect(again.password).toBe('token-value')
      await second.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('refuses to overwrite a corrupted key file instead of losing sealed secrets', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-cred-bad-'))
    try {
      writeFileSync(join(dir, 'credentials.key'), 'not-a-valid-key', { mode: 0o600 })
      await expect(openStore(dir)).rejects.toThrow(/密钥文件损坏/)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
