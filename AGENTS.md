# AGENTS.md

## 目标

将现有 deep-worker 逐步改造成 DeepDot：可持续接受委托的云端 Personal Agent，扩展手机/智能眼镜随身交互和智能家居控制。保留 Git 历史、npm workspaces 与现有用户数据，参考 OpenDot 的能力逐项迁移。

- 产品采用单 Agent；既有多 Agent Router 在 M2 退役，后续能力不再依赖角色交接或子 Agent。
- Cloudflare Workers + SQLite Durable Objects 优先，Node 服务保留身份、凭据、权限和业务数据。
- 眼镜先走手机/PWA 桥接；首批家居 Provider 为 Home Assistant、米家官方 HA 桥接、涂鸦官方云 API。
- 开始阶段任务前阅读 [开发路线](docs/deepdot/ROADMAP.md) 和该阶段 Spec；核对现有能力时阅读 [差距清单](docs/deepdot/FEATURE-GAPS.md)。以代码与实际验收为准，不把参考项目或截图的能力记作已完成。

## 常用命令

```bash
npm ci --ignore-scripts # 按 lockfile 安装；原因见 M0 基线记录
npm run build        # 首次检出先按 workspace 依赖顺序生成 dist
npm run dev          # 启动后端（tsx 直跑）
npm run typecheck    # 全量类型检查（server/web/pi-runner/shared）
npm test -- --run    # 运行全部单元测试（一次）
npm run format:check # 检查格式；修改时只格式化本阶段文件
```

M0 验证环境为 Node.js 24；安装问题与实际结果见 [M0 基线](docs/deepdot/M0-BASELINE.md)。现有容器也使用 `--ignore-scripts`，依赖更新后须重新验证原生模块和构建。

## 架构

- npm workspaces monorepo：`server`、`web`、`pi-runner`、`shared`。
- 后端：Hono + better-sqlite3 + Pino；Host/Container 共用 Pi Agent SDK Adapter，进程边界为 JSON IPC，生产路径不启动 `pi --mode rpc`。
- 前端：React + Vite + Tailwind + Zustand。
- 数据库迁移：`server/src/db/migration.ts`，用 `config_kv.schema_version` 跟踪版本，升级前自动备份，拒绝降级。
- 用量与账务：`server/src/usage-service.ts` 以 `eventId` 做幂等账本，`server/src/billing.ts` 管理套餐、订阅、余额、兑换码和配额；扣费与汇总必须在 SQLite 事务内完成。
- 共享类型放 `shared`，三方跨包引用统一走 workspace 依赖。

## 完成条件（阶段门禁）

每个阶段结束必须全部通过并附实际输出：

```bash
npm run build
npm run typecheck
npm test -- --run
git diff --check
```

每个功能提交先运行受影响检查；阶段结束完成上述全量门禁，对照阶段 Spec 汇报实际输出、commit、PR 和 CI 结果。等待用户确认后再合并阶段 PR、进入下一阶段；不自动扩大到后续阶段。

## 中文注释与小步提交

- 面向用户的说明和新增、实质修改的注释使用简体中文；代码标识、协议字段、第三方 API 名称保留英文。
- 注释解释约束、设计原因和反直觉行为，不逐行复述代码；生成文件修改源头后重新生成。
- Git 提交保留 Conventional Commit 前缀，冒号后的描述和正文统一使用中文，如 `feat(home): 增加设备状态查询`。
- 一个 commit 只完成一个可解释、可验证、可回退的交付点。普通改动参考 50–150 行有效增删，超过 300 行优先拆分；生成资源、lockfile 和文件移动单独说明。
- 较大功能按共享契约、持久化、服务行为、API、UI 与集成验收拆分，保持每个提交可构建；相关回归测试随实现提交。
- 检查通过后立即推送阶段分支，不攒到阶段结束；保留提交历史，不 squash、不强推、不制造空提交。
- 暂存前核对文件和 diff，仅提交本阶段改动；仓库重命名属于 M1，不在 M0 修改远端名称或包名。

## 测试与验证

- 测试真实实现，优先使用实际 SQLite、临时文件与 HTTP 链路；Fake Runner 只能证明协议和流程，不能证明真实模型或真机能力。
- 可逆、影响小、只复述实现的改动不额外写测试；新增行为和必要回归使用现有 Vitest 流程。
- 检查通过后，仅在出现新代码、新失败或未解决疑点时扩大或重复验证；任务结束清理本次无用临时文件。

## 禁止事项

- 不得修改参考仓库 `C:/Users/Administrator/Desktop/deep-worker-main/` 中的任何文件。
- 当前 OpenDot 目录同样只读；不整体复制其源码、数据库或 schema 版本。
- 不允许关闭类型检查、跳过测试、删除断言或用注释绕过问题。
- 密钥、API Key、Token 不得写入普通日志。
- 不引入非必要依赖；确有必要时说明理由并随 commit 提交。
- 只修改当前阶段任务列出的文件；避免范围外改动。
- 不得用 `git reset --hard` / `git checkout --` 覆盖未提交的他人改动。
- 不得把支付网关、真实密钥或第三方账务服务加入本地计费实现；计费范围仅限可测试的 SQLite 账本。
