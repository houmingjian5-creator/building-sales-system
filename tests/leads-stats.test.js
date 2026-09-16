"use strict";
const assert = require("assert");
const Stats = require("../leads/stats");

const now = new Date("2026-09-16T02:00:00.000Z");
assert.deepStrictEqual(Stats.period({ period: "today" }, now), {
  mode: "today", from: "2026-09-16", to: "2026-09-16",
  start: "2026-09-15 16:00:00", end: "2026-09-16 16:00:00", attributionStart: "2026-09-08 16:00:00"
});
assert.strictEqual(Stats.period({ period: "week" }, now).from, "2026-09-10");
assert.strictEqual(Stats.period({ period: "month" }, now).from, "2026-09-01");
assert.throws(() => Stats.period({ period: "custom", from: "2026-09-20", to: "2026-09-10" }, now));
assert.throws(() => Stats.period({ period: "custom", from: "2026-02-30", to: "2026-03-01" }, now));

const date = "2026/9/16", orderTime = "2026-09-16T06:00:00.000Z";
const period = Stats.period({ period: "today" }, now);
const resources = [{ id: "lead-a", customer_id: "customer-a" }];
const data = { customers: [{ id: "customer-a", name: "甲" }], orders: [
  { id: "valid", customerId: "customer-a", date, createdAt: orderTime, status: "已完成", amount: 100 },
  { id: "cancelled", customerId: "customer-a", date, createdAt: orderTime, status: "已取消", amount: 200 },
  { id: "return", customerId: "customer-a", date, createdAt: orderTime, status: "已完成", type: "return", amount: -30 },
  { id: "deleted", customerId: "customer-a", date, createdAt: orderTime, status: "已完成", amount: 50, deletedAt: orderTime },
  { id: "old", customerId: "customer-a", date: "2026/9/15", createdAt: "2026-09-15T06:00:00.000Z", status: "已完成", amount: 40 }
] };
const followups = [
  { lead_id: "lead-a", actor_id: "sales-a", created_at: "2026-09-10T06:00:00.000Z" },
  { lead_id: "lead-a", actor_id: "sales-b", created_at: "2026-09-15T06:00:00.000Z" },
  { lead_id: "lead-a", actor_id: "sales-a", created_at: "2026-09-16T07:00:00.000Z" }
];
const input = { resources, followups, data, period, effectiveOrderAmount: order => order.amount };
assert.deepStrictEqual(Stats.attributeOrders(input), { count: 1, amount: 100, byActor: { "sales-b": 1 } }, "one qualifying order belongs to the last pre-order follow-up actor");
assert.strictEqual(Stats.attributeOrders(Object.assign({}, input, { ownerId: "sales-a" })).count, 0);
assert.strictEqual(Stats.attributeOrders(Object.assign({}, input, { ownerId: "sales-b" })).count, 1);
assert.strictEqual(Stats.attributeOrders(Object.assign({}, input, { followups: [{ lead_id: "lead-a", actor_id: "sales-a", created_at: "2026-09-08T06:00:00.000Z" }] })).count, 0, "older than seven days must not count");
assert.strictEqual(Stats.attributeOrders(Object.assign({}, input, { followups: [{ lead_id: "lead-a", actor_id: "sales-a", created_at: "2026-09-16T07:00:00.000Z" }] })).count, 0, "follow-up after order must not count");
assert.strictEqual(Stats.orderTimestamp({ no: "ORD1789538400000", date }), 1789538400000);
assert.strictEqual(Stats.orderTimestamp({ date: "2026/9/16" }), Date.parse("2026-09-15T16:00:00.000Z"));
console.log("lead statistics period and order attribution tests passed");
