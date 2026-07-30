const assert = require("assert");
const fs = require("fs");
const path = require("path");
const server = require("../server");

assert.strictEqual(server.orderActualPaidAmount({ amount: 132 }), null);
assert.strictEqual(server.effectiveOrderAmount({ amount: 132 }), 132);
assert.strictEqual(server.effectiveOrderAmount({ amount: 132, actualPaidAmount: 120 }), 120);

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

console.log("Actual payment amount tests passed");
