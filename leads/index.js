"use strict";
const D = require("./domain");
module.exports = function createLeads(legacy, env) {
  env = env || process.env;
  const enabled = env.LEADS_ENABLED === "1", active = enabled && env.LEADS_ACTIVE === "1";
  let service, imports;
  const lookups = new Map();
  function initialize() {
    if (!service) {
      const database = require("./database")(env), vault = D.vault(env.LEADS_ENCRYPTION_KEY, env.LEADS_INDEX_KEY);
      service = require("./service")(database, vault, legacy);
      imports = require("./imports")(database, vault, service, legacy);
    }
  }
  function capability(user) { return { enabled: enabled && D.allowed(user) && (active || D.admin(user)), active }; }
  async function handle(req, res, url) {
    const customerWrite = active && ["POST", "PATCH", "PUT", "DELETE"].indexOf(req.method) >= 0 && (url.pathname === "/api/customers" || url.pathname.indexOf("/api/customers/") === 0);
    if (url.pathname.indexOf("/api/leads/") !== 0 && !customerWrite) return false;
    res.setHeader("cache-control", "no-store");
    let actor;
    try {
      if (!enabled) D.fail(404, "外呼模块尚未启用");
      const user = legacy.requireUser(req, res);
      actor = user;
      if (!user) return true;
      if (!D.allowed(user)) D.fail(403, "没有外呼资源权限");
      initialize();
      const action = url.pathname.slice("/api/leads/".length), method = req.method;
      let result;
      if (action === "setup" && method === "GET") result = await service.migration(user, false);
      else if (action === "setup" && method === "POST") {
        if (active) D.fail(409, "请在未激活状态下执行初始化");
        const body = await legacy.readBody(req);
        if (body.confirm !== "MIGRATE_EXISTING_CUSTOMERS") D.fail(400, "请明确确认现有客户关联迁移");
        result = await legacy.enqueueDbMutation(() => service.migration(user, true));
      } else if (action === "recover" && method === "POST") result = await legacy.enqueueDbMutation(() => service.recover(user));
      else {
        if (!active) D.fail(503, "外呼尚未激活，请先完成客户迁移并配置LEADS_ACTIVE");
        await service.ready();
        if (customerWrite) {
          if (!/^\/api\/customers(?:\/[^/]+)?$/.test(url.pathname)) D.fail(404, "客户接口不存在");
          const body = method === "DELETE" ? {} : await legacy.readBody(req);
          const customerId = url.pathname === "/api/customers" ? null : decodeURIComponent(url.pathname.split("/").pop());
          result = await service.saveCustomer(user, body, customerId, req.requestId, method === "DELETE");
        } else if (action === "resources" && method === "GET") result = await service.list(user, url.searchParams);
        else if (action === "resources" && method === "POST") result = await service.addResource(user, req.headers["x-idempotency-key"], await legacy.readBody(req));
        else if (/^resources\/[^/]+$/.test(action) && method === "GET") result = await service.detail(user, action.split("/")[1], url.searchParams.get("page"));
        else if (/^resources\/[^/]+$/.test(action) && method === "PATCH") result = await service.updateTag(user, req.headers["x-idempotency-key"], action.split("/")[1], await legacy.readBody(req));
        else if (action === "move" && method === "POST") result = await service.move(user, req.headers["x-idempotency-key"], await legacy.readBody(req));
        else if (/^resources\/[^/]+\/followups$/.test(action) && method === "POST") result = await service.follow(user, req.headers["x-idempotency-key"], action.split("/")[1], await legacy.readBody(req));
        else if (/^resources\/[^/]+\/dial$/.test(action) && method === "POST") result = await service.dial(user, action.split("/")[1], req.requestId);
        else if (action === "lookup" && method === "POST") {
          const now = Date.now(); lookups.forEach((v, k) => { if (now - v.since > 60000) lookups.delete(k); });
          const limit = lookups.get(user.id) || { since: now, n: 0 }; limit.n++; lookups.set(user.id, limit);
          if (limit.n > 20) D.fail(429, "号码核对过于频繁，请稍后重试");
          result = await service.lookup(user, (await legacy.readBody(req)).phone);
        } else if (action === "do-not-call" && method === "GET") result = await service.doNotCall(user, url.searchParams.get("page"));
        else if (action === "stats" && method === "GET") result = await service.stats(user);
        else if (action === "audit" && method === "GET") result = await service.audits(user, url.searchParams.get("page"));
        else if (action.indexOf("imports") === 0 && D.admin(user)) {
          await service.ready();
          if (action === "imports" && method === "GET") result = await imports.batches();
          else if (action === "imports/inspect" && method === "POST") result = await imports.inspect(user, await legacy.readBody(req));
          else if (/^imports\/[^/]+$/.test(action) && method === "GET") result = await imports.batches(action.split("/")[1], url.searchParams.get("page"));
          else if (/^imports\/[^/]+\/preview$/.test(action) && method === "POST") result = await imports.preview(user, action.split("/")[1], await legacy.readBody(req));
          else if (/^imports\/[^/]+\/commit$/.test(action) && method === "POST") result = await imports.commit(user, action.split("/")[1]);
        }
      }
      if (result === undefined) D.fail(404, "接口不存在或没有权限");
      legacy.sendJson(res, 200, result);
    } catch (error) {
      const status = error.status || (error.code === "ER_DUP_ENTRY" ? 409 : 503);
      const message = error.status ? error.message : error.code === "ER_DUP_ENTRY" ? "号码已存在，请刷新后重试" : "外呼操作暂未完成，请联系管理员检查连接和同步状态";
      if (!error.status) console.error("Lead operation failed:", req.requestId, error.code || "internal");
      if (req.method !== "GET" && legacy.appendAuditLog) {
        try { legacy.appendAuditLog({ actorId: actor && actor.id || "", actorName: actor && actor.name || "", action: "外呼操作", entityType: "外呼", result: "失败", requestId: req.requestId, message }); }
        catch (_) { console.error("Lead audit write failed:", req.requestId); }
      }
      legacy.sendError(res, status, message);
    }
    return true;
  }
  return { handle, capability };
};
