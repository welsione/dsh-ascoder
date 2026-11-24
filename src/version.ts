/**
 * 插件版本号：单一真源是 package.json 的 version 字段。
 *
 * 提交时由 .githooks/pre-commit 自动升版（patch +1），这里只在运行时读取，
 * 供 /api/ascoder/state 返回给界面展示。
 */
import { createRequire } from 'node:module'

/** 读取 package.json 里的版本（安装路径变化或读取失败时退回 0.0.0）。 */
export function readVersion(): string {
  try {
    const require = createRequire(import.meta.url)
    const pkg = require('../package.json') as { version?: unknown }
    return typeof pkg.version === 'string' && pkg.version !== '' ? pkg.version : '0.0.0'
  } catch {
    return '0.0.0'
  }
}
