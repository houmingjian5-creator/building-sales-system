const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const XlsxPopulate = require("xlsx-populate");
const server = require("../server");

async function run() {
  const user = { id: "u1" };
  server.setUserPassword(user, "correct horse battery staple");
  assert.ok(user.passwordHash.startsWith("scrypt$"));
  assert.strictEqual(user.password, undefined);
  assert.strictEqual(server.verifyPassword(user, "correct horse battery staple"), true);
  assert.strictEqual(server.verifyPassword(user, "wrong password"), false);
  assert.strictEqual(server.verifyPassword({ password: "legacy" }, "legacy"), true);

  const product = {
    id: "p1",
    name: "测试商品",
    unit: "件",
    price: 20,
    cost: 12,
    status: "在售",
  };
  assert.strictEqual(server.publicProduct(product).cost, undefined);
  assert.strictEqual(server.publicProduct(product, { includeCost: true }).cost, 12);
  assert.strictEqual(server.canViewProductCost({ role: "销售人员" }), false);
  assert.strictEqual(server.canViewProductCost({ role: "管理员" }), true);
  assert.strictEqual(server.canViewProductCost({ role: "超级管理员" }), true);
  assert.strictEqual(server.canViewProductCost({ role: "财务" }), false);
  assert.strictEqual(server.canExportProductWorkbook({ role: "销售人员" }), false);
  assert.strictEqual(server.canExportProductWorkbook({ role: "财务" }), true);
  assert.strictEqual(server.canExportProductWorkbook({ role: "管理员" }), true);
  assert.deepStrictEqual(server.productImageFiles({ imageFile: "abcdef1234567890-1.jpg" }), ["abcdef1234567890-1.jpg"]);
  assert.deepStrictEqual(server.productImageFiles({
    imageFile: "abcdef1234567890-1.jpg",
    imageFiles: ["abcdef1234567890-1.jpg", "abcdef1234567890-2.webp", "../unsafe.png"]
  }), ["abcdef1234567890-1.jpg", "abcdef1234567890-2.webp"]);
  assert.deepStrictEqual(server.publicProduct({ ...product, imageFiles: ["abcdef1234567890-1.jpg", "abcdef1234567890-2.webp"] }).imageUrls, [
    "/api/product-images/abcdef1234567890-1.jpg",
    "/api/product-images/abcdef1234567890-2.webp"
  ]);

  const pendingOrder = { id: "pending", salesUserId: "sales-1", status: "待确认" };
  assert.strictEqual(server.canDeleteOrder({ id: "sales-1", role: "销售人员" }, pendingOrder), true);
  assert.strictEqual(server.canDeleteOrder({ id: "sales-2", role: "销售人员" }, pendingOrder), false);
  assert.strictEqual(server.canDeleteOrder({ id: "sales-1", role: "销售人员" }, { ...pendingOrder, status: "已确认" }), false);
  assert.strictEqual(server.canDeleteOrder({ id: "admin", role: "管理员" }, { ...pendingOrder, status: "已完成" }), true);
  assert.strictEqual(server.canDeleteOrder({ id: "finance", role: "财务" }, pendingOrder), false);

  const companyCustomers = [
    { id: "customer-a", ownerId: "sales-1", phone: "138 0000 0001" },
    { id: "customer-b", ownerId: "sales-2", phone: "028-88886666" }
  ];
  assert.strictEqual(server.normalizeCustomerPhone("+86 138-0000-0001"), "13800000001");
  assert.strictEqual(server.customerPhoneExists(companyCustomers, "13800000001"), true, "客户电话必须跨销售全局唯一");
  assert.strictEqual(server.customerPhoneExists(companyCustomers, "028 8888 6666"), true);
  assert.strictEqual(server.customerPhoneExists(companyCustomers, "13800000001", "customer-a"), false, "编辑客户自身时应排除自身记录");
  assert.strictEqual(server.customerPhoneExists(companyCustomers, "13900000001"), false);

  const formattedPhoneCustomer = { name: "东哥", contact: "", phone: "182 8458 7520", address: "" };
  assert.strictEqual(server.customerMatchesSearch(formattedPhoneCustomer, "18284587520"), true, "客户电话搜索应忽略空格");
  assert.strictEqual(server.customerMatchesSearch(formattedPhoneCustomer, "+86 182-8458-7520"), true, "客户电话搜索应兼容国家码和分隔符");
  assert.strictEqual(server.customerMatchesSearch(formattedPhoneCustomer, "84587520"), true, "客户电话搜索应支持连续数字片段");
  assert.strictEqual(server.customerMatchesSearch(formattedPhoneCustomer, "东哥"), true, "客户名称搜索应保持不变");
  assert.strictEqual(server.customerMatchesSearch(formattedPhoneCustomer, "18284587521"), false);

  const order = {
    id: "o1",
    no: "ORD1",
    type: "sale",
    customerId: "c1",
    salesUserId: "u1",
    date: "2026/7/29",
    status: "已完成",
    payStatus: "已回款",
    phone: "13800000000",
    address: "测试地址",
    remark: "测试备注",
    amount: 20,
    cost: 12,
    profit: 8,
    grossProfit: 8,
    margin: 0.4,
    items: [{
      productId: "p1",
      name: "测试商品",
      spec: "20",
      unit: "个",
      quantity: 1,
      price: 20,
      cost: 12,
      costPrice: 12,
      purchasePrice: 12,
      profit: 8,
      grossProfit: 8,
      margin: 0.4,
    }],
  };
  const visibleOrder = server.publicOrder(order);
  assert.strictEqual(visibleOrder.cost, undefined);
  assert.strictEqual(visibleOrder.profit, undefined);
  assert.strictEqual(visibleOrder.grossProfit, undefined);
  assert.strictEqual(visibleOrder.margin, undefined);
  assert.deepStrictEqual(visibleOrder.items[0], {
    productId: "p1",
    name: "测试商品",
    spec: "20",
    unit: "个",
    quantity: 1,
    price: 20,
  });

  const workbookBuffer = await server.buildProductWorkbook([product], { includeCost: false });
  const workbook = await XlsxPopulate.fromDataAsync(workbookBuffer);
  const headers = workbook.sheet("产品").usedRange().value()[0];
  assert.ok(headers.includes("销售价"));
  assert.ok(!headers.includes("成本价"));

  const serverSource = fs.readFileSync(path.join(__dirname, "../server.js"), "utf8");
  const exportRoute = serverSource.slice(
    serverSource.indexOf('url.pathname === "/api/products/export"'),
    serverSource.indexOf('url.pathname === "/api/products/import"')
  );
  assert(exportRoute.includes("canExportProductWorkbook(user)"), "商品表格导出接口必须禁止销售人员");

  const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
  const finalProductRender = appSource.slice(
    appSource.lastIndexOf("function renderProducts"),
    appSource.indexOf("function productThumbnail", appSource.lastIndexOf("function renderProducts"))
  );
  assert(finalProductRender.includes('${canExport ? `<button id="productExportSelectedBtn"'), "商品导出按钮必须对销售人员隐藏");
  assert(appSource.includes('multiple hidden onchange="previewProductImage(this)"'), "商品图片选择必须支持多选");
  assert(appSource.includes("prepareProductImage"), "商品图片上传前必须经过压缩处理");
  assert(appSource.includes('order.status === "待确认"'), "销售人员删除订单入口必须限制为待确认状态");
  const customerRoutes = serverSource.slice(
    serverSource.indexOf('url.pathname === "/api/customers"'),
    serverSource.indexOf('method === "GET" && url.pathname.startsWith("/api/product-images/")')
  );
  assert(customerRoutes.split("customerPhoneExists").length >= 3, "新增和编辑客户都必须校验全局电话唯一性");

  const tempPath = path.join(os.tmpdir(), `building-sales-security-${process.pid}-${Date.now()}.json`);
  const previousPath = `${tempPath}.previous`;
  try {
    server.atomicWriteJson(tempPath, { version: 1 }, previousPath);
    server.atomicWriteJson(tempPath, { version: 2 }, previousPath);
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(tempPath, "utf8")), { version: 2 });
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(previousPath, "utf8")), { version: 1 });
  } finally {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    if (fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
  }

  console.log("security tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
