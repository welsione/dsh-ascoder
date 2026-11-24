import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { cloneLocalRepository, sharedObjectsSource, currentBranch } from '../src/git.js'

function makeRepo(root: string, payloadBytes: number): string {
  const dir = join(root, 'source')
  execFileSync('git', ['init', '--quiet', '-b', 'main', dir])
  const run = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', ...args], { cwd: dir })
  // 随机内容不可压缩，才能真实测出对象是否被复制
  writeFileSync(join(dir, 'big.bin'), randomBytes(payloadBytes))
  run('add', '.')
  run('commit', '--quiet', '-m', 'init')
  return dir
}

function objectsBytes(dir: string): number {
  const objects = join(dir, '.git', 'objects')
  let total = 0
  const walk = (path: string) => {
    for (const entry of readdirSync(path, { withFileTypes: true })) {
      const next = join(path, entry.name)
      try {
        if (entry.isDirectory()) walk(next)
        else total += statSync(next).size
      } catch {
        // git 的自动维护会在遍历期间临时创建/删除 maintenance.lock 之类的文件，
        // 统计体积时忽略这类瞬时文件即可
      }
    }
  }
  walk(objects)
  return total
}

describe('local clone modes', () => {
  it('copies objects by default', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-copy-'))
    try {
      const source = makeRepo(root, 512 * 1024)
      const target = join(root, 'copy')
      await cloneLocalRepository(source, target)
      expect(await sharedObjectsSource(target)).toBeNull()
      expect(await currentBranch(target)).toBe('main')
      // 默认模式把对象整份带过来
      expect(objectsBytes(target)).toBeGreaterThan(200 * 1024)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('borrows objects from the source repo instead of copying them', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-ref-'))
    try {
      const source = makeRepo(root, 2 * 1024 * 1024)
      const sourceBytes = objectsBytes(source)
      const target = join(root, 'ref')
      await cloneLocalRepository(source, target, { reference: true })

      const alternates = await sharedObjectsSource(target)
      expect(alternates).toBeTruthy()
      expect(alternates).toContain(join(source, '.git', 'objects'))

      // 关键断言：目标仓库几乎不占对象空间（借源仓库的对象）
      expect(sourceBytes).toBeGreaterThan(1.5 * 1024 * 1024)
      expect(objectsBytes(target)).toBeLessThan(64 * 1024)

      // 对象能正常读取，工作区、分支独立
      expect(await currentBranch(target)).toBe('main')
      const size = execFileSync('git', ['-C', target, 'cat-file', '-s', 'HEAD:big.bin'], { encoding: 'utf8' })
      expect(Number(size.trim())).toBe(2 * 1024 * 1024)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
