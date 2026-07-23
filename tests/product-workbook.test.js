const assert = require('assert');
const XlsxPopulate = require('xlsx-populate');
const server = require('../server');

async function run() {
  const source = [{
    id: 'p1',
    code: 'TEST-001',
    name: '\u6d4b\u8bd5\u5546\u54c1',
    spec: '20*2.8',
    cat1: '\u6c34\u7535',
    cat2: '\u6d4b\u8bd5\u5206\u7c7b',
    brand: '\u6d4b\u8bd5\u54c1\u724c',
    unit: '\u6839',
    price: 12.5,
    cost: 8.2,
    status: '\u5728\u552e',
    aliases: ['\u6d4b\u8bd5\u522b\u540d', '\u6837\u54c1'],
  }];
  const buffer = await server.buildProductWorkbook(source);
  assert(buffer.length > 1000, 'should generate a valid xlsx file');
  assert.strictEqual(buffer.slice(0, 2).toString('ascii'), 'PK', 'xlsx should be a ZIP container');

  const db = { products: source.map((product) => Object.assign({}, product)) };
  const parsed = await server.parseProductWorkbook(buffer, db);
  assert.strictEqual(parsed.length, 1);
  assert.strictEqual(parsed[0].id, 'p1', 'same product code should update the existing product');
  assert.strictEqual(parsed[0].name, '\u6d4b\u8bd5\u5546\u54c1');
  assert.deepStrictEqual(parsed[0].aliases, ['\u6d4b\u8bd5\u522b\u540d', '\u6837\u54c1']);

  const invalidWorkbook = await XlsxPopulate.fromDataAsync(buffer);
  invalidWorkbook.sheet('\u4ea7\u54c1').cell('D2').value('\u65e0\u6548\u5206\u7c7b');
  const invalidBuffer = Buffer.from(await invalidWorkbook.outputAsync());
  await assert.rejects(
    () => server.parseProductWorkbook(invalidBuffer, db),
    /\u4e00\u7ea7\u5206\u7c7b\u65e0\u6548/,
    'invalid product rows must be rejected before database writes'
  );
  console.log('Product workbook round-trip tests passed');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
