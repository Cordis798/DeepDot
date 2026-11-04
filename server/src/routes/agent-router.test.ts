import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { FakePiRunner } from '@deepdot/pi-runner';
import { createApp } from '../app.js';
import { initDatabase } from '../db/migration.js';
import { cookieRequest, cookieValue, jsonRequest } from '../helpers/test-app.js';
import {
  appendRouterEvent,
  createAgentBinding,
  createRouterPlan,
  setRouterPlanStatus,
} from '../agent-router/store.js';

describe('Router 退役后的 HTTP 历史接口', () => {
  let app: ReturnType<typeof createApp>;
  let db: ReturnType<typeof initDatabase>;
  let runner: FakePiRunner;
  let ownerCookie: string;
  let otherCookie: string;
  let jid: string;
  let otherJid: string;
  let planId: string;
  let bindingId: string;
  let historyId: string;

  beforeEach(async () => {
    db = initDatabase(':memory:');
    runner = new FakePiRunner();
    app = createApp({ db, runner });
    const setup = await app.request('/api/auth/setup', jsonRequest('/api/auth/setup', {
      username: 'owner', password: 'password123',
    }));
    expect(setup.status).toBe(201);
    ownerCookie = cookieValue(setup);
    const owner = await setup.json() as { user: { id: string } };
    const registration = await app.request('/api/auth/register', jsonRequest('/api/auth/register', {
      username: 'outsider', password: 'password123',
    }));
    expect(registration.status).toBe(201);
    otherCookie = cookieValue(registration);
    const profileResponse = await app.request('/api/agent-profiles', jsonRequest('/api/agent-profiles', {
      name: '历史 Agent',
    }, ownerCookie));
    expect(profileResponse.status).toBe(201);
    const { agent_profile: profile } = await profileResponse.json() as { agent_profile: { id: string } };
    const workspace = await app.request('/api/workspaces', jsonRequest('/api/workspaces', {
      name: '历史工作区', agent_profile_id: profile.id,
    }, ownerCookie));
    expect(workspace.status).toBe(201);
    jid = ((await workspace.json()) as { workspace: { jid: string } }).workspace.jid;
    const otherWorkspace = await app.request('/api/workspaces', jsonRequest('/api/workspaces', {
      name: '另一工作区',
    }, ownerCookie));
    expect(otherWorkspace.status).toBe(201);
    otherJid = ((await otherWorkspace.json()) as { workspace: { jid: string } }).workspace.jid;
    const binding = createAgentBinding(db, owner.user.id, jid, { agentProfileId: profile.id });
    expect(binding.ok).toBe(true);
    bindingId = binding.binding!.bindingId!;
    const plan = createRouterPlan(db, owner.user.id, jid, null, '历史待审批任务', {
      intent: 'engineering', requiredCapabilities: [], fallback: 'single_agent',
      explanation: '历史方案', risk: 'write', tasks: [{
        ordinal: 0, bindingId, agentProfileId: profile.id, title: '历史任务',
        requiredCapabilities: [], input: '历史输入', dependsOn: [], risk: 'write',
      }],
    }, null);
    planId = plan.id;
    const completed = createRouterPlan(db, owner.user.id, jid, null, '历史已完成任务', {
      ...plan.route, tasks: [], risk: 'read',
    }, null);
    historyId = completed.id;
    setRouterPlanStatus(db, historyId, 'completed', {
      planId: historyId, status: 'completed', text: '保留的历史结果', tasks: [],
    });
    appendRouterEvent(db, historyId, null, { type: 'completed', text: '保留的历史事件' });
    // 过期审批也属于历史，读取和退役写入口都不能再推进其状态。
    db.prepare('UPDATE agent_router_approvals SET expires_at = ? WHERE plan_id = ?')
      .run('2000-01-01T00:00:00.000Z', planId);
    db.prepare('UPDATE agent_router_plans SET approval_expires_at = ? WHERE id = ?')
      .run('2000-01-01T00:00:00.000Z', planId);
  });

  afterEach(async () => {
    await app?.close();
    db?.close();
  });

  function writeEndpoints() {
    const base = `/api/workspaces/${jid}`;
    return [
      { method: 'POST', path: `${base}/agents` },
      { method: 'DELETE', path: `${base}/agents/${bindingId}` },
      { method: 'POST', path: `${base}/router/plans` },
      ...['dispatch', 'approve', 'reject', 'cancel'].map((action) => ({
        method: 'POST', path: `${base}/router/plans/${planId}/${action}`,
      })),
    ];
  }

  function historyEndpoints(workspaceId = jid) {
    const base = `/api/workspaces/${workspaceId}`;
    return [`${base}/agents`, `${base}/router/plans`,
      `${base}/router/plans/${planId}`, `${base}/router/plans/${historyId}/events`];
  }

  function snapshot() {
    return ['workspace_agent_bindings', 'agent_router_plans', 'agent_router_tasks',
      'agent_router_approvals', 'agent_router_events', 'runner_turns', 'task_runs']
      .map((table) => db.prepare(`SELECT * FROM ${table} ORDER BY rowid`).all());
  }

  it('全部旧写入口返回 410，不修改历史、不创建任务或调用 Runner', async () => {
    const before = snapshot();
    for (const { method, path } of writeEndpoints()) {
      const response = await app.request(path, {
        method, headers: { cookie: `dw_session=${ownerCookie}`, 'content-type': 'application/json' },
        body: JSON.stringify({ message: '请执行', agent_profile_id: 'new-profile' }),
      });
      expect(response.status, path).toBe(410);
      expect(await response.json()).toEqual({
        error: expect.stringContaining('已退役'), code: 'AGENT_ROUTER_RETIRED',
      });
    }
    expect(snapshot()).toEqual(before);
    expect(runner.calls).toHaveLength(0);
  });

  it('仍能读取绑定、计划、任务和事件，且过期审批与历史结果保持原样', async () => {
    const before = snapshot();
    const responses = await Promise.all(historyEndpoints().map((path) =>
      app.request(path, cookieRequest(ownerCookie))));
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200, 200]);
    expect(await responses[0]!.json()).toMatchObject({ agents: [{ bindingId }] });
    expect(await responses[1]!.json()).toMatchObject({ plans: expect.arrayContaining([
      expect.objectContaining({ id: planId, status: 'awaiting_approval', approval_status: 'pending' }),
      expect.objectContaining({ id: historyId, result: expect.objectContaining({ text: '保留的历史结果' }) }),
    ]) });
    expect(await responses[2]!.json()).toMatchObject({
      plan: { id: planId }, tasks: [{ status: 'queued' }],
    });
    expect(await responses[3]!.json()).toEqual({ events: [{ type: 'completed', text: '保留的历史事件' }] });
    expect(snapshot()).toEqual(before);
    expect(runner.calls).toHaveLength(0);
  });

  it('历史读取保持工作区 ACL，拒绝跨用户和跨工作区的计划 ID', async () => {
    for (const path of historyEndpoints()) {
      expect((await app.request(path, cookieRequest(otherCookie))).status, path).toBe(404);
    }
    const base = `/api/workspaces/${otherJid}/router/plans`;
    for (const suffix of [planId, `${historyId}/events`]) {
      expect((await app.request(`${base}/${suffix}`, cookieRequest(ownerCookie))).status).toBe(404);
    }
    const otherPlans = await app.request(base, cookieRequest(ownerCookie));
    expect(otherPlans.status).toBe(200);
    expect(await otherPlans.json()).toEqual({ plans: [] });
  });

  it('历史读取与全部退役写入口仍要求登录', async () => {
    for (const path of historyEndpoints()) {
      expect((await app.request(path)).status, path).toBe(401);
    }
    for (const { method, path } of writeEndpoints()) {
      expect((await app.request(path, { method })).status, path).toBe(401);
    }
  });
});
