"use strict";
const crypto = require("crypto");
const D = require("./domain");
const id = () => crypto.randomBytes(16).toString("hex");
module.exports = function service(db, secrets, legacy) {
  const q = db.query;
  function customerFingerprint() {
    const customers = legacy.readDb().customers.map(c => [c.id, c.name || "", c.phone || "", c.ownerId || "", c.contact || "", c.address || "", c.email || ""]);
    customers.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    return secrets.hash(JSON.stringify(customers));
  }
  async function audit(c, user, action, leadId, requestId) {
    await q("INSERT INTO lead_audit (id,request_id,actor_id,action,lead_id,created_at) VALUES (?,?,?,?,?,UTC_TIMESTAMP())", [id(), requestId || "", user.id, action, leadId || null], c);
  }
  async function history(c, user, action, row, owner, reason) {
    await q("INSERT INTO lead_assignment_history (id,lead_id,actor_id,actor_name,action,from_owner,to_owner,reason,created_at) VALUES (?,?,?,?,?,?,?,?,UTC_TIMESTAMP())",
      [id(), row.id, user.id, user.name, action, row.owner_id || null, owner || null, D.text(reason, 500)], c);
  }
  async function ready() {
    const rows = await q("SELECT ready,customer_fingerprint FROM lead_settings WHERE id=1");
    if (!rows.length || !rows[0].ready) D.fail(503, "请先完成现有客户关联检查与迁移");
    const pending = await q("SELECT id FROM lead_customer_operations WHERE status='pending' LIMIT 1");
    if (pending.length) D.fail(503, "客户同步待恢复，请联系管理员");
    if (rows[0].customer_fingerprint !== customerFingerprint()) D.fail(503, "客户数据在外呼同步流程之外发生变化，请管理员核对关联后再启用");
  }
  async function capacity(c, owner, excludeId) {
    if (!owner) return;
    const user = legacy.readDb().users.find(u => u.id === owner && u.status === "启用" && D.allowed(u));
    if (!user) D.fail(400, "负责人不存在、已停用或没有资源权限");
    const rows = await q("SELECT COUNT(*) AS n FROM lead_resources WHERE owner_id=? AND id<>?", [owner, excludeId || ""], c);
    if (Number(rows[0].n) >= D.LIMIT) D.fail(409, "该人员私海已达到500条上限");
  }
  async function row(c, leadId, user) {
    const rows = await q("SELECT r.*, EXISTS(SELECT 1 FROM lead_do_not_call d WHERE d.phone_key=r.phone_key) AS blocked FROM lead_resources r WHERE r.id=?", [leadId], c);
    if (!rows.length) D.fail(404, "资源不存在");
    if (user) D.own(user, rows[0]);
    return rows[0];
  }
  function payloadPhone(value) { return D.phone(value, legacy.normalizeCustomerPhone); }
  async function insert(c, input, owner, customerId) {
    const number = payloadPhone(input.phone);
    const leadId = id();
    await q("INSERT INTO lead_resources (id,phone_key,phone_cipher,phone_mask,name,contact,address,source,region,tags,owner_id,customer_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP(),UTC_TIMESTAMP())",
      [leadId, secrets.hash(number), secrets.encrypt(number), number.slice(0, 3) + "****" + number.slice(-4), D.text(input.name || "未命名", 160), D.text(input.contact, 160), D.text(input.address, 500), D.text(input.source, 160), D.text(input.region, 160), D.text(input.tags, 500), owner || null, customerId || null], c);
    return leadId;
  }
  async function mutate(user, requestId, payload, task) {
    if (!/^[a-zA-Z0-9_-]{16,80}$/.test(requestId || "")) D.fail(400, "缺少有效操作编号，请刷新后重试");
    const key = secrets.hash(user.id + ":" + requestId);
    const fingerprint = secrets.hash(JSON.stringify(payload));
    return db.transaction(async c => {
      const old = await q("SELECT * FROM lead_requests WHERE request_key=?", [key], c);
      if (old.length) {
        if (old[0].payload_key !== fingerprint) D.fail(409, "操作编号已用于其他请求");
        return JSON.parse(old[0].result_json);
      }
      const result = await task(c);
      await q("INSERT INTO lead_requests VALUES (?,?,?,UTC_TIMESTAMP())", [key, fingerprint, JSON.stringify(result)], c);
      return result;
    });
  }
  async function list(user, params) {
    await ready();
    const page = Math.max(1, Math.min(2500, parseInt(params.get("page"), 10) || 1));
    const size = 20;
    const scope = params.get("scope") || "public";
    const where = [], args = [];
    if (scope === "public") {
      where.push("r.owner_id IS NULL");
      // The public pool is an actionable claim queue. Keep do-not-call records
      // available to administrators in the global view, but never offer them
      // to salespeople (or include them in a batch claim).
      where.push("NOT EXISTS(SELECT 1 FROM lead_do_not_call d WHERE d.phone_key=r.phone_key)");
    }
    else if (scope === "all" && D.admin(user)) { /* admin global list */ }
    else { where.push("r.owner_id=?"); args.push(user.id); }
    ["source", "region", "intent"].forEach(key => { if (params.get(key)) { where.push("r." + key + "=?"); args.push(D.text(params.get(key), 160)); } });
    if (params.get("tag")) { where.push("FIND_IN_SET(?,r.tags)>0"); args.push(D.text(params.get("tag"), 80)); }
    if (params.get("due") === "overdue") where.push("r.next_followup_at<UTC_TIMESTAMP()");
    if (params.get("due") === "scheduled") where.push("r.next_followup_at IS NOT NULL");
    ["from", "to"].forEach(key => { if (params.get(key)) { where.push("r.created_at" + (key === "from" ? ">=?" : "<=?")); args.push(D.date(params.get(key))); } });
    const sql = where.length ? " WHERE " + where.join(" AND ") : "";
    const count = await q("SELECT COUNT(*) AS n FROM lead_resources r" + sql, args);
    const rows = await q("SELECT r.*, EXISTS(SELECT 1 FROM lead_do_not_call d WHERE d.phone_key=r.phone_key) AS blocked FROM lead_resources r" + sql + " ORDER BY r.created_at DESC,r.id DESC LIMIT " + size + " OFFSET " + ((page - 1) * size), args);
    return { items: rows.map(r => D.publicLead(r, user, secrets)), total: Number(count[0].n), page, pageSize: size };
  }
  async function detail(user, leadId, page) {
    await ready();
    const r = await row(null, leadId, user);
    const offset = Math.max(0, Math.min(10000, (parseInt(page, 10) || 1) - 1)) * 50;
    const followups = await q("SELECT id,actor_name,method,result,content,intent,next_followup_at,created_at FROM lead_followups WHERE lead_id=? ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET " + offset, [leadId]);
    const movements = await q("SELECT actor_name,action,from_owner,to_owner,reason,created_at FROM lead_assignment_history WHERE lead_id=? ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET " + offset, [leadId]);
    const data = legacy.readDb();
    const customer = data.customers.find(x => x.id === r.customer_id);
    const orders = customer ? data.orders.filter(o => legacy.customerOrderMatchesCustomer(data, o, customer)).map(o => ({ id: o.id, no: o.no, date: o.date, status: o.status, amount: o.amount, type: o.type, salesUserId: o.salesUserId })) : [];
    const current = await row(null, leadId, user);
    if (current.version !== r.version) D.fail(409, "资源已变化，请重新打开详情");
    return { resource: D.publicLead(r, user, secrets), followups, movements, orders: orders.slice(offset, offset + 50), orderTotal: orders.length, historyPage: offset / 50 + 1 };
  }
  async function move(user, requestId, input) {
    const ids = Array.from(new Set(input.ids || [])).sort();
    if (!ids.length || ids.length > 100 || ids.some(v => typeof v !== "string" || v.length > 40)) D.fail(400, "每次请选择1至100条资源");
    if (["claim", "return", "assign", "recycle"].indexOf(input.action) < 0) D.fail(400, "无效流转操作");
    if (["assign", "recycle"].indexOf(input.action) >= 0 && !D.admin(user)) D.fail(403, "只有管理员可以分配或回收");
    return mutate(user, requestId, input, async c => {
      for (const leadId of ids) {
        const r = await row(c, leadId);
        let owner = null;
        if (input.action === "claim") {
          if (r.owner_id) D.fail(409, "资源已被领取，请刷新列表");
          if (r.blocked) D.fail(409, "禁止联系资源不能领取");
          if (r.customer_id) D.fail(409, "正式客户归属请由管理员调整");
          owner = user.id;
        } else if (input.action === "return") {
          D.own(user, r);
          if (r.customer_id) D.fail(403, "正式客户只能由管理员调整所属");
        } else {
          if (r.customer_id) D.fail(409, "请在客户管理中修改正式客户所属，同步其私海归属");
          owner = input.action === "assign" ? D.text(input.ownerId, 64) : null;
          if (input.action === "assign" && !owner) D.fail(400, "请选择负责人");
        }
        await capacity(c, owner, r.id);
        const update = await q("UPDATE lead_resources SET owner_id=?,next_followup_at=NULL,version=version+1,updated_at=UTC_TIMESTAMP() WHERE id=? AND version=?", [owner, r.id, r.version], c);
        if (update.affectedRows !== 1) D.fail(409, "资源状态已变化");
        await history(c, user, input.action, r, owner, input.reason);
        await audit(c, user, input.action, r.id, requestId);
      }
      return { ok: true, count: ids.length };
    });
  }
  async function follow(user, requestId, leadId, input) {
    return mutate(user, requestId, { leadId, input }, async c => {
      const r = await row(c, leadId, user);
      if (D.RESULTS.indexOf(input.result) < 0 || D.INTENTS.indexOf(input.intent) < 0) D.fail(400, "请选择有效跟进结果和意向");
      const content = D.text(input.content, 4000);
      if (!content) D.fail(400, "请填写跟进内容");
      const next = D.date(input.nextFollowupAt);
      if ((r.blocked || input.result === "do_not_call") && next) D.fail(400, "禁止联系资源不能设置联系任务");
      await q("INSERT INTO lead_followups VALUES (?,?,?,?,?,?,?,?,?,UTC_TIMESTAMP())", [id(), r.id, user.id, user.name, "manual", input.result, content, input.intent, next], c);
      await q("UPDATE lead_resources SET intent=?,tags=?,next_followup_at=?,version=version+1,updated_at=UTC_TIMESTAMP() WHERE id=?", [input.intent, D.text(input.tags, 500), next, r.id], c);
      if (input.result === "do_not_call") await q("INSERT INTO lead_do_not_call VALUES (?,?,?,UTC_TIMESTAMP()) ON DUPLICATE KEY UPDATE reason=VALUES(reason),actor_id=VALUES(actor_id)", [r.phone_key, "销售跟进标记拒绝联系", user.id], c);
      await audit(c, user, "followup", r.id, requestId);
      return { ok: true };
    });
  }
  async function lookup(user, number) {
    await ready();
    const normalized = payloadPhone(number);
    const rows = await q("SELECT id,owner_id,customer_id FROM lead_resources WHERE phone_key=?", [secrets.hash(normalized)]);
    if (!rows.length) {
      if (legacy.readDb().customers.some(x => legacy.normalizeCustomerPhone(x.phone) === normalized)) D.fail(409, "现有客户关联缺失，请联系管理员核对");
      return { location: "new" };
    }
    const r = rows[0];
    const location = !r.owner_id ? "public" : r.owner_id === user.id ? "mine" : "other";
    // A lookup discloses only the membership state, never another salesperson's details.
    return { location, resourceId: location === "other" && !D.admin(user) ? undefined : r.id };
  }
  async function dial(user, leadId, requestId) {
    return db.transaction(async c => {
      const r = await row(c, leadId, user);
      if (r.blocked) D.fail(403, "该资源已禁止联系");
      await audit(c, user, "dial_intent", r.id, requestId);
      return { phone: secrets.decrypt(r.phone_cipher) };
    });
  }
  async function replay(operation) {
    const payload = JSON.parse(secrets.decrypt(operation.payload_cipher));
    const data = legacy.readDb();
    const old = data.customers.find(x => x.id === operation.customer_id);
    if (payload.deleted) {
      if (old) { legacy.preserveCustomerOrderSnapshots(data, old); data.customers = data.customers.filter(x => x.id !== old.id); legacy.writeDb(data); }
    } else {
      const duplicate = data.customers.find(x => x.id !== payload.customer.id && legacy.normalizeCustomerPhone(x.phone) === legacy.normalizeCustomerPhone(payload.customer.phone));
      if (duplicate) D.fail(409, "客户号码冲突，请管理员核对后恢复");
      if (old) Object.assign(old, payload.customer); else data.customers.unshift(payload.customer);
      legacy.writeDb(data);
    }
    await db.transaction(async c => {
      await q("UPDATE lead_customer_operations SET status='done',completed_at=UTC_TIMESTAMP() WHERE id=?", [operation.id], c);
      await q("UPDATE lead_settings SET customer_fingerprint=? WHERE id=1", [customerFingerprint()], c);
    }, { recovery: true });
    return payload.deleted ? { ok: true, customerId: operation.customer_id } : { customer: payload.customer };
  }
  // Caller must hold the legacy mutation queue, including recovery and conversion.
  async function saveCustomer(user, input, customerId, requestId, deleting) {
    if (!D.allowed(user)) D.fail(403, "没有客户资源操作权限");
    const data = legacy.readDb();
    const old = customerId ? data.customers.find(x => x.id === customerId) : null;
    if (customerId && !old) D.fail(404, "客户不存在");
    if (old && !D.admin(user) && old.ownerId !== user.id) D.fail(403, "无权编辑该客户");
    if (deleting && !D.admin(user)) D.fail(403, "只有管理员可以删除客户");
    if (!D.admin(user) && input.ownerId && input.ownerId !== user.id) D.fail(403, "只有管理员有权限修改客户所属");
    const customer = Object.assign({}, old || { id: id(), createdAt: new Date().toISOString() });
    ["name", "phone", "contact", "address", "email"].forEach(key => { if (input[key] !== undefined) customer[key] = D.text(input[key], key === "address" ? 500 : 160); });
    if (!deleting) { if (!customer.name) D.fail(400, "客户名称必填"); customer.phone = payloadPhone(customer.phone); }
    customer.ownerId = D.admin(user) ? (input.ownerId || customer.ownerId || user.id) : user.id;
    const duplicate = data.customers.find(x => x.id !== customer.id && legacy.normalizeCustomerPhone(x.phone) === legacy.normalizeCustomerPhone(customer.phone));
    if (!deleting && duplicate) D.fail(409, duplicate.ownerId === user.id ? "该客户已在本人名下，请打开原记录" : "客户已在其他人员名下，只有管理员可以调整所属");
    const operation = await db.transaction(async c => {
      const found = await q("SELECT * FROM lead_resources WHERE customer_id=? OR phone_key=? FOR UPDATE", [customer.id, secrets.hash(customer.phone)], c);
      if (found.length > 1) D.fail(409, "新号码已属于另一资源，不能合并覆盖");
      let r = found[0];
      if (r && r.customer_id && r.customer_id !== customer.id) D.fail(409, "号码已关联其他客户");
      if (r && !old && r.owner_id && r.owner_id !== customer.ownerId) D.fail(409, "资源已在其他人员名下，只有管理员可以先调整所属");
      if (r && !old && !r.owner_id && !input.claimPublic) D.fail(409, "客户在公海，请确认纳入本人名下");
      if (r && !old && !r.owner_id) {
        const blocked = await q("SELECT phone_key FROM lead_do_not_call WHERE phone_key=?", [r.phone_key], c);
        if (blocked.length) D.fail(409, "禁止联系资源不能纳入");
      }
      if (!deleting) await capacity(c, customer.ownerId, r && r.id);
      if (!r) {
        if (old) D.fail(409, "现有客户尚未关联资源，请先核对迁移");
        r = await row(c, await insert(c, customer, customer.ownerId, customer.id));
      }
      if (deleting) {
        await q("UPDATE lead_resources SET customer_id=NULL,version=version+1,updated_at=UTC_TIMESTAMP() WHERE id=?", [r.id], c);
      } else {
        await q("UPDATE lead_resources SET name=?,contact=?,address=?,phone_key=?,phone_cipher=?,phone_mask=?,customer_id=?,owner_id=?,version=version+1,updated_at=UTC_TIMESTAMP() WHERE id=?", [customer.name, customer.contact || "", customer.address || "", secrets.hash(customer.phone), secrets.encrypt(customer.phone), customer.phone.slice(0, 3) + "****" + customer.phone.slice(-4), customer.id, customer.ownerId, r.id], c);
      }
      await history(c, user, deleting ? "unlink_customer" : old ? "update_customer" : "convert_customer", r, r.owner_id === customer.ownerId ? r.owner_id : customer.ownerId, "客户管理同步");
      await audit(c, user, deleting ? "unlink_customer" : "sync_customer", r.id, requestId);
      const op = { id: id(), lead_id: r.id, customer_id: customer.id, payload_cipher: secrets.encrypt(JSON.stringify({ customer, deleted: Boolean(deleting) })) };
      await q("INSERT INTO lead_customer_operations (id,lead_id,customer_id,payload_cipher,created_at) VALUES (?,?,?,?,UTC_TIMESTAMP())", [op.id, op.lead_id, op.customer_id, op.payload_cipher], c);
      return op;
    });
    return replay(operation);
  }
  async function recover(user) {
    if (!D.admin(user)) D.fail(403, "只有管理员可以恢复客户同步");
    const pending = await q("SELECT * FROM lead_customer_operations WHERE status='pending' ORDER BY created_at,id");
    for (const op of pending) await replay(op);
    return { ok: true, recovered: pending.length };
  }
  async function migration(user, apply) {
    if (!D.admin(user)) D.fail(403, "只有管理员可以核对现有客户");
    const data = legacy.readDb(), errors = [], counts = {}, seen = new Set();
    for (const customer of data.customers) {
      let number;
      try { number = payloadPhone(customer.phone); } catch (_) { errors.push({ customerId: customer.id, reason: "号码格式需人工核对" }); continue; }
      if (seen.has(number)) errors.push({ customerId: customer.id, reason: "重复号码" });
      seen.add(number);
      const owner = data.users.find(x => x.id === customer.ownerId && D.allowed(x));
      if (!owner) errors.push({ customerId: customer.id, reason: "负责人缺失或不具备资源权限" });
      counts[customer.ownerId] = (counts[customer.ownerId] || 0) + 1;
    }
    Object.keys(counts).forEach(ownerId => { if (counts[ownerId] > D.LIMIT) errors.push({ ownerId, reason: "现有客户超过500条" }); });
    if (!apply) return { total: data.customers.length, counts, errors, note: "仅读取客户，不修改原数据；启用前需暂停客户写入" };
    if (errors.length) D.fail(409, "存在迁移冲突，请先查看核对报告");
    return db.transaction(async c => {
      const existing = await q("SELECT COUNT(*) AS n FROM lead_resources", [], c);
      if (Number(existing[0].n)) D.fail(409, "资源库非空，不允许重复初始化或覆盖");
      for (const customer of data.customers) {
        const leadId = await insert(c, Object.assign({}, customer, { source: "existing_customer" }), customer.ownerId, customer.id);
        await history(c, user, "migrate_customer", { id: leadId }, customer.ownerId, "现有客户关联初始化");
      }
      await q("UPDATE lead_settings SET ready=1,customer_fingerprint=? WHERE id=1", [customerFingerprint()], c);
      await audit(c, user, "migrate_customers", null, "setup");
      return { ok: true, count: data.customers.length };
    }, { setup: true });
  }
  async function stats(user) {
    await ready();
    const where = D.admin(user) ? "" : " WHERE owner_id=?", args = D.admin(user) ? [] : [user.id];
    const resources = await q("SELECT owner_id,COUNT(*) total,SUM(next_followup_at IS NOT NULL) scheduled,SUM(next_followup_at<UTC_TIMESTAMP()) overdue,SUM(intent='high') interested,SUM(customer_id IS NOT NULL) customers FROM lead_resources" + where + " GROUP BY owner_id", args);
    const movements = await q("SELECT actor_id,action,COUNT(*) total FROM lead_assignment_history" + (D.admin(user) ? "" : " WHERE actor_id=?") + " GROUP BY actor_id,action", args);
    const connections = await q("SELECT actor_id,COUNT(*) total FROM lead_followups WHERE result='connected'" + (D.admin(user) ? "" : " AND actor_id=?") + " GROUP BY actor_id", args);
    const linked = await q("SELECT customer_id FROM lead_resources" + (where ? where + " AND customer_id IS NOT NULL" : " WHERE customer_id IS NOT NULL"), args);
    const customerIds = new Set(linked.map(r => r.customer_id)), data = legacy.readDb();
    const sales = { customers: 0, orders: 0, amount: 0 };
    data.customers.filter(c => customerIds.has(c.id)).forEach(c => {
      const summary = legacy.customerStatsPayload(data, c, null).stats;
      if (summary.count) sales.customers++;
      sales.orders += summary.count; sales.amount += summary.total;
    });
    return { resources, movements, connections, sales, note: "累计口径；接通为人工填写。关联成交使用旧客户有效销售单口径，不含退货单，不改变原销售业绩归属。" };
  }
  async function audits(user, page) {
    if (!D.admin(user)) D.fail(403, "只有管理员可以查看外呼审计");
    const offset = Math.max(0, Math.min(100000, (parseInt(page, 10) || 1) - 1)) * 50;
    return { items: await q("SELECT id,request_id,actor_id,action,lead_id,created_at FROM lead_audit ORDER BY created_at DESC,id DESC LIMIT 50 OFFSET " + offset) };
  }
  async function doNotCall(user, page) {
    if (!D.admin(user)) D.fail(403, "只有管理员可以查看拒绝联系名单");
    await ready();
    const currentPage = Math.max(1, Math.min(2000, parseInt(page, 10) || 1));
    const size = 50, offset = (currentPage - 1) * size;
    const count = await q("SELECT COUNT(*) AS n FROM lead_do_not_call");
    const rows = await q("SELECT d.reason,d.actor_id,d.created_at,r.id AS lead_id,r.phone_mask,r.name,r.owner_id FROM lead_do_not_call d LEFT JOIN lead_resources r ON r.phone_key=d.phone_key ORDER BY d.created_at DESC,d.phone_key LIMIT " + size + " OFFSET " + offset);
    const users = legacy.readDb().users;
    function userName(userId) {
      const found = users.find(u => u.id === userId);
      return found ? found.name : userId || "未知";
    }
    return {
      items: rows.map(r => ({ leadId: r.lead_id, phone: r.phone_mask || "资源已不存在", name: r.name || "未关联资源", reason: r.reason || "未填写", actorName: userName(r.actor_id), ownerName: r.owner_id ? userName(r.owner_id) : "公海", createdAt: r.created_at })),
      total: Number(count[0].n), page: currentPage, pageSize: size
    };
  }
  return { ready, list, detail, move, follow, lookup, dial, saveCustomer, recover, migration, stats, audits, doNotCall, insert, audit, payloadPhone };
};
