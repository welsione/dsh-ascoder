/**
 * 探测宿主机上的命令行工具（git / codegraph 等）是否可用。
 *
 * 这些 CLI 不是 DSH 工具本身：Agent 通过宿主的 shell 工具调用它们。
 * 设置页展示可用性，避免"工具列表里看不到就以为没有"。
 */
import { execFile } from 'node:child_process'

/** 一个 CLI 的可用性。 */
export interface CliStatus {
  /** 命令名。 */
  name: string
  /** 一行用途说明。 */
  purpose: string
  /** 是否可执行。 */
  available: boolean
  /** 版本或错误摘要。 */
  detail?: string
}

/** 需要探测的 CLI。 */
const CLI_CATALOG: Array<{ name: string; purpose: string; args: string[] }> = [
  { name: 'git', purpose: '读取历史/差异，分支空间同步也依赖它', args: ['--version'] },
  { name: 'codegraph', purpose: '语义代码检索（需要仓库内存在 .codegraph 索引）', args: ['--version'] },
]

/** 探测结果缓存（毫秒）。 */
const CACHE_TTL = 30_000
let cache: { at: number; list: CliStatus[] } | undefined

/** 执行一个命令并取首行输出。 */
function probe(name: string, args: string[]): Promise<{ ok: boolean; detail: string }> {
  return new Promise((resolve) => {
    execFile(name, args, { timeout: 4000 }, (error, stdout, stderr) => {
      if (error) {
        resolve({ ok: false, detail: (error.message || String(error)).split('\n')[0].slice(0, 160) })
        return
      }
      const text = (stdout || stderr || '').trim().split('\n')[0] || '可用'
      resolve({ ok: true, detail: text.slice(0, 160) })
    })
  })
}

/**
 * 探测 CLI 可用性（带 30s 缓存）。
 * @returns 每个 CLI 的可用状态
 */
export async function detectClis(): Promise<CliStatus[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL) return cache.list
  const list = await Promise.all(CLI_CATALOG.map(async (item) => {
    const result = await probe(item.name, item.args)
    return {
      name: item.name,
      purpose: item.purpose,
      available: result.ok,
      detail: result.detail,
    } satisfies CliStatus
  }))
  cache = { at: Date.now(), list }
  return list
}
