import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { ProjectService } from '../src/projects.js'
import { createFileBackend } from '../src/storage.js'
import { currentBranch, listBranches, remoteUrlOf } from '../src/git.js'

function gitIn(cwd: string, ...args: string[]): string {
  return execFileSync('git', ['-c', 'user.email=t@example.com', '-c', 'user.name=T', ...args], {
    cwd,
    encoding: 'utf8',
  })
}

/** 造一个「只有 refs/remotes/origin/*」的克隆，模拟旧版 Ascoder 的仓库布局。 */
function makeRemoteRefsOnlyClone(root: string): { legacy: string; origin: string } {
  const origin = join(root, 'origin')
  execFileSync('git', ['init', '--quiet', '-b', 'master', origin])
  writeFileSync(join(origin, 'README.md'), '# origin\n')
  gitIn(origin, 'add', '.')
  gitIn(origin, 'commit', '--quiet', '-m', 'init')
  gitIn(origin, 'checkout', '--quiet', '-b', 'release')
  writeFileSync(join(origin, 'release.txt'), 'release\n')
  gitIn(origin, 'add', '.')
  gitIn(origin, 'commit', '--quiet', '-m', 'release')
  gitIn(origin, 'checkout', '--quiet', 'master')

  const legacy = join(root, 'legacy-clone')
  execFileSync('git', ['init', '--quiet', legacy])
  gitIn(legacy, 'remote', 'add', 'origin', `file://${origin}`)
  gitIn(legacy, 'fetch', '--quiet', 'origin')
  // 清掉可能存在的本地分支，让 refs/heads 为空
  for (const branch of ['master']) {
    try {
      gitIn(legacy, 'branch', '-D', branch)
    } catch {
      // 没有就忽略
    }
  }
  return { legacy, origin }
}

async function openService(dataDir: string): Promise<ProjectService> {
  return ProjectService.open(
    createFileBackend(join(dataDir, 'projects.json'), 'projects'),
    createFileBackend(join(dataDir, 'repositories.json'), 'repositories'),
    join(dataDir, 'spaces'),
  )
}

describe('prepare with remote-refs-only source clone', () => {
  it('fetches the branch from the repository remote when the local clone lacks it', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-remote-refs-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-remote-refs-data-'))
    try {
      const { legacy } = makeRemoteRefsOnlyClone(root)
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      // 用本地路径登记；远端地址应从 origin 自动探测到
      const repository = await service.addRepository({ path: legacy, name: 'legacy' })
      expect(repository.remoteUrl).toBeTruthy()
      await service.addMember(project.id, { repositoryId: repository.id, alias: 'app' })

      const space = await service.createSpace(project.id, 'release')
      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.error).toBeUndefined()
      expect(prepared.status).toBe('ready')
      expect(await currentBranch(join(prepared.root as string, 'app'))).toBe('release')
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('imports the branch from the source clone refs when no remote is configured', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-source-refs-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-source-refs-data-'))
    try {
      const { legacy } = makeRemoteRefsOnlyClone(root)
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const repository = await service.addRepository({ path: legacy, name: 'legacy' })
      await service.setRepositoryRemote(repository.id, undefined)
      await service.addMember(project.id, { repositoryId: repository.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'release')
      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.error).toBeUndefined()
      expect(prepared.status).toBe('ready')
      expect(await currentBranch(join(prepared.root as string, 'app'))).toBe('release')
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('points the materialized origin at the repository remote so sync can pull', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-origin-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-origin-data-'))
    try {
      const { legacy } = makeRemoteRefsOnlyClone(root)
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const repository = await service.addRepository({ path: legacy, name: 'legacy' })
      await service.addMember(project.id, { repositoryId: repository.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'release')
      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.status).toBe('ready')

      const memberDir = join(prepared.root as string, 'app')
      expect(await remoteUrlOf(memberDir)).toBe(repository.remoteUrl)

      // 同步时 origin 已指向真实远端，pull 能正常完成
      const results = await service.syncSpace(project.id, space.id)
      expect(results).toEqual([{ alias: 'app', result: '已更新' }])
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('reports a clear error when neither the clone nor a remote can supply the branch', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-remote-missing-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-remote-missing-data-'))
    try {
      const { legacy } = makeRemoteRefsOnlyClone(root)
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const repository = await service.addRepository({ path: legacy, name: 'legacy' })
      await service.setRepositoryRemote(repository.id, undefined)
      await service.addMember(project.id, { repositoryId: repository.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'nope')
      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.status).toBe('failed')
      expect(prepared.error).toContain('没有配置远端地址')
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

describe('unborn HEAD repositories', () => {
  it('still reports a branch and lists refs when refs/heads is empty', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-unborn-'))
    try {
      const { legacy } = makeRemoteRefsOnlyClone(root)
      // 旧版克隆的 HEAD 指向不存在的分支，rev-parse --abbrev-ref HEAD 会报错
      expect(await currentBranch(legacy)).not.toBeUndefined()
      const snapshot = await listBranches(legacy)
      expect(snapshot.remote.length).toBeGreaterThan(0)
      // 分支排序依赖最近提交时间，这里确保能读到
      expect(snapshot.remote[0].committedAt).toBeGreaterThan(0)
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
