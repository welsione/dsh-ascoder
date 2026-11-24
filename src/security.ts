/**
 * 设置页密码：初始值来自插件配置，用户修改后以 scrypt 加盐哈希落盘。
 *
 * 只存哈希，不存明文；比对使用定长比较避免时序泄漏。
 */
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { RecordBackend, StoredRecord } from './storage.ts'

/** scrypt 参数：N=16384 在交互式校验里约几十毫秒，足够挡住暴力尝试。 */
const SCRYPT_KEYLEN = 32
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 } as const
/** 密码最短长度。 */
const MIN_PASSWORD_LENGTH = 6
/** 连续失败多少次后短暂锁定。 */
const MAX_FAILURES = 5
/** 锁定时长（毫秒）。 */
const LOCKOUT_MS = 30_000

/** 持久化记录：单条 id='settings'。 */
export interface SecurityRecord extends StoredRecord {
  hash?: string
  salt?: string
  updatedAt?: string
}

/** 错误：当前密码不正确。 */
export class WrongPasswordError extends Error {
  constructor() {
    super('当前密码不正确')
    this.name = 'WrongPasswordError'
  }
}

/** 设置页密码服务。 */
export class SettingsPassword {
  private failures = 0
  private lockedUntil = 0

  private constructor(
    private readonly backend: RecordBackend<SecurityRecord>,
    private readonly fallback: string,
    private record: SecurityRecord,
  ) {}

  /**
   * 打开服务并载入已保存的哈希。
   * @param backend - 持久化后端
   * @param fallback - 尚未修改过时使用的初始密码（来自配置）
   */
  static async open(backend: RecordBackend<SecurityRecord>, fallback: string): Promise<SettingsPassword> {
    const rows = await backend.load()
    return new SettingsPassword(backend, fallback, rows[0] ?? { id: 'settings' })
  }

  /** 是否仍在使用初始密码。 */
  get usesDefault(): boolean {
    return !this.record.hash
  }

  /**
   * 校验密码。
   * @param password - 用户输入
   * @returns 是否正确
   */
  verify(password: string): boolean {
    if (Date.now() < this.lockedUntil) {
      throw new Error(`尝试次数过多，请 ${Math.ceil((this.lockedUntil - Date.now()) / 1000)} 秒后再试`)
    }
    // 修改密码时会对新密码 trim；校验也按同样规则处理，避免"存的是去掉空格的密码、
    // 用户照着原样输入却打不开"这种不一致。
    const candidate = password.trim()
    const ok = this.record.hash && this.record.salt
      ? compare(candidate, this.record.hash, this.record.salt)
      : candidate === this.fallback.trim()
    if (ok) {
      this.failures = 0
      return true
    }
    this.failures += 1
    if (this.failures >= MAX_FAILURES) {
      this.failures = 0
      this.lockedUntil = Date.now() + LOCKOUT_MS
    }
    return false
  }

  /**
   * 修改密码。
   * @param current - 当前密码
   * @param next - 新密码
   */
  async change(current: string, next: string): Promise<void> {
    if (!this.verify(current)) throw new WrongPasswordError()
    const trimmed = next.trim()
    if (trimmed.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`新密码至少 ${MIN_PASSWORD_LENGTH} 位`)
    }
    if (trimmed === current) throw new Error('新密码不能与当前密码相同')
    const salt = randomBytes(16).toString('hex')
    this.record = {
      id: 'settings',
      salt,
      hash: scryptSync(trimmed, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS).toString('hex'),
      updatedAt: new Date().toISOString(),
    }
    await this.backend.save([this.record])
  }

  /** 释放介质。 */
  async close(): Promise<void> {
    await this.backend.close()
  }
}

/**
 * 定长比较密码哈希。
 * @param password - 明文密码
 * @param hash - 已存哈希（hex）
 * @param salt - 盐（hex）
 */
function compare(password: string, hash: string, salt: string): boolean {
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_OPTIONS)
  if (expected.length !== actual.length) return false
  return timingSafeEqual(expected, actual)
}
