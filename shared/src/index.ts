/**
 * server、web 与 pi-runner 共用的类型定义。
 *
 * 三个子项目通过这里共享流式事件协议，避免各自维护不一致的数据结构。
 */
export const SHARED_PACKAGE_VERSION = '0.1.0';

export interface VersionInfo {
  package: string;
  version: string;
}

export type {
  StreamAgentScope,
  StreamDisplayLevel,
  StreamEvent,
  StreamEventType,
  StreamUsage,
} from './stream-event.js';

// 历史 Router 数据仍可读取；这些类型不再代表可用的协作执行入口。
export type {
  AgentRouterApprovalStatus,
  AgentRouterCandidate,
  AgentRouterPlanSpec,
  AgentRouterPlanStatus,
  AgentRouterResult,
  AgentRouterTaskRisk,
  AgentRouterTaskResult,
  AgentRouterTaskSpec,
  AgentRouterTaskStatus,
} from './agent-router.js';
