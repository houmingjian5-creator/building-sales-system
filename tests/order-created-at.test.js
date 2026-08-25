const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { orderCreatedAtTime, sortOrdersByCreatedAt } = require("../server");

const legacyMiddleTimestamp = Date.parse("2026-08-20T12:00:00.000Z");
const orders = [
  { id: "created-old", no: "ORD100", createdAt: "2026-08-18T08:00:00.000Z", date: "2099/1/1" },
  { id: "legacy-middle", no: `ORD${legacyMiddleTimestamp}`, date: "2000/1/1" },
  { id: "created-new", no: "ORD101", createdAt: "2026-08-25T08:00:00.000Z", date: "1999/1/1" },
  { id: "unknown-first", no: "legacy-order-a", date: "2099/12/31" },
  { id: "unknown-second", no: "legacy-order-b", date: "2000/1/1" },
];

assert.strictEqual(orderCreatedAtTime(orders[1], 1), legacyMiddleTimestamp, "legacy orders must recover their creation time from a standard order number");
assert.deepStrictEqual(
  sortOrdersByCreatedAt(orders).map((order) => order.id),
  ["created-new", "legacy-middle", "created-old", "unknown-first", "unknown-second"],
  "orders must sort by actual creation time and keep unrecoverable legacy records stable"
);

const source = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
assert(source.includes("createdAt: orderCreatedAt,"), "new orders must persist a non-editable creation timestamp");
assert(source.includes("list = sortOrdersByCreatedAt(list);"), "order management must sort after filters and before pagination");
assert(source.includes("const history = sortOrdersByCreatedAt(customerOrdersForUser(db, customer, user));"), "customer order history must use the shared creation-time ordering");
assert(source.includes("sortOrdersByCreatedAt(baseOrders"), "cost control must use the shared creation-time ordering");

console.log("Order creation-time sorting tests passed");
