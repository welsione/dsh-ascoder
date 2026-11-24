import { describe, it, expect } from 'vitest'
import { existsSync, mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { ProjectService } from '../src/projects.js'
import { createFileBackend } from '../src/storage.js'
import { WorkspaceLinker } from '../src/workspaces.js'
import { assertBranchName, assertRemoteUrl, currentBranch, dirtyCount, isGitRepository, listBranches } from '../src/git.js'

/** 建一个临时 git 仓库并做一次初始提交。 */
function makeRepo(prefix = 'ascoder-repo-'): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  const run = (...args: string[]) => execFileSync('git', args, { cwd: dir, stdio: 'ignore' })
  run('init', '--quiet', '-b', 'main')
  run('config', 'user.email', 'test@example.com')
  run('config', 'user.name', 'Test')
  writeFileSync(join(dir, 'README.md'), '# fixture\n')
  run('add', '.')
  run('commit', '--quiet', '-m', 'init')
  return dir
}

/** 内存版 workspace registry 桩。 */
function makeRegistry() {
  const records: Array<{ id: string; path: string; title: string; createdAt: string }> = []
  let sequence = 0
  return {
    records,
    list: () => records,
    resolveByPath: async (path: string) => records.find((item) => item.path === path),
    create: async (path: string, title?: string) => {
      sequence += 1
      const record = { id: `ws-${sequence}`, path, title: title ?? path, createdAt: new Date().toISOString() }
      records.push(record)
      return record
    },
  }
}

async function openService(dataDir: string, registry?: ReturnType<typeof makeRegistry>): Promise<ProjectService> {
  return ProjectService.open(
    createFileBackend(join(dataDir, 'projects.json'), 'projects'),
    createFileBackend(join(dataDir, 'repositories.json'), 'repositories'),
    join(dataDir, 'spaces'),
    new WorkspaceLinker(() => registry),
  )
}

describe('project field caps', () => {
  it('rejects project names and descriptions above the caps on create and update', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-projects-cap-'))
    try {
      const service = await openService(dir)
      await expect(service.create({ name: 'x'.repeat(61) })).rejects.toThrow(/名称最多 60 字/)
      await expect(service.create({ name: 'ok', description: 'x'.repeat(501) })).rejects.toThrow(/描述最多 500 字/)
      const created = await service.create({ name: '正常项目' })
      await expect(service.update(created.id, { name: 'y'.repeat(61) })).rejects.toThrow(/名称最多 60 字/)
      await service.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('branch and remote validation', () => {
  it('accepts normal branch names', () => {
    expect(assertBranchName('main')).toBe('main')
    expect(assertBranchName('feat/ascoder-ui')).toBe('feat/ascoder-ui')
  })

  it('rejects option-like and malformed branch names', () => {
    expect(() => assertBranchName('-x')).toThrow()
    expect(() => assertBranchName('a b')).toThrow()
    expect(() => assertBranchName('a..b')).toThrow()
    expect(() => assertBranchName('a/')).toThrow()
  })

  it('accepts supported remote urls and rejects options', () => {
    expect(assertRemoteUrl('https://github.com/acme/demo-repo.git')).toContain('https://')
    expect(assertRemoteUrl('git@github.com:acme/demo-repo.git')).toContain('git@')
    expect(() => assertRemoteUrl('-u')).toThrow()
    // file:// 允许：内网镜像/本地裸库可以直接作为远端，但它仍必须是 URL 形式
    expect(assertRemoteUrl('file:///srv/mirrors/app.git')).toContain('file://')
    expect(() => assertRemoteUrl('/srv/mirrors/app.git')).toThrow()
  })
})

describe('git inspection', () => {
  it('detects repository, branch, dirty files and branches', async () => {
    const dir = makeRepo()
    try {
      expect(await isGitRepository(dir)).toBe(true)
      expect(await isGitRepository(join(dir, 'nope'))).toBe(false)
      expect(await currentBranch(dir)).toBe('main')
      expect(await dirtyCount(dir)).toBe(0)
      writeFileSync(join(dir, 'dirty.txt'), 'x\n')
      expect(await dirtyCount(dir)).toBe(1)

      execFileSync('git', ['checkout', '--quiet', '-b', 'feat/ui'], { cwd: dir, stdio: 'ignore' })
      const snapshot = await listBranches(dir)
      expect(snapshot.current).toBe('feat/ui')
      expect(snapshot.local.map((branch) => branch.name).sort()).toEqual(['feat/ui', 'main'])
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('project spaces', () => {
  it('creates a branch space, materializes members and reports ready', async () => {
    const repo = makeRepo()
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-space-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'Ascoder', description: '团队代码理解' })
      expect(project.spaces).toHaveLength(0)

      const repository = await service.addRepository({ path: repo })
      const member = await service.addMember(project.id, { repositoryId: repository.id })
      const space = await service.createSpace(project.id, 'main')
      expect(space.status).toBe('unprepared')

      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.status).toBe('ready')
      expect(prepared.root).toBeTruthy()
      expect(existsSync(join(prepared.root as string, member.alias, 'README.md'))).toBe(true)
      expect(existsSync(join(prepared.root as string, member.alias, '.git'))).toBe(true)

      const view = (await service.state())[0]
      expect(view.spaceCount).toBe(1)
      expect(view.spaces[0].preparedCount).toBe(1)
      expect(view.spaces[0].memberCount).toBe(1)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('keeps one space per branch and lists project branches', async () => {
    const repo = makeRepo()
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-branch-'))
    try {
      execFileSync('git', ['checkout', '--quiet', '-b', 'feat/x'], { cwd: repo, stdio: 'ignore' })
      execFileSync('git', ['checkout', '--quiet', 'main'], { cwd: repo, stdio: 'ignore' })
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const repository = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: repository.id })

      const branches = await service.branches(project.id)
      expect(branches.local.sort()).toEqual(['feat/x', 'main'])

      const first = await service.createSpace(project.id, 'main')
      const again = await service.createSpace(project.id, 'main')
      expect(again.id).toBe(first.id)
      expect(service.list()[0].spaces).toHaveLength(1)

      const second = await service.createSpace(project.id, 'feat/x')
      const prepared = await service.prepareSpace(project.id, second.id)
      expect(await currentBranch(join(prepared.root as string, 'P' === '' ? '' : service.list()[0].members[0].alias))).toBe('feat/x')
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('reports a failed space when the branch does not exist', async () => {
    const repo = makeRepo()
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-badbranch-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'BadBranch' })
      const repository = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: repository.id })
      const space = await service.createSpace(project.id, 'no-such-branch')
      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.status).toBe('failed')
      expect(prepared.error).toContain('no-such-branch')
      const view = (await service.state())[0]
      expect(view.spaces[0].status).toBe('failed')
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('rejects duplicate aliases and non-repositories', async () => {
    const repo = makeRepo()
    const plain = mkdtempSync(join(tmpdir(), 'ascoder-plain-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-reject-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const repository = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: repository.id })
      await expect(service.addMember(project.id, { path: repo })).rejects.toThrow()
      await expect(service.addMember(project.id, { path: plain })).rejects.toThrow()
      await expect(service.addMember(project.id, {})).rejects.toThrow()
      await expect(service.addMember(project.id, { path: repo, remoteUrl: 'https://x/y.git' })).rejects.toThrow()
      await expect(service.createSpace(project.id, '')).rejects.toThrow()
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(plain, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('removes a space and a project together with their directories', async () => {
    const repo = makeRepo()
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-remove-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const repository = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: repository.id })
      const space = await service.createSpace(project.id, 'main')
      const prepared = await service.prepareSpace(project.id, space.id)
      const root = prepared.root as string
      expect(existsSync(root)).toBe(true)

      expect(await service.removeSpace(project.id, space.id)).toBe(true)
      expect(existsSync(root)).toBe(false)
      expect(service.list()[0].spaces).toHaveLength(0)

      const second = await service.createSpace(project.id, 'main')
      const secondRoot = (await service.prepareSpace(project.id, second.id)).root as string
      expect(await service.remove(project.id)).toBe(true)
      expect(existsSync(secondRoot)).toBe(false)
      expect(await service.remove(project.id)).toBe(false)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('migrates legacy single-repository records into a space', async () => {
    const repo = makeRepo()
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-migrate-'))
    const file = join(dataDir, 'projects.json')
    try {
      mkdirSync(dataDir, { recursive: true })
      writeFileSync(file, JSON.stringify({
        version: 1,
        projects: [{
          id: 'legacy-1',
          name: 'Ascoder',
          path: repo,
          branch: 'main',
          root: repo,
          createdAt: '2026-01-01T00:00:00.000Z',
          members: [{ id: 'm1', alias: 'Ascoder', path: repo, branch: 'main', status: 'ready', targetPath: repo }],
        }],
      }), 'utf8')
      const service = await openService(dataDir)
      const project = service.list()[0]
      expect(project.members).toHaveLength(1)
      const migratedRepo = service.listRepositories()[0]
      expect(migratedRepo.path).toBe(repo)
      expect(project.members[0].repositoryId).toBe(migratedRepo.id)
      expect(project.spaces).toHaveLength(1)
      expect(project.spaces[0].branch).toBe('main')
      expect(project.spaces[0].root).toBe(repo)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

describe('workspace linking', () => {
  it('ensure() reuses an existing workspace', async () => {
    const registry = makeRegistry()
    const linker = new WorkspaceLinker(() => registry)
    const first = await linker.ensure('/repo/a', 'A')
    const second = await linker.ensure('/repo/a', 'A')
    expect(first?.created).toBe(true)
    expect(second?.created).toBe(false)
    expect(registry.records).toHaveLength(1)
  })

  it('is a no-op without a registry', async () => {
    const linker = new WorkspaceLinker(() => undefined)
    expect(linker.available).toBe(false)
    expect(await linker.ensure('/repo/a', 'A')).toBeUndefined()
  })

  it('enterSpace() prepares and links the space root with branch title', async () => {
    const repo = makeRepo()
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-link-'))
    const registry = makeRegistry()
    try {
      const service = await openService(dataDir, registry)
      const project = await service.create({ name: 'Link' })
      const repository = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: repository.id })
      const space = await service.createSpace(project.id, 'main')
      const workspaceId = await service.enterSpace(project.id, space.id)
      expect(workspaceId).toBe('ws-1')
      expect(registry.records).toHaveLength(1)
      expect(registry.records[0].title).toBe('Link · main')
      expect(service.spaceTitles()).toEqual(['Link · main'])
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('adopts git workspaces as projects and skips non-git directories', async () => {
    const repo = makeRepo()
    const plain = mkdtempSync(join(tmpdir(), 'ascoder-nogit-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-adopt-'))
    const registry = makeRegistry()
    registry.records.push(
      { id: 'ws-1', path: repo, title: '已有仓库', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'ws-2', path: plain, title: '普通目录', createdAt: '2026-01-01T00:00:00.000Z' },
    )
    try {
      const service = await openService(dataDir, registry)
      expect(await service.adoptWorkspaces()).toBe(1)
      expect(service.list()).toHaveLength(1)
      expect(service.listRepositories()[0].path).toBe(repo)
      expect(service.list()[0].members[0].repositoryId).toBe(service.listRepositories()[0].id)
      expect(service.list()[0].spaces).toHaveLength(1)
      expect(await service.adoptWorkspaces()).toBe(0)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(plain, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

describe('storage backends', () => {
  it('file backend round-trips and tolerates corruption', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-store-'))
    const file = join(dir, 'rows.json')
    try {
      const backend = createFileBackend<{ id: string; name: string }>(file, 'rows')
      expect(await backend.load()).toEqual([])
      await backend.save([{ id: 'a', name: 'A' }])
      expect(await backend.load()).toEqual([{ id: 'a', name: 'A' }])
      writeFileSync(file, 'broken{', 'utf8')
      expect(await backend.load()).toEqual([])
      await backend.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('repository registry healing', () => {
  it('heals a member whose repository record was lost by reading the clone origin', async () => {
    const repo = makeRepo()
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-heal-'))
    try {
      // 先正常建项目、加仓库、准备空间，得到物化目录
      const first = await openService(dataDir)
      const project = await first.create({ name: 'Heal' })
      const repository = await first.addRepository({ path: repo })
      await first.addMember(project.id, { repositoryId: repository.id })
      const space = await first.createSpace(project.id, 'main')
      await first.prepareSpace(project.id, space.id)
      await first.close()

      // 模拟旧版迁移留下的状态：成员还在、仓库表丢了
      const brokenFile = join(dataDir, 'repositories.json')
      writeFileSync(brokenFile, JSON.stringify({ repositories: [] }), 'utf8')

      const second = await openService(dataDir)
      const healed = second.listRepositories()
      expect(healed).toHaveLength(1)
      expect(healed[0].id).toBe(repository.id)
      expect(healed[0].path).toBe(repo)
      await second.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

describe('space prepare failure cleanup', () => {
  it('removes the half-finished clone of the failing member only', async () => {
    const valid = mkdtempSync(join(tmpdir(), 'ascoder-prep-ok-'))
    const broken = mkdtempSync(join(tmpdir(), 'ascoder-prep-bad-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-prep-data-'))
    try {
      const init = (dir: string) => {
        const run = (...args: string[]) => execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', ...args], { cwd: dir, stdio: 'ignore' })
        run('init', '--quiet', '-b', 'main')
        writeFileSync(join(dir, 'a.txt'), 'hello\n')
        run('add', '.')
        run('commit', '--quiet', '-m', 'init')
      }
      init(valid)
      init(broken)

      const service = await ProjectService.open(
        createFileBackend(join(dataDir, 'projects.json'), 'projects'),
        createFileBackend(join(dataDir, 'repositories.json'), 'repositories'),
        join(dataDir, 'spaces'),
      )
      const project = await service.create({ name: 'P' })
      const ok = await service.addRepository({ path: valid })
      const bad = await service.addRepository({ path: broken })
      await service.addMember(project.id, { repositoryId: ok.id, alias: 'good' })
      await service.addMember(project.id, { repositoryId: bad.id, alias: 'broken' })
      const space = await service.createSpace(project.id, 'main')
      // 仓库在准备前被删除：模拟"克隆到一半失败"
      rmSync(broken, { recursive: true, force: true })
      const prepared = await service.prepareSpace(project.id, space.id)

      expect(prepared.status).toBe('failed')
      const root = prepared.root as string
      expect(existsSync(join(root, 'good'))).toBe(true)
      // 失败成员的半成品目录被清理
      expect(existsSync(join(root, 'broken'))).toBe(false)
      await service.close()
    } finally {
      rmSync(valid, { recursive: true, force: true })
      rmSync(broken, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

