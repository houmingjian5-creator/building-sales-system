"use strict";
const assert = require("assert"), D = require("../leads/domain"), worker = require("../leads/import-worker");
const server = require("../server");
const a = { id: "a", name: "甲", role: "销售人员", status: "启用" }, b = { id: "b", name: "乙", role: "销售人员", status: "启用" }, admin = { id: "admin", name: "管理员", role: "管理员", status: "启用" };
const secrets = D.vault("a".repeat(64), "b".repeat(64));
const normalize = server.normalizeCustomerPhone;
async function run() {
  assert.strictEqual(D.phone("+86 138-0000-0001", normalize), "13800000001");
  assert.strictEqual(D.phone("028-88886666", normalize), "02888886666");
  assert.throws(() => D.phone("1.38E+10", normalize));
  assert.throws(() => D.phone("abc13800000001", normalize));
  assert.throws(() => D.date("2026-09-09T12:00"));
  assert.strictEqual(D.date("2026-09-09T12:00:00+08:00").toISOString(), "2026-09-09T04:00:00.000Z");
  assert.strictEqual(D.allowed({ role: "财务" }), false);
  assert.strictEqual(D.allowed({ role: "unknown" }), false);
  assert.throws(() => D.own(b, { owner_id: "a" }));
  const encrypted = secrets.encrypt("13800000001");
  assert.strictEqual(secrets.decrypt(encrypted), "13800000001");
  assert.notStrictEqual(secrets.encrypt("13800000001"), encrypted);
  const tampered = encrypted.split(":"); tampered[2] = "0".repeat(32);
  assert.throws(() => secrets.decrypt(tampered.join(":")));
  const row = { id: "r", phone_cipher: encrypted, phone_key: secrets.hash("13800000001"), phone_mask: "138****0001", owner_id: null, name: "13800000001", source: "13800000001", tags: "13800000001" };
  assert(!JSON.stringify(D.publicLead(row, a, secrets)).includes("13800000001"));
  assert.strictEqual(D.publicLead(Object.assign({}, row, { owner_id: a.id }), a, secrets).phone, "13800000001");
  assert.deepStrictEqual(worker.csv('姓名,电话\r\n"甲,乙",13800000001\r\n"带""引号",13800000002'), [["姓名", "电话"], ["甲,乙", "13800000001"], ['带"引号', "13800000002"]]);
  assert.throws(() => worker.csv('a\n"unfinished'));
  const workbook = await require("xlsx-populate").fromBlankAsync();
  workbook.sheet(0).cell("A1").value([["姓名", "电话"], ["测试", "13800000001"]]);
  const file = await workbook.outputAsync();
  const parsed = await worker.parse({ filename: "test.xlsx", base64: file.toString("base64") });
  assert.deepStrictEqual(parsed.rows, [["测试", "13800000001"]]);
  const disabled = require("../leads")({}, {});
  assert.strictEqual(disabled.capability(a).enabled, false);
  assert.strictEqual(await disabled.handle({ method: "POST" }, {}, new URL("http://localhost/api/customers")), false);
  // Verify routing classification: MySQL operations must not queue behind imports
  // on the legacy JSON queue; customer changes continue using that queue.
  assert.strictEqual(server.isSerializedMutation({ method: "POST", url: "/api/leads/move", headers: {} }), false);
  assert.strictEqual(server.isSerializedMutation({ method: "POST", url: "/api/customers", headers: {} }), true);
  console.log("lead privacy, normalization, import and routing tests passed");
}
run().catch(error => { console.error(error); process.exitCode = 1; });
