/**
 * DSH Workspace 联动：把 Ascoder 项目对齐到宿主 workspace，避免"两套项目目录"。
 *
 * registry 是可选依赖：宿主未提供 workspaceRegistry 时全部方法退化为 no-op，
 * 插件仍可独立工作。
 */

/** 宿主 Workspace 中本模块关心的最小形状。 */
export interface WorkspaceLike {
  /** 稳定 id（uuid）。 */
  readonly id: string
  /** 规范化后的目录绝对路径。 */
  readonly path: string
  /** 展示名。 */
  readonly title: string
  /** 创建时间（ISO 8601），部分宿主版本可能缺失。 */
  readonly createdAt?: string
}

/** `ctx.workspaceRegistry` 的最小形状。 */
export interface WorkspaceRegistryLike {
  /** 全部 workspace（同步读取）。 */
  list(): readonly WorkspaceLike[]
  /** 按规范化路径查找。 */
  resolveByPath(path: string): Promise<WorkspaceLike | undefined>
  /** 创建（路径必须已存在）。 */
  create(path: string, title?: string): Promise<WorkspaceLike>
}

/** 联动结果。 */
export interface WorkspaceLink {
  /** 对应 workspace id。 */
  workspaceId: string
  /** 本次是否新建。 */
  created: boolean
}

/**
 * 项目到 workspace 的联动器。
 *
 * registry 通过 getter 惰性解析：插件 apply 时宿主服务可能尚未就绪，
 * 每次调用现取才能拿到真实实例。
 */
export class WorkspaceLinker {
  constructor(private readonly resolveRegistry: () => WorkspaceRegistryLike | undefined) {}

  /** 当前可用的 registry 实例。 */
  private registry(): WorkspaceRegistryLike | undefined {
    try {
      return this.resolveRegistry()
    } catch {
      return undefined
    }
  }

  /** 宿主是否提供 workspace 能力。 */
  get available(): boolean {
    return this.registry() !== undefined
  }

  /** 当前全部 workspace 的 path → id 快照。 */
  snapshot(): Map<string, WorkspaceLike> {
    const map = new Map<string, WorkspaceLike>()
    for (const workspace of this.registry()?.list() ?? []) map.set(workspace.path, workspace)
    return map
  }

  /**
   * 确保某个目录有对应 workspace：先按路径解析，缺失才创建。
   * @param path - 项目目录（调用方保证已存在）
   * @param title - 新建时的展示名
   * @returns 联动结果；宿主无 workspace 能力时返回 undefined
   */
  async ensure(path: string, title: string): Promise<WorkspaceLink | undefined> {
    const registry = this.registry()
    if (!registry) return undefined
    const existing = await registry.resolveByPath(path)
    if (existing) return { workspaceId: existing.id, created: false }
    const created = await registry.create(path, title)
    return { workspaceId: created.id, created: true }
  }
}
