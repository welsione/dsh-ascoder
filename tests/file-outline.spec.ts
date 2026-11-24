import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildProjectTools, scanFileOutline } from '../src/projectTools.js'
import type { ProjectView } from '../src/projects.js'

const tsSource = [
  "import { x } from './x'",
  'export interface SignRequest {',
  '  id: string',
  '}',
  'export type SignResult = { ok: boolean }',
  'export enum SignStatus { Done }',
  'export function createSignTask(req: SignRequest) {',
  '  return req',
  '}',
  'export const querySign = async (id: string) => {',
  '  return id',
  '}',
].join('\n')

const javaSource = [
  'package com.example;',
  'public class SignService {',
  '  private final Repo repo;',
  '  public SignService(Repo repo) {',
  '    this.repo = repo',
  '  }',
  '  public void createSign(String id) {',
  '  }',
  '  private String queryResult(String id) {',
  '    return id',
  '  }',
  '}',
].join('\n')

describe('scanFileOutline', () => {
  it('lists TypeScript declarations with line numbers', () => {
    const outline = scanFileOutline(tsSource, 'src/api/sign.ts')
    const names = outline.symbols.map((symbol) => `${symbol.kind}:${symbol.name}@${symbol.line}`)
    expect(names).toContain('interface:SignRequest@2')
    expect(names).toContain('type:SignResult@5')
    expect(names).toContain('enum:SignStatus@6')
    expect(names).toContain('function:createSignTask@7')
    expect(names).toContain('function:querySign@10')
    expect(outline.lines).toBe(12)
  })

  it('recognises Java interfaces and enums with access modifiers', () => {
    const source = [
      'package com.example;',
      'public interface SignService {',
      '  void sign(String id);',
      '}',
      'public enum SignStatus { DONE }',
    ].join('\n')
    const outline = scanFileOutline(source, 'SignService.java')
    const names = outline.symbols.map((symbol) => `${symbol.kind}:${symbol.name}`)
    expect(names).toContain('interface:SignService')
    expect(names).toContain('enum:SignStatus')
  })

  it('lists Java class and methods', () => {
    const outline = scanFileOutline(javaSource, 'SignService.java')
    const names = outline.symbols.map((symbol) => `${symbol.kind}:${symbol.name}`)
    expect(names).toContain('class:SignService')
    expect(names).toContain('method:createSign')
    expect(names).toContain('method:queryResult')
  })

  it('caps symbols and marks truncation', () => {
    const many = Array.from({ length: 40 }, (_, index) => `export function fn${index}() {}`).join('\n')
    const outline = scanFileOutline(many, 'many.ts', 10)
    expect(outline.symbols).toHaveLength(10)
    expect(outline.truncated).toBe(true)
  })
})

describe('ascoder_file_outline tool', () => {
  function makeService(root: string): Parameters<typeof buildProjectTools>[0] {
    const project: ProjectView = {
      id: 'p1',
      name: 'Ascoder',
      createdAt: '2026-01-01T00:00:00.000Z',
      members: [
        { id: 'm1', alias: 'private-sign', repositoryId: 'r1' },
        { id: 'm2', alias: 'private-java', repositoryId: 'r2' },
      ],
      spaces: [{
        id: 's1',
        branch: 'hotfix/5.6.x',
        createdAt: '2026-01-01T00:00:00.000Z',
        root,
        status: 'ready',
        preparedCount: 2,
        memberCount: 2,
      }],
      memberCount: 2,
      spaceCount: 1,
      dirty: 0,
    }
    return {
      root,
      state: async () => [project],
      create: async () => ({ id: 'p1', name: 'Ascoder' }),
      addMember: async () => ({ id: 'm1' }),
      createSpace: async () => ({ id: 's1', branch: 'main' }),
      prepareSpace: async () => ({ id: 's1', branch: 'main', status: 'ready' }),
      syncSpace: async () => [],
      tasks: { list: () => [], running: () => [] },
    } as unknown as Parameters<typeof buildProjectTools>[0]
  }

  it('reads a member file given an alias prefix and rejects traversal', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-outline-'))
    try {
      mkdirSync(join(dir, 'private-sign', 'src'), { recursive: true })
      writeFileSync(join(dir, 'private-sign', 'src', 'sign.ts'), tsSource)
      const service = makeService(dir)
      const tools = buildProjectTools(service)
      const outlineTool = tools.find((tool) => tool.name === 'ascoder_file_outline')!
      const value = await outlineTool.execute(
        { projectId: 'p1', branch: 'hotfix/5.6.x', path: 'private-sign/src/sign.ts' },
        {} as never,
      ) as { alias: string; path: string; symbols: Array<{ name: string }> }
      expect(value.alias).toBe('private-sign')
      expect(value.symbols.map((symbol) => symbol.name)).toContain('createSignTask')
      await expect(outlineTool.execute(
        { projectId: 'p1', branch: 'hotfix/5.6.x', path: '../etc/passwd' },
        {} as never,
      )).rejects.toThrow(/不能包含 \.\./)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
