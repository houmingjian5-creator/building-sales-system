const assert = require('assert');
const server = require('../server');

const users = {
  admin: { id: 'u-admin', role: '管理员' },
  salesA: { id: 'u-a', role: '销售人员' },
  salesB: { id: 'u-b', role: '销售人员' },
};

const db = {
  users: [
    { id: 'u-admin', name: '管理员', role: '管理员' },
    { id: 'u-a', name: '销售甲', role: '销售人员' },
    { id: 'u-b', name: '销售乙', role: '销售人员' },
  ],
  customers: [
    { id: 'c-a', name: '甲客户', phone: '13800000001', ownerId: 'u-a' },
    { id: 'c-b', name: '乙客户', phone: '13800000002', ownerId: 'u-b' },
  ],
  products: [
    { id: 'p-1', code: 'P001', name: '测试石膏板', spec: '1200*2400*9.5', cat1: '木', cat2: '石膏板', unit: '张', price: 30, cost: 20, status: '在售', aliases: ['测试板'] },
  ],
  orders: [
    { id: 'o-1', no: 'ORD1', customerId: 'c-a', salesUserId: 'u-a', date: '2026/7/1', status: '已确认', payStatus: '未回款', amount: 300, costControl: { suppliers: [{ name: '许斌', materialCost: 120 }], deliveryPerson: '李师', transportCost: 30, reconciliationStatus: '已对订单', remark: '' }, items: [{ productId: 'p-1', name: '测试石膏板', quantity: 10, price: 30 }] },
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

const ranking = server.assistantCustomerRanking(server.assistantVisibleCustomers(db, users.salesA), scopedOrders, {
  period: 'custom',
  dateFrom: '2026-07-01',
  dateTo: '2026-07-31',
});
assert.strictEqual(ranking.length, 1);
assert.strictEqual(ranking[0].amount, 240, 'customer ranking should use net valid performance');

const trend = server.assistantSalesTrend(scopedOrders, {
  period: 'custom',
  dateFrom: '2026-07-01',
  dateTo: '2026-07-31',
});
assert.strictEqual(trend.length, 2, 'sales trend should include sale and return dates');
assert.strictEqual(trend.reduce((sum, row) => sum + row.amount, 0), 240);

const performance = server.assistantSalespersonPerformance(db, scopedOrders, users.salesA, {
  period: 'custom',
  dateFrom: '2026-07-01',
  dateTo: '2026-07-31',
});
assert.deepStrictEqual(performance.map((row) => row.salesperson), ['销售甲']);
assert.strictEqual(performance[0].amount, 240);

const adminCost = server.assistantCostControlSummary(db, db.orders, users.admin, {
  period: 'custom',
  dateFrom: '2026-07-01',
  dateTo: '2026-07-31',
});
assert.strictEqual(adminCost.totalCost, 150);
assert.strictEqual(adminCost.profit, 750, 'cost control summary should exclude pending and cancelled orders');
assert.strictEqual(adminCost.rows.some((row) => row.orderNo === 'ORD2'), false, 'pending orders must not enter cost control');
assert.strictEqual(server.assistantCostControlSummary(db, scopedOrders, users.salesA, {}).forbidden, true);

assert.strictEqual(server.assistantSanitizeWebQuery('搜索客户13800000001和ORD123的最新政策').includes('13800000001'), false);
assert.strictEqual(server.assistantSanitizeWebQuery('搜索客户13800000001和ORD123的最新政策').includes('ORD123'), false);
assert.strictEqual(server.assistantPrivateSafeWebQuery(db, users.salesA, '搜索甲客户地址和13800000001附近政策').includes('13800000001'), false);
assert.strictEqual(server.assistantIsPublicHttpsUrl('https://example.com/news'), true);
assert.strictEqual(server.assistantIsPublicHttpsUrl('http://127.0.0.1/private'), false);
assert.strictEqual(server.assistantIsPublicHttpsUrl('https://192.168.1.2/private'), false);
assert.strictEqual(server.assistantIsPublicHttpsUrl('https://[::1]/private'), false);
assert.strictEqual(server.assistantNeedsSmartModel('搜索最新建材政策'), true);
assert.strictEqual(server.assistantNeedsSmartModel('你好'), false);
assert.strictEqual(server.assistantToolDefinitions(users.admin).some((tool) => tool.function.name === 'cost_control_summary'), true);
assert.strictEqual(server.assistantToolDefinitions(users.salesA).some((tool) => tool.function.name === 'cost_control_summary'), false);
assert.ok(server.assistantSystemHelp('成本控制').length > 0);

console.log('Xiaocai assistant permission and business-rule tests passed');
