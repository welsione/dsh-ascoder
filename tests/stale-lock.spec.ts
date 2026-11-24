import { describe, it, expect } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { clearStaleIndexLock, STALE_INDEX_LOCK_MS } from '../src/projects.js'

function makeRepoDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'ascoder-lock-'))
  mkdirSync(join(dir, '.git'))
  return dir
}

describe('stale git index lock recovery', () => {
  it('removes a lock left behind by an interrupted git', async () => {
    const dir = makeRepoDir()
    try {
      const lock = join(dir, '.git', 'index.lock')
      writeFileSync(lock, '')
      const old = new Date(Date.now() - STALE_INDEX_LOCK_MS - 60_000)
      utimesSync(lock, old, old)
      await expect(clearStaleIndexLock(dir)).resolves.toBe(true)
      expect(existsSync(lock)).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('keeps a fresh lock that may belong to a running git', async () => {
    const dir = makeRepoDir()
    try {
      const lock = join(dir, '.git', 'index.lock')
      writeFileSync(lock, '')
      await expect(clearStaleIndexLock(dir)).resolves.toBe(false)
      expect(existsSync(lock)).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('removes a fresh lock that predates the current operation', async () => {
    const dir = makeRepoDir()
    try {
      const lock = join(dir, '.git', 'index.lock')
      writeFileSync(lock, '')
      // 锁是"刚刚"留下的，但本次操作开始时间在它之后 → 说明是上一次被取消/中断的操作
      const operationStart = Date.now() + 1_000
      await expect(clearStaleIndexLock(dir, operationStart)).resolves.toBe(true)
      expect(existsSync(lock)).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('does nothing when there is no lock', async () => {
    const dir = makeRepoDir()
    try {
      await expect(clearStaleIndexLock(dir)).resolves.toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
