const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
assert(!appSource.includes("?."), "public/app.js must remain compatible with the production Node.js syntax check");
assert(!appSource.includes("??"), "public/app.js must not use nullish coalescing on the production Node.js runtime");

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "building-sales-runtime-"));
process.env.RUNTIME_SESSION_PATH = path.join(tempRoot, "sessions.json");
process.env.AUDIT_LOG_DIR = path.join(tempRoot, "audit-logs");

const serverPath = require.resolve("../server");
let server = require(serverPath);
const db = server.readDb();
const enabledUser = db.users.find((user) => user.status === "启用");
assert(enabledUser, "测试数据至少需要一个启用账号");

const rawToken = server.createSession(enabledUser.id);
const persistedText = fs.readFileSync(process.env.RUNTIME_SESSION_PATH, "utf8");
const persisted = JSON.parse(persistedText);
assert(!persistedText.includes(rawToken), "会话文件不得保存原始令牌");
assert.strictEqual(persisted.sessions[0].tokenHash, server.sessionTokenHash(rawToken), "会话文件必须保存令牌哈希");

delete require.cache[serverPath];
server = require(serverPath);
const restoredUser = server.getCurrentUser({ headers: { cookie: `sid=${rawToken}` } });
assert(restoredUser && restoredUser.id === enabledUser.id, "服务模块重新加载后必须恢复有效会话");
server.invalidateUserSessions(enabledUser.id);
assert.strictEqual(server.getCurrentUser({ headers: { cookie: `sid=${rawToken}` } }), null, "账号安全信息变化后旧会话必须失效");

server.appendAuditLog({
  actorId: enabledUser.id, actorName: enabledUser.name, action: "编辑", entityType: "人员", entityId: enabledUser.id,
  before: { password: "secret", role: "销售人员" }, after: { passwordHash: "hash", role: "管理员" },
  requestId: "request-test", result: "成功",
});
const auditRecords = server.readAuditLogs({ keyword: "request-test" });
assert.strictEqual(auditRecords.length, 1, "操作日志必须支持关键词筛选");
assert(!JSON.stringify(auditRecords[0]).includes("secret"), "操作日志不得记录密码");
assert(!JSON.stringify(auditRecords[0]).includes('"hash"'), "操作日志不得记录密码哈希");

const paged = server.pagedResult([1, 2, 3, 4, 5], new URL("http://localhost/api/items?page=2&pageSize=2"), 20);
assert.deepStrictEqual(paged, { items: [3, 4], page: 2, pageSize: 2, total: 5, totalPages: 3 });

const queueEvents = [];
const firstWrite = server.enqueueDbMutation(async () => {
  queueEvents.push("first-start");
  await new Promise((resolve) => setTimeout(resolve, 15));
  queueEvents.push("first-end");
});
const secondWrite = server.enqueueDbMutation(async () => {
  queueEvents.push("second-start");
  queueEvents.push("second-end");
});

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
const dashboardDb = {
  users: [{ id: "admin", name: "管理员" }, { id: "sales-a", name: "甲" }, { id: "sales-b", name: "乙" }],
  customers: [{ id: "customer-a", name: "客户甲", ownerId: "sales-a" }, { id: "customer-b", name: "客户乙", ownerId: "sales-b" }],
  products: [{ id: "p1", cat1: "水电" }],
  orders: [
    { id: "a", no: "A", salesUserId: "sales-a", customerId: "customer-a", date: today, status: "已确认", amount: 100, actualPaidAmount: 80, items: [] },
    { id: "b", no: "B", salesUserId: "sales-b", customerId: "customer-b", date: today, status: "已确认", amount: 50, items: [] },
    { id: "pending", no: "P", salesUserId: "sales-a", customerId: "customer-a", date: today, status: "待确认", amount: 999, items: [] },
  ],
};
Promise.all([firstWrite, secondWrite]).then(() => {
  assert.deepStrictEqual(queueEvents, ["first-start", "first-end", "second-start", "second-end"], "数据库写操作必须严格串行");
  const dashboard = server.dashboardPayload(dashboardDb, { id: "admin", role: "管理员" }, ["sales-a"]);
  assert.strictEqual(dashboard.metrics.todaySales, 80, "概览必须按所选销售和实际付款金额汇总");
  assert.strictEqual(dashboard.metrics.todayOrderCount, 1, "概览必须排除待确认订单");
  assert.strictEqual(dashboard.metrics.todayCustomerCount, 1, "概览客户数必须去重并遵守销售筛选");
  assert(Array.isArray(dashboard.trend) && dashboard.trend.length >= now.getDate(), "概览接口必须返回本月每日经营趋势");
  assert.strictEqual(dashboard.trend[now.getDate() - 1].sales, 80, "趋势销售额必须沿用权限和实际付款口径");

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
const functionNames = Array.from(appSource.matchAll(/^(?:async\s+)?function\s+([\w$]+)\s*\(/gm)).map((match) => match[1]);
const duplicateNames = Array.from(new Set(functionNames.filter((name, index) => functionNames.indexOf(name) !== index)));
assert.deepStrictEqual(duplicateNames, [], "app.js 不得再保留会覆盖前方实现的同名函数");
assert(appSource.includes('/api/bootstrap?mode=summary'), "登录启动必须使用精简 bootstrap");
assert(appSource.includes("latestApiFetch"), "页面搜索必须取消过期请求");
const indexSource = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
assert(indexSource.includes("core.js?v="), "统一请求层必须拆分为独立静态资源");

  fs.rmSync(tempRoot, { recursive: true, force: true });
  console.log("Stability, session, audit and pagination tests passed");
}).catch((error) => {
  fs.rmSync(tempRoot, { recursive: true, force: true });
  throw error;
});
