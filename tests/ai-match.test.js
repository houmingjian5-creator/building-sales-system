const assert = require('assert');
const fs = require('fs');
const path = require('path');
const server = require('../server');

const db = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'db.json'), 'utf8'));

const orangePipeMatches = server.matchProductCandidates(
  db.products,
  '日丰 日丰橙色PPR系列 20管',
  { itemText: '20管', cat1: '水电', cat2: '日丰橙色PPR系列' }
);

assert(orangePipeMatches.length > 0, '20管应找到当前分类中的真实管材');
assert.strictEqual(orangePipeMatches[0].product.name, '日丰橙色磁芯管');
assert(orangePipeMatches.every((item) => item.product.cat2 === '日丰橙色PPR系列'));
assert(orangePipeMatches.every((item) => /管/.test(item.product.name)));
assert(orangePipeMatches.every((item) => !/过滤器|阀|弯|三通|直接|管帽/.test(item.product.name)));
assert(orangePipeMatches.every((item) => /(^|[^0-9.])20([^0-9.]|$)/.test(`${item.product.name} ${item.product.spec}`)));

assert.deepStrictEqual(server.fallbackParseOrderText('25管6根，20弯头14个'), [
  { rawName: '25管', quantity: 6 },
  { rawName: '20弯头', quantity: 14 },
]);

const historyProducts = [
  { id: 'standard', name: '龙牌轻钢主龙骨', brand: '龙牌', spec: '50', unit: '根', price: 10, cat1: '木', cat2: '轻钢龙骨', status: '在售', aliases: [] },
  { id: 'premium', name: '龙牌高端主龙骨', brand: '龙牌', spec: '50', unit: '根', price: 20, cat1: '木', cat2: '轻钢龙骨', status: '在售', aliases: [] },
  { id: 'knauf', name: '可耐福轻钢主龙骨', brand: '可耐福', spec: '50', unit: '根', price: 18, cat1: '木', cat2: '轻钢龙骨', status: '在售', aliases: [] },
];

const historyDb = {
  products: historyProducts,
  orders: [
    { id: 'valid-3', customerId: 'customer-a', date: '2026/7/20', status: '已完成', items: [{ productId: 'premium', quantity: 1 }] },
    { id: 'valid-2', customerId: 'customer-a', date: '2026/7/19', status: '已发货', items: [{ productId: 'standard', quantity: 20 }] },
    { id: 'valid-1', customerId: 'customer-a', date: '2026/7/18', status: '已确认', items: [{ productId: 'standard', quantity: 10 }] },
    { id: 'pending', customerId: 'customer-a', date: '2026/7/21', status: '待确认', items: [{ productId: 'premium', quantity: 999 }] },
    { id: 'canceled', customerId: 'customer-a', date: '2026/7/22', status: '已取消', items: [{ productId: 'premium', quantity: 999 }] },
    { id: 'return', type: 'return', no: 'TH100', customerId: 'customer-a', date: '2026/7/23', status: '已完成', items: [{ productId: 'premium', quantity: 999 }] },
    { id: 'deleted', customerId: 'customer-a', date: '2026/7/24', status: '已完成', deletedAt: '2026-07-24T00:00:00Z', items: [{ productId: 'premium', quantity: 999 }] },
  ],
};

const historyContext = server.buildAiRecommendationContext(historyDb, 'customer-a');
assert.strictEqual(historyContext.productStats.get('standard').customerOrderCount, 2, '只统计有效销售订单');
assert.strictEqual(historyContext.productStats.get('premium').customerOrderCount, 1, '待确认、取消、退货和已删除订单必须排除');

const habitDraft = server.validateAiDraft(
  historyDb,
  { items: [{ groupId: 'wood', rawName: '主龙骨', quantity: 6 }] },
  '主龙骨6根',
  [{ id: 'wood', title: '轻钢龙骨', cat1: '木', cat2: '轻钢龙骨' }],
  'customer-a'
);
assert.strictEqual(habitDraft.matched.length, 1, '稳定客户习惯可以自动确认');
assert.strictEqual(habitDraft.matched[0].productId, 'standard', '最近3次同类订单中出现2次的常用品优先');
assert.strictEqual(habitDraft.matched[0].matchSource, 'customer-history');

const explicitDraft = server.validateAiDraft(
  historyDb,
  { items: [{ groupId: 'wood', rawName: '可耐福主龙骨50', quantity: 3 }] },
  '可耐福主龙骨50',
  [{ id: 'wood', title: '轻钢龙骨', cat1: '木', cat2: '轻钢龙骨' }],
  'customer-a'
);
assert.strictEqual(explicitDraft.matched[0].productId, 'knauf', '客户明确品牌和规格必须压过历史习惯');

const popularityDb = {
  products: historyProducts,
  orders: [
    { id: 'g1', customerId: 'x', date: '2026/7/20', status: '已完成', items: [{ productId: 'standard', quantity: 1 }] },
    { id: 'g2', customerId: 'y', date: '2026/7/19', status: '已发货', items: [{ productId: 'standard', quantity: 1 }] },
    { id: 'g3', customerId: 'z', date: '2026/7/18', status: '已确认', items: [{ productId: 'standard', quantity: 1 }] },
    { id: 'g4', customerId: 'x', date: '2026/7/17', status: '已完成', items: [{ productId: 'premium', quantity: 100 }] },
  ],
};
const popularityContext = server.buildAiRecommendationContext(popularityDb, 'new-customer');
const popularMatches = server.matchProductCandidates(historyProducts, '主龙骨', {
  itemText: '主龙骨',
  cat1: '木',
  cat2: '轻钢龙骨',
  recommendationContext: popularityContext,
});
assert.strictEqual(popularMatches[0].product.id, 'standard', '无客户历史时先按有效订单频率、再按数量排序');
const popularityDraft = server.validateAiDraft(
  popularityDb,
  { items: [{ groupId: 'wood', rawName: '主龙骨', quantity: 5 }] },
  '主龙骨5根',
  [{ id: 'wood', title: '轻钢龙骨', cat1: '木', cat2: '轻钢龙骨' }],
  'new-customer'
);
assert.strictEqual(popularityDraft.matched.length, 0, '全局热销只能调整候选顺序，不能自动确认');
assert.strictEqual(popularityDraft.uncertain[0].candidates[0].productId, 'standard');

const learningDb = {
  products: [{ id: 'p1', name: '日丰PPR等径弯头', brand: '日丰', spec: '20', aliases: [] }],
  aiLearning: {},
};
const learned = server.recordAiLearning(learningDb, [{ rawName: '20弯', productId: 'p1', learnAlias: true }], {
  user: { id: 'admin-1', name: '管理员', role: '管理员' },
  orderId: 'order-1',
  orderType: 'sale',
});
assert.deepStrictEqual(learned, [{ productId: 'p1', rawName: '20弯' }]);
assert(learningDb.products[0].aliases.includes('20弯'), '管理员确认后才写入商品关键词');
assert.strictEqual(learningDb.aiLearning.aliasHistory[0].orderId, 'order-1', '关键词学习需保留订单审计信息');

server.recordAiLearning(learningDb, [{ rawName: '客户叫法', productId: 'p1', learnAlias: true }], {
  user: { id: 'sales-1', name: '销售', role: '销售人员' },
  orderId: 'order-2',
  orderType: 'sale',
});
assert(!learningDb.products[0].aliases.includes('客户叫法'), '销售人员不能写入商品关键词');

const aliasCount = learningDb.products[0].aliases.length;
server.recordAiLearning(learningDb, [{ rawName: '20弯', productId: 'p1', learnAlias: true }], {
  user: { id: 'admin-1', name: '管理员', role: '管理员' },
  orderId: 'order-3',
  orderType: 'sale',
});
assert.strictEqual(learningDb.products[0].aliases.length, aliasCount, '同义关键词不能重复写入');

console.log('AI catalog matching regression tests passed');
