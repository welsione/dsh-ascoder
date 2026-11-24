# dsh-ascoder 前后端契约（v2）

本文件是宿主半（`src/**`）与浏览器半（`web/**`）之间的唯一契约。两侧独立实现，不得各自扩展字段。

## 1. HTTP API（已鉴权）

宿主通过 `ctx.connection.fetch.register()` 注册，路径一律位于 `/api` 之下。只有同源 owner peer 能访问，其余 403；页面带 cookie，浏览器端直接 `fetch(path, { credentials: 'include' })` 即可。

### GET `/api/ascoder/state`

返回全部项目概览。

```json
{
  "ok": true,
  "data": {
    "projectsDir": "/Users/me/.dsh/ascoder/projects",
    "projects": [
      {
        "id": "uuid",
        "name": "Ascoder",
        "path": "/abs/path/to/repo",
        "remoteUrl": "git@github.com:acme/demo-repo.git",
        "branch": "main",
        "dirty": 0,
        "createdAt": "2026-11-09T05:00:00.000Z",
        "lastSyncAt": "2026-11-09T05:10:00.000Z"
      }
    ]
  }
}
```

`branch` 为 `null` 表示 detached HEAD；`dirty` 为未提交文件数；`lastSyncAt` 可能缺失。

### GET `/api/ascoder/branches?projectId=<id>`

```json
{
  "ok": true,
  "data": {
    "projectId": "uuid",
    "current": "main",
    "detached": false,
    "local": [
      { "name": "main", "current": true, "upstream": "origin/main" },
      { "name": "feat/x", "current": false }
    ],
    "remote": [
      { "name": "origin/main" },
      { "name": "origin/dev" }
    ]
  }
}
```

### POST `/api/ascoder/action`

请求体 `application/json`，`op` 区分操作。响应统一 `{ "ok": true, "data": ... }` 或 `{ "ok": false, "error": "message" }`（HTTP 状态码仍可为 200，前端只看 `ok`）。

| op | 请求字段 | data |
|---|---|---|
| `project.add` | `path?` 本地路径，或 `remoteUrl?` 远程地址；`name?` | 见下 `project.add` |
| `project.remove` | `projectId` | `{ "removed": true }` |
| `project.sync` | `projectId` | `{ "lastSyncAt": "ISO" }` |
| `branch.checkout` | `projectId`, `branch` | `{ "current": "branch" }` |
| `branch.create` | `projectId`, `branch` | `{ "current": "branch" }` |

`project.add` 成功时 `data` 为新增的 Project 对象（与 state 中元素同构）。远程地址会 clone 到 `projectsDir/<slug>`。

错误示例：`{ "ok": false, "error": "not a git repository: /tmp/x" }`。

## 2. 浏览器半（`web/client.js`）

- 无构建步骤：手写单文件，必须自调用
  `window.__ModuleLoader__.load({ id: 'dsh-ascoder/client', factory: (require) => {...} })`，
  工厂返回 `{ apply, inject }`。
- 依赖：`const React = require('react')`；不要 `require` 其他 DSH 包（避免版本耦合）。
- `inject = ['slots']`；通过 `ctx.slots.inject(name, cb)` / `ctx.slots.register({...}, Component)` 注册。
- 样式：自注入 `<style data-plugin="dsh-ascoder">`，不使用行内样式做主题。

### 2.1 品牌插槽

```js
ctx.slots.register({ name: 'sidebar.brand.mark' }, AscoderMark)   // props: { size }
ctx.slots.register({ name: 'sidebar.brand.name' }, AscoderName)
```

品牌行 `ui-brand-official` 由 profile 层禁用，浏览器半只负责 Ascoder 品牌。

另外在 `apply` 里设置：
- `document.title = 'Ascoder'`
- favicon 换成内联 SVG（`<link rel="icon" href="data:image/svg+xml,...">`）
- 注入 CSS 变量覆盖主色（`--dsh-accent` 之类以宿主实际变量为准，需自行探测；探测不到就只做 logo/标题）

### 2.2 项目管理页面

注册设置分区（宿主 `dsh-client-ui-settings-general` 渲染）：

```js
ctx.slots.inject('settings.section', () => ctx.slots.register({
  name: 'settings.section',
  id: 'ascoder-projects',
  order: 40,
  label: () => 'Ascoder 项目',
}, AscoderProjectsSection))
```

组件要求：
- 进入即 `GET /api/ascoder/state`，列出项目（名称、路径、当前分支、脏文件数）。
- 每个项目可展开分支列表（`GET /api/ascoder/branches?projectId=`），点击本地分支即 `branch.checkout`；可新建分支（`branch.create`）。
- 顶部可添加项目（本地路径输入 / 远程地址输入二选一）、刷新、每个项目可同步与移除。
- 三态齐全：加载中 / 空列表（引导添加）/ 错误（显示 `error` 并给重试按钮）。
- 所有按钮 `type="button"`、有可见焦点、`aria-label`；不使用 `transition: all`、不写死颜色以外的样式（用 CSS 变量）。
- 不引入 `any` 概念不适用（纯 JS），但禁止在生产代码里 `console.log` 噪音。

## 3. 字段与命名

- 全 camelCase；id 用 uuid v4。
- 时间一律 ISO 8601 字符串。
- 分支名原样保留（含 `/`），远端分支带 `origin/` 前缀。
