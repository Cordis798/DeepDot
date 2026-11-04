# DeepDot 功能差距清单

## 基线与状态含义

检查基线为 `93567abc9ef1d2f68bad8a34f525d9950c94c668`。M0 没有修改业务源码；以下现状来自该版本代码与本地 87 个测试文件、256 个用例的通过结果。

- **已有基础**：有代码和对应自动化覆盖，只承诺表中写明的行为。
- **待实现**：目标链路尚未形成，不因参考 OpenDot 有实现就标为支持。
- **待外部验收**：需要真实模型、第三方服务、Cloudflare 或硬件另行验证。
- **退役**：当前存在但不属于 DeepDot 目标，在指定阶段退出运行链路。

本表是 DeepDot 目标与现状的真相源。旧 `MINICLAW_GAP_AUDIT.md`、R16/R28 Spec 和旧实现状态文档保留历史背景，不作为后续多 Agent 开发依据。

## 保留与扩展

| 功能                | 当前证据与能力边界                                                                                                                            | 差距和计划                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| npm workspaces      | `package.json` 保留 shared、pi-runner、server、web 四包                                                                                       | M0 保留目录与依赖版本；M3 增加独立云 workspace                                                                             |
| 单 Agent SDK        | `pi-runner/src/pi-sdk-runtime.ts`、`pi-sdk-runtime.test.ts`；SDK 创建会话，Host/Container 使用同一 Adapter                                    | M2 收敛全部入口，旧 RPC 类型/工具不等于生产 RPC 依赖                                                                       |
| 身份与 Prompt       | `server/src/agent-profiles.ts` 有四段配置；`runtime-runner-service.ts` 当前主要传入 `identity_prompt`                                         | M6 补齐四段装配和上下文预算；Profile 配置不等于多 Agent 协作                                                               |
| 用户与 Workspace    | `server/src/workspace-acl.ts`、`workspace-acl.test.ts`；成员、管理员、访客及对象访问控制                                                      | 保留账户和数据隔离，扩展云端/设备时复用边界                                                                                |
| Web 聊天与流式进度  | `web/src/pages/ChatPage.tsx`、`shared/src/stream-event.ts`、`server/src/routes/runner-ws.test.ts`                                             | M5/M12 补齐独立于页面生命周期的长期任务、恢复和审批体验                                                                    |
| 输入与事件幂等      | `server/src/runner-reliability.ts`、`runner-reliability.test.ts`、`runtime-runner-service.test.ts`；Inbox/Turn/Outbox、重复提交与过期运行恢复 | M4 增加完整输入身份、效果分类、工具回执和 uncertain；现有重试不等于模型/工具检查点恢复                                     |
| Durable 检查点      | 当前 SDK Session/JSONL 恢复不是 Pi Durable Harness；本项目无云执行 workspace                                                                  | M3/M4 接入 Pi Durable、持久模型/工具边界与崩溃恢复；待真实模型及 Cloudflare 验收                                           |
| 云端执行            | 当前为 Node Host/Container；无 Workers/DO 执行入口                                                                                            | M3 开始实现，M14 完整部署；Node 保留凭据和授权，设备能力不能直接塞进 Worker                                                |
| 定时任务            | `server/src/task-service.ts`、`task-store.ts`、`task-service.test.ts`；cron/interval/once、租约、重试和通知                                   | M5 复用 Scheduler 接入 Goal；不另建第二套业务调度器                                                                        |
| 目标与持续委托      | 现有 Task 支持定时运行，但没有 Goal/完成条件/持续任务闭环                                                                                     | M5 增加单 Agent 步骤、遇阻提问、暂停/继续/取消与持久进度                                                                   |
| 记忆                | `server/src/memory-store.ts`、`memory-store.test.ts`；fact/decision/experience/follow_up、来源、CAS 版本、软删除、LIKE 搜索                   | M6 增加 preference、选择性上下文、Mem0 语义召回和同步忘记；不宣称已有向量召回                                              |
| Skills              | `pi-runner/src/capability-injection.ts`、`capability-injection.test.ts`；隔离物化后经 SDK ResourceLoader 加载                                 | 保留能力治理，扩展个人任务能力；不因安装即扩大授权                                                                         |
| MCP                 | `pi-runner/src/mcp-tool-bridge.ts`、`mcp-tool-bridge.test.ts`；受治理工具发现、白名单、调用与取消                                             | M7/M10 增加 Intent、设备授权和统一家居 MCP；MCP 配置存在不等于已连接实体设备                                               |
| Plugins             | `server/src/capabilities/plugin-catalog.ts`；当前解析目录与清单，SDK `noExtensions` 禁止自动执行扩展                                          | 保留目录管理；受审批扩展的实际执行需另立明确验收，不宣称兼容任意 Claude Plugin                                             |
| 模型 Provider       | `server/src/provider-pool.ts`、`provider-runtime.test.ts`；模型池、凭据映射与故障转移测试                                                     | 保留；模型 Provider 与家居 Provider 使用独立契约，真实模型另验                                                             |
| 设备与 MCP Intent   | 当前没有个人设备配对、能力授权/撤销和设备调用回执链路                                                                                         | M7 新增；严格绑定当前用户、工作区、会话、参数和有效授权                                                                    |
| Computer Use        | 当前没有面向授权设备的桌面读屏/操作闭环                                                                                                       | M8 新增应用/窗口绑定、截图版本、输入串行、分级审批、脱敏和加密                                                             |
| Browser Use         | 当前没有受控读页与隔离浏览器双通道                                                                                                            | M9 新增网页数据边界和批准的浏览器写操作，验证网页注入隔离                                                                  |
| 家居统一 MCP        | 当前没有家居实体模型、Provider 注册管理和设备控制工具                                                                                         | M10 一个 MCP 下管理多个品牌 Provider，统一能力描述/状态/错误，实体显式去重                                                 |
| Home Assistant      | 当前无适配器                                                                                                                                  | M10 实现发现、查询、动作和状态回读；需要 HA 实例与设备验收                                                                 |
| 米家                | 当前无适配器                                                                                                                                  | M10 独立 Provider 配置，经小米官方 HA 集成访问；明确依赖 HA，不宣称独立直连米家云                                          |
| 涂鸦                | 当前无适配器                                                                                                                                  | M10 对接官方云 API；需要项目、区域、授权和实际设备验收                                                                     |
| 机器人              | 当前无适配器                                                                                                                                  | 保留家居 Provider 扩展位置，品牌/型号未确定前不宣称支持                                                                    |
| 眼镜与第一视角      | 当前无眼镜协议、音视频采集、ASR/TTS 和物品位置记忆闭环                                                                                        | M11 先手机/PWA 桥接到云端 Personal Agent；支持物品识别、纸面文字、位置询问及远程执行，真机另验                             |
| 多渠道              | `server/src/im/adapters/` 有七类适配器；`channel-manager.test.ts` 使用 FakeTransport                                                          | M12 补全实际平台 Transport 与账户连接，优先飞书/钉钉/Telegram/Discord/WhatsApp；保留 QQ/微信已有基础，不把 Fake 当真实接入 |
| Web/PWA/Electron    | Web、manifest、Service Worker 和移动聊天 harness 已有；无 Electron workspace                                                                  | M12 完成移动真实交互与轻量 Electron Shell；DOM/harness 测试不是物理手机或桌面安装验收                                      |
| 观测与用量          | `server/src/logger.ts`、`monitoring.ts`、`usage-service.ts`；Pino、监控和幂等用量账本                                                         | M13 增加跨端 trace、OpenTelemetry/Langfuse、逐步失败定位及单 Agent 场景评估                                                |
| 备份与升级          | `server/src/backup-service.ts`、`db/migration.ts`，schema v18，升级备份与降级拒绝                                                             | M14 验证实际升级/恢复；不复制 OpenDot schema 或重置旧数据库                                                                |
| 部署与模型/硬件验收 | `container/Dockerfile` 和 Fake SDK/HTTP 测试不证明真实模型、Docker、云端和设备可用                                                            | M14 分别留下实际模型、Cloudflare、家居和设备证据，不复制参考项目测试成绩                                                   |

## 退役功能

| 当前能力                         | 证据                                                                         | DeepDot 处理                                                 |
| -------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 多 Agent Router、跨角色计划/派发 | `server/src/agent-router/`、`server/src/routes/agent-router.ts`              | M2 停用新建和执行，保留旧记录供历史查询                      |
| IM `/route` 与 Router 审批/取消  | `server/src/im/channel-commands.ts`、`channel-manager.ts`                    | M2 退役协作命令；单 Agent 任务审批/取消使用新契约            |
| Subagent / Handoff / Bot 团队    | 共享事件含历史 subagent scope，参考 OpenDot 含团队模块；不代表本项目均已实现 | 不迁移、不新增协作执行；清理实际依赖时保留读取旧事件的兼容性 |

## 使用与维护

- 开发顺序见 [路线图](ROADMAP.md)，M0 实测结果见 [基线记录](M0-BASELINE.md)。
- 阶段合并时更新本表对应行，补充 commit/PR 与验收文档；实现和外部验收分别推进。
- README 只维护简明功能矩阵，链接本表，不再维护第二套完整状态清单。

## M1 品牌更新

仓库与包已统一为 DeepDot / @deepdot/*，Web/PWA、原创图标和 README 已更新。保留旧配置、数据库、会话 Cookie 和本地存储键。上表业务能力仍按 M0 基线解释，品牌更新不代表新增云端或硬件能力。详见 [M1 验收](M1-BASELINE.md)。

## M2 单 Agent 更新

Web 协作面板/store、Router 执行服务与规划器已删除；IM 四类旧协作命令明确退役，Web/IM/Scheduler 使用单 Agent 链路。Router 七个写入口返回 410，历史 GET 与 ACL 保留且不改写审批；schema 和旧数据未迁移。Logo 最终以用户黑银三瓣圆心附件为准。现状与测试变更说明见 [M2 验收](M2-BASELINE.md)，上方 M0 基线表只作历史对照。
