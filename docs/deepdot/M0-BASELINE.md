# M0 工程基线与验收记录

日期：2026-11-04（Asia/Shanghai）。业务源码基线：`93567abc9ef1d2f68bad8a34f525d9950c94c668`。

## 工作树与变更边界

- 在已有干净工作树 `Deep Worker-r16-r28` 中，从 fetch 后的 `origin/master` 创建 `feat/deepdot-m0`。
- `origin` 仍为 `https://github.com/Cordis798/deep-worker`，账户 Cordis798 具有推送权限；仓库/包/品牌重命名留到 M1。
- 原 `Deep Worker` 主工作区的 `docs/FEATURE-COMPARISON.md`、`server/src/billing.test.ts` 和未跟踪的 `resume-layout/` 保持原样。
- 当前 OpenDot 仅作只读参考；没有复制其业务源码、数据库、依赖或图标。
- 本阶段只增加工程文档和 CI、修订协作规范与 README 开发入口，没有修改业务源码、测试断言、数据库和依赖版本。

## 可复现安装与门禁

本机：Windows x64，Node.js `v24.15.0`，npm `11.12.1`。CI 使用 Node 24，覆盖 Ubuntu 和 Windows；不把本机结果外推到 Node 20。

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run build
npm run typecheck
npm test -- --run
git diff --check
```

先构建再检查：workspace 包通过 `dist` 提供导出和类型声明，首次检出若先执行 `typecheck` 会缺失 `@deep-worker/shared` 等模块。根 `build` 已按 shared → pi-runner → server → web 的顺序执行，无需新增构建系统。

### 本地实际输出

| 检查                                           | 结果                     | 证据                                                                 |
| ---------------------------------------------- | ------------------------ | -------------------------------------------------------------------- |
| 普通 `npm ci --no-audit --no-fund`             | 退出码 1，已记录环境阻塞 | better-sqlite3 触发 node-gyp，本机没有 Visual Studio C++ 编译工具    |
| `npm ci --ignore-scripts --no-audit --no-fund` | 退出码 0                 | `added 260 packages in 17s`，依赖版本和 lockfile 未改变              |
| 原生 SQLite 实际加载                           | 退出码 0                 | 新建内存数据库并查询 `sqlite_version()`，返回 `3.53.4`               |
| `npm run typecheck`                            | 退出码 0                 | shared、pi-runner、server、web 均完成 `tsc --noEmit`                 |
| `npm test -- --run`                            | 退出码 0                 | `Test Files 87 passed (87)`；`Tests 256 passed (256)`；耗时 31.14 秒 |
| `npm run build`                                | 退出码 0                 | 四个 workspace 完成；Vite 构建 49 个模块并输出 Web 资源              |
| `git diff --check`                             | 退出码 0                 | 本阶段 diff 无空白错误；CI 另检查实际提交范围                        |

本地初轮门禁使用工作树已有的 dist；首轮 CI 揭示了首次检出的构建顺序依赖，已经在 CI 和上述开发命令中修正。只有干净 runner 的结果才能作为冷启动验证。

### 安装方式说明

`better-sqlite3@13.0.3` 包含 Windows/Linux 等平台的 N-API 预编译模块；`esbuild` 等工具的平台包也在 lockfile 中。采用现有 `container/Dockerfile` 同样使用的 `--ignore-scripts` 安装，再通过实际 SQLite 调用、完整测试和 Web 构建验证可用性。

本阶段没有安装 Visual Studio、关闭类型检查、跳过测试或更改原生依赖。以后升级依赖时必须重新检查是否需要安装脚本，不把这一方式视为所有 npm 项目的通用安装规则。

## Git 环境问题

系统 `C:/Program Files/Git/etc/gitconfig` 为异常内容，解析时报 `bad config line 1`；全局 HTTP/HTTPS 代理指向未监听的本机端口。使用以下命令级设置访问本仓库，不覆盖系统或全局配置：

```powershell
$env:GIT_CONFIG_NOSYSTEM = '1'
git -c http.proxy= -c https.proxy= -c http.version=HTTP/1.1 fetch origin
git -c http.proxy= -c https.proxy= -c http.version=HTTP/1.1 push origin feat/deepdot-m0
```

首次推送遇到连接超时，重试后成功；之后每个独立提交均推送阶段分支，没有改写远端历史。

## CI 验证

工作流：`.github/workflows/ci.yml`；触发：push、pull_request、workflow_dispatch；只读仓库权限。两个官方 Actions 固定到已核对的 v7 提交 SHA。

- Ubuntu/Windows 各自干净安装、完整构建、类型检查、全量测试和提交范围空白检查。
- PR 检查 base SHA 到当前 HEAD，push 检查 before 到 HEAD；新分支/手动运行使用 merge-base 回退，不对干净工作区运行空的 diff 充作验证。
- 首轮 [85f4397 的 CI](https://github.com/Cordis798/deep-worker/actions/runs/41829531330) 两平台均失败于“构建前先 typecheck”；未放宽检查，`4f952bb` 单独修正执行顺序。
- 修正后的 [4f952bb CI](https://github.com/Cordis798/deep-worker/actions/runs/41829766705) 已完成：Ubuntu、Windows 两个 job 均为 `success`，各自通过干净安装、完整构建、类型检查、测试和提交范围检查。最终文档提交的状态另以阶段 PR 最新检查为准。

## 提交追踪

| Commit    | 独立交付                                            |
| --------- | --------------------------------------------------- |
| `c16f142` | 固定 M0 文件范围、提交顺序和验收标准                |
| `73e5c58` | 更新 DeepDot 目标、SDK 架构、中文注释与小步提交规范 |
| `ac6463c` | 保存 M0–M14 路线、接口方向、兼容边界和 README 要求  |
| `9e0e008` | 建立现有实现、待开发、外部验收和退役功能清单        |
| `85f4397` | 增加 Linux/Windows 自动门禁                         |
| `4f952bb` | 修正首次检出时的 workspace 构建顺序                 |

本记录与 README 开发入口作为独立文档提交；完整历史可通过 `git log origin/master..HEAD --oneline` 查询。M0 的本地测试数量仍为 87 文件 / 256 用例，没有用文档改动虚增测试数量。

## 验收边界与后续

- [M0 Spec](M0-SPEC.md) 是本阶段清单，[路线图](ROADMAP.md) 是后续顺序，[差距清单](FEATURE-GAPS.md) 是功能状态真相源。
- 本次门禁覆盖现有模拟模型、真实 SQLite、HTTP 与 SDK 适配测试；不代表已部署 Cloudflare、连接真实 IM 或验证物理设备。
- 当前已存在的多 Agent 仍属于旧代码现状，M0 不扩展；M2 才退役，DeepDot 目标始终为单 Agent。
- 阶段 PR 保持未合并，等待用户验收；不自动开始 M1 或改名仓库。
