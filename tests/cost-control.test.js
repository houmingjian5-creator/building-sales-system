const assert = require("assert");
const server = require("../server");

assert.strictEqual(server.isCostControlOrder({
  no: "ORD1001",
  type: "sale",
  status: "\u5df2\u5b8c\u6210"
}), true);
assert.strictEqual(server.isCostControlOrder({
  no: "ORD1002",
  type: "sale",
  status: "\u5f85\u786e\u8ba4",
  deletedAt: "2026-07-30T00:00:00.000Z"
}), false);
assert.strictEqual(server.isCostControlOrder({
  no: "TH1003",
  type: "sale",
  status: "\u5df2\u5b8c\u6210"
}), false);
assert.strictEqual(server.isCostControlOrder({
  no: "ORD1004",
  type: "return",
  status: "\u5df2\u5b8c\u6210"
}), false);
assert.strictEqual(server.isCostControlOrder({
  no: "ORD1005",
  type: "sale",
  status: "\u5df2\u9000\u8d27"
}), false);
assert.strictEqual(server.isCostControlOrder({
  no: "ORD1006",
  type: "sale",
  status: "\u5df2\u53d6\u6d88"
}), false);

const normalized = server.normalizeCostControl({
  suppliers: [
    { name: "  Supplier A  ", materialCost: "20.25" },
    { name: "Supplier B", materialCost: 10 }
  ],
  deliveryPerson: "  Driver A  ",
  transportCost: "5.50"
}, {
  updatedAt: "2026-07-30T00:00:00.000Z",
  updatedBy: "user-1"
});

assert.deepStrictEqual(normalized.suppliers, [
  { name: "Supplier A", materialCost: 20.25 },
  { name: "Supplier B", materialCost: 10 }
]);
assert.strictEqual(normalized.deliveryPerson, "Driver A");
assert.strictEqual(normalized.transportCost, 5.5);
assert.strictEqual(normalized.updatedBy, "user-1");

assert.throws(function () {
  server.normalizeCostControl({
    suppliers: [{ name: "Supplier A", materialCost: -1 }]
  });
}, /\u5927\u4e8e\u6216\u7b49\u4e8e 0/);

assert.throws(function () {
  server.normalizeCostControl({
    suppliers: [
      { name: "Supplier A", materialCost: 1 },
      { name: "Supplier A", materialCost: 2 }
    ]
  });
}, /\u4e0d\u80fd\u91cd\u590d/);

const order = {
  id: "order-1",
  no: "ORD1007",
  type: "sale",
  customerId: "customer-1",
  salesUserId: "sales-1",
  date: "2026-07-30",
  status: "\u5df2\u5b8c\u6210",
  payStatus: "\u5df2\u56de\u6b3e",
  amount: 100,
  actualPaidAmount: 90,
  items: [],
  costControl: normalized
};

assert.deepStrictEqual(server.costControlTotals(order), {
  materialCost: 30.25,
  transportCost: 5.5,
  totalCost: 35.75,
  profit: 54.25
});

const db = {
  customers: [{ id: "customer-1", name: "Customer A", phone: "13800000000" }],
  users: [{ id: "sales-1", name: "Sales A" }]
};
const costOrder = server.publicCostControlOrder(order, db);
assert.strictEqual(costOrder.customerName, "Customer A");
assert.strictEqual(costOrder.customerPhone, "13800000000");
assert.strictEqual(costOrder.salesName, "Sales A");
assert.strictEqual(costOrder.effectiveAmount, 90);
assert.strictEqual(costOrder.costTotals.profit, 54.25);

const normalOrder = server.publicOrder(order);
assert.strictEqual(normalOrder.costControl, undefined);
assert.strictEqual(normalOrder.costTotals, undefined);

console.log("cost control tests passed");
