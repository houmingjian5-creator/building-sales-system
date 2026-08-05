const assert = require('assert');
const fs = require('fs');
const path = require('path');
const server = require('../server');

assert.deepStrictEqual(
  server.invalidOrderQuantityIndexes([
    { quantity: 1 },
    { quantity: 20 },
    { quantity: 1.5 },
    { quantity: 0 },
    { quantity: -2 },
    { quantity: 'abc' },
  ]),
  [2, 3, 4, 5],
  '订单数量只能是正整数'
);

assert.deepStrictEqual(
  server.invalidOrderPriceIndexes([
    { price: 0 },
    { price: 12.34 },
    { price: -1 },
    { price: 1.234 },
    { price: '' },
    { price: 'abc' },
  ], false),
  [2, 3, 4, 5],
  '销售单价格必须非负且最多两位小数'
);

assert.deepStrictEqual(
  server.invalidOrderPriceIndexes([{ price: -12.34 }, { price: 5 }], true),
  [],
  '退货单允许服务器接收规范化后的负数商品金额和正数费用'
);

assert.deepStrictEqual(
  server.invalidOrderProductIds(
    [{ productId: 'active' }, { productId: 'inactive' }, { productId: 'missing' }],
    [{ id: 'active', status: '在售' }, { id: 'inactive', status: '停用' }]
  ),
  ['inactive', 'missing'],
  '停用或不存在的商品不能用于生成订单'
);

const product = {
  id: 'p1',
  name: '测试管材',
  spec: '20',
  unit: '根',
  price: 10,
  cat1: '水电',
  cat2: '测试分类',
  status: '在售',
  aliases: [],
};

const decimalAiDraft = server.validateAiDraft(
  { products: [product], orders: [] },
  { items: [{ groupId: 'g1', rawName: '测试管材20', quantity: 1.5 }] },
  '测试管材20 1.5根',
  [{ id: 'g1', title: '测试分类', cat1: '水电', cat2: '测试分类' }],
  ''
);

assert.strictEqual(decimalAiDraft.matched.length, 0, 'AI 小数数量不能自动匹配进订单');
assert.strictEqual(decimalAiDraft.needsQuantity.length, 1, 'AI 小数数量必须进入待确认');
assert.strictEqual(decimalAiDraft.needsQuantity[0].quantity, 1.5, '保留原数量供操作员核对');
assert.strictEqual(decimalAiDraft.needsQuantity[0].quantityError, '商品数量必须为正整数');

const appSource = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
const finalProductCard = appSource.slice(
  appSource.lastIndexOf('function productCard'),
  appSource.indexOf('function productModal', appSource.lastIndexOf('function productCard'))
);
assert(finalProductCard.includes('min="1" step="1"'), '开单商品数量输入必须使用整数步进');
assert(!finalProductCard.includes('step="0.01"'), '开单商品数量不能使用小数步进');

const editOrderItems = appSource.slice(
  appSource.indexOf('function editOrderItemsHtml'),
  appSource.indexOf('function editProductPickerSlotHtml')
);
assert(editOrderItems.includes('历史数量不是整数，请修正'), '历史小数订单编辑时必须提示修正');
assert(editOrderItems.includes('min="1" step="1"'), '编辑订单数量必须使用整数步进');

const saveOrderEdits = appSource.slice(
  appSource.indexOf('async function saveOrderEdits'),
  appSource.indexOf('function cartItemForProduct')
);
assert(saveOrderEdits.includes('!isPositiveInteger(item.quantity)'), '编辑订单保存前必须校验整数数量');
assert(appSource.includes('function setCartPrice'), '购物车必须支持修改商品单价');
assert(appSource.includes('pagehide'), '关闭页面时必须保存购物车');
assert(appSource.includes('visibilitychange'), '页面隐藏或自动退出前必须保存购物车');
assert(appSource.includes('...cartSnapshot(product)'), '购物车必须保存商品名称、规格和单位快照');
assert(appSource.includes('clearPersistedCart(state.orderType)'), '订单成功后必须清除对应类型的持久化购物车');

console.log('Order integer quantity regression tests passed');
