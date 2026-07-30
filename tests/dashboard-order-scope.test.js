const assert = require("assert");
const fs = require("fs");
const path = require("path");
const server = require("../server");

const ownershipDb = {
  users: [
    { id: "sales-a", status: "启用" },
    { id: "sales-b", status: "启用" },
    { id: "sales-disabled", status: "停用" },
  ],
  customers: [
    { id: "customer-a", ownerId: "sales-a" },
    { id: "customer-b", ownerId: "sales-b" },
    { id: "customer-disabled", ownerId: "sales-disabled" },
  ],
};

assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "customer-a", "sales-a"), true);
assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "customer-a", "sales-b"), false);
assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "customer-disabled", "sales-disabled"), false);
assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "missing", "sales-a"), false);

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
const finalDashboard = appSource.slice(
  appSource.lastIndexOf("function renderDashboard"),
  appSource.indexOf("function businessDate", appSource.lastIndexOf("function renderDashboard"))
);
assert(finalDashboard.includes("dashboardFilteredOrders()"), "销售概览必须应用销售人员多选范围");
assert(finalDashboard.includes("monthPerformanceOrders.length"), "本月订单数必须包含所有有效订单");
assert(finalDashboard.includes("todayPerformanceOrders.length"), "今日订单数必须包含所有有效订单");
assert(finalDashboard.includes("performanceOrderAmount(order)"), "概览金额必须使用有效订单实际金额口径");
assert(finalDashboard.includes("firstValidCustomerOrderDate"), "新开客户必须按首次有效下单日期计算");
assert(!appSource.includes("function customerOpenedDate"), "新开客户不能再优先按建档时间计算");

const finalCreateOrder = appSource.slice(
  appSource.lastIndexOf("function renderCreateOrder"),
  appSource.indexOf("async function saveOrder()", appSource.lastIndexOf("function renderCreateOrder"))
);
assert(finalCreateOrder.includes("orderCustomerChoices()"), "开单客户必须按所选销售人员限制");
assert(finalCreateOrder.includes('id="createCustomerSearch"'), "开单客户选择必须支持姓名或电话搜索");
assert(finalCreateOrder.includes("setOrderSalesperson(this.value)"), "切换销售人员时必须同步刷新客户范围");

const finalSaveOrder = appSource.slice(
  appSource.lastIndexOf("async function saveOrder()"),
  appSource.indexOf("function cartItemForProduct", appSource.lastIndexOf("async function saveOrder()"))
);
assert(finalSaveOrder.includes("byId(orderCustomerChoices(), state.selectedCustomerId)"), "保存前必须再次校验客户在当前销售范围内");

console.log("Dashboard metrics and order customer scope tests passed");
