import { describe, it, expect } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { ToolUsageStore, createInstrumentedTool, type ToolUsageRecord } from '../src/toolUsage.js'
import { createFileBackend } from '../src/storage.js'

/** 打开一个临时存储。 */
async function openStore(dir: string, file = 'tools.json') {
  return ToolUsageStore.open(createFileBackend<ToolUsageRecord>(join(dir, file), 'usage'))
}

describe('tool usage store', () => {
  it('counts calls, errors and remembers the last outcome', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-tools-'))
    try {
      const store = await openStore(dir)
      store.record('ascoder_task_list', true, 12)
      store.record('ascoder_task_list', false, 30, 'boom')
      store.record('knowledge_search', true, 5)

      const taskList = store.get('ascoder_task_list')
      expect(taskList?.calls).toBe(2)
      expect(taskList?.errors).toBe(1)
      expect(taskList?.lastMs).toBe(30)
      expect(taskList?.lastError).toBe('boom')

      const search = store.get('knowledge_search')
      expect(search?.calls).toBe(1)
      expect(search?.errors).toBe(0)
      expect(search?.lastError).toBeUndefined()
      expect(store.list()[0].name).toBe('ascoder_task_list')
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('remembers disabled tools across reopen and re-enables them', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-tools-'))
    try {
      const store = await openStore(dir)
      expect(store.isEnabled('ascoder_task_list')).toBe(true)
      await store.setEnabled('ascoder_task_list', false)
      expect(store.isEnabled('ascoder_task_list')).toBe(false)
      await store.close()

      const reopened = await openStore(dir)
      expect(reopened.isEnabled('ascoder_task_list')).toBe(false)
      await reopened.setEnabled('ascoder_task_list', true)
      expect(reopened.isEnabled('ascoder_task_list')).toBe(true)
      await reopened.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('resets one tool or everything', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-tools-'))
    try {
      const store = await openStore(dir)
      store.record('a', true, 1)
      store.record('b', true, 2)
      await store.reset('a')
      expect(store.get('a')).toBeUndefined()
      expect(store.get('b')?.calls).toBe(1)
      await store.reset()
      expect(store.list()).toEqual([])
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('instrumented tools', () => {
  it('rejects calls when disabled and records usage when enabled', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-tools-'))
    try {
      const store = await openStore(dir)
      const definition = {
        name: 'ascoder_demo',
        description: 'demo',
        parameters: {},
        output: { schema: { type: 'object' }, render: () => [] },
        execute: async () => ({ ok: true }),
      } as unknown as import('@deepseek-ai/dsh-tools').ToolDefinition

      const instrumented = createInstrumentedTool(definition, () => store)
      const value = await instrumented.execute({}, {} as never)
      expect(value).toEqual({ ok: true })
      expect(store.get('ascoder_demo')?.calls).toBe(1)

      await store.setEnabled('ascoder_demo', false)
      await expect(instrumented.execute({}, {} as never)).rejects.toThrow('已在 Ascoder 设置中停用')
      expect(store.get('ascoder_demo')?.calls).toBe(1)

      await store.setEnabled('ascoder_demo', true)
      await instrumented.execute({}, {} as never)
      expect(store.get('ascoder_demo')?.calls).toBe(2)
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('records failures with their reason', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'ascoder-tools-'))
    try {
      const store = await openStore(dir)
      const definition = {
        name: 'ascoder_fail',
        description: 'demo',
        parameters: {},
        output: { schema: { type: 'object' }, render: () => [] },
        execute: async () => { throw new Error('nope') },
      } as unknown as import('@deepseek-ai/dsh-tools').ToolDefinition

      const instrumented = createInstrumentedTool(definition, () => store)
      await expect(instrumented.execute({}, {} as never)).rejects.toThrow('nope')
      const usage = store.get('ascoder_fail')
      expect(usage?.calls).toBe(1)
      expect(usage?.errors).toBe(1)
      expect(usage?.lastError).toBe('nope')
      await store.close()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})
