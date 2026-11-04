# M0：DeepDot 工程基线

## 目标

保留 deep-worker 的提交历史和 npm workspaces，在引入新产品功能前，建立可复现的安装、质量门禁、功能差距记录和小步提交流程。

本阶段基于 `origin/master` 的 `93567abc9ef1d2f68bad8a34f525d9950c94c668`，开发分支为 `feat/deepdot-m0`。原仓库重命名、产品品牌和图标属于 M1；单 Agent 收敛属于 M2。

## 工作树与远端

- 使用已有干净工作树 `Deep Worker-r16-r28`，从已 fetch 的 `origin/master` 创建阶段分支。
- `Deep Worker` 主工作区已有的文档、测试与 `resume-layout/` 改动保持原样，不纳入本阶段提交。
- 当前 OpenDot 目录只读，用作功能和源码参考，不整体替换本项目。
- M0 继续推送至 `Cordis798/deep-worker`，不重建 Git、不改写历史、不强推。
- 本机 Git 系统配置已损坏，且全局代理指向失效端口；仅使用命令级绕过，不修改全局配置。

## 允许修改的文件

| 文件                           | 目的                                       |
| ------------------------------ | ------------------------------------------ |
| `docs/deepdot/M0-SPEC.md`      | 固定本阶段范围与验收标准                   |
| `AGENTS.md`                    | 更新产品目标、SDK 架构、中文注释和提交规则 |
| `docs/deepdot/ROADMAP.md`      | 保存用户确认的 M0–M14 顺序与阶段验收点     |
| `docs/deepdot/FEATURE-GAPS.md` | 区分当前实现、参考能力和待开发项           |
| `docs/deepdot/M0-BASELINE.md`  | 记录安装、实际门禁结果与环境问题           |
| `.github/workflows/ci.yml`     | 运行干净安装和既有门禁                     |
| `README.md`                    | 补充路线图入口与可复现安装要求             |

不修改业务源码、数据库、依赖版本、包名和原有测试断言；如发现必须修改源码才能通过的失败，先记录具体证据并单独界定修复范围。

## 提交顺序

1. `docs(m0): 固定工程基线范围与验收标准`
2. `docs(agents): 更新 DeepDot 协作与提交规范`
3. `docs(plan): 记录 DeepDot 分阶段开发路线`
4. `docs(audit): 建立单 Agent 功能差距清单`
5. `ci: 建立跨平台工程质量门禁`
6. `docs(m0): 记录基线验证与开发入口`

每个提交只覆盖一个交付点，检查后立即推送阶段分支。若 CI 暴露问题，修复另作小提交，不 squash 已推送历史。阶段 PR 保持未合并，交由用户验收。

## 验收清单

- [ ] 分支基于最新远端基线，主工作区未提交改动未被覆盖或夹带。
- [ ] 记录干净安装命令、Node/npm 版本、退出码、失败与处理方式。
- [ ] `npm run typecheck` 通过。
- [ ] `npm test -- --run` 通过，并记录实际文件数和用例数。
- [ ] `npm run build` 通过。
- [ ] `git diff --check` 通过。
- [ ] CI 在 push、PR 和手动触发时执行以上门禁，不依赖模型密钥或真实设备。
- [ ] 路线图完整保留已确认的 Cloudflare 优先、手机桥接和三类家居 Provider 决策。
- [ ] 差距清单不把多 Agent 列为目标，不把 Fake/接口测试写成真机能力。
- [ ] 所有小提交已推送 GitHub，提供阶段 PR 与实际 CI 结果。

验收证据集中记录在 [M0 基线](M0-BASELINE.md)。本阶段结束后等待用户确认，不自动进入 M1。
