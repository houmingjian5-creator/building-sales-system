"use strict";
const crypto = require("crypto");
const path = require("path");
const fork = require("child_process").fork;
const D = require("./domain");
module.exports = function imports(db, vault, service, legacy) {
  let parsing = false;
  const q = db.query;
  function parse(input) {
    if (parsing) D.fail(429, "已有文件正在解析，请稍后重试");
    if (typeof input.base64 !== "string" || input.base64.length > 7100000) D.fail(400, "文件不能超过5MB");
    parsing = true;
    return new Promise((resolve, reject) => {
      const child = fork(path.join(__dirname, "import-worker.js"), [], { execArgv: ["--max-old-space-size=192"],
        env: { SystemRoot: process.env.SystemRoot || "", PATH: process.env.PATH || "" }, stdio: ["ignore", "ignore", "ignore", "ipc"] });
      let settled = false;
      const timer = setTimeout(() => finish(new Error("文件解析超时，请拆分文件")), 30000);
      function finish(error, data) { if (settled) return; settled = true; clearTimeout(timer); parsing = false; child.kill(); if (error) reject(error); else resolve(data); }
      child.on("message", message => {
        let error = null;
        if (message.error) {
          error = new Error(D.text(message.error, 500) || "文件解析失败，请检查文件格式");
          error.status = 400;
        }
        finish(error, message.result);
      });
      child.on("error", error => finish(error));
      child.on("exit", () => finish(new Error("文件解析进程结束，请缩小文件后重试")));
      child.send(input);
    });
  }
  async function inspect(user, input) {
    const filename = D.text(input.filename, 200);
    const parsed = await parse(input);
    const batchId = crypto.randomBytes(16).toString("hex");
    await db.transaction(async c => {
      await q("INSERT INTO lead_import_batches VALUES (?,?,?,'mapping',?,UTC_TIMESTAMP(),UTC_TIMESTAMP())", [batchId, user.id, filename, parsed.rows.length], c);
      for (let start = 0; start < parsed.rows.length; start += 100) {
        const values = [], args = [];
        for (let i = start; i < Math.min(start + 100, parsed.rows.length); i++) {
          values.push("(?,?,?,'raw','')"); args.push(batchId, i + 2, vault.encrypt(JSON.stringify(parsed.rows[i])));
        }
        await q("INSERT INTO lead_import_rows VALUES " + values.join(","), args, c);
      }
      await service.audit(c, user, "import_upload", null, batchId);
    });
    return { batchId, headers: parsed.headers, sample: parsed.rows.slice(0, 5), sheets: parsed.sheets, total: parsed.rows.length };
  }
  async function preview(user, batchId, input) {
    const mapping = input.mapping || {};
    if (!Number.isInteger(mapping.phone) || mapping.phone < 0 || mapping.phone > 59) D.fail(400, "请选择电话列");
    const fields = ["phone", "name", "contact", "address", "source", "region", "tags"];
    fields.forEach(key => { if (mapping[key] !== undefined && (!Number.isInteger(mapping[key]) || mapping[key] < -1 || mapping[key] > 59)) D.fail(400, "字段映射无效"); });
    return db.transaction(async c => {
      const batches = await q("SELECT * FROM lead_import_batches WHERE id=?", [batchId], c);
      if (!batches.length || batches[0].status !== "mapping") D.fail(409, "该批次已预览，请重新上传以修改映射");
      const rows = await q("SELECT * FROM lead_import_rows WHERE batch_id=? ORDER BY row_no", [batchId], c);
      const seen = new Set(), customers = new Set(legacy.readDb().customers.map(x => legacy.normalizeCustomerPhone(x.phone)));
      const keys = [], existing = new Set(), updates = [];
      for (const r of rows) {
        try { const values = JSON.parse(vault.decrypt(r.payload_cipher)); keys.push(vault.hash(service.payloadPhone(values[mapping.phone]))); } catch (_) { /* Report validation below. */ }
      }
      for (let start = 0; start < keys.length; start += 200) {
        const slice = keys.slice(start, start + 200);
        const matches = await q("SELECT phone_key FROM lead_resources WHERE phone_key IN (" + slice.map(() => "?").join(",") + ")", slice, c);
        matches.forEach(r => existing.add(r.phone_key));
      }
      for (const r of rows) {
        const values = JSON.parse(vault.decrypt(r.payload_cipher)), item = {};
        fields.forEach(key => { item[key] = mapping[key] >= 0 ? values[mapping[key]] || "" : ""; });
        let status = "ready", message = "";
        try {
          item.phone = service.payloadPhone(item.phone);
          fields.filter(k => k !== "phone").forEach(k => D.text(item[k], ["address", "tags"].indexOf(k) >= 0 ? 500 : 160));
          if (seen.has(item.phone)) { status = "duplicate"; message = "文件内重复"; }
          else if (customers.has(item.phone)) { status = "duplicate"; message = "已存在正式客户，不覆盖"; }
          else if (existing.has(vault.hash(item.phone))) { status = "duplicate"; message = "资源库已存在，不覆盖"; }
          seen.add(item.phone);
        } catch (error) { status = "invalid"; message = error.message; }
        updates.push([batchId, r.row_no, vault.encrypt(JSON.stringify(item)), status, message]);
      }
      for (let start = 0; start < updates.length; start += 100) {
        const slice = updates.slice(start, start + 100);
        await q("INSERT INTO lead_import_rows VALUES " + slice.map(() => "(?,?,?,?,?)").join(",") + " ON DUPLICATE KEY UPDATE payload_cipher=VALUES(payload_cipher),status=VALUES(status),message=VALUES(message)", [].concat.apply([], slice), c);
      }
      await q("UPDATE lead_import_batches SET status='preview',updated_at=UTC_TIMESTAMP() WHERE id=?", [batchId], c);
      await service.audit(c, user, "import_preview", null, batchId);
      return { ok: true };
    });
  }
  async function commit(user, batchId) {
    return db.transaction(async c => {
      const batches = await q("SELECT * FROM lead_import_batches WHERE id=?", [batchId], c);
      if (!batches.length || ["preview", "processing", "done"].indexOf(batches[0].status) < 0) D.fail(409, "请先完成导入预览");
      const rows = await q("SELECT * FROM lead_import_rows WHERE batch_id=? AND status='ready' ORDER BY row_no LIMIT 100", [batchId], c);
      const customers = new Set(legacy.readDb().customers.map(x => legacy.normalizeCustomerPhone(x.phone)));
      for (const r of rows) {
        const item = JSON.parse(vault.decrypt(r.payload_cipher));
        let status = "success", message = "";
        if (customers.has(item.phone) || (await q("SELECT id FROM lead_resources WHERE phone_key=?", [vault.hash(item.phone)], c)).length) { status = "duplicate"; message = "提交时发现重复，不覆盖"; }
        else {
          const leadId = await service.insert(c, item);
          await service.audit(c, user, "import_resource", leadId, batchId);
        }
        await q("UPDATE lead_import_rows SET status=?,message=? WHERE batch_id=? AND row_no=?", [status, message, batchId, r.row_no], c);
      }
      const remaining = await q("SELECT COUNT(*) n FROM lead_import_rows WHERE batch_id=? AND status='ready'", [batchId], c);
      const done = Number(remaining[0].n) === 0;
      await q("UPDATE lead_import_batches SET status=?,updated_at=UTC_TIMESTAMP() WHERE id=?", [done ? "done" : "processing", batchId], c);
      await service.audit(c, user, "import_chunk", null, batchId);
      return { done, processed: rows.length, remaining: Number(remaining[0].n) };
    });
  }
  async function batches(batchId, page) {
    if (!batchId) return { batches: await q("SELECT * FROM lead_import_batches ORDER BY created_at DESC LIMIT 100") };
    const counts = await q("SELECT status,COUNT(*) total FROM lead_import_rows WHERE batch_id=? GROUP BY status", [batchId]);
    const offset = Math.max(0, Math.min(100, (parseInt(page, 10) || 1) - 1)) * 50;
    const rows = await q("SELECT row_no,status,message FROM lead_import_rows WHERE batch_id=? ORDER BY row_no LIMIT 50 OFFSET " + offset, [batchId]);
    return { batchId, counts, rows };
  }
  return { inspect, preview, commit, batches };
};
