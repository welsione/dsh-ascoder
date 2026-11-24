import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { ProjectService } from '../src/projects.js'
import { createFileBackend } from '../src/storage.js'

function makeRepo(prefix: string, files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), prefix))
  const run = (...args: string[]) => execFileSync('git', ['-c', 'user.email=t@e.com', '-c', 'user.name=T', ...args], { cwd: dir, stdio: 'ignore' })
  run('init', '--quiet', '-b', 'main')
  for (const [path, content] of Object.entries(files)) {
    const full = join(dir, path)
    mkdirSync(join(full, '..'), { recursive: true })
    writeFileSync(full, content)
  }
  run('add', '.')
  run('commit', '--quiet', '-m', 'init')
  return dir
}

async function openService(dataDir: string): Promise<ProjectService> {
  return ProjectService.open(
    createFileBackend(join(dataDir, 'projects.json'), 'projects'),
    createFileBackend(join(dataDir, 'repositories.json'), 'repositories'),
    join(dataDir, 'spaces'),
  )
}

describe('space code search', () => {
  it('finds matches across member repositories with file and line', async () => {
    const repoA = makeRepo('ascoder-search-a-', {
      'src/ContractService.java': 'class ContractService {\n  void sign() {}\n}\n',
    })
    const repoB = makeRepo('ascoder-search-b-', {
      'src/SignController.java': 'class SignController {\n  // sign flow\n}\n',
    })
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-search-data-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const a = await service.addRepository({ path: repoA })
      const b = await service.addRepository({ path: repoB })
      await service.addMember(project.id, { repositoryId: a.id, alias: 'contract' })
      await service.addMember(project.id, { repositoryId: b.id, alias: 'sign' })
      const space = await service.createSpace(project.id, 'main')
      await service.prepareSpace(project.id, space.id)

      const result = await service.searchCode(project.id, space.id, 'sign')
      expect(result.matches.length).toBeGreaterThanOrEqual(2)
      const aliases = new Set(result.matches.map((item) => item.alias))
      expect(aliases.has('contract')).toBe(true)
      expect(aliases.has('sign')).toBe(true)
      const first = result.matches[0]
      expect(first.file.endsWith('.java')).toBe(true)
      expect(first.line).toBeGreaterThan(0)
      await service.close()
    } finally {
      rmSync(repoA, { recursive: true, force: true })
      rmSync(repoB, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })

  it('caps results and rejects option-like keywords', async () => {
    const bigFile = Array.from({ length: 80 }, (_, index) => `line ${index} sign`).join('\n')
    const repo = makeRepo('ascoder-search-cap-', { 'a.txt': bigFile })
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-search-cap-data-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const added = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: added.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'main')
      await service.prepareSpace(project.id, space.id)

      const capped = await service.searchCode(project.id, space.id, 'sign', { maxMatches: 5 })
      expect(capped.matches.length).toBe(5)
      expect(capped.truncated).toBe(true)
      await expect(service.searchCode(project.id, space.id, '-rf')).rejects.toThrow()
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

describe('space file listing', () => {
  it('lists tracked files per member with a glob and honours the cap', async () => {
    const repo = makeRepo('ascoder-list-', {
      'src/main/A.java': 'class A {}\n',
      'src/main/B.java': 'class B {}\n',
      'docs/readme.md': '# doc\n',
    })
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-list-data-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const added = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: added.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'main')
      await service.prepareSpace(project.id, space.id)

      const all = await service.listSpaceFiles(project.id, space.id, { glob: '**/*.java' })
      expect(all.groups[0].files).toEqual(['src/main/A.java', 'src/main/B.java'])

      const capped = await service.listSpaceFiles(project.id, space.id, { maxFiles: 1 })
      expect(capped.groups[0].files.length).toBe(1)
      expect(capped.truncated).toBe(true)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})

describe('space file listing edge cases', () => {
  it('matches a slash-free glob against basenames and strips the member alias from the prefix', async () => {
    const repo = makeRepo('ascoder-list2-', {
      'sign/src/main/java/SignController.java': 'class SignController {}\n',
      'sign/src/main/java/SignService.java': 'interface SignService {}\n',
      'biz/src/main/java/Contract.java': 'class Contract {}\n',
    })
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-list2-data-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const added = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: added.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'main')
      await service.prepareSpace(project.id, space.id)

      // 不带斜杠的 glob 应该按 basename 匹配（模型最常用这种写法）
      const byBase = await service.listSpaceFiles(project.id, space.id, { glob: '*Sign*.java' })
      expect(byBase.groups[0].files).toEqual([
        'sign/src/main/java/SignController.java',
        'sign/src/main/java/SignService.java',
      ])

      // 前缀写成 "app/sign"（成员别名开头）也应能命中
      const byAliasPrefix = await service.listSpaceFiles(project.id, space.id, {
        pathPrefix: 'app/sign',
        glob: '*.java',
      })
      expect(byAliasPrefix.groups[0].files.length).toBe(2)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})


describe('multi-keyword search', () => {
  it('ORs several keywords in one scan and dedupes repeated hits', async () => {
    const repo = makeRepo('ascoder-search-or-', {
      'src/A.java': 'class ContractSign {}\n',
      'src/B.java': 'class SignService {}\n',
      'src/C.java': 'class ContractSignService {}\n',
    })
    const dataDir = mkdtempSync(join(tmpdir(), 'ascoder-search-or-data-'))
    try {
      const service = await openService(dataDir)
      const project = await service.create({ name: 'P' })
      const added = await service.addRepository({ path: repo })
      await service.addMember(project.id, { repositoryId: added.id, alias: 'app' })
      const space = await service.createSpace(project.id, 'main')
      await service.prepareSpace(project.id, space.id)

      const result = await service.searchCode(project.id, space.id, 'ContractSign', {
        queries: ['SignService', 'ContractSign'],
      })
      const files = result.matches.map((item) => item.file)
      expect(files).toContain('src/A.java')
      expect(files).toContain('src/B.java')
      // ContractSign 重复出现在两个关键词里，不应产生重复行
      const keys = result.matches.map((item) => `${item.file}:${item.line}`)
      expect(new Set(keys).size).toBe(keys.length)
      await service.close()
    } finally {
      rmSync(repo, { recursive: true, force: true })
      rmSync(dataDir, { recursive: true, force: true })
    }
  })
})
