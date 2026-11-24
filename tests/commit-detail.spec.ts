import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { commitDetail, commitPatch } from '../src/git.ts'

function makeRepo(prefix = 'ascoder-commit-'): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  const run = (...args: string[]) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' })
  run('init', '--quiet', '-b', 'main')
  run('config', 'user.email', 'test@example.com')
  run('config', 'user.name', 'Test')
  run('config', 'commit.gpgsign', 'false')
  return dir
}

describe('commitDetail', () => {
  it('reports the summary and caps the file list', async () => {
    const dir = makeRepo()
    try {
      for (let index = 0; index < 8; index += 1) writeFileSync(join(dir, `f${index}.txt`), `${index}\n`)
      execFileSync('git', ['add', '.'], { cwd: dir, stdio: 'ignore' })
      execFileSync('git', ['commit', '--quiet', '-m', 'add eight files'], { cwd: dir, stdio: 'ignore' })
      const detail = await commitDetail(dir, 'HEAD', 3)
      expect(detail.subject).toBe('add eight files')
      expect(detail.parents).toBe(0)
      expect(detail.filesTotal).toBe(8)
      expect(detail.files).toHaveLength(3)
      expect(detail.truncated).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('returns a bounded patch and reports truncation', async () => {
    const dir = makeRepo()
    try {
      for (let index = 0; index < 40; index += 1) {
        writeFileSync(join(dir, `f${index}.txt`), `line-${index}\n`.repeat(6))
      }
      execFileSync('git', ['add', '.'], { cwd: dir, stdio: 'ignore' })
      execFileSync('git', ['commit', '--quiet', '-m', 'many files'], { cwd: dir, stdio: 'ignore' })
      const capped = await commitPatch(dir, 'HEAD', 20)
      expect(capped.truncated).toBe(true)
      expect(capped.text.split('\n').length).toBeLessThanOrEqual(20)
      const full = await commitPatch(dir, 'HEAD', 400)
      expect(full.text.length).toBeGreaterThan(capped.text.length)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('flags merge commits by their parent count', async () => {
    const dir = makeRepo()
    try {
      writeFileSync(join(dir, 'a.txt'), 'a\n')
      execFileSync('git', ['add', '.'], { cwd: dir, stdio: 'ignore' })
      execFileSync('git', ['commit', '--quiet', '-m', 'base'], { cwd: dir, stdio: 'ignore' })
      execFileSync('git', ['checkout', '--quiet', '-b', 'side'], { cwd: dir, stdio: 'ignore' })
      writeFileSync(join(dir, 'b.txt'), 'b\n')
      execFileSync('git', ['add', '.'], { cwd: dir, stdio: 'ignore' })
      execFileSync('git', ['commit', '--quiet', '-m', 'side work'], { cwd: dir, stdio: 'ignore' })
      execFileSync('git', ['checkout', '--quiet', 'main'], { cwd: dir, stdio: 'ignore' })
      execFileSync('git', ['merge', '--no-ff', '--quiet', '-m', 'merge side', 'side'], { cwd: dir, stdio: 'ignore' })
      const detail = await commitDetail(dir)
      expect(detail.parents).toBe(2)
      expect(detail.subject).toBe('merge side')
      expect(detail.files.length).toBeGreaterThan(0)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
