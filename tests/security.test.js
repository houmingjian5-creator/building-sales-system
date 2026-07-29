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
