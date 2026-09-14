const assert = require("assert");
const fs = require("fs");
const path = require("path");
const server = require("../server");

assert.strictEqual(server.orderActualPaidAmount({ amount: 132 }), null);
assert.strictEqual(server.effectiveOrderAmount({ amount: 132 }), 132);
assert.strictEqual(server.effectiveOrderAmount({ amount: 132, actualPaidAmount: 120 }), 120);
assert.strictEqual(server.orderActualReturnAmount({ amount: -132 }), null);
assert.strictEqual(server.orderActualReturnAmount({ amount: -132, actualReturnAmount: -118.5 }), -118.5);
assert.strictEqual(server.effectiveOrderAmount({ type: "return", amount: -132, actualReturnAmount: -118.5 }), -118.5);
assert.strictEqual(server.dashboardPerformanceAmount({ type: "return", amount: -132, actualReturnAmount: -118.5, items: [{ quantity: 1, price: -132 }] }), -118.5);

const publicOrder = server.publicOrder({
  id: "order-payment-test",
  no: "ORD-PAYMENT-TEST",
  type: "sale",
  amount: 132,
  actualPaidAmount: 120,
  paymentAdjustmentReason: "抹零",
  items: [],
});
assert.strictEqual(publicOrder.amount, 132, "original order amount must remain unchanged");
assert.strictEqual(publicOrder.actualPaidAmount, 120);
assert.strictEqual(publicOrder.effectiveAmount, 120);
assert.strictEqual(publicOrder.paymentAdjustmentReason, "抹零");

const publicReturn = server.publicOrder({
  id: "return-payment-test",
  no: "TH-PAYMENT-TEST",
  type: "return",
  amount: -132,
  actualReturnAmount: -118.5,
  returnAdjustmentReason: "扣除搬运费",
  items: [{ name: "瓷砖", quantity: 1, price: -132 }],
});
assert.strictEqual(publicReturn.amount, -132, "return item total must remain unchanged");
assert.strictEqual(publicReturn.actualReturnAmount, -118.5);
assert.strictEqual(publicReturn.effectiveAmount, -118.5);
assert.strictEqual(publicReturn.returnAdjustmentReason, "扣除搬运费");

const summary = server.assistantSalesSummary(
  [
    {
      id: "order-payment-test",
      no: "ORD-PAYMENT-TEST",
      type: "sale",
      date: "2026/7/29",
      status: "已完成",
      amount: 132,
      actualPaidAmount: 120,
      items: [],
    },
  ],
  { period: "custom", dateFrom: "2026-07-01", dateTo: "2026-07-31" }
);
assert.strictEqual(summary.amount, 120, "performance must use the adjusted actual amount");

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
assert.ok(appSource.includes("paymentAmountModal"), "payment amount modal should be available");
assert.ok(appSource.includes("order-original-amount"), "order card should show the struck-through original amount");
assert.ok(appSource.includes("saveActualPaymentAmount"), "payment amount save action should be exposed");
assert.ok(appSource.includes("实际退款金额"), "return amount modal should use refund wording");
assert.ok(appSource.includes("actualReturnAmount"), "return amount should have an independent adjusted value");
assert.ok(appSource.includes("实际退款金额必须与商品合计保持相同的正负方向"), "return adjustment must prevent an accidental sign reversal");
assert.ok(!appSource.includes('const amountMarkup = isReturn ?\n  `<strong class="order-amount">'), "return amount should be editable from the order card");

console.log("Actual payment amount tests passed");
