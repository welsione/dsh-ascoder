/**
 * 通用记录存储适配：DSH storage hub 的 KV 单元与单文件回退共用一套接口。
 *
 * 两处领域（知识条目、项目注册表）只需要提供「记录键」即可复用同一实现，
 * 避免每加一张表就复制一份后端代码。
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { KvUnit } from '@deepseek-ai/dsh-storage'

/** 一条可持久化记录：必须带稳定业务标识。 */
export interface StoredRecord {
  /** 记录的业务主键。 */
  id: string
}

/** 记录存储后端。`save` 为全量同步语义：写入现存记录、删除已移除记录。 */
export interface RecordBackend<T extends StoredRecord> {
  /** 读取全量快照。 */
  load(): Promise<T[]>
  /** 全量同步到介质。 */
  save(records: T[]): Promise<void>
  /** 释放介质资源。 */
  close(): Promise<void>
}

/** KV 单元后端：每行一条记录，写时做差量同步。 */
export function createKvBackend<T extends StoredRecord>(unit: KvUnit, table: string): RecordBackend<T> {
  return {
    async load() {
      const snapshot = await unit.loadAll()
      return Object.values(snapshot.tables[table] ?? {}) as T[]
    },
    async save(records) {
      const snapshot = await unit.loadAll()
      const kept = new Set(records.map((record) => record.id))
      for (const existing of Object.keys(snapshot.tables[table] ?? {})) {
        if (!kept.has(existing)) await unit.deleteRecord(table, existing)
      }
      for (const record of records) {
        await unit.putRecord(table, record.id, record)
      }
    },
    async close() {
      await unit.close()
    },
  }
}

/** 单 JSON 文件后端：原子替换写，损坏文件按空库容错。 */
export function createFileBackend<T extends StoredRecord>(file: string, field: string): RecordBackend<T> {
  return {
    async load() {
      if (!existsSync(file)) return []
      try {
        const parsed = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
        const rows = parsed[field]
        return Array.isArray(rows) ? (rows as T[]).filter((row) => row && typeof row.id === 'string') : []
      } catch {
        // 损坏文件按空库处理，不让插件加载失败；但先把原文件备份成 .corrupt-*，
        // 否则下一次保存会直接覆盖，现场与可恢复数据就没了。
        try {
          renameSync(file, `${file}.corrupt-${Date.now()}`)
        } catch {
          // 备份失败也不阻塞加载
        }
        return []
      }
    },
    async save(records) {
      mkdirSync(dirname(file), { recursive: true })
      const tmp = `${file}.${randomUUID()}.tmp`
      writeFileSync(tmp, JSON.stringify({ version: 1, [field]: records }, null, 2), 'utf8')
      renameSync(tmp, file)
    },
    async close() {
      // 文件后端无长连接资源。
    },
  }
}
