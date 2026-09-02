const assert = require("assert");
const fs = require("fs");
const path = require("path");
const server = require("../server");

const root = path.join(__dirname, "..");
const appSource = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(root, "public", "styles.css"), "utf8");

const db = {
  users: [
    { id: "admin", name: "管理员", role: "管理员", status: "启用" },
    { id: "finance", name: "财务", role: "财务", status: "启用" },
    { id: "sales-a", name: "销售甲", role: "销售人员", status: "启用" },
    { id: "sales-b", name: "销售乙", role: "销售人员", status: "启用" },
  ],
  customers: [
    { id: "c1", name: "重复客户", phone: "13800000001", ownerId: "sales-a" },
    { id: "c2", name: "新客户", phone: "13800000002", ownerId: "sales-a" },
    { id: "c3", name: "乙客户", phone: "13800000003", ownerId: "sales-b" },
    { id: "c4", name: "从未下单", phone: "13800000004", ownerId: "sales-a" },
  ],
  products: [],
  orders: [
    { id: "old-a", no: "ORD-OLD", customerId: "c1", salesUserId: "sales-a", date: "2026/8/30", status: "已完成", amount: 80, items: [] },
    { id: "a1", no: "ORD-A1", customerId: "c1", salesUserId: "sales-a", date: "2026/9/1", status: "已确认", amount: 100, items: [] },
    { id: "a2", no: "ORD-A2", customerId: "c1", salesUserId: "sales-a", date: "2026/9/2", status: "已完成", amount: 200, actualPaidAmount: 150, items: [] },
    { id: "a3", no: "ORD-A3", customerId: "c2", salesUserId: "sales-a", date: "2026/9/2", status: "已确认", amount: 50, items: [] },
    { id: "ar", no: "TH-A", type: "return", customerId: "c1", salesUserId: "sales-a", date: "2026/9/2", status: "已退货", amount: 20, items: [{ quantity: 1, price: 20 }] },
    { id: "pending", no: "ORD-P", customerId: "c1", salesUserId: "sales-a", date: "2026/9/2", status: "待确认", amount: 1000, items: [] },
    { id: "b1", no: "ORD-B1", customerId: "c3", salesUserId: "sales-b", date: "2026/9/2", status: "已完成", amount: 500, items: [] },
  ],
};

const range = server.analyticsRange("2026-09-01", "2026-09-02");
assert.deepStrictEqual(range, {
  from: "2026-09-01",
  to: "2026-09-02",
  days: 2,
  previousFrom: "2026-08-30",
  previousTo: "2026-08-31",
});

const salesA = server.analyticsPayload(db, db.users[2], {
  dateFrom: "2026-09-01",
  dateTo: "2026-09-02",
  salesFilters: ["sales-b"],
  inactiveDays: 30,
  monthCount: 6,
});
assert.deepStrictEqual(salesA.salesFilters, ["sales-a"], "销售人员必须被服务端固定为本人范围");
assert.strictEqual(salesA.summary.netSales.value, 280, "销售额应使用实际收款并扣除退货");
assert.strictEqual(salesA.summary.orderCount.value, 3, "销售订单数不得计入退货和待确认订单");
assert.strictEqual(salesA.returns.amount, 20);
assert.strictEqual(salesA.returns.count, 1);
assert.strictEqual(salesA.customers.counts.ordering, 2);
assert.strictEqual(salesA.customers.counts.new, 1, "第一次有效下单发生在本期才是新客户");
assert.strictEqual(salesA.customers.counts.repeat, 1, "本期两张以上有效销售单才是重复下单客户");
assert(salesA.customers.previews.inactive.some((row) => row.id === "c4" && row.neverOrdered), "从未下单客户必须进入待跟进名单");

const adminAll = server.analyticsPayload(db, db.users[0], { dateFrom: "2026-09-01", dateTo: "2026-09-02" });
assert.strictEqual(adminAll.summary.netSales.value, 780, "管理员默认查看公司整体数据");
assert.strictEqual(adminAll.summary.orderCount.value, 4);

const financeFiltered = server.analyticsPayload(db, db.users[1], {
  dateFrom: "2026-09-01",
  dateTo: "2026-09-02",
  salesFilters: ["sales-b"],
});
assert.strictEqual(financeFiltered.summary.netSales.value, 500, "财务应能筛选个人销售数据");
assert.strictEqual(financeFiltered.summary.orderCount.value, 1);

const detail = server.analyticsCustomerDetailsPayload(db, db.users[0], {
  type: "repeat",
  dateFrom: "2026-09-01",
  dateTo: "2026-09-02",
  page: 1,
  pageSize: 20,
});
assert.strictEqual(detail.total, 1);
assert.strictEqual(detail.items[0].id, "c1");

assert(appSource.includes('navButton("analytics", "数据分析")'), "桌面侧栏必须提供数据分析入口");
assert(appSource.includes('mobileMoreRouteButton("analytics", "数据分析")'), "手机更多菜单必须提供数据分析入口");
assert(appSource.includes("/api/analytics") && appSource.includes("/api/analytics/customers"), "数据分析页面必须读取汇总和客户明细接口");
assert(appSource.includes("dashboard-analytics-entry") && appSource.includes("查看详细分析"), "销售概览必须提供详细分析入口");
assert(stylesSource.includes(".analytics-kpi-grid") && stylesSource.includes(".analytics-chart-grid") && stylesSource.includes(".route-analytics"), "数据分析页面必须包含桌面和手机响应式样式");
assert(/@media \(max-width: 720px\)[\s\S]*?\.analytics-kpi-grid\s*\{\s*grid-template-columns:\s*repeat\(2/.test(stylesSource), "手机端关键指标必须采用双列紧凑布局");

console.log("Analytics permissions, comparison and customer insight tests passed");
