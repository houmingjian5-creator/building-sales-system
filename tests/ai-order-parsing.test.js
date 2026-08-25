const assert = require('assert');
const fs = require('fs');
const path = require('path');
const server = require('../server');

const parsed = server.fallbackParseOrderText('日丰20*2.8热水管60米，腻子两袋，阴阳角各一把');
assert.deepStrictEqual(parsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['日丰20*2.8热水管', 60, '米'],
  ['腻子', 2, '袋'],
  ['阴阳角', 1, '把'],
]);

const merged = server.mergeAiParsedItems('日丰20*2.8热水管60米，腻子2袋', [
  { sourceIndex: 0, rawName: '热水管', quantity: null, brand: '', specText: '' },
]);
assert.strictEqual(merged[0].rawName, '日丰20*2.8热水管', '原文中的品牌和规格不能被模型省略');
assert.strictEqual(merged[0].requestedQuantity, 60, '原文数量应补回模型遗漏数量');
assert.strictEqual(merged[0].requestedUnit, '米');
assert.strictEqual(merged[1].rawName, '腻子', '模型漏掉的整行应从原文补回');
assert(merged[1].parseWarnings.length > 0);

const unsupportedFields = server.mergeAiParsedItems('热水管10根', [
  { sourceIndex: 0, rawName: '热水管', quantity: 10, quantityUnit: '根', brand: '日丰', specText: '20*2.8' },
]);
assert.strictEqual(unsupportedFields[0].brand, '', '模型猜测的品牌不得参与商品匹配');
assert.strictEqual(unsupportedFields[0].specText, '', '模型猜测的规格不得参与商品匹配');
assert.strictEqual(unsupportedFields[0].parseWarnings.length, 2);

const contextBrandLines = server.mergeAiParsedItems('全用日丰\n20管10根', [
  { sourceIndex: 1, rawName: '20管', quantity: 10, quantityUnit: '根' },
]);
assert.strictEqual(contextBrandLines.length, 1, '全局品牌说明不得被补成商品行');

function converted(requestedQuantity, requestedUnit, unit, spec) {
  return server.resolveAiQuantityForProduct(
    { requestedQuantity, requestedUnit },
    { unit, spec: spec || '' }
  );
}

let result = converted(60, '米', '根（3米/根）');
assert.strictEqual(result.quantity, 20);
assert.strictEqual(result.conversion.rounded, false);

result = converted(10, '米', '根（3米/根）');
assert.strictEqual(result.quantity, 4);
assert.strictEqual(result.conversion.rounded, true);
assert.strictEqual(result.conversion.availableQuantity, 12);

result = converted(10, '根', '米（4米/根）');
assert.strictEqual(result.quantity, 40);

result = converted(7.6, '米', '根（3.8米/根）');
assert.strictEqual(result.quantity, 2);

result = converted(6.6, '米', '根', '3.3m/根');
assert.strictEqual(result.quantity, 2, '英文m和规格字段中的换算信息也应识别');

result = converted(10, '米', '袋', '20kg');
assert.strictEqual(result.quantity, null, '没有可靠换算关系时不得猜测');
assert(result.quantityError.includes('没有可靠'));

const products = [
  { id: 'rifeng-20', name: '日丰PPR热水管', brand: '水电', spec: '20*2.8', unit: '米（4米/根）', price: 8, cat1: '水电', cat2: '日丰灰色PPR系列', status: '在售', aliases: [] },
  { id: 'rifeng-25', name: '日丰PPR热水管', brand: '水电', spec: '25*3.5', unit: '米（4米/根）', price: 10, cat1: '水电', cat2: '日丰灰色PPR系列', status: '在售', aliases: [] },
  { id: 'weixing-20', name: '伟星PPR热水管', brand: '水电', spec: '20*2.8', unit: '米（4米/根）', price: 9, cat1: '水电', cat2: '伟星绿色PPR', status: '在售', aliases: [] },
];
const db = { products, orders: [], aiLearning: {} };
const scope = [{ id: 'water', title: '水管', cat1: '水电', cat2: '日丰灰色PPR系列' }];
const draft = server.validateAiDraft(db, {
  items: [{
    groupId: 'water',
    sourceText: '日丰20*2.8热水管10根',
    rawName: '日丰20*2.8热水管',
    brand: '日丰',
    specText: '20*2.8',
    requestedQuantity: 10,
    requestedUnit: '根',
  }],
}, '日丰20*2.8热水管10根', scope);
assert.strictEqual(draft.matched.length, 1, '明确品牌和规格应匹配真实商品');
assert.strictEqual(draft.matched[0].productId, 'rifeng-20');
assert.strictEqual(draft.matched[0].quantity, 40, '最终数量应按所选商品的单位换算');
assert.strictEqual(draft.matched[0].requestedQuantity, 10);
assert.strictEqual(draft.matched[0].requestedUnit, '根');

const appSource = fs.readFileSync(path.join(__dirname, '..', 'public', 'app.js'), 'utf8');
const selectionSource = appSource.slice(appSource.indexOf('function persistAiDraftProductSelection'), appSource.indexOf('function setAiAliasConsent'));
assert(selectionSource.includes('aiQuantityForProduct(entry.item, product)'), '人工更换商品后必须重新换算数量');
assert(selectionSource.includes('quantityManualOverride = false'));
const quantitySource = appSource.slice(appSource.indexOf('function updateAiDraftQuantity'), appSource.indexOf('function persistAiDraftProductSelection'));
assert(quantitySource.includes('quantityManualOverride = true'), '人工修改数量必须保留覆盖状态');
assert(appSource.includes('data-ai-conversion-note'), '识别详情必须展示换算过程');

console.log('AI parsing and unit conversion tests passed');
