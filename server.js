const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT || 3000);
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";

const sessions = new Map();

function newId() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex");
}

function readDb() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDb(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function sendJson(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  res.end(body);
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("请求体过大"));
        req.destroy();
      }
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("JSON 格式错误"));
      }
    });
  });
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  const cookie = req.headers.cookie || "";
  const match = cookie.match(/(?:^|;\s*)sid=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

function getCurrentUser(req) {
  const token = getToken(req);
  const userId = sessions.get(token);
  if (!userId) return null;
  const db = readDb();
  return db.users.find((user) => user.id === userId && user.status === "启用") || null;
}

function requireUser(req, res) {
  const user = getCurrentUser(req);
  if (!user) {
    sendError(res, 401, "请先登录");
    return null;
  }
  return user;
}

function requireAdmin(req, res) {
  const user = requireUser(req, res);
  if (!user) return null;
  if (!["超级管理员", "管理员"].includes(user.role)) {
    sendError(res, 403, "没有人员管理权限");
    return null;
  }
  return user;
}

function sanitizeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[，。、“”‘’：:；;！!？?、,.]/g, '')
    .replace(/[（）]/g, (char) => (char === '（' ? '(' : ')'))
    .replace(/×/g, '*');
}

function normalizeMatchText(value) {
  return normalizeText(value)
    .replace(/摩丽美涂/g, '摩利美涂')
    .replace(/付龙骨|付骨|辅龙骨|辅骨/g, '副龙骨')
    .replace(/直顶/g, '直钉')
    .replace(/罗丝/g, '螺丝')
    .replace(/罗母|罗姆/g, '螺母')
    .replace(/木龙骨|木条/g, '木方');
}

function splitAliases(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '')
    .split(/[,??;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function productAliases(product) {
  const terms = [product.name, product.spec, product.brand, product.cat1, product.cat2, product.code, ...(product.aliases || [])];
  const text = (String(product.name || '') + ' ' + String(product.spec || '') + ' ' + (product.aliases || []).join(' ')).toLowerCase();
  const rules = [
    [/\u77f3\u818f|\u87ba\u4e1d|\u7f57\u4e1d/, ['\u77f3\u818f\u87ba\u4e1d', '\u77f3\u818f\u7f57\u4e1d', '\u77f3\u818f\u4e1d']],
    [/\u87ba\u6bcd|\u7f57\u6bcd|\u7f57\u59c6/, ['\u87ba\u6bcd', '\u7f57\u6bcd', '\u7f57\u59c6']],
    [/\u526f\u9aa8|\u4ed8\u9aa8|\u8f85\u9aa8|\u526f\u9f99\u9aa8|\u4ed8\u9f99\u9aa8/, ['\u4ed8\u9aa8', '\u526f\u9aa8', '\u8f85\u9aa8', '\u4ed8\u9f99\u9aa8', '\u526f\u9f99\u9aa8']],
    [/\u4e3b\u9aa8|\u4e3b\u9f99\u9aa8/, ['\u4e3b\u9aa8', '\u4e3b\u9f99\u9aa8']],
    [/\u8fb9\u9aa8|\u8fb9\u9f99\u9aa8/, ['\u8fb9\u9aa8', '\u8fb9\u9f99\u9aa8']],
    [/\u6728\u9f99\u9aa8|\u6728\u65b9|\u6728\u6761/, ['\u6728\u9f99\u9aa8', '\u6728\u65b9', '\u6728\u6761', '\u6728\u9f99\u9aa8\u6761']],
    [/\u77f3\u818f\u677f/, ['\u77f3\u818f\u677f']],
    [/\u94a2\u9489/, ['\u94a2\u9489', '38\u94a2\u9489']],
    [/\u76f4\u9489/, ['\u76f4\u9489', '\u76f4\u9876']],
    [/\u9634\u89d2|\u9633\u89d2|\u9634\u9633\u89d2/, ['\u9634\u89d2', '\u9633\u89d2', '\u9634\u9633\u89d2']],
    [/\u767d\u4e73\u80f6|\u767d\u80f6/, ['\u767d\u4e73\u80f6', '\u767d\u80f6']],
    [/\u6c34\u6ce5/, ['\u6c34\u6ce5']],
    [/\u642c\u8fd0/, ['\u642c\u8fd0\u8d39', '\u642c\u8fd0']],
    [/\u8fd0\u8d39|\u9001\u8d27/, ['\u8fd0\u8d39', '\u9001\u8d27\u8d39']],
  ];
  rules.forEach(([pattern, aliases]) => {
    if (pattern.test(text)) terms.push(...aliases);
  });
  return [...new Set(terms.filter(Boolean))];
}

function publicProduct(product) {
  return {
    id: product.id,
    code: product.code || product.id,
    brand: product.brand || product.cat1 || '',
    cat1: product.cat1 || '',
    cat2: product.cat2 || '',
    name: product.name || '',
    spec: product.spec || '',
    unit: product.unit || '',
    price: Number(product.price || 0),
    cost: Number(product.cost || 0),
    status: product.status || '\u5728\u552e',
    aliases: splitAliases(product.aliases),
    color: product.color || '#dbe4ef',
    stock: Number(product.stock || 0),
  };
}

function normalizeProductPayload(payload, existing = {}) {
  const cat1 = payload.cat1 || existing.cat1 || '\u8f85\u52a9\u5546\u54c1';
  return {
    ...existing,
    id: existing.id || payload.id || payload.code || newId(),
    code: payload.code || existing.code || payload.id || newId(),
    brand: payload.brand || cat1,
    cat1,
    cat2: payload.cat2 !== undefined ? payload.cat2 : existing.cat2 || (cat1 === '\u8f85\u52a9\u5546\u54c1' ? '\u8f85\u52a9\u5546\u54c1' : ''),
    name: payload.name || existing.name || '\u672a\u547d\u540d\u5546\u54c1',
    spec: payload.spec !== undefined ? payload.spec : existing.spec || '',
    unit: payload.unit || existing.unit || '\u4e2a',
    price: Number(payload.price || 0),
    cost: Number(payload.cost || 0),
    status: payload.status || existing.status || '\u5728\u552e',
    aliases: splitAliases(payload.aliases !== undefined ? payload.aliases : existing.aliases),
    color: existing.color || payload.color || '#dbe4ef',
    stock: Number(existing.stock || payload.stock || 0),
  };
}

const ORDER_STATUS_OPTIONS = new Set(['待确认', '已确认', '已发货', '已完成', '已取消', '已退货']);

function normalizePayStatus(value) {
  if (value === '已付款' || value === '已回款') return '已付款';
  return '未付款';
}

function publicOrder(order) {
  const isReturn = order.type === 'return' || String(order.no || '').startsWith('TH') || order.status === '已退货';
  const items = isReturn ? normalizeReturnItems(order.items) : Array.isArray(order.items) ? order.items : [];
  return {
    ...order,
    type: isReturn ? 'return' : order.type || 'sale',
    payStatus: normalizePayStatus(order.payStatus),
    address: order.address || '',
    remark: order.remark || '',
    items,
    amount: isReturn ? orderAmount(items) : Number(order.amount || 0),
  };
}

function orderItemsFromPayload(items, products = []) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return null;
    const quantity = Number(item.quantity || 0);
    const price = Number(item.price !== undefined ? item.price : product.price || 0);
    return {
      productId: product.id,
      name: product.name || '',
      spec: product.spec || '',
      unit: product.unit || '',
      quantity,
      price,
    };
  }).filter((item) => item && item.productId);
}

function invalidOrderProductIds(items, products = []) {
  const ids = new Set(products.map((product) => product.id));
  return (Array.isArray(items) ? items : [])
    .map((item) => String((item && item.productId) || ''))
    .filter((id) => !id || !ids.has(id));
}

function orderAmount(items) {
  return (Array.isArray(items) ? items : []).reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
}

function isPositiveReturnCharge(item) {
  const name = String((item && item.name) || '');
  return name.includes('运费') || name.includes('搬运费');
}

function normalizeReturnItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    ...item,
    price: isPositiveReturnCharge(item) ? Math.abs(Number(item.price || 0)) : -Math.abs(Number(item.price || 0)),
  }));
}

function candidateFor(product) {
  return { productId: product.id, name: product.name, spec: product.spec, unit: product.unit, price: product.price, cat1: product.cat1 || '', cat2: product.cat2 || '' };
}

function isGenericBrandTerm(term) {
  const genericTerms = ['龙骨', '主龙骨', '副龙骨', '边龙骨', '石膏板', '石膏', '木方', '木类小配件', '木工辅材', '油工辅材', '水电辅材', '辅助商品'];
  return genericTerms.some((generic) => term === generic || term.includes(generic));
}

function requestedBrandTerms(products, needle) {
  const terms = [];
  products.forEach((product) => {
    [product.brand, product.cat2].forEach((value) => {
      const term = normalizeMatchText(value);
      if (term && term.length >= 2 && needle.includes(term) && !isGenericBrandTerm(term)) terms.push(term);
    });
  });
  return [...new Set(terms)];
}

function contextBrandTerms(products, content) {
  const text = normalizeMatchText(content);
  if (!/(全用|都用|全部用|统一用|用).*?(牌|品牌|的)/.test(text)) return [];
  const brands = [];
  products.forEach((product) => {
    [product.brand, product.cat2].forEach((value) => {
      const term = normalizeMatchText(value);
      if (term && term.length >= 2 && text.includes(term) && !isGenericBrandTerm(term)) brands.push(term);
    });
  });
  return [...new Set(brands)];
}

function productHasBrandTerm(product, brandTerms) {
  if (!brandTerms.length) return true;
  const haystack = normalizeMatchText([product.brand, product.cat2, product.name, ...(product.aliases || [])].join(' '));
  return brandTerms.some((term) => haystack.includes(term));
}

function textTokens(value) {
  const genericTerms = ['\u666e\u901a', '\u5e38\u89c4', '\u9ed8\u8ba4'];
  return (String(value || '').toLowerCase().match(/[\u4e00-\u9fa5]+|[a-z0-9.]+/g) || [])
    .map((token) => normalizeMatchText(token))
    .filter((token) => token && token.length >= 2 && !genericTerms.includes(token));
}

function productKind(product) {
  const text = normalizeMatchText([product.name, product.spec, product.brand, product.cat1, product.cat2, ...(product.aliases || [])].join(' '));
  if (text.includes('过滤器')) return 'filter';
  if (text.includes('三角阀')) return 'angleValve';
  if (text.includes('截止阀')) return 'stopValve';
  if (text.includes('管帽') || text.includes('堵头')) return 'pipeCap';
  if (text.includes('双联') && (text.includes('弯头') || text.includes('内牙弯') || text.includes('内丝弯'))) return 'doubleInnerElbow';
  if (text.includes('45') && (text.includes('弯头') || text.includes('弯'))) return 'elbow45';
  if (text.includes('弯头') || text.includes('大弧弯') || text.includes('过桥弯') || text.includes('无口弯')) return 'elbow';
  if (text.includes('三通')) return 'tee';
  if (text.includes('直接') || text.includes('直通')) return 'coupling';
  if (text.includes('吊卡')) return 'hanger';
  if (text.includes('钉卡')) return 'nailClip';
  if (text.includes('管卡') || text.includes('坐卡') || text.includes('座卡')) return 'pipeClip';
  if (text.includes('波纹管')) return 'corrugatedPipe';
  if (text.includes('线管') || text.includes('水管') || text.includes('排水管') || text.includes('热水管') || text.includes('冷水管') || text.endsWith('管') || text.includes('磁芯管') || text.includes('瓷芯管') || text.includes('双层管')) return 'pipe';
  if (text.includes('木方')) return 'woodBatten';
  if (text.includes('主龙骨')) return 'mainKeel';
  if (text.includes('副龙骨')) return 'subKeel';
  if (text.includes('边龙骨')) return 'edgeKeel';
  if (text.includes('龙骨')) return 'lightKeel';
  if (text.includes('石膏板')) return 'gypsumBoard';
  if (text.includes('石膏')) return 'gypsum';
  if (text.includes('腻子')) return 'putty';
  if (text.includes('界面剂')) return 'primer';
  if (text.includes('保护膜胶')) return 'filmTape';
  if (text.includes('保护膜')) return 'floorFilm';
  if (text.includes('丝杆')) return 'rod';
  if (text.includes('螺丝') || text.includes('螺钉') || text.includes('自攻钉')) return 'screw';
  if (text.includes('直钉')) return 'straightNail';
  if (text.includes('钢钉')) return 'steelNail';
  if (text.includes('阴角')) return 'insideCorner';
  if (text.includes('阳角')) return 'outsideCorner';
  return '';
}

function requestedKind(rawName) {
  const text = normalizeMatchText(rawName);
  if (text.includes('过滤器')) return 'filter';
  if (text.includes('三角阀')) return 'angleValve';
  if (text.includes('截止阀')) return 'stopValve';
  if (text.includes('管帽') || text.includes('堵头')) return 'pipeCap';
  if ((text.includes('连体') || text.includes('双联')) && (text.includes('内弯') || text.includes('内丝弯') || text.includes('内牙弯'))) return 'doubleInnerElbow';
  if ((text.includes('45') || text.includes('四十五')) && text.includes('弯')) return 'elbow45';
  if (text.includes('弯头') || text.includes('无口弯') || text.includes('过桥弯') || text.includes('大弧弯') || text.endsWith('弯')) return 'elbow';
  if (text.includes('三通')) return 'tee';
  if (text.includes('直接') || text.includes('直通')) return 'coupling';
  if (text.includes('吊卡')) return 'hanger';
  if (text.includes('钉卡')) return 'nailClip';
  if (text.includes('管卡') || text.includes('坐卡') || text.includes('座卡')) return 'pipeClip';
  if (text.includes('波纹管')) return 'corrugatedPipe';
  if (text.includes('管子') || text.includes('水管') || text.includes('线管') || /(^|[^\u4e00-\u9fa5])\d+(?:[.]\d+)?管$/.test(text) || /^\d+(?:[.]\d+)?管$/.test(text)) return 'pipe';
  if (text.includes('木方') || /\d+[*]\d+/.test(text) && text.includes('龙骨')) return 'woodBatten';
  if (text.includes('主龙骨')) return 'mainKeel';
  if (text.includes('副龙骨')) return 'subKeel';
  if (text.includes('边龙骨')) return 'edgeKeel';
  if (text.includes('石膏板')) return 'gypsumBoard';
  if (text.includes('石膏')) return 'gypsum';
  if (text.includes('腻子')) return 'putty';
  if (text.includes('界面剂')) return 'primer';
  if (text.includes('保护膜胶') || text.includes('胶布')) return 'filmTape';
  if (text.includes('保护膜')) return 'floorFilm';
  if (text.includes('丝杆')) return 'rod';
  if (text.includes('螺丝') || text.includes('螺钉') || text.includes('自攻钉')) return 'screw';
  if (text.includes('直钉')) return 'straightNail';
  if (text.includes('钢钉')) return 'steelNail';
  if (text.includes('阴角')) return 'insideCorner';
  if (text.includes('阳角')) return 'outsideCorner';
  return '';
}

function isBrandSensitiveKind(kind) {
  return ['mainKeel', 'subKeel', 'edgeKeel', 'lightKeel', 'gypsumBoard'].includes(kind);
}

function learningScore(db, rawName, productId) {
  const key = normalizeMatchText(rawName);
  const learning = db && db.aiLearning && db.aiLearning.productChoices;
  if (!key || !learning || !learning[key] || !learning[key][productId]) return 0;
  return Math.min(90, Number(learning[key][productId] || 0) * 18);
}

function hasStandaloneNumber(product, token) {
  const text = [product.name, product.spec].join(' ');
  const escaped = String(token).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^0-9.])${escaped}([^0-9.]|$)`).test(text);
}

function requestedSpecNumbers(value) {
  return [...new Set((String(value || '').match(/\d+(?:[.]\d+)?/g) || []).map((token) => String(Number(token))))];
}

function matchProductCandidates(products, rawName, options = {}) {
  const needle = normalizeMatchText(rawName);
  if (!needle) return [];
  const explicitBrandTerms = requestedBrandTerms(products, needle);
  const contextBrands = options.contextBrandTerms || [];
  const kind = requestedKind(options.itemText || rawName);
  const brandTerms = explicitBrandTerms.length ? explicitBrandTerms : (isBrandSensitiveKind(kind) ? contextBrands : []);
  const queryTokens = textTokens(rawName);
  const specNumbers = requestedSpecNumbers(options.itemText || rawName);
  const scored = products
    .filter((product) => product.status !== '\u505c\u7528')
    .filter((product) => !options.cat1 || product.cat1 === options.cat1)
    .filter((product) => !options.cat2 || product.cat2 === options.cat2)
    .filter((product) => !kind || productKind(product) === kind)
    .filter((product) => !specNumbers.length || specNumbers.every((token) => hasStandaloneNumber(product, token)))
    .map((product) => {
      const aliases = productAliases(product);
      const name = normalizeMatchText(product.name);
      const spec = normalizeMatchText(product.spec);
      const brand = normalizeMatchText(product.brand);
      const cat2 = normalizeMatchText(product.cat2);
      const searchable = normalizeMatchText([product.name, product.spec, product.brand, product.cat1, product.cat2, ...aliases].join(' '));
      const pKind = productKind(product);
      let score = 0;

      if (kind && pKind === kind) score += 150;
      if (kind === 'woodBatten' && ['mainKeel', 'subKeel', 'edgeKeel', 'lightKeel'].includes(pKind)) score -= 220;
      if (['mainKeel', 'subKeel', 'edgeKeel'].includes(kind) && pKind === 'woodBatten') score -= 180;
      if (kind === 'gypsum' && pKind === 'primer') score -= 90;
      if (kind === 'primer' && pKind === 'gypsum') score -= 70;

      if (brandTerms.length && !productHasBrandTerm(product, brandTerms)) score -= explicitBrandTerms.length ? 180 : 40;
      if (brandTerms.length && productHasBrandTerm(product, brandTerms)) score += explicitBrandTerms.length ? 160 : 90;
      if (brand && needle.includes(brand)) score += 100;
      if (cat2 && needle.includes(cat2)) score += 150;
      if (name && name === needle) score += 220;
      else if (name && name.includes(needle)) score += 150;
      else if (name && needle.includes(name)) score += 150;
      if (spec && needle.includes(spec)) score += 45;
      if (
        needle.includes('\u77f3\u818f\u677f') &&
        name.includes('\u666e\u901a') &&
        !['\u9632\u6c34', '\u8010\u6f6e', '\u5347\u7ea7', '\u5206\u89e3', '\u4fee\u8865', '\u4fdd\u62a4'].some((term) => needle.includes(term))
      ) {
        score += 45;
      }

      aliases.forEach((alias) => {
        const term = normalizeMatchText(alias);
        if (!term) return;
        const numericTerm = /^[0-9.]+$/.test(term);
        const genericTerm = ['\u666e\u901a', '\u5e38\u89c4', '\u9ed8\u8ba4'].includes(term);
        if (term === needle) score += 120;
        else if (needle.includes(term)) score += numericTerm || genericTerm ? 8 : (term.length >= 2 ? 70 : 10);
        else if (term.includes(needle)) score += numericTerm ? 5 : (term.length >= 2 ? 25 : 8);
      });
      queryTokens.forEach((token) => {
        if (!searchable.includes(token)) return;
        if (/^[0-9.]+$/.test(token)) score += hasStandaloneNumber(product, token) ? 70 : 12;
        else score += 30;
      });
      if (searchable.includes(needle)) score += 50;
      if (needle.includes('摩利美涂') && needle.includes('石膏') && name.includes('摩利美涂') && name.includes('找平石膏')) score += 120;
      if (needle.includes('摩利美涂') && needle.includes('石膏') && name.includes('轻质石膏')) score += 40;
      if (needle.includes('红色') && name.includes('保护膜') && !name.includes('绿色')) score += 30;
      if (kind === 'screw' && needle.includes('春雨') && searchable.includes('春雨')) score += 90;
      if (kind === 'screw' && needle.includes('黑') && searchable.includes('黑')) score += 70;
      score += learningScore(options.db, rawName, product.id);
      return { product, score };
    })
    .filter((item) => item.score >= 110)
    .sort((a, b) => b.score - a.score || (String(a.product.name || '') + String(a.product.spec || '')).localeCompare(String(b.product.name || '') + String(b.product.spec || ''), 'zh-CN'));
  return scored.slice(0, 8);
}

function parseJsonFromText(text) {
  const raw = String(text || "").trim();
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
    throw new Error("AI 返回内容不是有效 JSON");
  }
}

function callDeepSeek(messages) {
  if (!DEEPSEEK_API_KEY) {
    return Promise.reject(new Error("DeepSeek API Key 尚未配置"));
  }
  const body = JSON.stringify({
    model: DEEPSEEK_MODEL,
    messages,
    temperature: 0.1,
    response_format: { type: "json_object" },
  });
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.deepseek.com",
        path: "/chat/completions",
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          "content-length": Buffer.byteLength(body),
        },
        timeout: 30000,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => {
          raw += chunk;
        });
        res.on("end", () => {
          let payload;
          try {
            payload = JSON.parse(raw);
          } catch {
            return reject(new Error("DeepSeek 返回格式异常"));
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            const message = payload.error && payload.error.message ? payload.error.message : "DeepSeek 调用失败";
            return reject(new Error(message));
          }
          const choice = payload.choices && payload.choices[0];
          const content = choice && choice.message ? choice.message.content : "";
          resolve(content || "");
        });
      }
    );
    req.on("timeout", () => req.destroy(new Error("DeepSeek 请求超时")));
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function expandAiLines(lines) {
  const expanded = [];
  lines.forEach((line) => {
    const rawName = String(line.rawName || line.name || '').trim();
    const normalized = normalizeMatchText(rawName);
    if (normalized.includes('阴阳角')) {
      expanded.push({ ...line, rawName: rawName.replace(/阴阳角/g, '阴角'), quantity: 50 });
      expanded.push({ ...line, rawName: rawName.replace(/阴阳角/g, '阳角'), quantity: 50 });
      return;
    }
    expanded.push(line);
  });
  return expanded;
}

function validateAiDraft(db, aiResult, content = '', scopes = []) {
  const lines = Array.isArray(aiResult.items) ? aiResult.items : [];
  const matched = [];
  const needsQuantity = [];
  const uncertain = [];
  const unmatched = [];
  const contextBrands = contextBrandTerms(db.products, content);

  expandAiLines(lines).forEach((line) => {
    const rawName = String(line.rawName || line.name || '').trim();
    const scope = scopes.find((item) => item.id === line.groupId) || (scopes.length === 1 ? scopes[0] : null);
    if (!scope) {
      unmatched.push({ groupId: '', groupTitle: '无法确定分类窗口', rawName, note: 'AI未能确定该商品属于哪个输入窗口，请重新识别或手动添加' });
      return;
    }
    const context = [line.brand, line.cat1, line.cat2, line.system, line.context].filter(Boolean).join(' ');
    const matchText = [context, rawName].filter(Boolean).join(' ');
    const quantity = Number(line.quantity);
    const lineContextBrands = requestedBrandTerms(db.products, normalizeMatchText(context));
    const matches = matchProductCandidates(db.products, matchText, {
      db,
      itemText: rawName,
      cat1: scope.cat1 || '',
      cat2: scope.cat2 || '',
      contextBrandTerms: lineContextBrands.length ? lineContextBrands : contextBrands,
    });
    const uniqueHardMatch = matches.length === 1 && requestedKind(rawName) && requestedSpecNumbers(rawName).length;
    const product = uniqueHardMatch || (matches[0] && matches[0].score >= 260 && (!matches[1] || matches[0].score - matches[1].score >= 100)) ? matches[0].product : null;
    const candidateProducts = matches.map((item) => candidateFor(item.product));
    const groupMeta = { groupId: scope.id || '', groupTitle: scope.title || scope.cat2 || scope.cat1 || '未分组' };

    if (!product) {
      if (candidateProducts.length) {
        uncertain.push({ ...groupMeta, rawName, quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null, candidates: candidateProducts });
        return;
      }
      unmatched.push({ ...groupMeta, rawName, note: line.note || '\u6307\u5b9a\u5206\u7c7b\u4e2d\u672a\u627e\u5230\u7c7b\u578b\u548c\u89c4\u683c\u90fd\u7b26\u5408\u7684\u5546\u54c1' });
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      needsQuantity.push({ ...groupMeta, rawName, productId: product.id, name: product.name, spec: product.spec, unit: product.unit, price: product.price });
      return;
    }

    matched.push({
      ...groupMeta,
      rawName,
      productId: product.id,
      name: product.name,
      spec: product.spec,
      unit: product.unit,
      price: product.price,
      quantity,
    });
  });

  return { matched, needsQuantity, uncertain, unmatched };
}

async function buildAiOrderDraft(db, groups) {
  const scopes = (Array.isArray(groups) ? groups : []).map((group, index) => ({
    id: String(group.id || `group-${index + 1}`),
    title: String(group.title || group.cat2 || group.cat1 || `分类 ${index + 1}`),
    cat1: String(group.cat1 || ''),
    cat2: String(group.cat2 || ''),
    content: String(group.content || '').slice(0, 1600),
  })).filter((group) => group.cat1 && group.content.trim());
  const content = scopes.map((group) => `[${group.id}] ${group.cat1}${group.cat2 ? ` / ${group.cat2}` : ''}\n${group.content}`).join('\n\n');
  const messages = [
    {
      role: 'system',
      content: '\u4f60\u662f\u5efa\u6750\u9500\u552e\u7cfb\u7edf\u7684\u5f00\u5355\u6587\u672c\u89e3\u6790\u52a9\u624b\u3002\u4f60\u53ea\u8d1f\u8d23\u4ece\u9500\u552e\u539f\u6587\u4e2d\u62c6\u51fa\u5546\u54c1\u53eb\u6cd5\u3001\u6570\u91cf\u548c\u6bb5\u843d\u4e0a\u4e0b\u6587\uff0c\u4e0d\u8981\u5339\u914d\u6216\u521b\u9020\u5546\u54c1\uff0c\u4e0d\u8981\u751f\u6210\u5546\u54c1\u540d\u3001\u89c4\u683c\u3001\u5355\u4f4d\u3001\u4ef7\u683c\u6216\u5546\u54c1ID\u3002\u6570\u91cf\u4e0d\u660e\u786e\u65f6 quantity=null\u3002\u6bb5\u843d\u6807\u9898\u4e2d\u7684\u54c1\u724c\u3001\u6750\u8d28\u548c\u7cfb\u7edf\u9700\u8981\u539f\u6837\u4f20\u9012\u7ed9\u8be5\u6bb5\u6bcf\u4e2a\u5546\u54c1\u3002\u53ea\u8fd4\u56de JSON\u3002',
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: '\u4ece orderText \u4e2d\u8bc6\u522b\u5546\u54c1\u53eb\u6cd5\u548c\u6570\u91cf\u3002',
        outputSchema: {
          items: [
            {
              groupId: '\u5fc5\u987b\u539f\u6837\u8fd4\u56de\u8be5\u5546\u54c1\u6240\u5c5e\u8f93\u5165\u5206\u7ec4\u7684 id',
              rawName: '\u9500\u552e\u539f\u6587\u4e2d\u7684\u5546\u54c1\u53eb\u6cd5',
              quantity: '\u6570\u5b57\uff0c\u65e0\u6cd5\u786e\u5b9a\u5219 null',
              brand: '\u6bb5\u843d\u660e\u786e\u6307\u5b9a\u7684\u54c1\u724c\uff0c\u6ca1\u6709\u5219\u7a7a\u5b57\u7b26\u4e32',
              system: '\u6bb5\u843d\u6807\u9898\u6216\u4e0a\u4e0b\u6587\uff0c\u4f8b\u5982\u767d\u8272PPR\u3001PVC\u6392\u6c34\u3001PVC\u7ebf\u7ba1',
              note: '\u53ef\u9009',
            },
          ],
        },
        rules: [
          '\u4e0d\u8981\u628a\u5ba2\u6237\u540d\u3001\u5730\u5740\u3001\u9001\u8d27\u65f6\u95f4\u8bc6\u522b\u4e3a\u5546\u54c1',
          '\u4e00\u5c0f\u6876\u3001\u4e00\u5927\u6876\u3001\u4e00\u888b\u3001\u4e00\u76d2\u3001\u4e00\u6839\u3001\u4e00\u5f20\u7b49\u53ef\u4ee5\u7406\u89e3\u4e3a\u6570\u91cf 1',
          '\u9519\u522b\u5b57\u53ef\u4ee5\u6309\u53e3\u8bed\u7406\u89e3\uff0c\u4f8b\u5982\u7f57\u6bcd=\u87ba\u6bcd\u3001\u7f57\u4e1d=\u87ba\u4e1d\u3001\u4ed8\u9aa8=\u526f\u9aa8',
          '\u5168\u7528\u67d0\u54c1\u724c\u3001\u90fd\u7528\u67d0\u54c1\u724c\u662f\u4e0a\u4e0b\u6587\u54c1\u724c\uff0c\u4e0d\u8981\u5f53\u4f5c\u5546\u54c1\u884c',
          '\u9634\u9633\u89d2\u5404\u4e00\u628a\u9700\u8981\u4fdd\u7559\u4e3a\u9634\u9633\u89d2\uff0c\u4e0d\u8981\u4e22\u5931',
          '\u5982\u679c\u5546\u54c1\u540d\u540e\u9762\u7d27\u8ddf\u6570\u5b57\u4e14\u6709\u5355\u4f4d\uff0c\u4f8b\u5982\u6469\u5229\u7f8e\u6d82\u77f3\u818f30\u888b\uff0c\u6570\u5b57\u662f\u6570\u91cf',
        ],
        orderGroups: scopes.map((group) => ({ id: group.id, category: group.cat1, subcategory: group.cat2, orderText: group.content })),
      }),
    },
  ];
  const text = await callDeepSeek(messages);
  return validateAiDraft(db, parseJsonFromText(text), content, scopes);
}

function recordAiLearning(db, pairs) {
  const validPairs = Array.isArray(pairs) ? pairs : [];
  if (!validPairs.length) return;
  if (!db.aiLearning) db.aiLearning = {};
  if (!db.aiLearning.productChoices) db.aiLearning.productChoices = {};
  validPairs.forEach((pair) => {
    const key = normalizeMatchText(pair.rawName || '');
    const productId = String(pair.productId || '');
    if (!key || !productId || !db.products.some((product) => product.id === productId)) return;
    if (!db.aiLearning.productChoices[key]) db.aiLearning.productChoices[key] = {};
    db.aiLearning.productChoices[key][productId] = Number(db.aiLearning.productChoices[key][productId] || 0) + 1;
  });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml",
    }[ext] || "application/octet-stream";
    res.writeHead(200, { "content-type": contentType });
    res.end(data);
  });
}

async function handleApi(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (method === "POST" && url.pathname === "/api/login") {
    const { phone, password } = await readBody(req);
    const db = readDb();
    const user = db.users.find((item) => item.phone === phone);
    if (!user || user.password !== password) return sendError(res, 401, "手机号或密码错误");
    if (user.status !== "启用") return sendError(res, 403, "账号已停用");
    const token = crypto.randomBytes(24).toString("hex");
    sessions.set(token, user.id);
    db.loginLogs.unshift({ id: newId(), userId: user.id, phone: user.phone, createdAt: new Date().toISOString() });
    writeDb(db);
    res.setHeader("set-cookie", `sid=${token}; Path=/; HttpOnly; SameSite=Lax`);
    return sendJson(res, 200, { token, user: sanitizeUser(user) });
  }

  if (method === "POST" && url.pathname === "/api/logout") {
    sessions.delete(getToken(req));
    res.setHeader("set-cookie", "sid=; Path=/; Max-Age=0");
    return sendJson(res, 200, { ok: true });
  }

  if (method === "GET" && url.pathname === "/api/me") {
    const user = requireUser(req, res);
    if (!user) return;
    return sendJson(res, 200, { user: sanitizeUser(user) });
  }

  if (method === "GET" && url.pathname === "/api/bootstrap") {
    const user = requireUser(req, res);
    if (!user) return;
    const db = readDb();
    return sendJson(res, 200, {
      user: sanitizeUser(user),
      users: db.users.map(sanitizeUser),
      customers: db.customers,
      products: db.products,
      orders: db.orders.filter((order) => !order.deletedAt && (user.role !== "销售人员" || order.salesUserId === user.id)).map(publicOrder),
    });
  }

  if (url.pathname === "/api/users") {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const db = readDb();
    if (method === "GET") return sendJson(res, 200, { users: db.users.map(sanitizeUser) });
    if (method === "POST") {
      const payload = await readBody(req);
      if (!payload.name || !payload.phone || !payload.password) return sendError(res, 400, "姓名、手机号和密码必填");
      if (db.users.some((user) => user.phone === payload.phone)) return sendError(res, 409, "手机号已存在");
      const user = {
        id: newId(),
        name: payload.name,
        phone: payload.phone,
        password: payload.password,
        role: payload.role || "销售人员",
        status: payload.status || "启用",
      };
      db.users.unshift(user);
      writeDb(db);
      return sendJson(res, 201, { user: sanitizeUser(user) });
    }
  }

  if (url.pathname.startsWith("/api/users/")) {
    const admin = requireAdmin(req, res);
    if (!admin) return;
    const id = url.pathname.split("/").pop();
    const db = readDb();
    const user = db.users.find((item) => item.id === id);
    if (!user) return sendError(res, 404, "人员不存在");
    if (method === "PUT") {
      if (!requireAdmin(req, res)) return;
      const payload = await readBody(req);
      if (payload.phone && db.users.some((item) => item.phone === payload.phone && item.id !== id)) {
        return sendError(res, 409, "手机号已存在");
      }
      ["name", "phone", "password", "role", "status"].forEach((key) => {
        if (payload[key] !== undefined) user[key] = payload[key];
      });
      writeDb(db);
      return sendJson(res, 200, { user: sanitizeUser(user) });
    }
  }

  if (url.pathname === "/api/products") {
    const user = requireUser(req, res);
    if (!user) return;
    const db = readDb();
    if (method === "GET") return sendJson(res, 200, { products: db.products.map(publicProduct) });
    if (method === "POST") {
      if (!requireAdmin(req, res)) return;
      const payload = await readBody(req);
      if (!payload.name) return sendError(res, 400, "商品名称必填");
      const product = normalizeProductPayload(payload);
      if (db.products.some((item) => item.id === product.id)) product.id = newId();
      db.products.unshift(product);
      writeDb(db);
      return sendJson(res, 201, { product: publicProduct(product) });
    }
  }

  if (url.pathname.startsWith("/api/products/")) {
    const user = requireUser(req, res);
    if (!user) return;
    const id = decodeURIComponent(url.pathname.split("/").pop());
    const db = readDb();
    const productIndex = db.products.findIndex((item) => item.id === id);
    const product = db.products[productIndex];
    if (!product) return sendError(res, 404, "商品不存在");
    if (method === "PUT") {
      if (!requireAdmin(req, res)) return;
      const payload = await readBody(req);
      const updated = normalizeProductPayload(payload, product);
      Object.assign(product, updated);
      writeDb(db);
      return sendJson(res, 200, { product: publicProduct(product) });
    }
    if (method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      db.products.splice(productIndex, 1);
      writeDb(db);
      return sendJson(res, 200, { id: product.id, deleted: true });
    }
  }

  if (method === "POST" && url.pathname === "/api/ai/order-draft") {
    const user = requireUser(req, res);
    if (!user) return;
    const payload = await readBody(req);
    const groups = Array.isArray(payload.groups) ? payload.groups.slice(0, 8) : [{ id: 'group-1', cat1: '', cat2: '', content: payload.content }];
    if (!groups.some((group) => String((group && group.cat1) || '').trim() && String((group && group.content) || '').trim())) {
      return sendError(res, 400, "请为材料窗口选择一级分类并输入订单内容");
    }
    const db = readDb();
    try {
      const draft = await buildAiOrderDraft(db, groups);
      return sendJson(res, 200, draft);
    } catch (error) {
      return sendError(res, 502, error.message || "AI 开单识别失败");
    }
  }

  if (url.pathname === "/api/orders") {
    const user = requireUser(req, res);
    if (!user) return;
    const db = readDb();
    if (method === "GET") {
      return sendJson(res, 200, { orders: db.orders.filter((order) => !order.deletedAt && (user.role !== "销售人员" || order.salesUserId === user.id)).map(publicOrder) });
    }
    if (method === "POST") {
      const payload = await readBody(req);
      if (invalidOrderProductIds(payload.items, db.products).length) {
        return sendError(res, 400, "订单包含产品库中不存在的商品，请重新选择");
      }
      const order = {
        id: newId(),
        type: payload.type === "return" ? "return" : "sale",
        no: `${payload.type === "return" ? "TH" : "ORD"}${Date.now()}`,
        customerId: payload.customerId,
        salesUserId: user.role === "销售人员" ? user.id : payload.salesUserId || user.id,
        date: payload.date || new Date().toLocaleDateString("zh-CN"),
        address: payload.address || "",
        remark: payload.remark || "",
        status: payload.type === "return" ? "已退货" : "待确认",
        payStatus: normalizePayStatus(payload.payStatus),
        items: orderItemsFromPayload(payload.items, db.products),
      };
      if (order.type === "return") order.items = normalizeReturnItems(order.items);
      order.amount = orderAmount(order.items);
      db.orders.unshift(order);
      recordAiLearning(db, payload.aiLearnPairs);
      writeDb(db);
      return sendJson(res, 201, { order: publicOrder(order) });
    }
  }

  if (url.pathname === "/api/orders-legacy-disabled") {
    const user = requireUser(req, res);
    if (!user) return;
    const db = readDb();
    if (method === "GET") {
      return sendJson(res, 200, { orders: db.orders });
    }
    if (method === "POST") {
      const payload = await readBody(req);
      const order = {
        id: newId(),
        no: `${payload.type === "return" ? "TH" : "ORD"}${Date.now()}`,
        customerId: payload.customerId,
        salesUserId: payload.salesUserId || user.id,
        date: new Date().toLocaleDateString("zh-CN"),
        status: payload.type === "return" ? "已退货" : "待确认",
        payStatus: "未回款",
        amount: Number(payload.amount || 0),
        items: payload.items || [],
      };
      db.orders.unshift(order);
      recordAiLearning(db, payload.aiLearnPairs);
      writeDb(db);
      return sendJson(res, 201, { order });
    }
  }

  if (url.pathname.startsWith("/api/orders/")) {
    const user = requireUser(req, res);
    if (!user) return;
    const id = decodeURIComponent(url.pathname.split("/").pop());
    const db = readDb();
    const order = db.orders.find((item) => item.id === id);
    if (!order) return sendError(res, 404, "订单不存在");
    if (order.deletedAt) return sendError(res, 404, "订单已删除");
    if (method === "DELETE") {
      if (!["超级管理员", "管理员"].includes(user.role)) return sendError(res, 403, "只有管理员可以删除订单");
      order.deletedAt = new Date().toISOString();
      order.deletedBy = user.id;
      writeDb(db);
      return sendJson(res, 200, { id: order.id, deleted: true });
    }
    if (user.role === "销售人员" && order.salesUserId !== user.id) {
      return sendError(res, 403, "无权修改该订单");
    }
    if (method === "PUT" || method === "PATCH") {
      const payload = await readBody(req);
      if (payload.customerId !== undefined) order.customerId = payload.customerId;
      if (payload.salesUserId !== undefined && user.role !== "销售人员") order.salesUserId = payload.salesUserId;
      if (payload.date !== undefined) order.date = payload.date;
      if (payload.address !== undefined) order.address = payload.address;
      if (payload.remark !== undefined) order.remark = payload.remark;
      if (payload.status !== undefined && ORDER_STATUS_OPTIONS.has(payload.status)) order.status = payload.status;
      if (payload.payStatus !== undefined) order.payStatus = normalizePayStatus(payload.payStatus);
      if (payload.items !== undefined) {
        order.items = orderItemsFromPayload(payload.items, db.products);
        if (order.type === "return" || String(order.no || "").startsWith("TH")) order.items = normalizeReturnItems(order.items);
      }
      if (payload.items !== undefined) {
        order.amount = orderAmount(order.items);
      } else if (payload.amount !== undefined) {
        order.amount = Number(payload.amount || 0);
      }
      writeDb(db);
      return sendJson(res, 200, { order: publicOrder(order) });
    }
  }

  sendError(res, 404, "接口不存在");
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/api/")) {
    handleApi(req, res).catch((error) => sendError(res, 500, error.message || "服务器错误"));
    return;
  }
  serveStatic(req, res);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Building sales system running at http://localhost:${PORT}`);
  });
}

module.exports = server;
module.exports.matchProductCandidates = matchProductCandidates;
