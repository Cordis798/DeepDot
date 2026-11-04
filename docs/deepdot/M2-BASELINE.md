# M2 单 Agent 收敛验收

日期：2026-11-04。基于 M1 已合并的 main；分支 `feat/deepdot-m2`。

## 完成项

- Logo 原图 `assets/deepdot-logo.png` 与用户最终附件逐字节相同，为黑银三瓣与银色圆心。Web/PWA/README 均从此源生成，SVG 为嵌入原图的布局容器，不再维护另一套绘制造型。
- 已目视核对 512px 导出；180/192/512/1024 PNG 尺寸正确。输入原图为 177×170，大尺寸导出是等比缩放，不宣称新增矢量细节。
- Web 删除协作面板、Router store、自动历史加载和写操作；聊天、停止、工作区/会话创建切换复制保留。
- HTTP 七个旧写入口统一返回 `410 / AGENT_ROUTER_RETIRED`，要求先登录，不创建绑定/计划、不审批、不取消、不派发。
- 历史绑定、计划、步骤和事件 GET 保留原工作区 ACL；读取不再自动更新过期审批，schema 仍为 v18，用户数据未迁移或清空。
- IM 的 /route、/approve、/reject、/cancel 明确反馈已退役，在工作区解析之前处理，不落入普通模型输入。/single 与普通消息使用同一 RuntimeRunnerService。
- app 和 RuntimeChannelManager 不再构造协作服务；协作 service/planner 源码已删除。普通持久队列 SQL 排除旧 router: 回合，submit 拒绝新建/重放该保留身份；Scheduler 原链路保留。
- SDK 的 `noExtensions: true` 及受治理工具清单保留，没有子 Agent 工具注册。child_process.spawn 是 Runner/MCP 进程传输，不是协作 Agent。
- 共享 Router 类型、历史 subagent 事件标签及持久数据结构保留兼容，不表示执行能力仍开放。

## 实际验证

Node.js 24.15.0 / npm 11.12.1：

| 检查                     | 实际结果                             |
| ------------------------ | ------------------------------------ |
| `npm run build`          | 通过，含图标重新生成及四个 workspace |
| `npm run typecheck`      | 通过                                 |
| `npm test -- --run`      | 86 文件 / 252 用例通过，23.42 秒     |
| Web 专项 typecheck/test  | 通过；6 文件 / 10 用例               |
| HTTP + store 专项        | 通过；2 文件 / 6 用例                |
| IM 命令/真实管理器专项   | 通过；2 文件 / 3 用例                |
| Logo 源字节/导出尺寸检查 | 通过                                 |
| `git diff --check`       | 通过                                 |

HTTP 回归对七个写入口验证返回值、相关七张表前后快照相同、Runner 零调用；验证四类历史 GET、跨用户与工作区隔离、无凭据 401、过期 pending 读取不改写。IM 回归经 FakeTransport → RuntimeChannelManager 验证四种旧命令均有反馈且模型输入为空，再验证普通消息正常回复。现有 Web、普通 HTTP 聊天、定时任务与用量闭环测试全量通过。

相对 M1 的 87 文件 / 256 用例：退役规划器及其专用测试一起删除，旧 HTTP 协作执行测试替换为退役/历史读取回归，并新增两项持久恢复回归，因此总数变化；没有跳过检查、关闭断言或把测试失败改成成功。

## 交付边界

每个交付点独立 commit 并推送；删除协作服务属于一个完整退役单元（486 行），未改写原提交。最终 CI 与 PR 链接由阶段 PR 提供，等待用户阶段验收后合并，不自动进入 M3。

本次验证使用本地 SDK/Fake Runner、真实 SQLite/HTTP 与渠道 FakeTransport，不代表已连接真实 IM、云端或硬件。后续状态以 [路线图](ROADMAP.md) 与 [差距清单](FEATURE-GAPS.md) 为准。

## 旧持久回合恢复补充

最终审查发现仅移除协作服务仍不能阻止普通队列恢复旧 Router 回合，已修复。新增真实 SQLite 回归覆盖 103 个旧 queued/retry_wait/过期 running 回合：普通 im:/task-run: 两个回合正常恢复，旧回合零 outbox；新建或重放 router: 身份均拒绝且不增加 inbox/turn。专项2文件15项测试通过；本地旧 service/planner 编译残留已清理。
