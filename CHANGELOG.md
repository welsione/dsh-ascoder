# Changelog

## 0.45.1

- 修复索引期间无法进入会话：索引动作不再占用全局 busy，行内「进入」/「更多」按钮始终可用（实测索引进行中点「进入」正常打开会话）
- 修复 `codegraph init 退出码 1：database is locked`：索引任务改为全局串行队列（前一个跑完才启动下一个，排队中显示"排队等待其他索引任务完成…"），遇到 locked 自动退避重试最多 3 次
- 修复第二个空间发起索引时被复用成第一个空间任务的问题（现在只复用同一空间的任务）


## 0.43.0

- Mermaid 兜底渲染加固（多 Agent 部署反复丢渲染的原因排查后）：
  - 已有 `window.mermaid` 但不可用（坏的插件全局）时自动改用插件自带运行时
  - 渲染失败后 4 秒自动重试（流式输出先到半截源码的场景）
  - 代码块识别扩展到 `pre` 直接承载文本的结构（不再只认 `pre > code`）
  - 8 秒未渲染时打印可操作告警（含资产路由与版本提示）
- `deploy/smoke.sh` 增加 Mermaid 链路验收：插件版本、`assets/mermaid.min.js`、客户端兜底标记、资产路由 200 且 >1MB
- `docs/deploy-remote.md` 新增「部署验收（多 Agent 部署必读）」；`docs/deployment.md` 增加健康检查指引

## 0.44.1

- 索引不再影响业务：索引进程以 `nice -n 10` 低优先级运行；全局单飞（同一时间只跑一个索引任务，多空间请求复用该任务）；实测索引期间 `/api/ascoder/state` 101–217ms、`space.enter` 正常返回、会话页面与输入框可用
- 维护持久化索引状态 `indexStatus`：`none` / `indexing` / `ready` / `stale`（成员仓库最新提交晚于索引时间即过期），失败不会残留"索引中"
- `更新代码` 成功后对已就绪空间自动排一次增量索引，保持索引与代码一致
- Agent 门禁：新增 `ascoder_codegraph` 工具（query / explore / node / callers / callees / impact / files），**只有索引 ready 时可用**，未就绪返回"先建索引/等索引完成/索引已过期"的明确提示
- 空间徽章区分 索引中 / 已索引 / 需更新索引
- 单测覆盖索引门禁文案（indexQueryBlocker）


## 0.43.0

- 任务页改进：种类筛选（全部 / 准备空间 / 更新代码 / **代码索引** / 失败）+ 每页 10 条分页；任务文案补上 `codegraph.index → 代码索引`
- 存储兜底告警：任一 KV 单元打不开退回文件存储时，状态接口返回 `storage.mode = file`，任务页顶部提示「与另一实例不互通」
- 任务接口支持 `?limit=`（默认 20，上限 200）与 `kind` / `status` 过滤
- git 报错友好化：`fatal: couldn't find remote ref refs/heads/x` → 「远端没有分支 x：确认分支名，或先更新仓库后再试」


## 0.42.0

- CodeGraph 索引集成：
  - 分支空间首次准备成功后自动排后台索引任务（`codegraph.index`），不阻塞任何操作
  - 空间页每个分支显示索引徽章：运行中小鸟 + 「索引中」，完成后「已索引」（hover 显示文件/节点数）；行菜单新增「建立索引 / 更新索引」
  - 新增接口 `GET /api/ascoder/codegraph?projectId=`（按空间返回覆盖率、文件数、节点数、边数）与 `codegraph.index` 动作
  - Agent 工具：`ascoder_codegraph_status`（覆盖率与统计）、`ascoder_codegraph_index`（后台建/更新索引，返回 taskId）
  - 实测：develop/master/ci 三个空间全部索引完成（674/613/512 文件，17k/15.6k/13k 节点）
- 修复并发提交丢掉的 `menuKeyboard`（引用 5 处、定义缺失，导致一点空间菜单整个浮层崩溃）
- 修复索引状态加载 hook 在 project 声明前取值导致永远跳过的问题


## 0.39.5

- 恢复 Mermaid **自包含兜底渲染**：部署里没有 `dsh-mermaid` 时也能把 ```mermaid 代码块渲成图
  - 优先复用已有的 `window.mermaid`（如 dsh-mermaid），无则按需加载插件自带 `assets/mermaid.min.js`
  - 只有页面出现 mermaid 块时才加载资源，首屏无额外开销
  - `package.json` 的 `files` 补上 `assets/mermaid.min.js`（之前漏打包，导致路由回退成占位脚本）
- 单测 42 个

## 0.39.2

- 工具页列出**全部** Agent 工具：除全局视图外，逐个 Agent 预设借用作用域读取其工具视图（bash / read / grep / glob / edit 等 35 个宿主工具），去重后共 49 个
- 新增「命令行工具」卡片：探测 `git`、`codegraph` 的可用性与版本；codegraph 显示分支空间的 `.codegraph` 索引覆盖率（0/3），并说明这些 CLI 由宿主 shell 工具调用
- 工具行显示来源（插件 / 宿主 / 预设名）


## 0.38.0

- 设置页新增「工具」分区：可见工具清单（Ascoder 插件 / 宿主内置分组）、调用次数、失败次数、最近使用、耗时、最近失败原因
- Ascoder 插件工具可在此启停：停用后调用直接报「已在 Ascoder 设置中停用」；统计可单个或整体清零
- 工具调用统计由 `ToolUsageStore` 落盘（KV `ascoder_tool_usage`），工具注册时统一套上 `createInstrumentedTool`
- 新增单测覆盖统计累加、启停持久化、清零与包装器行为


## 1.0.9-remote

- 身份完全收敛到 Ascoder：profile 里关掉宿主的 `harness:identity`（`includeHarnessIdentity: false`）、停用注入实现 checkout/Web GUI 描述的 `harness-dev-context`、`web-runtime.surfaceContext=false`，`personaPrefix` 换成 Ascoder 的身份说明；插件自身提示词也不再出现平台名，避免模型在思考里复述。实测新会话系统提示 0 处提及宿主，回答为「我是 Ascoder，你的代码助手」
- 修复插件升级不生效：pnpm 对「同版本 + 同 file: 路径」会复用商店旧内容，entrypoint 升级时先删 `node_modules/dsh-ascoder` 再 `pnpm install --prod --force`
- 回归测试覆盖身份提示词不含平台名

## 1.0.8-remote

- 分支搜索改为「相关度 + 最近提交时间」排序：后端分支列表按各自最近提交倒序（`for-each-ref --format=%(committerdate:unix)`），前端在过滤后按 完全匹配 → 末段匹配（`v4.3.x/release`）→ 前缀 → 段前缀 → 段包含 → 任意位置 打分，同分保持时间顺序
- 效果：搜索 `release` 由原来的 `backup/pre-release_20240119…` 变为 `release` → `v4.3.x/release` → `pre-release/5.6.x` …
- 回归测试覆盖远端分支的 `committedAt` 读取

## 1.0.7-remote

- 修复「切换分支」菜单报 `fatal: ambiguous argument 'HEAD'`：旧版仓库克隆的 HEAD 指向不存在的分支（refs/heads 为空），`git rev-parse --abbrev-ref HEAD` 直接报错；`currentBranch` 改为先 `symbolic-ref` 再退回 `rev-parse`，读不出来的情况返回 null
- 分支菜单支持搜索与截断：旧仓库有上万条历史分支，原先一次性渲染 20000+ 行；现在默认最多 40 条分支 / 20 个空间，超出提示「还有 N 个，输入关键词继续筛选」，分支数超过 40 时显示搜索框
- 新增回归测试：unborn HEAD 仓库也能读出分支并列出远端引用

## 1.0.6-remote

- 新增共享对象库：`ASC_LOCAL_CLONE=reference` 时用 `git clone --reference <源> file://<源>` 物化成员，空间体积从 9–11G 降到约 350M（旧仓库单库 8G，多空间重复拷贝是磁盘杀手）
- 修正：本地路径克隆会走 git local 优化，`--reference` 只写 alternates 文件而不省空间，必须走 `file://` 传输协议
- 新增 `sharedObjectsSource()` 与 `tests/local-clone.spec.ts`（用不可压缩数据断言对象确实被借用）
- `deploy/.env.example`、`docs/deploy-remote.md` 补充开关与限制（空间依赖源仓库目录存在）

## 1.0.5-remote

- 修复 askpass 脚本 bug：`printf %s\n "$ASC_USER"` 的格式串没加引号，shell 把 `\n` 转义成字面 `n`，git 收到的用户名/密码末尾各多一个 `n`，导致所有私有仓库认证失败（`Authentication failed`）
- 准备/同步空间时把成员目录的 `origin` 指向仓库真实远端并设置上游分支（本地克隆原本指向旧版仓库目录，`git pull` 报 "no such ref was fetched"）
- 存量空间在「更新代码」时自动纠正 origin，无需重新准备
- 新增 `tests/askpass.spec.ts` 回归测试（凭据必须原样输出）
- `docs/deploy-remote.md` 补充这两类报错的成因与处理

## 1.0.4-remote

- 修复：旧版 Ascoder 的仓库克隆只有 `refs/remotes/origin/*`（本地无分支、HEAD 无效），本地克隆后准备空间会报 `'origin/x' is not a commit`；现在按「本地分支 → 跟踪分支 → 源克隆引用导入 → 远端抓取」四级回退检出
- `repo.add` 从本地路径登记时自动探测 `remoteUrl`；新增 `repo.remote` 操作给已登记仓库补设远端
- `assertRemoteUrl` 接受 `file://`（内网镜像/本地裸库），仍拒绝选项注入与裸路径
- `deploy/entrypoint.sh` 改用插件包 sha256 标记判断是否需要重装（版本号不变也能升级）
- 新增回归测试 `tests/space-remote-refs.spec.ts`（源克隆只有远端引用、无远端、缺分支三种情况）

## 1.0.3-remote

- 新增 `repo.credential` 操作：给已登记的仓库绑定/解绑加密凭据（迁移旧数据、轮换令牌用）
- `deploy/entrypoint.sh`：镜像内种子插件与卷内已装版本不一致时自动 `pnpm install --prod` 升级
- `deploy/Dockerfile`：构建阶段改用 `npm install --ignore-scripts`，lockfile 滞后时不再整构建失败
- `scripts/`：迁移脚本支持 `--creds` 导入旧库仓库账号；抓取脚本补 credentials 表
- `docs/deploy-remote.md`：补凭据导入、插件升级、实测结果与截图

## 1.0.2-remote

- 空间支持按成员覆盖分支：`ProjectSpace.memberBranches`，`space.create` 接受 `memberBranches`，物化按成员分支检出；旧版 Ascoder 的异构空间可完整迁移
- `deploy/Dockerfile`：`npm ci --ignore-scripts`（避免 prepare 在源码就位前执行）；新增 `APT_MIRROR` ARG，内网可用阿里云源
- `deploy/entrypoint.sh`：支持 `/opt/ascoder/extra.patch.yml` 追加覆盖（`# ASC_EXTRAS` 防重复）、`ASC_PUBLIC_URL` / `ASC_TRUSTED_HOSTS`
- 新增 `deploy/docker-compose.remote.yml`、`deploy/extra.patch.example.yml`
- 新增 `scripts/fetch-legacy-dump.sh` 与 `scripts/migrate-legacy-ascoder.py`：把旧版 MySQL 的仓库/项目/空间迁到新版（含异步任务等待）
- 新增 `docs/deploy-remote.md`：内网一台部署机 的部署与迁移实录

## 1.0.1-docker

- **更正**：magpie 支持 macOS / Windows / Linux，且提供官方镜像 `ghcr.io/yetone/magpie`（linux/amd64 + arm64）；此前“无 Linux 产物”的结论错误
- `deploy/` 改为两容器编排：`magpie`（官方镜像，`stable` 标签）+ `ascoder`，Ascoder 连 `http://magpie:3425/v1`，跨容器用 gateway key
- 新增 `deploy/docker-compose.host-gateway.yml`：复用宿主已登录 magpie（`host.docker.internal`）
- Windows 组合方案写进 `docs/docker.md`：原生 magpie + Docker Desktop、纯容器、原生不容器

## 1.0.0-docker

- 新增 `deploy/`：多阶段 Dockerfile（插件从源码构建）、compose、entrypoint、smoke.sh、.env.example
- 新增 `docs/docker.md`：magpie 接入方案对比、DSH 在容器里的硬约束（DSH_HOME / --host / 每次随机 token / trusted-host）、卷与路径映射、验证清单与已知限制
- 结论：dsh + codegraph + git 可进镜像；magpie 是 macOS 应用，走宿主 `host.docker.internal:3425`

## 0.16.2

- 会话页隐藏宿主的访问模式选择器（`button[aria-label^="访问模式"]`），权限不在会话里切换
- 顺带隐藏 `/permission` 指令弹出的选择器，避免绕过
- 旧会话保留创建时的模式，新会话按配置（`read-only`）创建

## 0.16.1

- 回答视角职责拆分：**设置 → 回答视角**只管理定义（风格 / 提示词 / 结构），**会话页输入框左侧**新增视角选择胶囊与菜单
- 视角定义扩展为三部分：风格一句话、回答结构、逐行提示词；内置视角可展开查看但不移交给设置页选择
- 修复设置页视角列表与标题挤在一起的问题（标题与操作拆成两行），模型分区去掉吸顶分组标题
- 修复视角菜单在输入框区没有背景/边框（token 作用域未覆盖输入区）
- 单测 32 个

## 0.15.2

- 只读权限下允许更新代码：新增 `ascoder_sync_space` 工具（git fetch + pull --ff-only）与分支空间「更新代码」按钮；系统提示词新增「Ascoder 只读约定」
- 会话模型改到设置：新增「会话模型」分区（读宿主 llm 目录、写 agentDefaultModel），会话页模型选择器隐藏
- 新增「回答视角」分区：内置 开发者/产品经理/测试工程师 + 自定义视角（可编辑/删除），选择结果注入系统提示词
- 运行状态文案「深度求索中」→「正在调查代码」，鲸鱼尾巴图标换成 Ascoder 小鸟
- 首页设置入口改为齿轮图标按钮
- 单测 32 个（新增视角存储用例）

## 0.14.0

- **设置页密码可在界面里修改**：设置新增「设置密码」分区（当前密码 / 新密码 / 确认），改完立即生效
- 密码以 scrypt 加盐哈希落盘（只存 hash + salt），连续 5 次失败锁定 30 秒
- 存储优先走 DSH storage hub（`ascoder_security`），不可用时回退 `~/.dsh/ascoder/security.json`
- 修改后不再读配置里的初始密码；仍在初始密码时界面会提示
- 单测 29 个（新增密码校验/修改/错误/锁定用例）

## 0.13.3

- **权限改为仅可查看**：profile patch 设置 `permission.defaultPreset: read-only` 与 `sandbox-policy.mode: read-only`；注意 patch 会整块替换 config，`presets` 必须写全
- **仓库管理**：新增全局仓库注册表（`Repository`）与「仓库」页面（登记/同步/删除）；项目成员改为引用仓库（`repositoryId`），分支空间按引用物化
- 修正迁移落盘：旧记录迁移时仓库表未写入，新增自愈逻辑从已物化克隆的 `origin` 反推来源并用原 id 重建
- **Ascoder 真 Logo**：从 legacy `logo.svg` 抽出鸟形图标与字标，用于侧栏、首页标题、欢迎区与 favicon
- 单测 25 个（新增仓库自愈用例）

## 0.12.2

- **修复"进入会话后无法回到项目"**：会话区左上角常驻面包屑 `‹ 项目 · 分支`，点击回到所属项目页
- 归属判定基于侧栏选中会话所在的 workspace 分组标题，而非"上次进入"的记忆，侧栏任意会话都能正确返回
- 面包屑挂在 `conversation.header.leading`（root 作用域），空会话/新会话同样可见
- 浮层支持 Esc 逐级后退（项目页 → 列表 → 关闭，密码门优先）
- 侧栏品牌按钮与面包屑统一走同一返回逻辑

## 0.11.0

- **信息架构重做**，修复"项目管理页又变成项目列表"的层级重复：
  首页=项目列表 → 项目页=分支空间列表 → 分支空间=会话
- **分支空间升级为宿主模型一等对象**（`Project.spaces[]`）：可显式创建、进入、删除，带 `待准备/就绪/失败` 状态与失败原因
- 新增 `space.create / space.prepare / space.enter / space.remove`；`enterSpace` 负责准备 + 对齐 workspace（标题 `项目 · 分支`）
- 分支选择按前缀分组（`fix/` `feat/` `ci/` … + 数量），支持搜索，已存在的分支空间打标
- 项目管理页改为分区式：基本信息 / 仓库成员 / 删除项目（危险区）
- 成员不再持有分支字段（分支属于空间）；旧记录自动迁移成「项目 + 一个分支空间」
- 单测 24 个，覆盖空间幂等创建、失败状态、目录清理、迁移、workspace 标题

## 0.10.2

- 视觉系统重做：token 层（颜色/间距/圆角/字体/缓动）、形状锁、统一按钮与输入控件
- 首页项目卡片改为签名元素（文件夹字形 + 名称/状态 + 分支胶囊 + 右箭头，整卡可点）
- 分支页重做：搜索框 + 行式列表 + 当前分支标记；加载态改骨架屏；空态带主行动
- 管理页改嵌入模式，去掉与浮层重复的标题；详情页路径独立成行
- 修复实测对比度问题：宿主 success token 在浅色下仅 2.3:1，改为插件自带的双主题语义色（实测 5.3 / 8.55）
- 全量键盘可达、focus-visible、reduced-motion 降级；暗色截图入库

## 0.9.0

- 项目管理从设置页移出：首页「项目管理」打开独立全屏页面（`shell.overlay`），设置里不再有 Ascoder 分区
- DSH 设置页加密码门：首页「设置」/ 品牌按钮 / `⌥⌘,` 快捷键统一先校验密码；宿主侧 `auth.verify` 等长比较，配置 `adminPassword`（出厂默认值，部署前务必覆盖）
- 品牌按钮改为回到 Ascoder 首页（设置走首页按钮 + 密码）
- 明确边界：密码是界面访问门，不是安全边界（DSH token 仍保护 API）

## 0.8.2

- 侧栏分组过滤：`state` 返回 `spaces`（属于 Ascoder 空间的分组标题），客户端只显示这些分组；旧项目目录分组、DSH `默认项目`、`未分组` 一律隐藏
- 说明：这是**隐藏**而非删除，宿主数据不变；如需彻底清理可后续加「删除遗留工作区」操作

## 0.8.1

- 首页改为项目选择页：`shell.overlay` 全屏首页 → 选项目 → 选分支 → 进入会话（「管理项目」进设置，「跳过」回 DSH 视图）
- 会话按分支隔离：DSH workspace 粒度从「项目」改为「项目 · 分支」，标题带分支名，侧栏各自分组
- 项目空间物化布局按分支分目录：`<dataDir>/spaces/<项目>-<短id>/<分支>/<成员别名>/`
- 新增 `project.enter`（准备 + 对齐 workspace）与项目级分支列表（`/api/ascoder/branches?projectId=`）
- 移除「自动进入上次项目」的旧行为，首页由用户显式选择

## 0.7.1

- 重做项目模型，对齐 legacy Ascoder 交互：项目（容器）→ 仓库成员（每个选一个分支）→ 项目空间（物化目录）→ 会话
- 前端改为两级界面：项目卡片列表（名称/描述/成员数/状态/进入·管理·删除）+ 项目详情（成员表格、分支下拉、添加仓库、准备空间、进入会话）
- 宿主新增 `project.create/update/prepare`、`member.add/remove/branch/sync`；`prepare` 用本地 clone 或远程 clone 物化成员，分支不存在时明确报错（不再静默）
- 旧版单仓库记录自动迁移为「项目 + 一个成员」
- 项目状态机：待准备 / 就绪 / 失败（成员级错误可见）
- 单测 25 个（新增分支选择、坏分支报错、迁移、清理）

## 0.6.4

- Ascoder 首页逻辑：无选中会话时自动进入已配置项目（多项目记忆上次选择），不再显示「选择代码目录」
- 隐藏 DSH 专属入口：侧栏加目录、账号菜单、右侧边栏整套（新标签页/分栏/全屏）、输入框「+」死按钮
- 设置入口迁到侧栏品牌：点击「Ascoder」按 ⌥⌘, 打开设置（替代被隐藏的账号菜单）
- 输入框占位文案改为「描述你的代码问题」（文本节点 + placeholder 属性双路替换）

## 0.5.2

- 项目 ↔ 侧栏 workspace 联动：`add` 幂等对齐 workspace、首次读取收养 Git workspace、`project.open` + `uiWorkspace.startSession()` 一键开聊
- 「打开会话」完成后自动关闭设置面板（宿主未暴露关闭 API，发它已监听的 Escape 手势）
- workspaceRegistry 走惰性 getter 解析，修复 apply 早于服务就绪导致联动失效
- 回退宿主工具裁剪：工具行在 agent preset 里重复 4 份，profile patch 无法全禁；禁用服务会让新建会话报 `agent-preset/invalid`
- 新增 workspace 联动单测（4 个）

## 0.4.4

- 文案补丁层：文本节点 + `aria-label`/`title`/`placeholder`/`data-placeholder` 属性级替换，隐藏「插件」入口与右栏切换控件
- 移除 locale 覆盖方案：`ctx.locale.register` 对同命名空间重复注册抛错，会打挂 `ui-workspace`（已改 DOM 补丁）
- 修复裁剪导致的 "Failed to load plugins"：恢复 `ui-sidebar-right` / `ui-commands` / `ui-file-drag` / `ui-plugin-manager` 等基建插件，只禁用叶子
- 新增 `presets/ascoder-only.patch.yml`（验证零依赖断裂）与三张界面截图

## 0.4.0

- Ascoder 形态：新增 `presets/ascoder-only.patch.yml`，在组合层隐藏 Ascoder 用不到的 DSH 前端能力与宿主工具（客户端模块 63 → 38）
- 品牌门脸：欢迎区 `conversation.hero.brand.mark` 换成 Ascoder 标记，headline/preview 文案覆盖
- 页面标题加 MutationObserver 锁，避免宿主布局写回产品名
- 侧栏术语统一：「工作区」→「项目」（locale 覆盖，中英各一套）

## 0.3.0

- 新增项目与分支管理：本地/远程 Git 仓库登记、分支查看/切换/新建、远端同步
- 新增已鉴权浏览器 API：`/api/ascoder/state`、`/api/ascoder/branches`、`/api/ascoder/action`
- 新增浏览器半（`dsh.client`）：Ascoder 品牌标记与名称、页面标题/favicon、品牌色 token 覆盖
- 新增「Ascoder 项目」设置页：项目卡片、分支切换、新建分支、三态与可访问性
- 数据目录改为解析到 `$DSH_HOME` 下，不再依赖启动 cwd
- 存储抽象泛化：知识库与项目注册表共用一套 KV/文件后端
- 修复 storage 单元命名必须匹配 `^[a-z][a-z0-9_]*$`

## 0.1.0

- 知识层工具：`knowledge_search` / `knowledge_save` / `knowledge_list` / `knowledge_forget`
- 角色化回答风格：developer / product_manager / tester（移植自 legacy `prompts/answer-style-*.md`）
- 移除 codegraph 依赖：代码排查交给 DSH 原生 grep/read/bash
