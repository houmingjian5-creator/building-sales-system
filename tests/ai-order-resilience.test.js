const assert = require('assert');
const server = require('../server');

async function run() {
  const db = { products: [], customers: [], orders: [], aiLearning: {} };
  const groups = Array.from({ length: 8 }, (_, index) => ({
    id: `group-${index + 1}`,
    cat1: '水电',
    cat2: `分类${index + 1}`,
    content: `测试材料${index + 1} ${index + 1}个`,
  }));
  const draft = await server.buildAiOrderDraft(db, groups, '', { strategy: 'local-only' });
  const all = ['matched', 'needsQuantity', 'uncertain', 'unmatched'].reduce((items, key) => items.concat(draft[key] || []), []);
  assert.strictEqual(all.length, 8, '本地兜底必须保留8个分类中的每一条原文');
  assert.deepStrictEqual(all.map((item) => item.groupId).sort(), groups.map((group) => group.id).sort());
  assert(all.every((item) => item.requestedQuantity > 0), '本地兜底不能丢失数量');

  const longGroup = {
    id: 'long-group',
    cat1: '水电',
    content: Array.from({ length: 24 }, (_, index) => `测试配件${index + 1} ${index + 1}个`).join('\n'),
  };
  const longDraft = await server.buildAiOrderDraft(db, [longGroup], '', { strategy: 'local-only' });
  const longItems = ['matched', 'needsQuantity', 'uncertain', 'unmatched'].reduce((items, key) => items.concat(longDraft[key] || []), []);
  assert.strictEqual(longItems.length, 24, '包含20条以上材料的分类必须完整保留原文行');
  assert.deepStrictEqual(longItems.map((item) => item.sourceIndex).sort((a, b) => a - b), Array.from({ length: 24 }, (_, index) => index));

  console.log('AI multi-category resilience tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
