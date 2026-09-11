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
  let business = { users, customers: [], orders: [] }, failWrite = false;
  async function query(sql, args) {
    assert.strictEqual((sql.match(/\?/g) || []).length, (args || []).length, "SQL binding count: " + sql);
    if (sql.startsWith("SELECT * FROM lead_requests")) return clone(state.requests.filter(x => x.request_key === args[0]));
    if (sql.startsWith("SELECT COUNT(*) AS n FROM lead_resources")) return [{ n: state.rows.filter(x => x.owner_id === args[0] && x.id !== args[1]).length }];
    if (sql.startsWith("SELECT r.*")) return clone(state.rows.filter(x => x.id === args[0]).map(x => Object.assign({}, x, { blocked: state.blocked.indexOf(x.phone_key) >= 0 ? "1" : "0" })));
    if (sql.startsWith("INSERT INTO lead_requests")) { state.requests.push({ request_key: args[0], payload_key: args[1], result_json: args[2] }); return {}; }
    if (sql.startsWith("INSERT INTO lead_assignment_history")) { state.history.push(clone(args)); return {}; }
    if (sql.startsWith("INSERT INTO lead_audit")) { state.audit.push(clone(args)); return {}; }
    if (sql.startsWith("UPDATE lead_resources SET owner_id")) {
      const r = state.rows.find(x => x.id === args[1] && x.version === args[2]);
      if (!r) return { affectedRows: 0 }; r.owner_id = args[0]; r.version++; r.next_followup_at = null; return { affectedRows: 1 };
    }
    if (sql.startsWith("INSERT INTO lead_followups")) { state.followups.push(clone(args)); return {}; }
    if (sql.startsWith("UPDATE lead_resources SET intent")) { Object.assign(state.rows.find(x => x.id === args[3]), { intent: args[0], tags: args[1], next_followup_at: args[2] }); return {}; }
    if (sql.startsWith("INSERT INTO lead_do_not_call")) { state.blocked.push(args[0]); return {}; }
    if (sql.startsWith("SELECT phone_key FROM lead_do_not_call")) return state.blocked.indexOf(args[0]) >= 0 ? [{ phone_key: args[0] }] : [];
    if (sql.startsWith("SELECT * FROM lead_resources WHERE customer_id")) return clone(state.rows.filter(x => x.customer_id === args[0] || x.phone_key === args[1]));
    if (sql.startsWith("INSERT INTO lead_resources")) { state.rows.push({ id: args[0], phone_key: args[1], phone_cipher: args[2], phone_mask: args[3], name: args[4], contact: args[5], address: args[6], source: args[7], region: args[8], tags: args[9], owner_id: args[10], customer_id: args[11], version: 1 }); return {}; }
    if (sql.startsWith("UPDATE lead_resources SET name")) {
      Object.assign(state.rows.find(x => x.id === args[8]), { name: args[0], contact: args[1], address: args[2], phone_key: args[3], phone_cipher: args[4], phone_mask: args[5], customer_id: args[6], owner_id: args[7] }); return {};
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
  const legacy = { readDb: () => clone(business), writeDb: data => { if (failWrite) throw new Error("simulated disk interruption"); business = clone(data); }, normalizeCustomerPhone: normalize };
  return { service: createService(db, secrets, legacy), state: () => state, business: () => business,
    failWrite: value => { failWrite = value; }, add: function (id, owner, number) { state.rows.push({ id, owner_id: owner || null, phone_key: secrets.hash(number || "13800000001"), phone_cipher: secrets.encrypt(number || "13800000001"), phone_mask: "138****0001", version: 1, customer_id: null }); } };
}
async function run() {
  let f = fixture(); f.add("shared");
  const results = await Promise.allSettled([f.service.move(users[0], "request-shared-0001", { action: "claim", ids: ["shared"] }), f.service.move(users[1], "request-shared-0002", { action: "claim", ids: ["shared"] })]);
  assert.strictEqual(results.filter(x => x.status === "fulfilled").length, 1);
  assert.strictEqual(f.state().history.length, 1);
  await f.service.move(users[0], "request-shared-0001", { action: "claim", ids: ["shared"] });
  assert.strictEqual(f.state().history.length, 1, "retry must not duplicate history");
  await assert.rejects(f.service.move(users[0], "request-shared-0001", { action: "return", ids: ["shared"] }));
  await assert.rejects(f.service.follow(users[1], "request-follow-0001", "shared", { result: "connected", intent: "high", content: "越权" }));
  await f.service.follow(users[0], "request-follow-0002", "shared", { result: "do_not_call", intent: "low", content: "拒绝联系" });
  assert.strictEqual(f.state().blocked.length, 1);
  await assert.rejects(f.service.follow(users[0], "request-follow-0003", "shared", { result: "connected", intent: "high", content: "后续", nextFollowupAt: "2026-10-01T00:00:00Z" }));
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
  console.log("lead service concurrency model, quota, ownership and interrupted-customer recovery tests passed");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
