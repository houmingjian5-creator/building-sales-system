const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  customerOrderMatchesCustomer,
  customerOrdersForUser,
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
  ],
};

assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[0], customer), true, "exact customer id must match");
assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[1], customer), true, "orphaned legacy id should recover by unique phone");
assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[2], customer), false, "an existing different customer id must not be reassigned by phone");
assert.strictEqual(customerOrderMatchesCustomer(db, db.orders[3], customer), false, "deleted orders must stay hidden");

const salesOrders = customerOrdersForUser(db, customer, { id: "sales-a", role: "销售人员" });
assert.deepStrictEqual(salesOrders.map((order) => order.id), ["exact", "legacy", "return"], "sales scope and recovered history must both apply");

const summary = customerStatsPayload(db, customer, { id: "sales-a", role: "销售人员" });
assert.strictEqual(summary.stats.count, 2, "returns must not count as customer sales orders");
assert.strictEqual(summary.stats.total, 300, "customer total must include exact and safely recovered orders");
assert.strictEqual(summary.stats.last, "2026/8/3", "latest sales order date must be returned");

const appSource = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf8");
assert(appSource.includes('c.stats && typeof c.stats === "object"'), "customer cards must prefer server-computed statistics");
assert(appSource.includes("loadCustomerOrderHistory(id)"), "customer history modal must load complete orders independently");
assert(appSource.includes("/api/customers/${encodeURIComponent(id)}/orders"), "customer history must use the scoped server endpoint");

console.log("customer order link tests passed");
