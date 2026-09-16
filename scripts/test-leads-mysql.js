"use strict";
// Opt-in only. Never executed by npm test. Does not create a database and refuses
// any nonempty schema or database whose name does not end in _leads_test.
const assert = require("assert"), fs = require("fs"), path = require("path");
const D = require("../leads/domain");
const env = process.env;
if (env.LEADS_TEST_CONFIRM !== "EMPTY_SYNTHETIC_TEST_ONLY" || !/_leads_test$/.test(env.LEADS_MYSQL_DATABASE || "")) {
  console.error("Provide a dedicated empty *_leads_test database and LEADS_TEST_CONFIRM=EMPTY_SYNTHETIC_TEST_ONLY. Never use production."); process.exit(1);
}
const db = require("../leads/database")(env);
const vault = D.vault("1".repeat(64), "2".repeat(64));
const users = [{ id: "a", name: "测试甲", role: "销售人员", status: "启用" }, { id: "b", name: "测试乙", role: "销售人员", status: "启用" }, { id: "admin", name: "测试管理员", role: "管理员", status: "启用" }];
let business = { users, customers: [], orders: [] }, broken = false;
const legacy = { readDb: () => JSON.parse(JSON.stringify(business)), writeDb: data => { if (broken) throw new Error("test write interruption"); business = data; }, normalizeCustomerPhone: value => String(value).replace(/\D/g, "").replace(/^86(?=\d{11}$)/, ""), customerOrderMatchesCustomer: () => false, customerStatsPayload: () => ({ stats: { count: 0, total: 0 } }) };
const service = require("../leads/service")(db, vault, legacy);
async function run() {
  assert.strictEqual((await db.query("SHOW TABLES")).length, 0, "test database must be empty");
  const schema = fs.readFileSync(path.join(__dirname, "../leads/schema.sql"), "utf8").replace(/^--.*$/gm, "");
  for (const statement of schema.split(";").map(s => s.trim()).filter(Boolean)) await db.query(statement);
  await service.migration(users[2], true);
  let shared;
  await db.transaction(async c => { shared = await service.insert(c, { name: "竞争测试", phone: "13800000001" }); });
  const competition = await Promise.allSettled(users.slice(0, 2).map((u, i) => service.move(u, "mysql-race-000000" + i, { action: "claim", ids: [shared] })));
  assert.strictEqual(competition.filter(x => x.status === "fulfilled").length, 1);
  const ownerId = (await db.query("SELECT owner_id FROM lead_resources WHERE id=?", [shared]))[0].owner_id;
  const owner = users.find(u => u.id === ownerId), stranger = users.find(u => u.id !== ownerId && u.role === "销售人员");
  await assert.rejects(service.detail(stranger, shared));
  await service.follow(owner, "mysql-follow-000001", shared, { result: "connected", content: "合成记录" });
  assert.strictEqual((await service.detail(owner, shared)).followups.length, 1);
  const candidates = [];
  await db.transaction(async c => {
    for (let i = 0; i < 498; i++) await service.insert(c, { name: "容量测试", phone: "139" + String(i).padStart(8, "0") }, owner.id);
    for (let i = 0; i < 2; i++) candidates.push(await service.insert(c, { name: "容量竞争", phone: "1370000000" + i }));
  });
  const capacity = await Promise.allSettled(candidates.map((resource, i) => service.move(owner, "mysql-capacity-000" + i, { action: "claim", ids: [resource] })));
  assert.strictEqual(capacity.filter(x => x.status === "fulfilled").length, 1);
  assert.strictEqual(Number((await db.query("SELECT COUNT(*) n FROM lead_resources WHERE owner_id=?", [owner.id]))[0].n), 500);
  broken = true;
  await assert.rejects(service.saveCustomer(owner, { name: "合成客户", phone: "13800000001" }, null, "mysql-customer-001"));
  assert.strictEqual((await db.query("SELECT id FROM lead_customer_operations WHERE status='pending'")).length, 1);
  broken = false; await service.recover(users[2]); await service.recover(users[2]);
  assert.strictEqual(business.customers.length, 1);
  await assert.rejects(service.move(owner, "mysql-return-00001", { action: "return", ids: [shared] }));
  await service.saveCustomer(users[2], { ownerId: stranger.id }, business.customers[0].id, "mysql-reassign-001");
  assert.strictEqual((await db.query("SELECT owner_id FROM lead_resources WHERE id=?", [shared]))[0].owner_id, stranger.id);
  await service.ready();
  const imports = require("../leads/imports")(db, vault, service, legacy);
  const batch = await imports.inspect(users[2], { filename: "synthetic.csv", base64: Buffer.from("姓名,电话\n甲,13600000001\n乙,13600000001\n丙,invalid\n丁,13600000002").toString("base64") });
  await imports.preview(users[2], batch.batchId, { mapping: { name: 0, phone: 1 } });
  await imports.commit(users[2], batch.batchId); await imports.commit(users[2], batch.batchId);
  const counts = (await imports.batches(batch.batchId)).counts;
  assert.strictEqual(Number(counts.find(x => x.status === "success").total), 2);
  assert.strictEqual(Number(counts.find(x => x.status === "duplicate").total), 1);
  assert.strictEqual(Number(counts.find(x => x.status === "invalid").total), 1);
  if (env.LEADS_TEST_ROWS === "50000") {
    const before = Number((await db.query("SELECT COUNT(*) n FROM lead_resources"))[0].n);
    for (let start = before; start < 50000; start += 100) await db.transaction(async c => {
      const values = [], params = [];
      for (let i = start; i < Math.min(start + 100, 50000); i++) {
        const phone = "130" + String(i).padStart(8, "0");
        values.push("(?,?,?,?,?,'load_test',UTC_TIMESTAMP(),UTC_TIMESTAMP())");
        params.push("load" + i, vault.hash(phone), vault.encrypt(phone), "130****" + phone.slice(-4), "合成压测资源");
      }
      await db.query("INSERT INTO lead_resources (id,phone_key,phone_cipher,phone_mask,name,source,created_at,updated_at) VALUES " + values.join(","), params, c);
    });
    const times = [];
    await Promise.all(Array.from({ length: 10 }, async () => { const start = Date.now(); const result = await service.list(owner, new URLSearchParams("scope=public&page=1")); assert(result.items.length <= 20); times.push(Date.now() - start); }));
    console.log("50k synthetic resources / 10 concurrent list latency ms:", times.sort((a, b) => a - b));
  }
  console.log("MySQL integration passed; synthetic test tables retained for inspection. No production JSON was read or written.");
}
run().catch(error => { console.error(error.code || error.message); process.exitCode = 1; }).then(() => db.close());
