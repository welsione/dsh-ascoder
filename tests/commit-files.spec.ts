import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { commitDiffStat, commitFiles } from '../src/git.js'

function makeRepo(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  const git = (...args: string[]) => execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', ...args], { cwd: dir, stdio: 'ignore' })
  git('init', '--quiet', '-b', 'main')
  mkdirSync(join(dir, 'src'), { recursive: true })
  writeFileSync(join(dir, 'a.txt'), 'a\n')
  writeFileSync(join(dir, 'src/b.txt'), 'b\n')
  git('add', '.')
  git('commit', '--quiet', '-m', 'init')
  writeFileSync(join(dir, 'a.txt'), 'a changed\n')
  git('add', '.')
  git('commit', '--quiet', '-m', 'change a')
  return dir
}

describe('commit file listing', () => {
  it('reports the changed file count and caps the returned paths', async () => {
    const repo = makeRepo('ascoder-commit-files-')
    try {
      const all = await commitFiles(repo, 20)
      expect(all.count).toBe(1)
      expect(all.files).toEqual(['a.txt'])
      const none = await commitFiles(repo, 0)
      expect(none.files.length).toBe(1) // limit 下限 1
      const stat = await commitDiffStat(repo)
      expect(stat.insertions).toBeGreaterThan(0)
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })
})
