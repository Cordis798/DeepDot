import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import {
  getRouterPlan,
  getRouterTasks,
  listAgentBindings,
  listRouterEvents,
  listRouterPlans,
} from '../agent-router/store.js';
import type Database from 'better-sqlite3';
import type { AppVariables } from '../types.js';

function publicPlan(plan: ReturnType<typeof getRouterPlan>) {
  if (!plan) return undefined;
  return {
    id: plan.id,
    workspace_jid: plan.workspaceJid,
    session_id: plan.sessionId,
    actor_user_id: plan.actorUserId,
    intent: plan.intent,
    status: plan.status,
    input: plan.input,
    route: plan.route,
    result: plan.result,
    capability_hash: plan.capabilityHash,
    created_at: plan.createdAt,
    updated_at: plan.updatedAt,
    completed_at: plan.completedAt,
    plan_hash: plan.planHash,
    approval_required: plan.approvalRequired,
    approval_status: plan.approvalStatus,
    approval_expires_at: plan.approvalExpiresAt,
    approved_by: plan.approvedBy,
    approved_at: plan.approvedAt,
  };
}

export function createAgentRouterRoutes(db: Database.Database) {
  const app = new Hono<{ Variables: AppVariables }>();
  app.use('*', authMiddleware(db));

  app.get('/:jid/agents', (c) => {
    const agents = listAgentBindings(db, c.get('user')!.id, c.req.param('jid'));
    if (!agents) return c.json({ error: 'Workspace not found' }, 404);
    return c.json({ agents });
  });

  const retired = (c: import('hono').Context) => c.json({
    error: '多 Agent Router 已退役，请使用普通聊天。历史记录仍可读取。',
    code: 'AGENT_ROUTER_RETIRED',
  }, 410);
  app.post('/:jid/agents', retired);
  app.delete('/:jid/agents/:bindingId', retired);
  app.post('/:jid/router/plans', retired);
  for (const action of ['dispatch', 'approve', 'reject', 'cancel']) {
    app.post(`/:jid/router/plans/:planId/${action}`, retired);
  }

  app.get('/:jid/router/plans', (c) => {
    const plans = listRouterPlans(db, c.get('user')!.id, c.req.param('jid'));
    if (!plans) return c.json({ error: 'Workspace not found' }, 404);
    return c.json({ plans: plans.map(publicPlan) });
  });

  app.get('/:jid/router/plans/:planId', (c) => {
    const user = c.get('user')!;
    const plan = getRouterPlan(db, user.id, c.req.param('jid'), c.req.param('planId'));
    if (!plan) return c.json({ error: 'Router plan not found' }, 404);
    return c.json({ plan: publicPlan(plan), tasks: getRouterTasks(db, user.id, c.req.param('jid'), plan.id) });
  });

  app.get('/:jid/router/plans/:planId/events', (c) => {
    const events = listRouterEvents(db, c.get('user')!.id, c.req.param('jid'), c.req.param('planId'));
    if (!events) return c.json({ error: 'Router plan not found' }, 404);
    return c.json({ events });
  });

  return app;
}
