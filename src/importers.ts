/**
 * 远程仓库导入：Bitbucket Server（含 Data Center）与 GitHub（含企业版）。
 *
 * 只读 REST 调用，凭证以请求头传递，不进入日志或 URL。
 */
import type { GitAuth } from './git.ts'

/** 支持的平台。 */
export type ImportProvider = 'bitbucket' | 'github'

/** 一个可导入的仓库。 */
export interface ImportRepo {
  /** 展示名（含项目/组织前缀）。 */
  name: string
  /** HTTP 克隆地址。 */
  remoteUrl: string
}

/** Bitbucket 中的一个项目。 */
export interface ImportProject {
  key: string
  name: string
}

/** 请求超时（毫秒）。 */
const REQUEST_TIMEOUT_MS = 20_000
/** 分页上限，避免超大实例拖死请求。 */
const MAX_PAGES = 10
/** 单页条数。 */
const PAGE_SIZE = 100

/**
 * 规范化用户输入的基础地址。
 * 允许粘贴 `https://host/dashboard`、`https://host/projects/CL` 这类页面地址。
 * @param input - 用户输入
 * @param provider - 平台
 * @returns 该平台的 API 根地址
 */
export function normalizeBase(input: string, provider: ImportProvider): string {
  const raw = input.trim()
  if (raw === '') throw new Error('请填写服务器地址')
  let url: URL
  try {
    url = new URL(raw.includes('://') ? raw : `https://${raw}`)
  } catch {
    throw new Error(`地址格式不正确: ${raw}`)
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('只支持 http/https 地址')
  if (provider === 'github') {
    if (url.hostname === 'github.com' || url.hostname === 'www.github.com' || url.hostname === 'api.github.com') {
      return 'https://api.github.com'
    }
    return `${url.origin}/api/v3`
  }
  return url.origin
}

/**
 * 组装鉴权头：有用户名走 Basic（Bitbucket/GitHub 均支持），否则用 Bearer。
 * @param credential - 凭证
 */
export function buildAuthHeaders(credential: GitAuth): Record<string, string> {
  const token = credential.password
  if (credential.username && credential.username.trim() !== '') {
    const encoded = Buffer.from(`${credential.username}:${token}`, 'utf8').toString('base64')
    return { authorization: `Basic ${encoded}` }
  }
  return { authorization: `Bearer ${token}` }
}

/**
 * 发起一次 JSON 请求并把常见失败翻译成可读错误。
 * @param url - 完整地址
 * @param headers - 鉴权头
 */
async function requestJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json', ...headers },
      signal: controller.signal,
    })
    if (response.status === 401) throw new Error('凭证无效或已过期')
    if (response.status === 403) throw new Error('凭证权限不足（需要读取项目与仓库的权限）')
    if (response.status === 404) throw new Error('地址或项目不存在，或凭证无权访问')
    if (!response.ok) throw new Error(`平台返回 ${response.status}`)
    return (await response.json()) as T
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('请求超时，检查服务器地址是否可达')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/** Bitbucket REST 分页响应。 */
interface BitbucketPage<T> {
  values?: T[]
  nextPageStart?: number
  isLastPage?: boolean
}

/**
 * 拉取 Bitbucket 项目列表。
 * @param baseUrl - 用户输入
 * @param credential - 凭证
 */
export async function listBitbucketProjects(baseUrl: string, credential: GitAuth): Promise<ImportProject[]> {
  const base = normalizeBase(baseUrl, 'bitbucket')
  const headers = buildAuthHeaders(credential)
  const projects: ImportProject[] = []
  let start = 0
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const payload = await requestJson<BitbucketPage<{ key: string; name: string }>>(
      `${base}/rest/api/1.0/projects?limit=${PAGE_SIZE}&start=${start}`,
      headers,
    )
    for (const item of payload.values ?? []) projects.push({ key: item.key, name: item.name })
    if (payload.isLastPage || payload.nextPageStart === undefined) break
    start = payload.nextPageStart
  }
  return projects.sort((left, right) => left.key.localeCompare(right.key))
}

/** Bitbucket 仓库条目（只取需要的字段）。 */
interface BitbucketRepo {
  slug: string
  name: string
  links?: { clone?: Array<{ name?: string; href?: string }> }
}

/**
 * 拉取 Bitbucket 某项目下的仓库。
 * @param baseUrl - 用户输入
 * @param projectKey - 项目 key（如 CL）
 * @param credential - 凭证
 */
export async function listBitbucketRepos(
  baseUrl: string,
  projectKey: string,
  credential: GitAuth,
): Promise<ImportRepo[]> {
  const base = normalizeBase(baseUrl, 'bitbucket')
  const headers = buildAuthHeaders(credential)
  const key = projectKey.trim().toUpperCase()
  if (!/^[A-Z0-9_~-]{1,64}$/.test(key)) throw new Error(`项目 key 不合法: ${projectKey}`)
  const repos: ImportRepo[] = []
  let start = 0
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const payload = await requestJson<BitbucketPage<BitbucketRepo>>(
      `${base}/rest/api/1.0/projects/${encodeURIComponent(key)}/repos?limit=${PAGE_SIZE}&start=${start}`,
      headers,
    )
    for (const item of payload.values ?? []) {
      const clone = item.links?.clone ?? []
      const http = clone.find((entry) => entry.name === 'http')?.href ?? clone[0]?.href
      if (!http) continue
      repos.push({ name: `${key}/${item.slug}`, remoteUrl: http })
    }
    if (payload.isLastPage || payload.nextPageStart === undefined) break
    start = payload.nextPageStart
  }
  return repos.sort((left, right) => left.name.localeCompare(right.name))
}

/**
 * 拉取 GitHub 仓库（用户自己的 + 组织内的）。
 * @param baseUrl - 用户输入（github.com 或企业版地址）
 * @param credential - 凭证
 * @param org - 可选组织名；留空时拉当前账号可见仓库
 */
export async function listGithubRepos(
  baseUrl: string,
  credential: GitAuth,
  org?: string,
): Promise<ImportRepo[]> {
  const base = normalizeBase(baseUrl, 'github')
  const headers = buildAuthHeaders(credential)
  const target = org && org.trim() !== ''
    ? `${base}/orgs/${encodeURIComponent(org.trim())}/repos?per_page=${PAGE_SIZE}`
    : `${base}/user/repos?per_page=${PAGE_SIZE}&affiliation=owner,collaborator,organization_member`
  const payload = await requestJson<Array<{ full_name: string; clone_url: string; archived?: boolean }>>(target, headers)
  const repos: ImportRepo[] = []
  for (const item of payload ?? []) {
    if (item.archived) continue
    repos.push({ name: item.full_name, remoteUrl: item.clone_url })
  }
  return repos.sort((left, right) => left.name.localeCompare(right.name))
}
