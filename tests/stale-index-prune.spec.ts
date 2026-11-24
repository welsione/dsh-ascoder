import { describe, it, expect } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pruneStaleIndexDirs } from '../src/codegraph.js'

/** 造一个成员目录，并按给定时间戳铺出残留索引目录。 */
function makeMemberDir(stamps: number[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'ascoder-prune-'))
  for (const stamp of stamps) {
    const stale = join(dir, `.codegraph.stale-${stamp}`)
    mkdirSync(stale, { recursive: true })
    writeFileSync(join(stale, 'index.db'), 'x')
  }
  return dir
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 120))

describe('pruneStaleIndexDirs', () => {
  it('keeps only the newest leftover and removes the rest', async () => {
    const dir = makeMemberDir([1000, 3000, 2000, 4000])
    try {
      pruneStaleIndexDirs(dir)
      await settle()
      expect(existsSync(join(dir, '.codegraph.stale-4000'))).toBe(true)
      expect(existsSync(join(dir, '.codegraph.stale-3000'))).toBe(false)
      expect(existsSync(join(dir, '.codegraph.stale-2000'))).toBe(false)
      expect(existsSync(join(dir, '.codegraph.stale-1000'))).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('keeps everything when there is nothing old to remove', async () => {
    const dir = makeMemberDir([5000])
    try {
      pruneStaleIndexDirs(dir)
      await settle()
      expect(existsSync(join(dir, '.codegraph.stale-5000'))).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('does nothing for a directory without leftovers', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-prune-'))
    try {
      expect(() => pruneStaleIndexDirs(dir)).not.toThrow()
      await settle()
      expect(existsSync(dir)).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
