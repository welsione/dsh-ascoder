# dsh-ascoder

> **English** — A DeepSeek Harness plugin that gives an engineering team a shared, self-learning memory for code questions: it retrieves the team's own terminology, past conclusions and hard-won lessons before answering, then lets the session write new knowledge back for the next session.

把**团队的代码理解记忆**装进 DeepSeek Harness：问代码问题前先查团队术语、历史结论和踩坑经验，答完把新结论沉淀回去，下个会话自动生效。同时提供项目 / 分支空间管理与角色化回答风格。

DSH 已经自带会话、Agent、LLM 适配、工具系统和 Web UI，所以这里只做 DSH 没有的那部分。

## 能力

| 能力 | 说明 |
|---|---|
| **团队知识层** | 检索 / 写入 / 盘点 / 删除团队知识（业务术语、机制结论、踩坑经验）。`injectKnowledge` 开启时摘要注入每轮系统提示词。 |
| **项目与分支空间** | 项目 = 仓库成员集合；分支空间 = 成员仓库按选定分支物化出的代码目录，一个空间一个 DSH workspace，**会话按分支隔离**。 |
| **角色化回答风格** | 开发者 / 产品经理 / 测试工程师三种内置视角，可在设置里自定义风格与回答结构，会话输入框旁随时切换。 |
| **仓库管理与批量导入** | 登记本地路径或远程地址；支持从 Bitbucket Server / GitHub（含企业版）批量导入仓库，凭证加密保存。 |
| **代码定位工具** | 代码检索、文件骨架（只要声明与行号）、提交摘要、分支候选打分、空间快照，以及可选的 CodeGraph 语义索引。 |

**不做**：会话与流式管理、LLM provider 管理、代码写入、代码图谱自建（走可选的外部 CodeGraph CLI）。

## 安装

```sh
git clone https://github.com/welsione/dsh-ascoder.git
cd dsh-ascoder && npm install && npm run build && npm pack
dsh plugin --profile web add ./dsh-ascoder-*.tgz
```

从 npm 安装（发布后）：

```sh
dsh plugin --profile web add dsh-ascoder
```

卸载：

```sh
dsh plugin --profile web remove dsh-ascoder
```

要求：Node.js `>= 22`；DSH 版本范围见 `package.json` 的 `peerDependencies`。

## 快速开始

```sh
dsh --profile web
```

1. 首页点「新建项目」，填名称；
2. 进项目「管理」→ 添加仓库（本地路径或远程地址）；
3. 「新建分支空间」→ 选分支 → 等待准备完成；
4. 进入空间提问，例如「这个项目的『项目空间』概念是什么？」——Agent 会先 `knowledge_search`，答完可用 `knowledge_save` 沉淀结论。

## 概念

三层，每层只做一件事：

| 层 | 在哪 | 做什么 |
|---|---|---|
| 项目 | 首页 | 项目容器：名称 + 描述 + 仓库成员 |
| 分支空间 | 项目页 | 每个成员选定一个分支后物化出的代码目录，DSH workspace 指向它 |
| 会话 | 分支空间页 | 在该空间的代码上提问，Agent 同时看到所有成员仓库 |

分支空间是显式对象（`Project.spaces[]`），不是项目上的一个字段：

- 物化路径 `<dataDir>/<项目>-<短id>/<分支>/<别名>/`
- 状态可见：`待准备` / `就绪` / `失败`（失败带具体原因，如「分支不存在」）
- 同一分支重复创建是幂等的，直接复用；删除空间只删空间目录，不动仓库本体

**仓库管理**是独立的全局注册表（首页「仓库」图标）。同一个路径重复登记会复用记录；仍被项目引用的仓库不允许删除。

## 配置

| 字段 | 默认值 | 说明 |
|---|---|---|
| `style` | `auto` | 回答风格：`auto` 按环境线索推断（回退 developer），或固定 `developer` / `product_manager` / `tester` |
| `dataDir` | `ascoder` | 数据目录，相对路径挂到 `$DSH_HOME` 下（如 `~/.dsh/ascoder`），绝对路径原样使用 |
| `injectKnowledge` | `true` | 是否把团队知识摘要注入每轮系统提示词 |
| `adminPassword` | 见 `cordis.patch.yml` | 打开 DSH 设置页的密码，**部署前必须改**，详见「安全模型」 |

在 profile 的 `cordis.patch.yml` 覆盖：

```yaml
- update:
    - id: dsh-ascoder
      config:
        style: tester
        injectKnowledge: true
```

## 工具

Agent 侧共 18 个工具，按用途分组（`ascoder_codegraph_*` 需要已建索引）：

**知识层**

| 工具 | 作用 |
|---|---|
| `knowledge_search` | 检索术语 / 结论 / 踩坑经验 |
| `knowledge_save` | 写入一条知识，相同 `kind`+`term` 覆盖更新 |
| `knowledge_list` / `knowledge_forget` | 盘点 / 删除不再成立的知识 |

**项目与空间**

| 工具 | 作用 |
|---|---|
| `ascoder_project_list` / `ascoder_project_create` / `ascoder_project_member_add` | 项目与仓库成员 |
| `ascoder_space_create` / `ascoder_sync_space` | 建空间 / 更新代码（只读约定下唯一改动工作区的途径） |
| `ascoder_set_space_branches` / `ascoder_branch_candidates` | 调整成员分支映射 / 列候选分支（按同名、用途、版本号、最近提交打分） |

**读代码**

| 工具 | 作用 |
|---|---|
| `ascoder_code_search` | 跨成员仓库检索（内部 `git grep`，只搜已跟踪文件） |
| `ascoder_file_outline` | 文件骨架：类 / 接口 / 方法 / 导出函数与行号，不返回实现 |
| `ascoder_commit_detail` | 提交摘要：sha、作者、时间、是否合并、改动文件清单 |
| `ascoder_space_snapshot` | 各成员的当前分支、HEAD 短 sha、最近提交、脏文件数、领先/落后上游数 |

**CodeGraph 语义索引（可选）**

| 工具 | 作用 |
|---|---|
| `ascoder_codegraph_status` / `ascoder_codegraph_index` | 查看索引覆盖率 / 建立或更新索引（后台任务） |
| `ascoder_codegraph_query` | 在语义索引里查符号或按主题探索代码 |

**任务与事件**

| 工具 | 作用 |
|---|---|
| `ascoder_task_list` | 后台任务进度、失败原因与最近事件；排查「刚才那次准备/更新成功了吗」 |

准备空间、更新代码、建索引都是**后台任务 + 进度轮询**，不阻塞请求；任务页（首页「任务」图标）可看运行中任务、最近任务和事件流。

## 安全模型

**仓库凭证**（设置 → 仓库凭证）

| 项 | 实现 |
|---|---|
| 存储 | 令牌以 AES-256-GCM 加密落盘，密钥为 `<dataDir>/credentials.key`（0600，首次自动生成） |
| 回显 | 接口只返回掩码 `••••xxxx`，明文不离开宿主进程 |
| git 注入 | 用 `GIT_ASKPASS` 脚本从环境变量取用户名/令牌，**不把令牌拼进 URL，也不写进 remote 配置** |
| 失败兜底 | 未配置 askpass 时 git 走 `GIT_TERMINAL_PROMPT=0` 直接失败，不会卡在交互提示 |

**设置页密码门**

- 首页「设置」、侧栏品牌按钮、`⌥⌘,` 快捷键都会先弹密码框
- 密码在宿主侧校验；存储用 scrypt 加盐哈希，只存哈希与盐；连续 5 次输错锁定 30 秒
- 出厂默认值为 `change-me`，**部署前务必在 `cordis.patch.yml` 改掉**
- 忘了密码：把 `adminPassword` 改回已知值，删掉 `ascoder_security` 存储记录后重启

> 这是**界面访问门，不是安全边界**。DSH 自己的连接 token 依然保护 API；密码只是阻止不知情的人在本机 UI 里点开设置页。多用户场景请在前面加 VPN / 反向代理认证 / SSO。

**只读默认值**

Ascoder 是代码理解工具，不写业务代码，建议在 profile 里把默认权限设为仅可查看：

```yaml
- id: permission
  name: "@deepseek-ai/dsh-permission-presets"
  config:
    defaultPreset: read-only
    presets:            # patch 会整块替换 config，必须写全
      read-only:   { sandbox: read-only, approval: ask, name: read-only }
      workspace-write: { sandbox: workspace-write, approval: ask, name: workspace-write }
- id: sandbox-policy
  name: "@deepseek-ai/dsh-sandbox-policy"
  config:
    mode: read-only
    workspaceRoot: !!js process.cwd()
```

只读下仍可更新代码：人通过分支空间的「更新代码」（`git fetch` + `git pull --ff-only`，只快进），Agent 通过 `ascoder_sync_space`（同一实现）。

**插件自身的数据与网络边界**

- 文件：只读写 `dataDir` 下的知识库、项目/仓库注册表、凭证与设置记录
- 网络：只在主动添加远程仓库、同步或克隆时调用本机 `git`；插件自身不发其他请求
- 子进程：以 `execFile('git', [参数数组])` 调用，不经 shell；分支名与远程地址做形态校验
- 系统提示词：注册 1 个 section（回答风格）+ 1 个动态 context（知识摘要），不覆盖宿主 prompt

## 部署（容器）

```dockerfile
FROM node:22-slim
RUN npm i -g @deepseek-ai/dsh
COPY dsh-ascoder-0.45.79.tgz /opt/ascoder/
COPY profile /root/.dsh/profiles/ascoder
RUN cd /root/.dsh/profiles/ascoder && \
    sed -i 's#"dsh-ascoder": ".*"#"dsh-ascoder": "file:/opt/ascoder/dsh-ascoder-0.45.79.tgz"#' package.json && \
    pnpm install
VOLUME ["/root/.dsh"]
EXPOSE 8443
CMD ["dsh", "--profile", "ascoder", "--host", "172.17.0.2", "--port", "8443", \
     "--no-open", "--tls-cert", "/certs/fullchain.pem", "--tls-key", "/certs/privkey.pem", \
     "--public-url", "https://ascoder.example.com/", "--trusted-host", "ascoder.example.com"]
```

几个部署要点：

- `--host` 只接受**具体网卡地址**，不接受 `0.0.0.0`。绑容器网卡 IP 由 Docker `-p 443:8443` 映射，或同容器起反向代理监听 0.0.0.0 代理到 `127.0.0.1:8443`。
- 用域名或局域网 IP 访问时必须加 `--trusted-host`，否则 `/api` 会被信任围栏拒绝。
- 浏览器系统通知只在安全上下文（`https://` 或 `localhost`）可用；纯 HTTP 局域网访问时通知会被禁用。
- 持久化挂载 `$DSH_HOME`（默认 `/root/.dsh`）即可带走全部状态。`<dataDir>/projects/` 是克隆出来的代码副本，体积可能很大，建议单独挂盘或定期清理。

## 开发

```sh
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest，30 个测试文件 / 123 个用例
npm run build       # tsdown → lib/
npm pack --dry-run  # 发布预检
```

浏览器半是单文件、无构建：`web/client.js` 直接随包下发。

发布前四连：`typecheck` → `test` → `build` → `pack`。

## 已知限制

- **必须重建 `lib/`**：`lib/` 不入库，克隆后不跑 `npm run build` 就没有产物。
- **依赖 DSH 内部结构**：品牌替换、文案补丁、运行态图标接管依赖宿主 DOM 与 CSS 类名（如 `[data-chat-running]`），宿主改版可能失效。
- **禁用清单只能关叶子插件**：`ui-sidebar-right` / `ui-commands` / `ui-file-drag` / `ui-plugin-manager` 是基建，禁用会让整页加载失败。`presets/ascoder-only.patch.yml` 是已验证零断裂的版本。
- **宿主工具无法从 profile 层禁用**：工具行在 agent preset 的 include 里内嵌多份，按 id 只改得到一份；强行禁用会让新会话报 `agent-preset/invalid`。
- **旧会话保留创建时的权限**：改配置为只读后，只有**新建**的会话才是只读。
- **多实例共存**：同一 profile 起多个实例时，后启动的实例可能打不开共享存储而退回本地文件，两块存储互不相通（任务页顶部会告警）。

## 故障排查

- 层没生效：`dsh --profile web --dump-config | grep dsh-ascoder`，确认出现 `# == dsh-ascoder`。
- 工具没出现：确认 profile 里有 `tools` 与 `systemPrompt` 服务；插件 `inject = ['tools', 'systemPrompt']`。
- 知识库位置：有 storage hub 时走 KV 单元；没有时看 `dataDir` 下的 JSON 文件。
- 安装报 `EPERM ... root-owned files`：本机 npm 缓存属主问题，换 `--cache` 或修复属主，与插件无关。

## 许可证

MIT。安全问题请通过仓库的 private advisory 或 issue 报告。

