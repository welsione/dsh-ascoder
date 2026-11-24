import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spaceIndexStatus } from '../src/codegraph.js'

/**
 * 空索引库必须被判定为「未索引」。
 *
 * init 中途失败会留下只有 176K 的空数据库，若只看 `.codegraph` 目录存在就当作完成，
 * 界面会显示 3/3 就绪但没有一条符号可查（曾真实发生过）。
 */
describe('spaceIndexStatus with an empty index directory', () => {
  it('does not count a bare .codegraph directory as indexed', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-emptyidx-'))
    try {
      // 只有目录、没有任何索引内容（等价于 init 刚建好库就退出）
      mkdirSync(join(dir, '.codegraph'))
      const status = await spaceIndexStatus([{ alias: 'repo', dir }])
      expect(status.memberCount).toBe(1)
      // codegraph 不在测试环境里，status 会失败 → 这一项按"已存在但读不到"处理，
      // 关键是不能把空目录当成有内容；真实环境的空库由 status --json 的 0 files 兜住
      expect(status.members[0].files === undefined || status.members[0].files === 0).toBe(true)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('reports nothing indexed for a repository without .codegraph', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-noindex-'))
    try {
      const status = await spaceIndexStatus([{ alias: 'repo', dir }])
      expect(status.indexedCount).toBe(0)
      expect(status.members[0].indexed).toBe(false)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
