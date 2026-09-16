"use strict";
const assert = require("assert"), D = require("../leads/domain");
const createService = require("../leads/service");
const normalize = require("../server").normalizeCustomerPhone;
const users = [{ id: "a", name: "甲", role: "销售人员", status: "启用" }, { id: "b", name: "乙", role: "销售人员", status: "启用" }, { id: "admin", name: "管理员", role: "管理员", status: "启用" }];
const secrets = D.vault("1".repeat(64), "2".repeat(64));
const clone = x => JSON.parse(JSON.stringify(x));
// Model transaction rollback and serialized admission; this is not a MySQL test.
function fixture() {
  let state = { rows: [], requests: [], history: [], audit: [], followups: [], operations: [], blocked: [] }, chain = Promise.resolve();
  let business = { users, customers: [], orders: [] }, failWrite = false, queries = [];
  async function query(sql, args) {
    queries.push({ sql, args: clone(args || []) });
    assert.strictEqual((sql.match(/\?/g) || []).length, (args || []).length, "SQL binding count: " + sql);
    if (sql.startsWith("SELECT ready,customer_fingerprint")) {
      const customers = business.customers.map(c => [c.id, c.name || "", c.phone || "", c.ownerId || "", c.contact || "", c.address || "", c.email || ""]);
      customers.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
      return [{ ready: 1, customer_fingerprint: secrets.hash(JSON.stringify(customers)) }];
    }
    if (sql.startsWith("SELECT id FROM lead_customer_operations WHERE status='pending'")) return [];
    if (sql.startsWith("SELECT * FROM lead_requests")) return clone(state.requests.filter(x => x.request_key === args[0]));
    if (sql.startsWith("SELECT COUNT(*) AS n FROM lead_resources r")) return [{ n: 0 }];
    if (sql.startsWith("SELECT COUNT(*) AS n FROM lead_resources")) return [{ n: state.rows.filter(x => x.owner_id === args[0] && x.id !== args[1]).length }];
    if (sql.startsWith("SELECT r.*, 0 AS blocked FROM lead_resources r")) return clone(state.rows.filter(x => x.owner_id === args[0] && state.blocked.indexOf(x.phone_key) < 0).map(x => Object.assign({}, x, { blocked: 0 })));
    if (sql.startsWith("SELECT f.lead_id,f.content,f.created_at FROM lead_followups")) return clone(state.followups.filter(function (item) { return item && !Array.isArray(item) && item.owner_id === args[0]; }));
    if (sql.startsWith("SELECT h.lead_id,MAX(h.created_at) AS entered_at")) return [];
    if (sql.startsWith("SELECT r.*,EXISTS") && sql.indexOf("r.customer_id=?") >= 0) return clone(state.rows.filter(x => x.customer_id === args[0] || x.phone_key === args[1]).map(x => Object.assign({}, x, { blocked: state.blocked.indexOf(x.phone_key) >= 0 ? "1" : "0" })));
    if (sql.startsWith("SELECT r.*") && sql.indexOf("r.phone_key=?") >= 0) return clone(state.rows.filter(x => x.phone_key === args[0]).map(x => Object.assign({}, x, { blocked: state.blocked.indexOf(x.phone_key) >= 0 ? "1" : "0" })));
    if (sql.startsWith("SELECT r.*") && sql.indexOf("r.id=?") >= 0) return clone(state.rows.filter(x => x.id === args[0]).map(x => Object.assign({}, x, { blocked: state.blocked.indexOf(x.phone_key) >= 0 ? "1" : "0" })));
    if (sql.startsWith("SELECT r.id FROM lead_resources")) return clone(state.rows.filter(x => x.phone_key === args[0] && x.id !== args[1]).map(x => ({ id: x.id })));
    if (sql.startsWith("SELECT phone_key FROM lead_do_not_call")) return state.blocked.indexOf(args[0]) >= 0 ? [{ phone_key: args[0] }] : [];
    if (sql.startsWith("SELECT r.*")) return [];
    if (sql.startsWith("INSERT INTO lead_requests")) { state.requests.push({ request_key: args[0], payload_key: args[1], result_json: args[2] }); return {}; }
    if (sql.startsWith("INSERT INTO lead_assignment_history")) { state.history.push(clone(args)); return {}; }
    if (sql.startsWith("INSERT INTO lead_audit")) { state.audit.push(clone(args)); return {}; }
    if (sql.startsWith("UPDATE lead_resources SET owner_id")) {
      const r = state.rows.find(x => x.id === args[1] && x.version === args[2]);
      if (!r) return { affectedRows: 0 }; r.owner_id = args[0]; r.version++; r.next_followup_at = null; return { affectedRows: 1 };
    }
    if (sql.startsWith("INSERT INTO lead_followups")) { state.followups.push(clone(args)); return {}; }
    if (sql.startsWith("UPDATE lead_resources SET next_followup_at")) { const r = state.rows.find(x => x.id === args[1]); Object.assign(r, { next_followup_at: args[0], version: r.version + 1 }); return {}; }
    if (sql.startsWith("UPDATE lead_resources SET consent_status")) {
      const r = state.rows.find(x => x.id === args[1] && x.version === args[2]);
      if (!r) return { affectedRows: 0 }; r.consent_status = args[0]; r.version++; return { affectedRows: 1 };
    }
    if (sql.startsWith("UPDATE lead_resources SET tags")) {
      const r = state.rows.find(x => x.id === args[1] && x.version === args[2]);
      if (!r) return { affectedRows: 0 }; r.tags = args[0]; r.version++; return { affectedRows: 1 };
    }
    if (sql.startsWith("INSERT INTO lead_do_not_call")) { state.blocked.push(args[0]); return {}; }
    if (sql.startsWith("SELECT r.id,r.owner_id,r.customer_id")) return clone(state.rows.filter(x => x.phone_key === args[0]).map(x => Object.assign({}, x, { blocked: state.blocked.indexOf(x.phone_key) >= 0 ? "1" : "0" })));
    if (sql.startsWith("INSERT INTO lead_resources")) { state.rows.push({ id: args[0], phone_key: args[1], phone_cipher: args[2], phone_mask: args[3], name: args[4], contact: args[5], address: args[6], source: args[7], region: args[8], tags: args[9], owner_id: args[10], customer_id: args[11], version: 1 }); return {}; }
    if (sql.startsWith("UPDATE lead_resources SET name=?,phone_key=?")) {
      const r = state.rows.find(x => x.id === args[4] && x.version === args[5]);
      if (!r) return { affectedRows: 0 };
      Object.assign(r, { name: args[0], phone_key: args[1], phone_cipher: args[2], phone_mask: args[3], version: r.version + 1 }); return { affectedRows: 1 };
    }
    if (sql.startsWith("UPDATE lead_resources SET name")) {
      const r = state.rows.find(x => x.id === args[8]);
      Object.assign(r, { name: args[0], contact: args[1], address: args[2], phone_key: args[3], phone_cipher: args[4], phone_mask: args[5], customer_id: args[6], owner_id: args[7], version: r.version + 1 }); return {};
    }
    if (sql.startsWith("INSERT INTO lead_customer_operations")) { state.operations.push({ id: args[0], lead_id: args[1], customer_id: args[2], payload_cipher: args[3], status: "pending" }); return {}; }
    if (sql.startsWith("UPDATE lead_customer_operations")) { state.operations.find(x => x.id === args[0]).status = "done"; return {}; }
    if (sql.startsWith("UPDATE lead_settings SET customer_fingerprint")) return {};
    if (sql.startsWith("SELECT * FROM lead_customer_operations")) return clone(state.operations.filter(x => x.status === "pending"));
    throw new Error("Unmodeled SQL: " + sql);
  }
  const db = { query, transaction: function (task, options) {
    const run = chain.then(async () => {
      if (!(options && options.recovery) && state.operations.some(x => x.status === "pending")) D.fail(503, "pending");
      const before = clone(state);
      try { return await task({}); } catch (error) { state = before; throw error; }
    }); chain = run.catch(() => {}); return run;
  } };
  const legacy = { readDb: () => clone(business), writeDb: data => { if (failWrite) throw new Error("simulated disk interruption"); business = clone(data); }, normalizeCustomerPhone: normalize,
    customerOrderMatchesCustomer: (data, order, customer) => order.customerId === customer.id,
    effectiveOrderAmount: order => Number(order.actualPaidAmount != null ? order.actualPaidAmount : order.amount || 0) };
  return { service: createService(db, secrets, legacy), state: () => state, business: () => business, queries: () => queries,
    failWrite: value => { failWrite = value; }, setBusiness: value => { business = clone(value); },
    add: function (id, owner, number) { state.rows.push({ id, owner_id: owner || null, phone_key: secrets.hash(number || "13800000001"), phone_cipher: secrets.encrypt(number || "13800000001"), phone_mask: "138****0001", name: id, tags: "", consent_status: "unknown", created_at: "2026-08-01T00:00:00.000Z", version: 1, customer_id: null }); } };
}
async function run() {
  let f = fixture(); f.add("shared");
  const results = await Promise.allSettled([f.service.move(users[0], "request-shared-0001", { action: "claim", ids: ["shared"] }), f.service.move(users[1], "request-shared-0002", { action: "claim", ids: ["shared"] })]);
  assert.strictEqual(results.filter(x => x.status === "fulfilled").length, 1);
  assert.strictEqual(f.state().history.length, 1);
  await f.service.move(users[0], "request-shared-0001", { action: "claim", ids: ["shared"] });
  assert.strictEqual(f.state().history.length, 1, "retry must not duplicate history");
  await assert.rejects(f.service.move(users[0], "request-shared-0001", { action: "return", ids: ["shared"] }));
  await assert.rejects(f.service.follow(users[1], "request-follow-0001", "shared", { result: "connected", content: "越权" }));
  await f.service.follow(users[0], "request-follow-0002", "shared", { result: "do_not_call", content: "拒绝联系" });
  assert.strictEqual(f.state().blocked.length, 1);
  await assert.rejects(f.service.follow(users[0], "request-follow-0003", "shared", { result: "connected", content: "后续", nextFollowupAt: "2026-10-01T00:00:00Z" }));
  f = fixture(); for (let i = 0; i < 499; i++) f.add("owned" + i, "a"); f.add("one"); f.add("two");
  const quota = await Promise.allSettled([f.service.move(users[0], "request-quota-0001", { action: "claim", ids: ["one"] }), f.service.move(users[0], "request-quota-0002", { action: "claim", ids: ["two"] })]);
  assert.strictEqual(quota.filter(x => x.status === "fulfilled").length, 1);
  assert.strictEqual(f.state().rows.filter(x => x.owner_id === "a").length, 500);
  f = fixture(); f.add("free"); f.add("taken", "b");
  await assert.rejects(f.service.move(users[0], "request-batch-0001", { action: "claim", ids: ["free", "taken"] }));
  assert.strictEqual(f.state().rows.find(x => x.id === "free").owner_id, null, "failed batch rolls back all claims");
  assert.strictEqual(f.state().history.length, 0);
  f = fixture(); f.add("public", null, "13800000001");
  await assert.rejects(f.service.saveCustomer(users[0], { name: "测试", phone: "13800000001" }, null, "customer-1"));
  f.failWrite(true);
  await assert.rejects(f.service.saveCustomer(users[0], { name: "测试", phone: "+86 138-0000-0001", claimPublic: true }, null, "customer-2"));
  assert.strictEqual(f.state().operations[0].status, "pending");
  await assert.rejects(f.service.move(users[0], "request-block-0001", { action: "return", ids: ["public"] }));
  f.failWrite(false); await f.service.recover(users[2]); await f.service.recover(users[2]);
  assert.strictEqual(f.business().customers.length, 1, "recovery is idempotent");
  const c = f.business().customers[0];
  assert.strictEqual(c.phone, "13800000001"); assert.strictEqual(c.ownerId, "a");
  await assert.rejects(f.service.move(users[0], "request-return-001", { action: "return", ids: ["public"] }));
  await assert.rejects(f.service.saveCustomer(users[0], { ownerId: "b" }, c.id, "customer-3"));
  await f.service.saveCustomer(users[2], { ownerId: "b", name: "更新名称" }, c.id, "customer-4");
  assert.strictEqual(f.business().customers[0].ownerId, "b");
  assert.strictEqual(f.state().rows[0].owner_id, "b"); assert.strictEqual(f.state().rows[0].name, "更新名称");
  const linkedVersion = f.state().rows[0].version;
  const linkedRenamed = await f.service.updateResource(users[1], "linked-edit-name-01", f.state().rows[0].id, { name: "销售同步改名", version: linkedVersion });
  assert.strictEqual(linkedRenamed.name, "销售同步改名");
  assert.strictEqual(f.business().customers[0].name, "销售同步改名", "linked resource name must stay synchronized with the formal customer");
  const linkedPhone = await f.service.updateResource(users[2], "linked-edit-phone-1", f.state().rows[0].id, { name: "管理员同步修改", phone: "13800000022", version: linkedRenamed.version });
  assert.strictEqual(linkedPhone.phone, "13800000022");
  assert.strictEqual(f.business().customers[0].phone, "13800000022", "admin phone edit must stay synchronized with the formal customer");
  assert.strictEqual(f.state().rows[0].phone_key, secrets.hash("13800000022"));
  f = fixture();
  const created = await f.service.addResource(users[0], "request-manual-0001", { name: "手工资源", phone: "13800000003", tag: "业主" });
  assert.strictEqual(created.status, "created");
  assert.strictEqual(f.state().rows[0].owner_id, "a");
  assert.strictEqual(f.state().rows[0].tags, "业主");
  assert.strictEqual(f.business().customers.length, 0, "manual lead must not create a customer");
  const existing = await f.service.addResource(users[0], "request-manual-0002", { name: "不覆盖", phone: "13800000003", tag: "其他" });
  assert.strictEqual(existing.status, "existing");
  f.add("public-two", null, "13800000004");
  const claimed = await f.service.addResource(users[0], "request-manual-0003", { name: "不覆盖公海", phone: "13800000004", tag: "工人", claimPublic: true });
  assert.strictEqual(claimed.status, "claimed");
  assert.strictEqual(f.state().rows.find(x => x.id === "public-two").owner_id, "a");
  f.add("other-two", "b", "13800000005");
  await assert.rejects(f.service.addResource(users[0], "request-manual-0004", { name: "冲突", phone: "13800000005" }));
  f.add("blocked-own", "a", "13800000006");
  f.state().blocked.push(secrets.hash("13800000006"));
  await assert.rejects(f.service.addResource(users[0], "request-manual-0005", { name: "禁联", phone: "13800000006" }), /禁止联系/);
  const blockedMembership = await f.service.lookup(users[0], "13800000006");
  assert.strictEqual(blockedMembership.blocked, true);
  await assert.rejects(f.service.saveCustomer(users[0], { name: "禁联客户", phone: "13800000006" }, null, "customer-blocked"), /禁止联系/);
  const version = f.state().rows[0].version;
  const tagged = await f.service.updateTag(users[0], "request-tag-0001", created.resourceId, { tag: "装修公司负责人/工长", version });
  assert.strictEqual(tagged.tag, "装修公司负责人/工长");
  await assert.rejects(f.service.updateTag(users[1], "request-tag-0002", created.resourceId, { tag: "工人", version: tagged.version }));
  const blockedBeforeWechat = f.state().blocked.length;
  const wechat = await f.service.updateWechatStatus(users[0], "request-wechat-0001", created.resourceId, { wechatStatus: "rejected", version: tagged.version });
  assert.strictEqual(wechat.wechatStatus, "rejected");
  assert.strictEqual(f.state().rows[0].consent_status, "rejected");
  assert.strictEqual(f.state().blocked.length, blockedBeforeWechat, "微信拒绝不能加入拒绝联系名单");
  await assert.rejects(f.service.updateWechatStatus(users[1], "request-wechat-0002", created.resourceId, { wechatStatus: "approved", version: wechat.version }), /无权访问/);
  await assert.rejects(f.service.updateWechatStatus(users[0], "request-wechat-0005", created.resourceId, { version: wechat.version }), /请选择微信状态/);
  await assert.rejects(f.service.updateWechatStatus(users[0], "request-wechat-0003", created.resourceId, { wechatStatus: "invalid-status", version: wechat.version }), /微信状态/);
  await assert.rejects(f.service.updateWechatStatus(users[0], "request-wechat-0004", created.resourceId, { wechatStatus: "approved", version: tagged.version }), /资源已变化/);
  await f.service.follow(users[0], "request-follow-tag-0001", created.resourceId, { result: "connected", content: "已联系" });
  assert.strictEqual(f.state().rows[0].tags, "装修公司负责人/工长", "follow-up must not change the fixed tag");
  assert.strictEqual(f.state().rows[0].consent_status, "rejected", "follow-up must not change WeChat status");
  assert.strictEqual(f.state().followups.filter(Array.isArray).pop()[7], "unknown", "legacy non-null intent column must receive a compatibility value");
  const renamed = await f.service.updateResource(users[0], "request-edit-name-01", created.resourceId, { name: "销售修改姓名", version: f.state().rows[0].version });
  assert.strictEqual(renamed.name, "销售修改姓名");
  assert.strictEqual(f.state().rows[0].phone_key, secrets.hash("13800000003"));
  await assert.rejects(f.service.updateResource(users[0], "request-edit-phone-01", created.resourceId, { name: "越权", phone: "13800000012", version: renamed.version }), /无权修改资源电话/);
  await assert.rejects(f.service.updateResource(users[1], "request-edit-other-01", created.resourceId, { name: "越权姓名", version: renamed.version }), /无权访问/);
  f.add("duplicate-edit", "b", "13800000012");
  await assert.rejects(f.service.updateResource(users[2], "request-edit-duplicate", created.resourceId, { name: "管理员修改", phone: "13800000012", version: renamed.version }), /已属于另一条资源/);
  const adminEdited = await f.service.updateResource(users[2], "request-edit-admin-01", created.resourceId, { name: "管理员修改", phone: "13800000013", version: renamed.version });
  assert.strictEqual(adminEdited.phone, "13800000013");
  assert.strictEqual(f.state().rows[0].phone_key, secrets.hash("13800000013"));
  await assert.rejects(f.service.updateResource(users[2], "request-edit-stale-01", created.resourceId, { name: "旧版本", phone: "13800000014", version: renamed.version }), /资源已变化/);
  const params = new URLSearchParams({ scope: "all", owner: "a", tag: "业主", followed: "yes" });
  await f.service.list(users[2], params);
  const listSql = f.queries().filter(x => x.sql.startsWith("SELECT r.*")).pop();
  assert(listSql.sql.indexOf("r.owner_id=?") >= 0 && listSql.sql.indexOf("lead_followups") >= 0 && listSql.sql.indexOf("r.tags=?") >= 0);
  await f.service.list(users[2], new URLSearchParams({ scope: "all", tag: "unset" }));
  const unsetSql = f.queries().filter(x => x.sql.startsWith("SELECT r.*")).pop();
  assert(unsetSql.sql.indexOf("TRIM(r.tags)=''" ) >= 0);
  await f.service.list(users[0], new URLSearchParams({ scope: "mine", wechatStatus: "unknown" }));
  const wechatFilterSql = f.queries().filter(x => x.sql.startsWith("SELECT r.*,fm.last_followup_at")).pop();
  assert(wechatFilterSql.sql.indexOf("r.consent_status='unknown'") >= 0 && wechatFilterSql.args.indexOf("approved") >= 0, "private sea must filter normalized WeChat status with bound values");
  await assert.rejects(f.service.list(users[0], new URLSearchParams({ scope: "mine", owner: "b" })));
  const orderFragments = { sea_desc: "sea_entered_at DESC", sea_asc: "sea_entered_at ASC", created_desc: "r.created_at DESC", created_asc: "r.created_at ASC", followed_desc: "fm.last_followup_at DESC", followed_asc: "fm.last_followup_at ASC", count_desc: "followup_count,0) DESC", count_asc: "followup_count,0) ASC" };
  for (const mode of Object.keys(orderFragments)) {
    await f.service.list(users[0], new URLSearchParams({ scope: "mine", sort: mode }));
    const sortedSql = f.queries().filter(x => x.sql.startsWith("SELECT r.*,fm.last_followup_at")).pop().sql;
    assert(sortedSql.indexOf(orderFragments[mode]) >= 0, mode + " must use its whitelisted server sort");
  }
  await f.service.list(users[0], new URLSearchParams({ scope: "mine", sort: "r.created_at;DROP TABLE lead_resources" }));
  const safeSortSql = f.queries().filter(x => x.sql.startsWith("SELECT r.*,fm.last_followup_at")).pop().sql;
  assert(safeSortSql.indexOf("DROP TABLE") < 0 && safeSortSql.indexOf("r.created_at DESC") >= 0, "unknown sort falls back safely");
  await f.service.list(users[0], new URLSearchParams({ scope: "mine", q: "138-0000-0001" }));
  const searchQuery = f.queries().filter(x => x.sql.startsWith("SELECT r.*,fm.last_followup_at")).pop();
  assert(searchQuery.sql.indexOf("r.name LIKE ? OR r.phone_key=?") >= 0, "resource search must use bound name and exact phone conditions");
  assert(searchQuery.args.indexOf("%138-0000-0001%") >= 0 && searchQuery.args.indexOf(secrets.hash("13800000001")) >= 0);
  assert(searchQuery.sql.indexOf("AS sea_entered_at") >= 0 && searchQuery.sql.indexOf("lead_assignment_history") >= 0, "list must derive the latest entry into the current sea");
  f = fixture(); f.add("task-own", "a", "13800000007"); f.add("task-other", "b", "13800000008"); f.add("task-blocked", "a", "13800000009");
  f.state().blocked.push(secrets.hash("13800000009"));
  const tasks = await f.service.tasks(users[0], new URLSearchParams());
  assert.deepStrictEqual(tasks.groups.pending.items.map(x => x.id), ["task-own"], "tasks only expose the current owner's contactable resources");
  const taskSql = f.queries().find(x => x.sql.startsWith("SELECT r.*, 0 AS blocked"));
  assert(taskSql.sql.indexOf("r.owner_id=?") >= 0 && taskSql.sql.indexOf("lead_do_not_call") >= 0);
  f = fixture(); f.add("task-order", "a", "13800000010"); f.state().rows[0].customer_id = "customer-task";
  f.state().followups.push({ lead_id: "task-order", owner_id: "a", content: "最近沟通了报价与送货时间", created_at: "2026-08-20T00:00:00.000Z" });
  f.setBusiness({ users, customers: [{ id: "customer-task", ownerId: "a", name: "任务客户", phone: "13800000010" }], orders: [{ id: "order-task", customerId: "customer-task", no: "XS001", date: "2026/7/1", status: "已完成", amount: 1000, actualPaidAmount: 888.5 }] });
  const orderTasks = await f.service.tasks(users[0], new URLSearchParams());
  const orderTask = orderTasks.groups.medium.items[0];
  assert.strictEqual(orderTask.orderAmount, 888.5);
  assert.strictEqual(orderTask.orderCount, 1);
  assert.strictEqual(orderTask.lastFollowupContent, "最近沟通了报价与送货时间");
  assert.strictEqual(orderTask.seaEnteredAt, "2026-08-01T00:00:00.000Z");
  assert(orderTask.reasonShort && orderTask.reasonShort.length <= 16);
  console.log("lead service concurrency model, quota, ownership and interrupted-customer recovery tests passed");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
