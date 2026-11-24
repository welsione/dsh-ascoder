import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { ProjectService } from '../src/projects.js'
import { createFileBackend } from '../src/storage.js'
import { buildGuideSection, buildIdentitySection } from '../src/prompt.js'

function makeRepo(root: string, name: string): string {
  const dir = join(root, name)
  execFileSync('git', ['init', '--quiet', '-b', 'main', dir])
  const run = (...args: string[]) =>
    execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', ...args], { cwd: dir })
  writeFileSync(join(dir, 'README.md'), `# ${name}\n`)
  run('add', '.')
  run('commit', '--quiet', '-m', 'init')
  run('branch', 'release')
  return dir
}

describe('space manifest', () => {
  it('writes .ascoder-space.md explaining that members are the repos', async () => {
    const root = mkdtempSync(join(tmpdir(), 'ascoder-manifest-'))
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-manifest-data-'))
    try {
      const service = await ProjectService.open(
        createFileBackend(join(dataDir, 'projects.json'), 'projects'),
        createFileBackend(join(dataDir, 'repositories.json'), 'repositories'),
        join(dataDir, 'spaces'),
      )
      const project = await service.create({ name: '公有云' })
      const a = await service.addRepository({ path: makeRepo(root, 'cloud-webapp') })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'cloud-webapp' })
      const space = await service.createSpace(project.id, 'release')
      const prepared = await service.prepareSpace(project.id, space.id)
      expect(prepared.status).toBe('ready')

      const manifest = readFileSync(join(prepared.root as string, '.ascoder-space.md'), 'utf8')
      expect(manifest).toContain('公有云 · release')
      expect(manifest).toContain('根目录本身不是 git 仓库')
      expect(manifest).toContain('| cloud-webapp | release | ./cloud-webapp/ |')
      await service.close()
    } finally {
      rmSync(root, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('tells the agent about multi-repository spaces in the guide prompt', () => {
    const guide = buildGuideSection()
    expect(guide).toContain('分支空间')
    expect(guide).toContain('.ascoder-space.md')
    expect(guide).toContain('not a git repository')
  })
})

describe('identity prompt', () => {
  it('introduces itself as Ascoder and hides the host implementation', () => {
    const identity = buildIdentitySection()
    expect(identity).toContain('Ascoder')
    expect(identity).toContain('不要出现底层平台')
    expect(identity).toContain('产品语言')
    // 提示词本身不写平台名，模型才不会在思考里复述它
    expect(identity).not.toContain('DSH')
    expect(identity).not.toContain('DeepSeek Harness')
  })
})
