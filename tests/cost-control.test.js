const assert = require("assert");
const fs = require("fs");
const path = require("path");
const server = require("../server");

assert.strictEqual(server.dateInRange("2026/8/7", "2026-08-01", "2026-08-31"), true);
assert.strictEqual(server.dateInRange("2026-8-1", "2026/08/01", "2026/08/31"), true);
assert.strictEqual(server.dateInRange("2026/8/31", "2026-08-01", "2026-08-31"), true);
assert.strictEqual(server.dateInRange("2026/9/1", "2026-08-01", "2026-08-31"), false);
assert.strictEqual(server.dateInRange("2026/2/30", "2026-02-01", "2026-02-28"), false);
assert.strictEqual(server.dateInRange("", "", ""), true);

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
  no: "ORD1002-PENDING",
  type: "sale",
  status: "\u5f85\u786e\u8ba4"
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
  transportCost: "5.50",
  reconciliationStatus: "\u95ee\u9898\u8ba2\u5355",
  remark: "  Need review  "
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
assert.strictEqual(normalized.reconciliationStatus, "\u95ee\u9898\u8ba2\u5355");
assert.strictEqual(normalized.remark, "Need review");
assert.strictEqual(normalized.updatedBy, "user-1");

const defaultControl = server.normalizeCostControl({});
assert.strictEqual(defaultControl.reconciliationStatus, "\u672a\u5bf9\u8ba2\u5355");
assert.strictEqual(defaultControl.remark, "");

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

assert.throws(function () {
  server.normalizeCostControl({
    reconciliationStatus: "\u4e0d\u5b58\u5728"
  });
}, /\u5bf9\u5355\u72b6\u6001\u4e0d\u6b63\u786e/);

assert.throws(function () {
  server.normalizeCostControl({
    remark: new Array(502).join("a")
  });
}, /\u6210\u672c\u5907\u6ce8\u4e0d\u80fd\u8d85\u8fc7/);

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
  items: [{
    productId: "product-1",
    name: "Test material",
    spec: "20kg",
    unit: "bag",
    quantity: 2,
    price: 50
  }],
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
assert.strictEqual(costOrder.items.length, 1);
assert.strictEqual(costOrder.items[0].name, "Test material");

const normalOrder = server.publicOrder(order);
assert.strictEqual(normalOrder.costControl, undefined);
assert.strictEqual(normalOrder.costTotals, undefined);

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");
function frontendFunctionSource(name, nextName) {
  const start = appSource.indexOf("function " + name);
  const end = appSource.indexOf("function " + nextName, start);
  assert(start >= 0 && end > start, "找不到前端函数：" + name);
  return appSource.slice(start, end).trim();
}

const normalizeDateSource = frontendFunctionSource("normalizeCostOrderDate", "costOrderDateInRange");
const dateRangeSource = frontendFunctionSource("costOrderDateInRange", "costOrderMatchesSuppliers");
const costOrderDateInRange = new Function(
  normalizeDateSource + "\nreturn (" + dateRangeSource + ");"
)();
assert.strictEqual(costOrderDateInRange("2026/7/1", "2026-07-01", "2026-07-31"), true);
assert.strictEqual(costOrderDateInRange("2026-07-31", "2026-07-01", "2026-07-31"), true);
assert.strictEqual(costOrderDateInRange("2026-06-30", "2026-07-01", "2026-07-31"), false);
assert.strictEqual(costOrderDateInRange("2026-02-30", "2026-02-01", "2026-02-28"), false);

const supplierFilterSource = frontendFunctionSource("costOrderMatchesSuppliers", "summarizeCostOrders");
const costOrderMatchesSuppliers = new Function(
  "COST_UNASSIGNED_SUPPLIER",
  "return (" + supplierFilterSource + ");"
)("__unassigned_supplier__");
const supplierOrder = {
  costControl: {
    suppliers: [{ name: "Supplier A" }, { name: "Supplier B" }]
  }
};
assert.strictEqual(costOrderMatchesSuppliers(supplierOrder, []), true);
assert.strictEqual(costOrderMatchesSuppliers(supplierOrder, ["Supplier B", "Supplier C"]), true);
assert.strictEqual(costOrderMatchesSuppliers(supplierOrder, ["Supplier C"]), false);
assert.strictEqual(costOrderMatchesSuppliers({ costControl: { suppliers: [] } }, ["__unassigned_supplier__"]), true);
assert.strictEqual(costOrderMatchesSuppliers(supplierOrder, ["__unassigned_supplier__"]), false);

const costRenderSource = appSource.slice(
  appSource.indexOf("function renderCostControl"),
  appSource.indexOf("function renderCostOrderCard")
);
assert(costRenderSource.includes("costOrderDateInRange"), "成本订单必须应用日期筛选");
assert(costRenderSource.includes("costOrderMatchesSuppliers"), "成本订单必须应用供应商筛选");
assert(costRenderSource.includes("整体毛利率"), "成本汇总必须展示整体毛利率");
assert(appSource.includes("summary.profit / summary.revenue"), "整体毛利率必须按总盈利除以实际付款合计计算");
assert(stylesSource.includes(".cost-filter-toggle"), "手机成本筛选必须提供折叠入口");
assert(stylesSource.includes(".cost-filter-content.is-open"), "手机成本筛选必须支持展开");
assert(stylesSource.includes("grid-template-columns: repeat(5"), "桌面成本汇总必须容纳五张统计卡");

assert(appSource.includes("cost-order-view-btn"), "Each cost order must expose an order-detail button.");
assert(appSource.includes("openCostOrderDocument"), "Cost orders must use the guarded order-detail flow.");
assert(appSource.includes("byId(orders, id) || costOrderById(id)"), "Order details must support cost-page lazy-loaded orders.");

const reconciliationSaveSource = frontendFunctionSource("setCostReconciliationStatus", "toggleCostOrder");
assert(appSource.includes("async function setCostReconciliationStatus"), "Reconciliation status changes must save asynchronously.");
assert(reconciliationSaveSource.includes("apiFetch(`/api/cost-control/"), "Reconciliation status changes must persist immediately.");
assert(reconciliationSaveSource.includes("order.costControl = previousControl"), "Failed reconciliation saves must restore the previous status.");
assert(reconciliationSaveSource.includes('showToast("对单状态已保存")'), "Successful reconciliation saves must confirm persistence.");

console.log("cost control tests passed");
