const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  customerOrderMatchesCustomer,
  customerOrdersForUser,
  orderMatchesSearch,
  publicOrder,
  customerStatsPayload,
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

const appSource = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
assert(appSource.includes('c.stats && typeof c.stats === "object"'), "customer cards must prefer server-computed statistics");
assert(appSource.includes("loadCustomerOrderHistory(id)"), "customer history modal must load complete orders independently");
assert(appSource.includes("/api/customers/${encodeURIComponent(id)}/orders"), "customer history must use the scoped server endpoint");

console.log("customer order link tests passed");
