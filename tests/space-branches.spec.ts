import { describe, it, expect } from 'vitest'
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { ProjectService } from '../src/projects.js'
import { createFileBackend } from '../src/storage.js'
import { currentBranch } from '../src/git.js'

/** 建一个临时仓库，带两个分支。 */
function makeRepo(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  const run = (...args: string[]) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' })
  run('init', '--quiet', '-b', 'main')
  run('config', 'user.email', 'test@example.com')
  run('config', 'user.name', 'Test')
  writeFileSync(join(dir, 'README.md'), '# fixture\n')
  run('add', '.')
  run('commit', '--quiet', '-m', 'init')
  run('checkout', '--quiet', '-b', 'release')
  writeFileSync(join(dir, 'release.txt'), 'release\n')
  run('add', '.')
  run('commit', '--quiet', '-m', 'release')
  run('checkout', '--quiet', 'main')
  return dir
}

async function openService(dataDir: string): Promise<ProjectService> {
  return ProjectService.open(
    createFileBackend(join(dataDir, 'projects.json'), 'projects'),
    createFileBackend(join(dataDir, 'repositories.json'), 'repositories'),
    join(dataDir, 'spaces'),
  )
}

describe('space member branch overrides', () => {
  it('checks out the per-member branch and falls back to the space branch', async () => {
    const repoA = makeRepo('ascoder-br-a-')
    const repoB = makeRepo('ascoder-br-b-')
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-br-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const a = await service.addRepository({ path: repoA })
      const b = await service.addRepository({ path: repoB })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'alpha' })
      await service.addMember(project.id, { repositoryId: b.id, alias: 'beta' })

      // alpha 用默认分支 main，beta 覆盖成 release
      const space = await service.createSpace(project.id, 'main', { beta: 'release' })
      expect(space.memberBranches).toEqual({ beta: 'release' })

      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.status).toBe('ready')
      const root = prepared.root as string
      expect(await currentBranch(join(root, 'alpha'))).toBe('main')
      expect(await currentBranch(join(root, 'beta'))).toBe('release')
      await service.close()
    } finally {
      rmSync(repoA, { recursive: true, force: true })
      rmSync(repoB, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('ignores overrides for unknown members and keeps space dedupe by branch', async () => {
    const repo = makeRepo('ascoder-br-c-')
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-br2-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const a = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'alpha' })
      const space = await service.createSpace(project.id, 'main', { ghost: 'release' })
      expect(space.memberBranches).toBeUndefined()
      const again = await service.createSpace(project.id, 'main', { alpha: 'release' })
      expect(again.id).toBe(space.id)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

describe('space sync fallback', () => {
  it('resets a diverged read-only member to the upstream tip instead of failing', async () => {
    const repoA = makeRepo('ascoder-sync-div-')
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-sync-div-data-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const repository = await service.addRepository({ path: repoA })
      // 显式给远端地址（ensureOrigin 才会设置 origin 与 upstream）
      await service.setRepositoryRemote(repository.id, `file://${repoA}`)
      await service.addMember(project.id, { repositoryId: repository.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'main')
      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.status).toBe('ready')

      // 空间里制造分叉提交（模拟历史遗留的本地差异）
      const memberDir = join(prepared.root as string, 'app')
      writeFileSync(join(memberDir, 'local-only.txt'), 'local\n')
      execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', 'add', '.'], { cwd: memberDir })
      execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', 'commit', '--quiet', '-m', 'local change'], { cwd: memberDir })

      // 源仓库同时前进
      writeFileSync(join(repoA, 'remote-only.txt'), 'remote\n')
      execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', 'add', '.'], { cwd: repoA })
      execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', 'commit', '--quiet', '-m', 'remote change'], { cwd: repoA })

      const results = await service.syncSpace(project.id, space.id)
      expect(results).toEqual([{ alias: 'app', result: '已重置到远端' }])
      expect(existsSync(join(memberDir, 'remote-only.txt'))).toBe(true)
      expect(existsSync(join(memberDir, 'local-only.txt'))).toBe(false)
      await service.close()
    } finally {
      rmSync(repoA, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})
