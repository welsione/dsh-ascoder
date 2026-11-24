/**
 * 回答视角（角色）存储：内置三种视角 + 用户自定义视角，选择结果全局生效。
 *
 * 视角只影响回答风格（结论先行、证据位置、是否展示代码），不改动工具权限。
 */
import { randomUUID } from 'node:crypto'
import type { RecordBackend, StoredRecord } from './storage.ts'
import { ROLE_STYLES, renderCustomSection, renderRoleSection, type RoleStyle } from './roles.ts'

/** 一个可选视角。 */
export interface RoleEntry {
  id: string
  name: string
  /** 风格一句话描述。 */
  description: string
  /** 提示词要求（逐行）。 */
  instruction: string
  /** 回答结构。 */
  structure: string
  /** 是否内置（内置不可删除、不可改内容）。 */
  builtin: boolean
}

/** 持久化状态：单条记录。 */
export interface RoleStateRecord extends StoredRecord {
  selectedId: string
  custom: Array<{ id: string; name: string; description?: string; instruction: string; structure?: string }>
}

/** 自定义视角字段上限：这些文本会进入每次对话的系统提示词。 */
const CUSTOM_ROLE_NAME_MAX = 40
const CUSTOM_ROLE_DESCRIPTION_MAX = 200
const CUSTOM_ROLE_STRUCTURE_MAX = 200
const CUSTOM_ROLE_INSTRUCTION_MAX = 4000

/** 内置视角 id 列表。 */
export const BUILTIN_ROLE_IDS = Object.keys(ROLE_STYLES) as Array<keyof typeof ROLE_STYLES>

/** 回答视角服务。 */
export class RoleStore {
  private constructor(
    private readonly backend: RecordBackend<RoleStateRecord>,
    private state: RoleStateRecord,
  ) {}

  /**
   * 打开视角存储。
   * @param backend - 持久化后端
   * @param fallbackId - 首次使用时的默认视角
   */
  static async open(backend: RecordBackend<RoleStateRecord>, fallbackId: string): Promise<RoleStore> {
    const rows = await backend.load()
    return new RoleStore(backend, rows[0] ?? {
      id: 'roles',
      selectedId: BUILTIN_ROLE_IDS.includes(fallbackId as keyof typeof ROLE_STYLES) ? fallbackId : 'developer',
      custom: [],
    })
  }

  /** 全部可选视角（内置在前）。 */
  list(): RoleEntry[] {
    const builtin: RoleEntry[] = BUILTIN_ROLE_IDS.map((id) => ({
      id,
      name: ROLE_STYLES[id].label,
      description: ROLE_STYLES[id].description,
      structure: ROLE_STYLES[id].structure,
      instruction: ROLE_STYLES[id].rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n'),
      builtin: true,
    }))
    const custom: RoleEntry[] = this.state.custom.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description ?? '',
      structure: role.structure ?? '',
      instruction: role.instruction,
      builtin: false,
    }))
    return [...builtin, ...custom]
  }

  /** 当前选中的视角。 */
  selected(): RoleEntry {
    const all = this.list()
    return all.find((role) => role.id === this.state.selectedId) ?? all[0]
  }

  /** 切换视角。 */
  async select(id: string): Promise<RoleEntry> {
    const target = this.list().find((role) => role.id === id)
    if (!target) throw new Error(`视角不存在: ${id}`)
    this.state = { ...this.state, selectedId: id }
    await this.backend.save([this.state])
    return target
  }

  /**
   * 新增或更新自定义视角。
   * @param input - 视角内容；带 id 表示更新
   */
  async save(input: {
    id?: string
    name: string
    description?: string
    instruction: string
    structure?: string
  }): Promise<RoleEntry> {
    const name = input.name.trim()
    const instruction = input.instruction.trim()
    const description = (input.description ?? '').trim()
    const structure = (input.structure ?? '').trim()
    if (name === '') throw new Error('视角名称不能为空')
    if (instruction === '') throw new Error('视角要求不能为空')
    // 自定义视角会进入每一次对话的系统提示词：不限长度会把每次请求撑大
    if (name.length > CUSTOM_ROLE_NAME_MAX) throw new Error(`视角名称最多 ${CUSTOM_ROLE_NAME_MAX} 字`)
    if (instruction.length > CUSTOM_ROLE_INSTRUCTION_MAX) throw new Error(`视角要求最多 ${CUSTOM_ROLE_INSTRUCTION_MAX} 字`)
    if (description.length > CUSTOM_ROLE_DESCRIPTION_MAX) throw new Error(`视角描述最多 ${CUSTOM_ROLE_DESCRIPTION_MAX} 字`)
    if (structure.length > CUSTOM_ROLE_STRUCTURE_MAX) throw new Error(`回答结构最多 ${CUSTOM_ROLE_STRUCTURE_MAX} 字`)
    if (input.id && BUILTIN_ROLE_IDS.includes(input.id as keyof typeof ROLE_STYLES)) {
      throw new Error('内置视角不能修改')
    }
    const custom = [...this.state.custom]
    const existing = input.id ? custom.findIndex((role) => role.id === input.id) : -1
    const entry = {
      id: existing >= 0 ? (input.id as string) : randomUUID(),
      name,
      description,
      instruction,
      structure,
    }
    if (existing >= 0) custom[existing] = entry
    else custom.push(entry)
    this.state = { ...this.state, custom }
    await this.backend.save([this.state])
    return { ...entry, builtin: false }
  }

  /** 删除自定义视角。 */
  async remove(id: string): Promise<boolean> {
    if (BUILTIN_ROLE_IDS.includes(id as keyof typeof ROLE_STYLES)) throw new Error('内置视角不能删除')
    const before = this.state.custom.length
    const custom = this.state.custom.filter((role) => role.id !== id)
    if (custom.length === before) return false
    const selectedId = this.state.selectedId === id ? 'developer' : this.state.selectedId
    this.state = { ...this.state, custom, selectedId }
    await this.backend.save([this.state])
    return true
  }

  /** 当前视角的提示词片段（风格 + 结构 + 要求）。 */
  section(): string {
    const role = this.selected()
    return role.builtin
      ? renderRoleSection(ROLE_STYLES[role.id as keyof typeof ROLE_STYLES])
      : renderCustomSection({
        name: role.name,
        description: role.description,
        instruction: role.instruction,
        structure: role.structure,
      })
  }

  /** 释放介质。 */
  async close(): Promise<void> {
    await this.backend.close()
  }
}

/** 由内置风格构造视角（供测试与渲染复用）。 */
export function builtinRole(id: keyof typeof ROLE_STYLES): RoleEntry {
  const style: RoleStyle = ROLE_STYLES[id]
  return {
    id,
    name: style.label,
    description: style.description,
    structure: style.structure,
    instruction: style.rules.map((rule, index) => `${index + 1}. ${rule}`).join('\n'),
    builtin: true,
  }
}
