const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  customerOrderMatchesCustomer,
  customerOrdersForUser,
  orderMatchesSearch,
  publicOrder,
  customerStatsPayload,
  isReceivableOrder,
  dashboardReceivableOrders,
} = require("../server");

const customer = { id: "customer-new", name: "测试客户", phone: "138-0013-8000", ownerId: "sales-a" };
const otherCustomer = { id: "customer-other", name: "其他客户", phone: "13900000000", ownerId: "sales-b" };
const db = {
  customers: [customer, otherCustomer],
  orders: [
    { id: "exact", customerId: customer.id, customerPhone: "13800138000", salesUserId: "sales-a", date: "2026/8/2", amount: 100 },
    { id: "legacy", customerId: "customer-deleted", customerPhone: "+86 13800138000", salesUserId: "sales-a", date: "2026/8/3", amount: 200 },
    { id: "other", customerId: otherCustomer.id, customerPhone: "13800138000", salesUserId: "sales-b", date: "2026/8/4", amount: 300 },
    { id: "deleted", customerId: customer.id, customerPhone: "13800138000", salesUserId: "sales-a", date: "2026/8/5", amount: 400, deletedAt: "2026-08-06" },
    { id: "return", type: "return", no: "TH1", customerId: customer.id, customerPhone: "13800138000", salesUserId: "sales-a", date: "2026/8/6", amount: -50 },
    { id: "pending", customerId: customer.id, customerPhone: "13800138000", salesUserId: "sales-a", date: "2026/8/7", amount: 500, status: "待确认" },
    { id: "cancelled", customerId: customer.id, customerPhone: "13800138000", salesUserId: "sales-a", date: "2026/8/8", amount: 600, status: "已取消" },
  ],
};

assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[0], customer), true, "exact customer id must match");
assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[1], customer), true, "orphaned legacy id should recover by unique phone");
assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[2], customer), false, "an existing different customer id must not be reassigned by phone");
assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[3], customer), false, "deleted orders must stay hidden");
assert.strictEqual(orderMatchesSearch(db, db.orders[1], customer.name), true, "order search must match the current linked customer name for legacy snapshots");
assert.strictEqual(orderMatchesSearch(db, db.orders[2], customer.name), false, "order search must not associate an order with a different existing customer by phone");
assert.strictEqual(publicOrder(db.orders[1], db).customerName, customer.name, "order responses must include the linked customer name when legacy order snapshots are missing");

const salesOrders = customerOrdersForUser(db, customer, { id: "sales-a", role: "销售人员" });
assert.deepStrictEqual(salesOrders.map((order) => order.id), ["exact", "legacy", "return", "pending", "cancelled"], "sales scope and recovered history must retain pending and cancelled orders");

const summary = customerStatsPayload(db, customer, { id: "sales-a", role: "销售人员" });
assert.strictEqual(summary.stats.count, 2, "returns must not count as customer sales orders");
assert.strictEqual(summary.stats.total, 300, "customer total must include exact and safely recovered orders");
assert.strictEqual(summary.stats.last, "2026/8/3", "latest sales order date must be returned");
assert.deepStrictEqual(summary.orders.map((order) => order.id), ["exact", "legacy", "pending", "cancelled"], "customer order references must retain pending and cancelled orders");

const debtDb = { customers: [customer, otherCustomer], orders: [
  { id: "unpaid-adjusted", customerId: customer.id, salesUserId: "sales-a", status: "已确认", payStatus: "未回款", amount: 1000, actualPaidAmount: 850, date: "2026/9/1" },
  { id: "unpaid-legacy", customerId: customer.id, salesUserId: "sales-a", status: "已发货", payStatus: "未付款", amount: 100, date: "2026/9/2" },
  { id: "paid", customerId: customer.id, salesUserId: "sales-a", status: "已完成", payStatus: "已付款", amount: 200, date: "2026/9/3" },
  { id: "draft", customerId: customer.id, salesUserId: "sales-a", status: "待确认", payStatus: "未付款", amount: 300, date: "2026/9/4" },
  { id: "return", customerId: customer.id, salesUserId: "sales-a", type: "return", status: "已退货", payStatus: "未付款", amount: -50, date: "2026/9/5" },
  { id: "other-sales", customerId: otherCustomer.id, salesUserId: "sales-b", status: "已完成", payStatus: "未付款", amount: 400, date: "2026/9/6" },
] };
const debtSummary = customerStatsPayload(debtDb, customer, { id: "sales-a", role: "销售人员" });
assert.strictEqual(debtSummary.stats.unpaidTotal, 950, "customer receivable uses the adjusted final amount of unpaid valid sales orders");
assert.strictEqual(debtSummary.stats.unpaidCount, 2);
assert.strictEqual(isReceivableOrder(debtDb.orders[2]), false, "paid orders must not appear in debt details");
assert.strictEqual(isReceivableOrder(debtDb.orders[3]), false, "draft orders must not appear in debt details");
assert.strictEqual(isReceivableOrder(debtDb.orders[4]), false, "returns must not appear in debt details");
assert.deepStrictEqual(dashboardReceivableOrders(debtDb, { id: "sales-a", role: "销售人员" }, ["sales-b"]).map((order) => order.id), ["unpaid-adjusted", "unpaid-legacy"], "sales users must not see another salesperson's receivables even with a forged filter");
assert.deepStrictEqual(dashboardReceivableOrders(debtDb, { id: "admin", role: "管理员" }, ["sales-b"]).map((order) => order.id), ["other-sales"], "admin dashboard order detail must respect the salesperson filter");

const appSource = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
assert(appSource.includes('c.stats && typeof c.stats === "object"'), "customer cards must prefer server-computed statistics");
assert(appSource.includes("loadCustomerOrderHistory(id)"), "customer history modal must load complete orders independently");
assert(appSource.includes("/api/customers/${encodeURIComponent(id)}/orders"), "customer history must use the scoped server endpoint");
assert(appSource.includes("customerUnpaidOnly") && appSource.includes("toggleCustomerUnpaid"), "customer list must offer the unpaid filter and per-customer details");
assert(appSource.includes("/api/dashboard/receivables"), "dashboard receivable card must load its own paged order details");

console.log("customer order link tests passed");
