"use strict";

const assert = require("assert");
const Tasks = require("../leads/tasks");
const NOW = "2026-09-14T04:00:00.000Z";

function resource(extra) {
  return Object.assign({ id: "r1", created_at: "2026-09-01T00:00:00.000Z", next_followup_at: null }, extra || {});
}
function order(date, status, extra) {
  return Object.assign({ id: date, no: "XS" + date, date: date, status: status || "已完成" }, extra || {});
}
function follow(date) { return { created_at: date }; }
function classify(input) { return Tasks.classify(Object.assign({ resource: resource(), followups: [], orders: [], now: NOW }, input || {})); }

assert.strictEqual(Tasks.validOrder(order("2026/9/1", "已确认")), true);
assert.strictEqual(Tasks.validOrder(order("2026/9/1", "已发货")), true);
assert.strictEqual(Tasks.validOrder(order("2026/9/1", "已完成")), true);
["待确认", "已取消", "已退货", "已确定"].forEach(function (status) { assert.strictEqual(Tasks.validOrder(order("2026/9/1", status)), false); });
assert.strictEqual(Tasks.validOrder(order("2026/9/1", "已完成", { type: "return" })), false);
assert.strictEqual(Tasks.validOrder(order("2026/9/1", "已完成", { no: "TH001" })), false);
assert.strictEqual(Tasks.validOrder(order("2026/9/1", "已完成", { deletedAt: NOW })), false);

assert.strictEqual(classify({ customer: {}, orders: [order("2026/9/5")] }), null, "9天不应出现");
assert.strictEqual(classify({ customer: {}, orders: [order("2026/9/4")] }).tier, "medium", "10天进入中等");
assert.strictEqual(classify({ customer: {}, orders: [order("2026/8/26")] }).tier, "medium", "19天仍为中等");
assert.strictEqual(classify({ customer: {}, orders: [order("2026/8/25")] }).tier, "priority", "20天进入重点");

let task = classify({ customer: {}, orders: [order("2026/8/20")], followups: [follow("2026-09-10T02:00:00.000Z")] });
assert.strictEqual(task.tier, "medium", "重点客户首次跟进后立即转为中等");
assert(task.reason.indexOf("首次跟进") >= 0);
assert.strictEqual(classify({ customer: {}, orders: [order("2026/8/20")], followups: [follow("2026-09-10T02:00:00.000Z"), follow("2026-09-12T02:00:00.000Z")] }), null, "中等客户再次跟进后暂时隐藏");
task = classify({ customer: {}, orders: [order("2026/7/1")], followups: [follow("2026-07-30T02:00:00.000Z"), follow("2026-08-25T02:00:00.000Z")] });
assert.strictEqual(task.tier, "medium", "第二次跟进20天后重新进入中等");
assert.strictEqual(classify({ customer: {}, orders: [order("2026/9/10")], followups: [follow("2026-08-01T02:00:00.000Z")] }), null, "新订单应重置旧跟进周期");

task = classify({ enteredAt: "2026-09-14T01:00:00.000Z" });
assert.strictEqual(task.tier, "pending", "新进入私海且从未跟进应立即显示");
assert.strictEqual(classify({ enteredAt: "2026-09-01T01:00:00.000Z", followups: [follow("2026-09-10T01:00:00.000Z")] }), null, "普通资源跟进后20天内隐藏");
task = classify({ enteredAt: "2026-08-01T01:00:00.000Z", followups: [follow("2026-08-25T01:00:00.000Z")] });
assert.strictEqual(task.tier, "pending", "普通资源20天未跟进重新出现");
assert(task.reason.indexOf("20天") >= 0);

assert.strictEqual(classify({ resource: resource({ next_followup_at: "2026-09-15T00:00:00.000Z" }), customer: {}, orders: [order("2026/8/1")] }), null, "未来预约到期前隐藏");
assert.strictEqual(classify({ resource: resource({ next_followup_at: "2026-09-14T00:00:00.000Z" }), customer: {}, orders: [order("2026/9/12")] }).tier, "medium", "有订单的到期预约进入中等");
assert.strictEqual(classify({ resource: resource({ next_followup_at: "2026-09-14T00:00:00.000Z" }), enteredAt: "2026-09-01T00:00:00.000Z", followups: [follow("2026-09-13T00:00:00.000Z")] }).tier, "pending", "无订单的到期预约进入待跟进");

const sortable = [
  { id: "never", createdAt: "2026-01-03T00:00:00Z", lastFollowupAt: null, followupCount: 0 },
  { id: "newer", createdAt: "2026-01-02T00:00:00Z", lastFollowupAt: "2026-09-10T00:00:00Z", followupCount: 2 },
  { id: "older", createdAt: "2026-01-01T00:00:00Z", lastFollowupAt: "2026-08-10T00:00:00Z", followupCount: 5 }
];
function sorted(mode) { return sortable.slice().sort(function (a, b) { return Tasks.compare(a, b, mode); }).map(function (item) { return item.id; }); }
assert.deepStrictEqual(sorted("created_desc"), ["never", "newer", "older"]);
assert.deepStrictEqual(sorted("created_asc"), ["older", "newer", "never"]);
assert.deepStrictEqual(sorted("followed_desc"), ["newer", "older", "never"]);
assert.deepStrictEqual(sorted("followed_asc"), ["older", "newer", "never"], "never-followed resources always sort last");
assert.deepStrictEqual(sorted("count_desc"), ["older", "newer", "never"]);
assert.deepStrictEqual(sorted("count_asc"), ["never", "newer", "older"]);
const paged = Tasks.page(Array.from({ length: 45 }, function (_, i) { return i; }), 3);
assert.strictEqual(paged.total, 45); assert.strictEqual(paged.page, 3); assert.deepStrictEqual(paged.items, [40, 41, 42, 43, 44]);

console.log("lead automatic follow-up tier and lifecycle tests passed");
