/**
 * 仓库凭证：远程仓库用的用户名 + 令牌/密码。
 *
 * 安全约定：
 * - 令牌以 AES-256-GCM 加密落盘，密钥保存在同目录的 key 文件（0600，首次自动生成）
 * - 对浏览器只返回掩码，永不回传明文
 * - git 操作通过 GIT_ASKPASS 注入，不把令牌拼进 remote URL
 */
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { RecordBackend, StoredRecord } from './storage.ts'

/** 加密算法参数。 */
const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12
const KEY_BYTES = 32

/** 持久化记录。 */
/** 凭证字段上限（都会出现在设置页与 git askpass 环境里）。 */
const CREDENTIAL_NAME_MAX = 60
const CREDENTIAL_USERNAME_MAX = 200
const CREDENTIAL_SECRET_MAX = 4096

export interface CredentialRecord extends StoredRecord {
  name: string
  username: string
  /** 加密后的令牌：iv.tag.cipher（base64url）。 */
  sealed: string
  createdAt: string
  lastUsedAt?: string
}

/** 对外展示的凭证（不含机密）。 */
export interface CredentialSummary {
  id: string
  name: string
  username: string
  /** 掩码，如 ••••7f3a。 */
  masked: string
  createdAt: string
  lastUsedAt?: string
}

/** git 需要的明文凭证。 */
export interface CredentialSecret {
  username: string
  password: string
}

/** 仓库凭证服务。 */
export class CredentialStore {
  private constructor(
    private readonly backend: RecordBackend<CredentialRecord>,
    private readonly keyFile: string,
    private key: Buffer,
    private records: CredentialRecord[],
  ) {}

  /**
   * 打开凭证存储（必要时生成密钥）。
   * @param backend - 持久化后端
   * @param keyFile - 密钥文件路径
   */
  static async open(backend: RecordBackend<CredentialRecord>, keyFile: string): Promise<CredentialStore> {
    const key = await loadOrCreateKey(keyFile)
    const records = await backend.load()
    return new CredentialStore(backend, keyFile, key, records)
  }

  /** 对外列表（只含掩码）。 */
  list(): CredentialSummary[] {
    return this.records.map((record) => ({
      id: record.id,
      name: record.name,
      username: record.username,
      masked: maskOf(record.sealed),
      createdAt: record.createdAt,
      ...(record.lastUsedAt ? { lastUsedAt: record.lastUsedAt } : {}),
    }))
  }

  /**
   * 新增或更新凭证。
   * @param input - 名称、用户名、令牌；id 存在时为更新（可不传令牌）
   */
  async save(input: { id?: string; name: string; username: string; secret?: string }): Promise<CredentialSummary> {
    const name = input.name.trim()
    const username = input.username.trim()
    if (name === '') throw new Error('凭证名称不能为空')
    if (username === '') throw new Error('用户名不能为空')
    // 这三个字段会出现在设置页列表、日志摘要与 git askpass 环境里，限制长度避免溢出
    if (name.length > CREDENTIAL_NAME_MAX) throw new Error(`凭证名称最多 ${CREDENTIAL_NAME_MAX} 字`)
    if (username.length > CREDENTIAL_USERNAME_MAX) throw new Error(`用户名最多 ${CREDENTIAL_USERNAME_MAX} 字`)
    if ((input.secret ?? '').length > CREDENTIAL_SECRET_MAX) throw new Error(`令牌/密码最多 ${CREDENTIAL_SECRET_MAX} 字符`)
    const existing = input.id ? this.records.find((record) => record.id === input.id) : undefined
    const secret = input.secret?.trim()
    if (!existing && !secret) throw new Error('首次创建必须填写令牌/密码')
    const sealed = secret ? seal(this.key, secret) : (existing as CredentialRecord).sealed
    const record: CredentialRecord = {
      id: existing?.id ?? randomBytes(8).toString('hex'),
      name,
      username,
      sealed,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      ...(existing?.lastUsedAt ? { lastUsedAt: existing.lastUsedAt } : {}),
    }
    this.records = [...this.records.filter((item) => item.id !== record.id), record]
    await this.backend.save(this.records)
    return this.list().find((item) => item.id === record.id) as CredentialSummary
  }

  /** 删除凭证。 */
  async remove(id: string): Promise<boolean> {
    const before = this.records.length
    this.records = this.records.filter((record) => record.id !== id)
    if (this.records.length === before) return false
    await this.backend.save(this.records)
    return true
  }

  /** 是否存在该凭证。 */
  has(id: string): boolean {
    return this.records.some((record) => record.id === id)
  }

  /**
   * 取出明文凭证供 git 使用，并记录使用时间。
   * @param id - 凭证 id
   */
  async reveal(id: string): Promise<CredentialSecret> {
    const record = this.records.find((item) => item.id === id)
    if (!record) throw new Error(`凭证不存在: ${id}`)
    record.lastUsedAt = new Date().toISOString()
    await this.backend.save(this.records)
    return { username: record.username, password: unseal(this.key, record.sealed) }
  }

  /** 释放介质。 */
  async close(): Promise<void> {
    await this.backend.close()
  }
}

/**
 * 读取或生成 32 字节密钥。
 *
 * 密钥文件存在但内容不合法时**必须报错**：静默生成新密钥会让所有已存令牌
 * 永久无法解密（数据丢失且无提示）。只有文件不存在（首次运行）才生成。
 */
async function loadOrCreateKey(keyFile: string): Promise<Buffer> {
  let raw: string | null = null
  try {
    raw = await readFile(keyFile, 'utf8')
  } catch {
    raw = null
  }
  if (raw !== null) {
    const key = Buffer.from(raw.trim(), 'base64')
    if (key.length === KEY_BYTES) return key
    throw new Error(
      `凭证密钥文件损坏（${key.length} 字节，应为 ${KEY_BYTES}）：${keyFile}。`
      + '请恢复备份的密钥文件；直接重建会导致已保存的令牌无法解密',
    )
  }
  const key = randomBytes(KEY_BYTES)
  await mkdir(dirname(keyFile), { recursive: true })
  try {
    // wx：并发下只有一个进程能创建，避免互相覆盖密钥
    await writeFile(keyFile, key.toString('base64'), { mode: 0o600, flag: 'wx' })
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code
    if (code !== 'EEXIST') throw error
    const existing = Buffer.from((await readFile(keyFile, 'utf8')).trim(), 'base64')
    if (existing.length === KEY_BYTES) return existing
    throw new Error(`凭证密钥文件并发创建后内容异常：${keyFile}`)
  }
  await chmod(keyFile, 0o600).catch(() => undefined)
  return key
}

/** 加密令牌。 */
function seal(key: Buffer, plaintext: string): string {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.')
}

/** 解密令牌。 */
function unseal(key: Buffer, sealed: string): string {
  const [ivPart, tagPart, dataPart] = sealed.split('.')
  if (!ivPart || !tagPart || !dataPart) throw new Error('凭证数据损坏')
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivPart, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagPart, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(dataPart, 'base64url')), decipher.final()]).toString('utf8')
}

/** 生成掩码：只用密文尾部区分不同凭证，不泄露明文。 */
function maskOf(sealed: string): string {
  const tail = sealed.slice(-4)
  return '••••' + tail
}

/** 凭证与 askpass 脚本的临时目录（跟随数据目录）。 */
export function askpassDirOf(dataDir: string): string {
  return join(dataDir, 'askpass')
}
