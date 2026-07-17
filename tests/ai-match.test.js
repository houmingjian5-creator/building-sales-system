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

console.log('AI catalog matching regression tests passed');
