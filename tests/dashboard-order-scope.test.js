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
    { id: "customer-a", ownerId: "sales-a", name: "测试客户", phone: "13800000000", address: "测试地址" },
    { id: "customer-b", ownerId: "sales-b" },
    { id: "customer-disabled", ownerId: "sales-disabled" },
  ],
  orders: [
    { id: "order-a", customerId: "customer-a" },
    { id: "order-a-return", customerId: "customer-a", type: "return" },
  ],
};

assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "customer-a", "sales-a"), true);
assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "customer-a", "sales-b"), false);
assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "customer-disabled", "sales-disabled"), false);
assert.strictEqual(server.customerBelongsToSalesperson(ownershipDb, "missing", "sales-a"), false);
assert.strictEqual(server.customerOrderReferenceCount(ownershipDb, "customer-a"), 2);
assert.strictEqual(server.customerOrderReferenceCount(ownershipDb, "customer-b"), 0);
assert.strictEqual(server.preserveCustomerOrderSnapshots(ownershipDb, ownershipDb.customers[0]), 2);
assert.strictEqual(ownershipDb.orders[0].customerName, "测试客户");
assert.strictEqual(ownershipDb.orders[0].customerPhone, "13800000000");
assert.strictEqual(ownershipDb.orders[0].customerAddress, "测试地址");

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
const remoteDashboard = appSource.slice(
  appSource.indexOf("function renderDashboardRemote"),
  appSource.indexOf("function auditQuery", appSource.indexOf("function renderDashboardRemote"))
);
const dashboardLoader = appSource.slice(
  appSource.indexOf("async function loadDashboard"),
  appSource.indexOf("async function loadCustomers", appSource.indexOf("async function loadDashboard"))
);
assert(dashboardLoader.includes('salesUserIds: state.dashboardSalesFilters.join(",")'), "销售概览必须把销售人员多选范围交给服务器");
assert(remoteDashboard.includes("metrics.monthOrderCount"), "本月订单数必须使用服务器有效订单统计");
assert(remoteDashboard.includes("metrics.todayOrderCount"), "今日订单数必须使用服务器有效订单统计");
assert(remoteDashboard.includes("metrics.monthSales"), "概览金额必须使用服务器实际金额口径");
assert(remoteDashboard.includes("metrics.totalReceivableAmount") && remoteDashboard.includes("累计至今，不受本月日期限制"), "概览必须展示不受月份限制的累计待回款金额");
assert(remoteDashboard.includes("dashboardTrendHtml"), "销售概览必须展示销售额和订单数趋势");
assert(appSource.includes('data.newCustomers || []'), "新开客户必须使用服务器首次有效下单统计");
assert(!appSource.includes("function customerOpenedDate"), "新开客户不能再优先按建档时间计算");

const finalCreateOrder = appSource.slice(
  appSource.lastIndexOf("function renderCreateOrder"),
  appSource.indexOf("async function saveOrder()", appSource.lastIndexOf("function renderCreateOrder"))
);
assert(finalCreateOrder.includes("orderCustomerChoices()"), "开单客户必须按所选销售人员限制");
assert(finalCreateOrder.includes('id="createCustomerSearch"'), "开单客户选择必须支持姓名或电话搜索");
assert(finalCreateOrder.includes("setOrderSalesperson(this.value)"), "切换销售人员时必须同步刷新客户范围");
assert(finalCreateOrder.includes("|| null"), "开单页面未选择客户时必须保持空值");
assert(!finalCreateOrder.includes("|| customerList[0]"), "开单页面不能自动选择客户列表第一项");

const ensureSalesScopeSource = appSource.slice(
  appSource.indexOf("function ensureSalesScope"),
  appSource.indexOf("function setRoute", appSource.indexOf("function ensureSalesScope"))
);
assert(!ensureSalesScopeSource.includes("allowedCustomers[0]"), "销售范围刷新时不能自动选择首位客户");

const customerCardSource = appSource.slice(
  appSource.indexOf("function customerCard"),
  appSource.indexOf("function renderProducts", appSource.indexOf("function customerCard"))
);
assert(customerCardSource.includes('isAdmin() ? actionButton("删除客户"'), "删除客户入口必须仅管理员可见");
assert(customerCardSource.includes("deleteCustomer(${JSON.stringify(c.id)})"), "删除客户按钮必须生成可执行的客户 ID 参数");
assert(!customerCardSource.includes("deleteCustomer(${jsArg(c.id)})"), "删除客户按钮不能对客户 ID 重复转义");

const serverSource = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
const customerRouteSource = serverSource.slice(
  serverSource.indexOf('if (url.pathname.startsWith("/api/customers/"))'),
  serverSource.indexOf('if (method === "GET" && url.pathname.startsWith("/api/product-images/"))')
);
assert(customerRouteSource.includes('method === "DELETE"'), "客户接口必须支持删除");
assert(customerRouteSource.includes("isAdminRole(user)"), "客户删除必须在服务端校验管理员权限");
assert(customerRouteSource.includes("preserveCustomerOrderSnapshots"), "删除客户前必须保留历史订单中的客户快照");
assert(!customerRouteSource.includes("有历史订单，不能删除"), "有历史订单的客户不应再被禁止删除");

const deleteCustomerSource = appSource.slice(
  appSource.indexOf("async function deleteCustomer"),
  appSource.indexOf("function productModal", appSource.indexOf("async function deleteCustomer"))
);
assert(deleteCustomerSource.includes("历史订单仍会保留"), "删除有订单客户时必须明确提示历史订单会保留");
assert(!deleteCustomerSource.includes("if (stats.count) return"), "前端不能拦截有历史订单的客户删除");
assert(appSource.includes("function orderCustomerForDisplay"), "订单页面必须支持已删除客户的快照显示");

const finalSaveOrder = appSource.slice(
  appSource.lastIndexOf("async function saveOrder()"),
  appSource.indexOf("function cartItemForProduct", appSource.lastIndexOf("async function saveOrder()"))
);
assert(finalSaveOrder.includes("byId(orderCustomerChoices(), state.selectedCustomerId)"), "保存前必须再次校验客户在当前销售范围内");

console.log("Dashboard metrics and order customer scope tests passed");
