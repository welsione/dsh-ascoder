import { describe, expect, it } from 'vitest'
import { indexQueryBlocker } from '../src/codegraph.ts'

describe('indexQueryBlocker', () => {
  it('allows queries only when the index is ready', () => {
    expect(indexQueryBlocker('ready')).toBeUndefined()
  })

  it('explains why indexing blocks queries', () => {
    expect(indexQueryBlocker('indexing')).toContain('正在建立中')
  })

  it('asks to rebuild a stale index', () => {
    expect(indexQueryBlocker('stale')).toContain('已过期')
    expect(indexQueryBlocker('stale')).toContain('ascoder_codegraph_index')
  })

  it('asks to build a missing index', () => {
    expect(indexQueryBlocker('none')).toContain('尚未建立')
    expect(indexQueryBlocker(undefined)).toContain('尚未建立')
  })
})
