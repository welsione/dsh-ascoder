/**
 * 分支空间的 CodeGraph 索引编排：查询覆盖率、启动索引任务、空间就绪后自动建索引。
 *
 * 索引耗时较长，一律放进后台任务（TaskService）里跑，页面只展示进度，不阻塞操作。
 */
import { statfsSync } from 'node:fs'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import type { ProjectService, ProjectView, SpaceView } from './projects.ts'
import type { TaskService, TaskView } from './tasks.ts'
import { indexQueryBlocker, spaceIndexStatus, runIndex, runCodegraphQuery, type CodegraphIndexMode, type SpaceIndexStatus } from './codegraph.ts'
import { headInfo } from './git.ts'

/** 某个空间所在仓库成员目录。 */
interface MemberDir {
  alias: string
  dir: string
}

/** 索引编排能力（API 与 Agent 工具共用）。 */
export interface CodegraphFacade {
  /** 某个项目下所有分支空间的索引状态。 */
  statusForProject(projectId: string): Promise<Array<SpaceIndexStatus & { spaceId: string; branch: string }>>
  /** 某个分支空间的索引状态。 */
  status(projectId: string, spaceId: string): Promise<SpaceIndexStatus & { branch: string }>
  /** 启动索引任务（未索引的成员 init，已索引的成员 sync 增量）。 */
  start(projectId: string, spaceId: string, mode?: CodegraphIndexMode): Promise<TaskView>
  /** 空间刚准备好时按需自动建索引：已在跑或全部已索引则跳过。 */
  maybeAutoIndex(projectId: string, spaceId: string): void
  /** 按项目名/ID + 分支名定位空间（Agent 工具用）。 */
  resolveSpace(projectRef: string, branch: string): Promise<{ project: ProjectView; space: SpaceView }>
  /**
   * 在索引就绪的空间里执行一次 codegraph 查询。
   * 索引未就绪（none / indexing / stale）时直接报错，让调用方先建索引。
   */
  query(projectRef: string, branch: string, args: string[]): Promise<{ output: string; dir: string }>
}

/** 依赖注入：项目与任务服务都惰性取，避免启动顺序问题。 */
export interface CodegraphDeps {
  projects: () => ProjectService
  tasks: () => TaskService
}

/** 全局索引闸门：同一时刻只允许一个 codegraph.index 任务真正执行，其余排队等待。 */
let indexGate: Promise<void> = Promise.resolve()

/** 自动建索引要求的最小剩余磁盘（索引本身会占空间，空间仓库可能很大）。 */
const AUTO_INDEX_MIN_FREE_BYTES = 5 * 1024 * 1024 * 1024
/**
 * 项目级索引状态缓存时长。
 * 每次 statusForProject 要为每个成员跑一次 `codegraph status`（实测 21 次调用约 4 秒），
 * 而项目页在轮询它；不缓存会让容器持续 spawn CLI 进程。
 */
const PROJECT_STATUS_TTL_MS = 20000

/** 剩余磁盘字节数（平台不支持时返回 null，视为通过）。 */
function freeBytesOf(path: string): number | null {
  try {
    const stats = statfsSync(path)
    return Number(stats.bavail) * Number(stats.bsize)
  } catch {
    return null
  }
}

/** 判断一个空间里正在跑的索引任务。 */
function runningIndexTask(tasks: TaskService, spaceId: string): TaskView | undefined {
  return tasks.running().find((task) => task.kind === 'codegraph.index' && task.spaceId === spaceId)
}

/** 成员目录列表（空间已准备时才有意义）。 */
function memberDirs(project: ProjectView, space: SpaceView): MemberDir[] {
  if (!space.root) return []
  return project.members.map((member) => ({ alias: member.alias, dir: join(space.root as string, member.alias) }))
}

/**
 * 创建索引编排服务。
 * @param deps - 项目与任务服务
 * @returns 索引编排能力
 */
export function createCodegraphFacade(deps: CodegraphDeps): CodegraphFacade {
  // 全局串行队列：codegraph 的索引库有 SQLite 写锁，两个任务同时跑会 database is locked
  const waiters: Array<() => void> = []
  let indexBusy = false
  const acquireIndexSlot = (): Promise<void> => new Promise((resolve) => {
    if (!indexBusy) {
      indexBusy = true
      resolve()
      return
    }
    waiters.push(resolve)
  })
  const releaseIndexSlot = (): void => {
    const next = waiters.shift()
    if (next) next()
    else indexBusy = false
  }

  const findSpace = async (projectId: string, spaceId: string): Promise<{ project: ProjectView; space: SpaceView }> => {
    const projects = await deps.projects().state()
    const project = projects.find((item) => item.id === projectId)
    if (!project) throw new Error('项目不存在：' + projectId)
    const space = project.spaces.find((item) => item.id === spaceId)
    if (!space) throw new Error('分支空间不存在：' + spaceId)
    return { project, space }
  }

  const statusOf = async (project: ProjectView, space: SpaceView): Promise<SpaceIndexStatus> => {
    const dirs = memberDirs(project, space)
    if (dirs.length === 0) {
      return { members: [], indexedCount: 0, memberCount: 0, available: false, detail: '空间尚未准备', indexStatus: 'none' }
    }
    const live = await spaceIndexStatus(dirs)
    const running = runningIndexTask(deps.tasks(), space.id) !== undefined
    let indexStatus: 'none' | 'indexing' | 'ready' | 'stale'
    if (running) {
      indexStatus = 'indexing'
    } else if (live.indexedCount < live.memberCount || live.memberCount === 0) {
      indexStatus = 'none'
    } else {
      // 有索引：比较成员仓库最新提交与索引时间，落后即过期
      const indexedAt = space.indexedAt ? Date.parse(space.indexedAt) : NaN
      const heads = await Promise.all(dirs.map((dir) => headInfo(dir.dir).catch(() => undefined)))
      const newestCommit = heads.reduce((latest, head) => {
        const at = head?.committedAt ? Date.parse(head.committedAt) : NaN
        return Number.isFinite(at) && at > latest ? at : latest
      }, 0)
      indexStatus = Number.isFinite(indexedAt) && newestCommit > indexedAt ? 'stale' : 'ready'
    }
    return { ...live, indexStatus }
  }

  /** 全局单飞：任何空间正在索引时复用该任务，避免多空间并发索引拖慢会话。 */
  const runningAnyIndex = (): TaskView | undefined =>
    deps.tasks().running().find((task) => task.kind === 'codegraph.index')

  const start = async (projectId: string, spaceId: string, mode?: CodegraphIndexMode): Promise<TaskView> => {
    const { project, space } = await findSpace(projectId, spaceId)
    const dirs = memberDirs(project, space)
    if (dirs.length === 0) throw new Error('分支空间尚未准备，无法建索引')
    // 只复用同一空间的任务；其他空间的任务交给全局队列排队，不能被吞掉
    const existing = runningIndexTask(deps.tasks(), spaceId)
    if (existing) return existing
    const tasks = deps.tasks()
    // 索引状态变了，清掉项目级缓存，避免界面 8 秒内仍显示旧覆盖率
    projectStatusCache.delete(projectId)
    await deps.projects().setIndexState(projectId, spaceId, { indexStatus: 'indexing' })
    return tasks.start(
      // 互斥键：同一空间同一时间只跑一个索引任务（检查-启动之间可能有并发）
      { kind: 'codegraph.index', title: `建立代码索引 · ${space.branch}`, projectId, spaceId, key: `codegraph:${spaceId}` },
      async (handle) => {
        handle.report('排队等待其他索引任务完成…', 0, dirs.length)
        await acquireIndexSlot()
        try {
          let done = 0
          const total = dirs.length
          for (const member of dirs) {
            if (handle.cancelled) return
            const current = await spaceIndexStatus([member])
            const memberMode: CodegraphIndexMode = mode ?? (current.indexedCount > 0 ? 'update' : 'create')
            handle.report(
              memberMode === 'create'
                ? `${member.alias}：全量建立索引，大仓库需要几分钟（${done + 1}/${total}）`
                : `${member.alias}：增量更新索引（${done + 1}/${total}）`,
              done,
              total,
            )
            // 旧实例/其他工具可能仍持有索引库锁：遇到 locked 退避重试，最多 3 次
            for (let attempt = 0; ; attempt += 1) {
              try {
                await runIndex(member.dir, memberMode, (line) => {
                  handle.report(`${member.alias}（${done + 1}/${total}）：${line.slice(0, 120)}`, done, total)
                })
                break
              } catch (error) {
                const message = error instanceof Error ? error.message : String(error)
                if (attempt >= 2 || !/database is locked/i.test(message)) throw error
                const waitMs = 3000 * (attempt + 1)
                handle.report(`${member.alias}：索引库被占用，${Math.round(waitMs / 1000)} 秒后重试`, done, total)
                await new Promise((resolve) => setTimeout(resolve, waitMs))
              }
            }
            done += 1
            handle.report(`${member.alias} 完成（${done}/${total}）`, done, total)
          }
          const finalStatus = await spaceIndexStatus(dirs)
          // 校验：真的有内容才算完成。init 中途失败会留下空库并"正常退出"，
          // 若不校验就会把 3/3 就绪写进状态，而语义检索其实查不到任何东西。
          const empty = finalStatus.members.filter((member) => !member.indexed).map((member) => member.alias)
          if (empty.length > 0) {
            const hasAny = finalStatus.indexedCount > 0
            await deps.projects().setIndexState(projectId, spaceId, { indexStatus: hasAny ? 'stale' : 'none' })
            throw new Error(`索引未建立完成（${empty.join('、')} 没有实际内容，可能是仓库过大或进程被中断），请重试`)
          }
          const first = finalStatus.members[0]
          await deps.projects().setIndexState(projectId, spaceId, {
            indexStatus: 'ready',
            indexedAt: new Date().toISOString(),
            ...(first?.files !== undefined ? { indexFiles: first.files } : {}),
            ...(first?.symbols !== undefined ? { indexSymbols: first.symbols } : {}),
          })
          handle.succeed(`索引已就绪（${done}/${total} 个仓库）`)
        } catch (error) {
          // 失败不留"索引中"的假状态：已有索引记为 stale，没有则回到 none
          const hasIndex = (await spaceIndexStatus(dirs)).indexedCount > 0
          await deps.projects().setIndexState(projectId, spaceId, { indexStatus: hasIndex ? 'stale' : 'none' })
          throw error
        } finally {
          releaseIndexSlot()
        }
      },
    )
  }

  /** 项目级状态缓存：projectId → { at, value }。索引任务进行中时不缓存，保证进度实时。 */
  const projectStatusCache = new Map<string, { at: number; value: Array<SpaceIndexStatus & { spaceId: string; branch: string }> }>()

  return {
    async statusForProject(projectId: string): Promise<Array<SpaceIndexStatus & { spaceId: string; branch: string }>> {
      const projects = await deps.projects().state()
      const project = projects.find((item) => item.id === projectId)
      if (!project) throw new Error('项目不存在：' + projectId)
      const cached = projectStatusCache.get(projectId)
      if (cached && Date.now() - cached.at < PROJECT_STATUS_TTL_MS) return cached.value
      // 各空间并行巡检：原来串行遍历 7 个空间，每个空间要跑一次 codegraph status，
      // 打开项目页要等 40 秒以上；并行后约等于最慢的那个空间。
      const list = await Promise.all(project.spaces.map(async (space) => ({
        ...(await statusOf(project, space)),
        spaceId: space.id,
        branch: space.branch,
      })))
      // 有索引在跑就不缓存，避免把进度冻结 8 秒
      const indexing = deps.tasks().running().some((task) => task.kind === 'codegraph.index')
      if (!indexing) projectStatusCache.set(projectId, { at: Date.now(), value: list })
      return list
    },
    async status(projectId: string, spaceId: string): Promise<SpaceIndexStatus & { branch: string }> {
      const { project, space } = await findSpace(projectId, spaceId)
      return { ...(await statusOf(project, space)), branch: space.branch }
    },
    start,
    maybeAutoIndex(projectId: string, spaceId: string): void {
      // 默认自动建索引（全局一次只跑一个任务，其余排队）；设 ASC_AUTO_INDEX=0 可关闭。
      // 注意：索引 7GB 级仓库要几分钟，期间容器被重建会中断并留下半成品库（已有自愈与退避）。
      if (process.env.ASC_AUTO_INDEX === '0') return
      void (async () => {
        try {
          const { project, space } = await findSpace(projectId, spaceId)
          if (space.status !== 'ready') return
          if (runningIndexTask(deps.tasks(), spaceId)) return
          // 重启残留：状态停在 indexing 但没有在跑的任务，说明上次容器被重建打断了索引。
          // 大仓库全量重建要几十分钟，而部署会再打断它 —— 自动重来只会陷入死循环
          // （实测 5.6.x/private-java 就这样连续失败），所以只标记为过期，交给用户挑时机重建。
          if (space.indexStatus === 'indexing') {
            await deps.projects().setIndexState(projectId, spaceId, { indexStatus: 'stale' })
            return
          }
          const status = await statusOf(project, space)
          if (status.memberCount === 0) return
          if (status.indexedCount >= status.memberCount) return
          // 磁盘不足时跳过自动索引：不要因为后台索引把磁盘打满而影响代码更新与会话
          const free = freeBytesOf(space.root ?? '')
          if (free !== null && free < AUTO_INDEX_MIN_FREE_BYTES) return
          // 退避：同一空间最近 10 分钟内失败过就不再自动重试，避免失败任务刷屏
          const recentFailure = deps.tasks().list().some((task) =>
            task.kind === 'codegraph.index'
            && task.spaceId === spaceId
            && task.status === 'failed'
            && task.finishedAt !== undefined
            && Date.now() - Date.parse(task.finishedAt) < 10 * 60 * 1000)
          if (recentFailure) return
          await start(projectId, spaceId)
        } catch {
          // 自动建索引失败不影响空间使用
        }
      })()
    },
    async query(projectRef: string, branch: string, args: string[]): Promise<{ output: string; dir: string }> {
      const projects = await deps.projects().state()
      const project = projects.find((item) => item.id === projectRef) ?? projects.find((item) => item.name === projectRef)
      if (!project) throw new Error('找不到项目：' + projectRef)
      const space = project.spaces.find((item) => item.branch === branch)
      if (!space) throw new Error(`项目 ${project.name} 下没有分支空间：${branch}`)
      const status = await statusOf(project, space)
      const blocker = indexQueryBlocker(status.indexStatus)
      if (blocker) throw new Error(blocker)
      const target = memberDirs(project, space).find((dir) => existsSync(join(dir.dir, '.codegraph')))
      if (!target) throw new Error('没有找到已建索引的成员仓库')
      const output = await runCodegraphQuery(target.dir, args)
      return { output, dir: target.alias }
    },
    async resolveSpace(projectRef: string, branch: string): Promise<{ project: ProjectView; space: SpaceView }> {
      const projects = await deps.projects().state()
      const project = projects.find((item) => item.id === projectRef)
        ?? projects.find((item) => item.name === projectRef)
      if (!project) throw new Error('找不到项目：' + projectRef)
      const space = project.spaces.find((item) => item.branch === branch)
      if (!space) throw new Error(`项目 ${project.name} 下没有分支空间：${branch}`)
      return { project, space }
    },
  }
}
