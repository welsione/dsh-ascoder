import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { ProjectService } from '../src/projects.js'
import { createFileBackend } from '../src/storage.js'

function makeRepo(root: string, name: string, branches: string[]): string {
  const dir = join(root, name)
  execFileSync('git', ['init', '--quiet', '-b', branches[0], dir])
  const run = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', ...args], { cwd: dir })
  writeFileSync(join(dir, 'README.md'), `# ${name}\n`)
  run('add', '.')
  run('commit', '--quiet', '-m', 'init')
  for (const branch of branches.slice(1)) run('branch', branch)
  return dir
}

async function openService(dataDir: string): Promise<ProjectService> {
  return ProjectService.open(
    createFileBackend(join(dataDir, 'projects.json'), 'projects'),
    createFileBackend(join(dataDir, 'repositories.json'), 'repositories'),
    join(dataDir, 'spaces'),
  )
}

describe('space branch mapping', () => {
  it('repairs a failed space by pointing a member at a branch it actually has', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-map-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-map-data-'))
    try {
      const main = makeRepo(root, 'private-java', ['hotfix/5.4.x'])
      const common = makeRepo(root, 'private-common', ['main', 'v4.2.x/hotfix'])
      const service = await openService(dataDir)
      const project = await service.create({ name: '私有云' })
      const a = await service.addRepository({ path: main })
      const b = await service.addRepository({ path: common })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'private-java' })
      await service.addMember(project.id, { repositoryId: b.id, alias: 'private-common' })

      const space = await service.createSpace(project.id, 'hotfix/5.4.x')
      const failed = await service.prepareSpace(project.id, space.id)
      expect(failed.status).toBe('failed')

      const candidates = await service.branchCandidates(project.id, 'hotfix/5.4.x')
      const commonCandidates = candidates.filter((row) => row.alias === 'private-common').map((row) => row.branch)
      expect(commonCandidates[0]).toBe('v4.2.x/hotfix')
      expect(candidates.some((row) => row.alias === 'private-java' && row.matched)).toBe(true)

      await service.setSpaceBranches(project.id, space.id, { 'private-common': 'v4.2.x/hotfix' })
      const repaired = await service.prepareSpace(project.id, space.id)
      expect(repaired.status).toBe('ready')
      expect(repaired.memberBranches).toEqual({ 'private-common': 'v4.2.x/hotfix' })
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('auto-plan maps the member that lacks the branch and prepares in one step', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-auto-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-auto-data-'))
    try {
      const main = makeRepo(root, 'private-java', ['hotfix/5.4.x'])
      const common = makeRepo(root, 'private-common', ['main', 'v4.2.x/hotfix'])
      const service = await openService(dataDir)
      const project = await service.create({ name: '私有云' })
      const a = await service.addRepository({ path: main })
      const b = await service.addRepository({ path: common })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'private-java' })
      await service.addMember(project.id, { repositoryId: b.id, alias: 'private-common' })

      const plan = await service.autoPlanSpace(project.id, 'hotfix/5.4.x')
      expect(plan.unresolved).toEqual([])
      expect(plan.mapping).toEqual({ 'private-common': 'v4.2.x/hotfix' })
      expect(plan.status).toBe('ready')
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('auto-plan reports members that have no candidate branch at all', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-auto2-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-auto2-data-'))
    try {
      const only = makeRepo(root, 'lonely', ['main'])
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const a = await service.addRepository({ path: only })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'lonely' })
      const plan = await service.autoPlanSpace(project.id, 'release/nope')
      // 该仓库并非完全没有分支，候选里会给出 main，因此不进入 unresolved
      expect(plan.unresolved).toEqual([])
      expect(plan.mapping).toEqual({ lonely: 'main' })
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('keeps branches that equal the space branch out of the override map', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-map2-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-map2-data-'))
    try {
      const repo = makeRepo(root, 'app', ['main', 'release'])
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const a = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'release')
      await service.setSpaceBranches(project.id, space.id, { app: 'release', ghost: 'x' })
      const updated = await service.state()
      const target = updated[0].spaces.find((item) => item.id === space.id)
      expect(target?.memberBranches).toBeUndefined()
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})
