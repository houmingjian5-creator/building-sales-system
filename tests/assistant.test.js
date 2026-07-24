const assert = require('assert');
const server = require('../server');

const users = {
  admin: { id: 'u-admin', role: '管理员' },
  salesA: { id: 'u-a', role: '销售人员' },
  salesB: { id: 'u-b', role: '销售人员' },
};

const db = {
  customers: [
    { id: 'c-a', name: '甲客户', phone: '13800000001', ownerId: 'u-a' },
    { id: 'c-b', name: '乙客户', phone: '13800000002', ownerId: 'u-b' },
  ],
  products: [
    { id: 'p-1', code: 'P001', name: '测试石膏板', spec: '1200*2400*9.5', cat1: '木', cat2: '石膏板', unit: '张', price: 30, cost: 20, status: '在售', aliases: ['测试板'] },
  ],
  orders: [
    { id: 'o-1', no: 'ORD1', customerId: 'c-a', salesUserId: 'u-a', date: '2026/7/1', status: '已确认', payStatus: '未回款', amount: 300, items: [{ productId: 'p-1', name: '测试石膏板', quantity: 10, price: 30 }] },
    { id: 'o-2', no: 'ORD2', customerId: 'c-a', salesUserId: 'u-a', date: '2026/7/2', status: '待确认', payStatus: '未回款', amount: 150, items: [{ productId: 'p-1', name: '测试石膏板', quantity: 5, price: 30 }] },
    { id: 'o-3', no: 'ORD3', customerId: 'c-b', salesUserId: 'u-b', date: '2026/7/3', status: '已完成', payStatus: '已回款', amount: 600, items: [{ productId: 'p-1', name: '测试石膏板', quantity: 20, price: 30 }] },
    { id: 'o-4', no: 'TH1', type: 'return', customerId: 'c-a', salesUserId: 'u-a', date: '2026/7/4', status: '已退货', payStatus: '未回款', items: [{ productId: 'p-1', name: '测试石膏板', quantity: 2, price: 30 }] },
    { id: 'o-5', no: 'ORD5', customerId: 'c-a', salesUserId: 'u-a', date: '2026/7/5', status: '已取消', payStatus: '未回款', amount: 900, items: [{ productId: 'p-1', name: '测试石膏板', quantity: 30, price: 30 }] },
    { id: 'o-6', no: 'ORD6', customerId: 'c-a', salesUserId: 'u-a', date: '2026/7/6', status: '已完成', payStatus: '未回款', amount: 120, deletedAt: '2026-07-07T00:00:00.000Z', items: [{ productId: 'p-1', quantity: 4, price: 30 }] },
  ],
};

assert.deepStrictEqual(server.assistantVisibleCustomers(db, users.salesA).map((item) => item.id), ['c-a']);
assert.deepStrictEqual(server.assistantVisibleOrders(db, users.salesA).map((item) => item.id), ['o-1', 'o-2', 'o-4', 'o-5']);
assert.strictEqual(server.assistantVisibleCustomers(db, users.admin).length, 2);

const scopedOrders = server.assistantVisibleOrders(db, users.salesA);
const summary = server.assistantSalesSummary(scopedOrders, { period: 'custom', dateFrom: '2026-07-01', dateTo: '2026-07-31' });
assert.strictEqual(summary.amount, 240, 'confirmed sales minus returns should produce net performance');
assert.strictEqual(summary.saleOrderCount, 1, 'pending and cancelled orders must not count');
assert.strictEqual(summary.returnAmount, -60, 'returns must reduce performance');

const receivables = server.assistantReceivables(scopedOrders, server.assistantVisibleCustomers(db, users.salesA));
assert.strictEqual(receivables.count, 1, 'only valid unpaid sales orders should count as receivables');
assert.strictEqual(receivables.total, 300);

const salesResults = server.executeAssistantTools(db, users.salesA, { tools: [{ name: 'product_search', args: { query: '测试石膏板' } }] });
assert.strictEqual(salesResults[0].data[0].cost, undefined, 'sales users must not receive product cost');
const adminResults = server.executeAssistantTools(db, users.admin, { tools: [{ name: 'product_search', args: { query: '测试石膏板' } }] });
assert.strictEqual(adminResults[0].data[0].cost, 20, 'admins may receive product cost');

const history = server.assistantCustomerHistory(db, server.assistantVisibleCustomers(db, users.salesA), scopedOrders, '甲客户');
assert.strictEqual(history.customer.id, 'c-a');
assert.strictEqual(history.commonProducts[0].quantity, 8, 'customer product history should subtract returned quantity');

console.log('Xiaocai assistant permission and business-rule tests passed');
