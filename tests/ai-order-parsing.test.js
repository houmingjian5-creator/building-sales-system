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

const leadingParsed = server.fallbackParseOrderText('10袋西南325水泥，128匹24多孔砖，40袋河沙');
assert.deepStrictEqual(leadingParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['西南325水泥', 10, '袋'],
  ['24多孔砖', 128, '匹'],
  ['河沙', 40, '袋'],
], '数量和单位写在商品名前面时也必须正确拆分');

const sentenceText = '60个100*200*600加气砖。1.2米过梁两根。河沙4方。炭渣13袋。西南325水泥20包。小金条红砖100个。';
const sentenceParsed = server.fallbackParseOrderText(sentenceText);
assert.deepStrictEqual(sentenceParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['100*200*600加气砖', 60, '个'],
  ['1.2米过梁', 2, '根'],
  ['河沙', 4, '方'],
  ['炭渣', 13, '袋'],
  ['西南325水泥', 20, '包'],
  ['小金条红砖', 100, '个'],
], '中文句号必须拆分商品，同时保留1.2米小数规格');

const dotSentenceParsed = server.fallbackParseOrderText('60个100*200*600加气砖.1.2米过梁两根.4方河沙.炭渣13袋.325西南水泥20包.24红砖100个');
assert.deepStrictEqual(dotSentenceParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['100*200*600加气砖', 60, '个'],
  ['1.2米过梁', 2, '根'],
  ['河沙', 4, '方'],
  ['炭渣', 13, '袋'],
  ['325西南水泥', 20, '包'],
  ['24红砖', 100, '个'],
], '英文句号必须拆分商品，但数字两侧的小数点不得拆分');

const duplicateSourceMerge = server.mergeAiParsedItems(sentenceText, [
  { sourceIndex: 0, sourceText: '60个100*200*600加气砖', rawName: '100*200*600加气砖', quantity: 60, quantityUnit: '个' },
  { sourceIndex: 0, sourceText: '1.2米过梁两根', rawName: '1.2米过梁', quantity: 2, quantityUnit: '根' },
  { sourceIndex: 0, sourceText: '河沙4方', rawName: '河沙', quantity: 4, quantityUnit: '方' },
  { sourceIndex: 0, sourceText: '炭渣13袋', rawName: '炭渣', quantity: 13, quantityUnit: '袋' },
  { sourceIndex: 0, sourceText: '西南325水泥20包', rawName: '西南325水泥', quantity: 20, quantityUnit: '包' },
  { sourceIndex: 0, sourceText: '小金条红砖100个', rawName: '小金条红砖', quantity: 100, quantityUnit: '个' },
]);
assert.deepStrictEqual(duplicateSourceMerge.map((item) => [item.rawName, item.requestedQuantity]), [
  ['100*200*600加气砖', 60],
  ['1.2米过梁', 2],
  ['河沙', 4],
  ['炭渣', 13],
  ['西南325水泥', 20],
  ['小金条红砖', 100],
], '模型重复返回sourceIndex时不得把第一段原文复制到全部商品');

const sharedColorParsed = server.fallbackParseOrderText('2.5平方塔牌电线红一圈、蓝一圈、黄一圈');
assert.deepStrictEqual(sharedColorParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['2.5平方塔牌电线红', 1, '圈'],
  ['2.5平方塔牌电线蓝', 1, '圈'],
  ['2.5平方塔牌电线黄', 1, '圈'],
], '同组后续颜色必须继承品牌、商品名称和2.5平方规格');

const eachColorParsed = server.fallbackParseOrderText('2.5平方塔牌电线红蓝黄各一圈');
assert.deepStrictEqual(eachColorParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['2.5平方塔牌电线红', 1, '圈'],
  ['2.5平方塔牌电线蓝', 1, '圈'],
  ['2.5平方塔牌电线黄', 1, '圈'],
], '颜色枚举加“各”必须展开为三条完整商品请求');

const compactParsed = server.fallbackParseOrderText('河沙4方炭渣13袋西南325水泥20包');
assert.strictEqual(compactParsed.length, 1, '没有明确标点时不得仅凭数字加单位强行拆分商品');

const subKeelParsed = server.fallbackParseOrderText('50*0.5付龙骨100根');
assert.deepStrictEqual(subKeelParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['50*0.5付龙骨', 100, '根'],
], '付龙骨中的“付”属于商品名称，不能把一个商品误拆成两条');

const woodListParsed = server.fallbackParseOrderText('付挂80个\n龙强石膏板20张\n50*0.5付龙骨100根，\n3米丝杆40根，\n50*0.8主龙骨10根\n石膏板检修口5个');
assert.deepStrictEqual(woodListParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['付挂', 80, '个'],
  ['龙强石膏板', 20, '张'],
  ['50*0.5付龙骨', 100, '根'],
  ['3米丝杆', 40, '根'],
  ['50*0.8主龙骨', 10, '根'],
  ['石膏板检修口', 5, '个'],
], '截图中的六条木工材料必须保持六条，不能把付龙骨额外拆开');

const trailingAttributeParsed = server.fallbackParseOrderText('塔牌2.5平方电线2圈红色');
assert.strictEqual(trailingAttributeParsed.length, 1, '数量后面的颜色属性不能被误拆成新商品');
assert(trailingAttributeParsed[0].rawName.includes('红色'));

const negatedParsed = server.fallbackParseOrderText('不要红色，要蓝色两圈');
assert.deepStrictEqual(negatedParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['蓝色', 2, '圈'],
], '否定项不能被加入开单结果');

const replacementParsed = server.fallbackParseOrderText('水泥不要西南的，要拉法基20包');
assert.deepStrictEqual(replacementParsed.map((item) => [item.rawName, item.requestedQuantity, item.requestedUnit]), [
  ['水泥拉法基', 20, '包'],
], '品牌替换语句只能保留目标品牌，不能把被否定品牌加入开单');

const overriddenSpecColors = server.fallbackParseOrderText('2.5平方塔牌电线红一圈、4平方蓝两圈');
assert.deepStrictEqual(overriddenSpecColors.map((item) => [item.rawName, item.requestedQuantity]), [
  ['2.5平方塔牌电线红', 1],
  ['4平方塔牌电线蓝', 2],
], '同组子项明确写新规格时应覆盖旧规格，同时继承品牌和商品名称');

const aggregateColors = server.fallbackParseOrderText('2.5平方塔牌电线红蓝一共3圈');
assert.strictEqual(aggregateColors.length, 1, '颜色合计数量不能擅自平均或复制成多条');
assert.strictEqual(aggregateColors[0].requestedQuantity, null);
assert(aggregateColors[0].parseWarnings.some((warning) => warning.includes('合计数量')));

const colorProducts = ['红', '蓝', '黄'].map((color) => ({
  id: `tapa-wire-${color}`,
  name: `塔牌2.5平方电线${color}`,
  brand: '塔牌',
  spec: `2.5平方 ${color}`,
  unit: '圈',
  price: 100,
  cat1: '水电',
  cat2: '电线',
  status: '在售',
  aliases: [],
}));
const colorDraft = server.validateAiDraft(
  { products: colorProducts, orders: [], aiLearning: {} },
  { items: eachColorParsed.map((item) => Object.assign({}, item, { groupId: 'wire-colors' })) },
  '2.5平方塔牌电线红蓝黄各一圈',
  [{ id: 'wire-colors', title: '电线', cat1: '水电', cat2: '电线' }]
);
assert.deepStrictEqual(colorDraft.matched.map((item) => [item.name, item.quantity]), [
  ['塔牌2.5平方电线红', 1],
  ['塔牌2.5平方电线蓝', 1],
  ['塔牌2.5平方电线黄', 1],
], '颜色展开后的每一条都必须匹配相同品牌和规格的对应颜色商品');

const wireProducts = [{
  id: 'tapa-wire-2.5',
  name: '塔牌电线',
  brand: '塔牌',
  spec: '2.5平方',
  unit: '圈',
  price: 100,
  cat1: '水电',
  cat2: '电线',
  status: '在售',
  aliases: [],
}];
const wireVariants = [
  '塔牌2.5平方电线2圈',
  '2圈2.5平方塔牌电线',
  '2圈塔牌2.5平方电线',
  '塔牌电线2圈2.5平方',
];
const wireParseOptions = { products: wireProducts, cat1: '水电', cat2: '电线' };
wireVariants.forEach((text) => {
  const item = server.fallbackParseOrderText(text, wireParseOptions)[0];
  assert.strictEqual(item.requestedQuantity, 2, `${text} 应识别数量2`);
  assert.strictEqual(item.requestedUnit, '圈', `${text} 应识别数量单位圈`);
  assert(item.rawName.includes('塔牌') && item.rawName.includes('2.5') && item.rawName.includes('电线'), `${text} 删除数量后必须保留品牌、规格和名称`);
  const result = server.validateAiDraft(
    { products: wireProducts, orders: [], aiLearning: {} },
    { items: [Object.assign({}, item, { groupId: 'wire' })] },
    text,
    [{ id: 'wire', title: '电线', cat1: '水电', cat2: '电线' }]
  );
  assert.strictEqual(result.matched.length, 1, `${text} 应匹配同一个真实商品`);
  assert.strictEqual(result.matched[0].productId, 'tapa-wire-2.5');
  assert.strictEqual(result.matched[0].quantity, 2);
});

const wireWithoutQuantity = server.mergeAiParsedItems('塔牌2.5平方电线', [{
  sourceIndex: 0,
  sourceText: '塔牌2.5平方电线',
  rawName: '塔牌电线',
  quantity: 2.5,
  quantityUnit: '平方',
  specText: '2.5平方',
}], wireParseOptions)[0];
assert.strictEqual(wireWithoutQuantity.requestedQuantity, null, '明确的商品规格不能被模型误报为下单数量');
assert.strictEqual(wireWithoutQuantity.requestedUnit, '');
assert(wireWithoutQuantity.rawName.includes('2.5平方'), '没有填写数量时必须保留完整规格用于商品匹配');
assert(wireWithoutQuantity.parseWarnings.some((warning) => warning.includes('商品规格')));

const conversionSpecParsed = server.fallbackParseOrderText('10根塔牌电线4米/根', {
  products: [{ id: 'meter-wire', name: '塔牌电线', brand: '塔牌', spec: '4米/根', unit: '米（4米/根）', cat1: '水电', cat2: '电线', status: '在售', aliases: [] }],
  cat1: '水电',
  cat2: '电线',
})[0];
assert.strictEqual(conversionSpecParsed.requestedQuantity, 10, '复合规格中的4米/根不能被误当作下单数量');
assert.strictEqual(conversionSpecParsed.requestedUnit, '根');
assert(conversionSpecParsed.rawName.includes('4米/根'), '换算规格必须保留在商品描述中');

const dynamicUnitParsed = server.fallbackParseOrderText('运费3趟', {
  products: [{ id: 'delivery', name: '运费', spec: '', unit: '趟', cat1: '其他', cat2: '', status: '在售', aliases: [] }],
  cat1: '其他',
})[0];
assert.strictEqual(dynamicUnitParsed.requestedQuantity, 3, '商品库中的非传统单位也必须识别');
assert.strictEqual(dynamicUnitParsed.requestedUnit, '趟');

const numericBrandProducts = [
  { id: '303-level', name: '山林山找平石膏', brand: '油', spec: '15KG', unit: '袋', price: 14, cat1: '油', cat2: '303', status: '在售', aliases: [] },
  { id: '303-light', name: '山林山轻质石膏', brand: '油', spec: '20KG', unit: '袋', price: 21, cat1: '油', cat2: '303', status: '在售', aliases: [] },
  { id: '303-putty', name: '山林山腻子膏', brand: '油', spec: '25KG', unit: '件', price: 25, cat1: '油', cat2: '303', status: '在售', aliases: [] },
  { id: '303-primer', name: '山林山界面剂', brand: '油', spec: '18L', unit: '桶', price: 85, cat1: '油', cat2: '303', status: '在售', aliases: ['303界面剂一桶'] },
  { id: '303-primer-small', name: '山林山界面剂（小）', brand: '油', spec: '', unit: '桶', price: 35, cat1: '油', cat2: '303', status: '在售', aliases: [] },
  { id: 'mesh-normal', name: '网格布 10cm', brand: '油', spec: '10cm', unit: '圈', price: 5, cat1: '油', cat2: '油工辅材', status: '在售', aliases: [] },
  { id: 'mesh-thick', name: '网格布 10cm（加厚）', brand: '油', spec: '10cm', unit: '圈', price: 8, cat1: '油', cat2: '油工辅材', status: '在售', aliases: [] },
  { id: 'roller-normal', name: '滚筒（普通）', brand: '油', spec: '', unit: '个', price: 3, cat1: '油', cat2: '油工辅材', status: '在售', aliases: [] },
  { id: 'roller-good', name: '滚筒（好）', brand: '油', spec: '', unit: '个', price: 6, cat1: '油', cat2: '油工辅材', status: '在售', aliases: [] },
];
const numericBrandDb = { products: numericBrandProducts, orders: [], aiLearning: {} };
const oilScope = [{ id: 'oil', title: '油', cat1: '油', cat2: '' }];

function numericBrandDraft(text) {
  const options = { products: numericBrandProducts, cat1: '油', cat2: '' };
  const item = Object.assign({}, server.fallbackParseOrderText(text, options)[0], { groupId: 'oil' });
  return server.validateAiDraft(numericBrandDb, { items: [item] }, text, oilScope);
}

let screenshotDraft = numericBrandDraft('303石膏20袋');
assert.strictEqual(screenshotDraft.matched.length, 0, '未写明石膏款式时不能随意自动确认');
assert.strictEqual(screenshotDraft.uncertain.length, 1);
assert.strictEqual(screenshotDraft.uncertain[0].quantity, 20, '待确定商品必须保留原文数量');
assert(screenshotDraft.uncertain[0].candidates.length >= 2);
assert(screenshotDraft.uncertain[0].candidates.every((candidate) => candidate.cat2 === '303'), '数字品牌必须限制候选系列');

screenshotDraft = numericBrandDraft('303腻子膏15件');
assert.strictEqual(screenshotDraft.matched.length, 1);
assert.strictEqual(screenshotDraft.matched[0].productId, '303-putty');
assert.strictEqual(screenshotDraft.matched[0].quantity, 15);

screenshotDraft = numericBrandDraft('303界面剂一桶');
assert.strictEqual(screenshotDraft.matched.length, 0, '大小款式未写明时必须保留候选确认');
assert.strictEqual(screenshotDraft.uncertain.length, 1);
assert.strictEqual(screenshotDraft.uncertain[0].quantity, 1, '旧别名中的一桶不能导致原数量被清空');
assert.strictEqual(screenshotDraft.uncertain[0].requestedUnit, '桶');

screenshotDraft = numericBrandDraft('10cm网格袋一圈');
assert.strictEqual(screenshotDraft.matched.length, 1, '网格袋口语应匹配普通网格布');
assert.strictEqual(screenshotDraft.matched[0].productId, 'mesh-normal');
assert.strictEqual(screenshotDraft.matched[0].quantity, 1);

screenshotDraft = numericBrandDraft('普通滚筒一个');
assert.strictEqual(screenshotDraft.matched.length, 1, '明确普通款不能被热销好款覆盖');
assert.strictEqual(screenshotDraft.matched[0].productId, 'roller-normal');
assert.strictEqual(screenshotDraft.matched[0].quantity, 1);

const catalogDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'db.json'), 'utf8'));
const leadingText = '10袋西南325水泥，128匹24多孔砖，40袋河沙';
const leadingItems = server.mergeAiParsedItems(leadingText, []).map((item) => Object.assign({}, item, { groupId: 'tile' }));
const leadingDraft = server.validateAiDraft(catalogDb, { items: leadingItems }, leadingText, [
  { id: 'tile', title: '瓦', cat1: '瓦', cat2: '' },
]);
assert.strictEqual(leadingDraft.matched.length, 3, '用户本次三条瓦工材料必须全部匹配');
assert.deepStrictEqual(leadingDraft.matched.map((item) => [item.name, item.quantity, item.unit]), [
  ['西南325水泥', 10, '袋'],
  ['24多孔砖', 128, '匹'],
  ['纯黄沙', 40, '袋'],
]);
assert.strictEqual(leadingDraft.uncertain.length, 0);
assert.strictEqual(leadingDraft.unmatched.length, 0);

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
