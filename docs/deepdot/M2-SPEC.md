# M2：单 Agent 收敛与最终 Logo

## 目标

按用户最新附件采用黑银色三瓣圆心 Logo，保留原图作为设计源，统一生成 Web/PWA/README 资源。随后完成路线图 M2：聊天、IM、Scheduler 仅进入单 Agent 执行，原多 Agent 数据可读但不可创建、审批、派发或继续执行。

## 范围与提交

- Logo 源、生成脚本、导出图标、favicon/cache 版本及 README 品牌说明。
- Web ChatPage、Router store 和相关测试：删除协作面板、自动加载与写操作，不影响聊天/工作区/会话。
- server app、Router 路由与测试：只保留受 ACL 保护的历史 GET；旧写入口返回明确退役错误。
- IM command/parser/manager/runtime manager 及测试：退役 route/approve/reject/cancel，保留 single 与普通聊天、工作区绑定等命令。
- Router service/planner 的生产依赖退役；历史 store、共享历史类型和 schema 保留。不删除用户数据、不改写历史结果。
- RuntimeRunnerService、runner-reliability 及测试：普通持久队列恢复必须排除旧 router: 输入，且过滤在 LIMIT 前完成；入口拒绝重放该保留身份，不影响普通任务。
- 回归测试验证旧 HTTP/IM 入口无法执行、历史可读且隔离、普通 Web/IM/定时任务仍运行。
- AGENTS、README、API、路线与差距文档同步单 Agent 现状及验收记录。

每个交付点独立提交并推送阶段分支。先核对依赖，再移除执行代码；删除历史执行测试必须由对应退役行为测试替换，不能通过削弱断言掩盖回归。

## 验收

1. 原图源与用户附件一致，各尺寸导出可复现并目视核对。
2. Web 无协作控制或 Router 请求；正常流式聊天、停止、会话切换保留。
3. Router 写端点均不可执行；历史读取维持现有 ACL，不暴露其他用户数据。
4. IM 旧协作命令给出退役反馈，不作为普通模型输入；帮助只显示有效命令。
5. Node 启动、IM 与 Scheduler 不创建 AgentRouterService，不自动恢复旧协作任务。
6. 无 spawn/handoff 协作工具进入单 Agent SDK；历史 subagent 事件仍可读取。
7. npm run build、npm run typecheck、npm test -- --run、git diff --check 全部通过，阶段 PR CI 通过。

本次只完成 Logo 与 M2，不提前实施 M3。按既定逐阶段规则，提供具体 PR 及验收记录后等待用户验收合并。
