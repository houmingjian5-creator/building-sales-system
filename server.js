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
    .replace(/[????,.]/g, '')
    .replace(/[??]/g, (char) => (char === '?' ? '(' : ')'));
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
    [/\u6728\u9f99\u9aa8|\u6728\u65b9/, ['\u6728\u9f99\u9aa8', '\u6728\u65b9']],
    [/\u77f3\u818f\u677f/, ['\u77f3\u818f\u677f']],
    [/\u94a2\u9489/, ['\u94a2\u9489', '38\u94a2\u9489']],
    [/\u76f4\u9489/, ['\u76f4\u9489']],
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

function candidateFor(product) {
  return { productId: product.id, name: product.name, spec: product.spec, unit: product.unit, price: product.price };
}

function requestedBrandTerms(products, needle) {
  const terms = [];
  products.forEach((product) => {
    [product.brand, product.cat2].forEach((value) => {
      const term = normalizeText(value);
      if (term && term.length >= 2 && needle.includes(term)) terms.push(term);
    });
  });
  return [...new Set(terms)];
}

function productHasBrandTerm(product, brandTerms) {
  if (!brandTerms.length) return true;
  const haystack = normalizeText([product.brand, product.cat2, product.name, ...(product.aliases || [])].join(' '));
  return brandTerms.some((term) => haystack.includes(term));
}

function textTokens(value) {
  const genericTerms = ['\u666e\u901a', '\u5e38\u89c4', '\u9ed8\u8ba4'];
  return (String(value || '').toLowerCase().match(/[\u4e00-\u9fa5]+|[a-z0-9.]+/g) || [])
    .map((token) => normalizeText(token))
    .filter((token) => token && token.length >= 2 && !genericTerms.includes(token));
}

function matchProductCandidates(products, rawName) {
  const needle = normalizeText(rawName);
  if (!needle) return [];
  const brandTerms = requestedBrandTerms(products, needle);
  const queryTokens = textTokens(rawName);
  const scored = products
    .filter((product) => product.status !== '\u505c\u7528')
    .map((product) => {
      const aliases = productAliases(product);
      const name = normalizeText(product.name);
      const spec = normalizeText(product.spec);
      const brand = normalizeText(product.brand);
      const cat2 = normalizeText(product.cat2);
      const searchable = normalizeText([product.name, product.spec, product.brand, product.cat1, product.cat2, ...aliases].join(' '));
      let score = 0;

      if (brandTerms.length && !productHasBrandTerm(product, brandTerms)) score -= 120;
      if (brand && needle.includes(brand)) score += 80;
      if (cat2 && needle.includes(cat2)) score += 140;
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
        const term = normalizeText(alias);
        if (!term) return;
        const numericTerm = /^[0-9.]+$/.test(term);
        const genericTerm = ['\u666e\u901a', '\u5e38\u89c4', '\u9ed8\u8ba4'].includes(term);
        if (term === needle) score += 120;
        else if (needle.includes(term)) score += numericTerm || genericTerm ? 8 : (term.length >= 2 ? 70 : 10);
        else if (term.includes(needle)) score += numericTerm ? 5 : (term.length >= 2 ? 25 : 8);
      });
      queryTokens.forEach((token) => {
        if (searchable.includes(token)) score += /^[0-9.]+$/.test(token) ? 18 : 30;
      });
      if (searchable.includes(needle)) score += 50;
      return { product, score };
    })
    .filter((item) => item.score >= 55)
    .sort((a, b) => b.score - a.score || (String(a.product.name || '') + String(a.product.spec || '')).localeCompare(String(b.product.name || '') + String(b.product.spec || ''), 'zh-CN'));
  return scored.slice(0, 6);
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

function validateAiDraft(db, aiResult) {
  const lines = Array.isArray(aiResult.items) ? aiResult.items : [];
  const matched = [];
  const needsQuantity = [];
  const uncertain = [];
  const unmatched = [];

  lines.forEach((line) => {
    const rawName = String(line.rawName || line.name || '').trim();
    const quantity = Number(line.quantity);
    const matches = matchProductCandidates(db.products, rawName);
    const product = matches[0] && matches[0].score >= 100 && (!matches[1] || matches[0].score - matches[1].score >= 25) ? matches[0].product : null;
    const candidateProducts = matches.map((item) => candidateFor(item.product));

    if (!product) {
      if (candidateProducts.length) {
        uncertain.push({ rawName, quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null, candidates: candidateProducts });
        return;
      }
      unmatched.push({ rawName, note: line.note || '\u5546\u54c1\u5e93\u4e2d\u672a\u627e\u5230\u5339\u914d\u5546\u54c1' });
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      needsQuantity.push({ rawName, productId: product.id, name: product.name, spec: product.spec, unit: product.unit, price: product.price });
      return;
    }

    matched.push({
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

async function buildAiOrderDraft(db, content) {
  const messages = [
    {
      role: 'system',
      content: '\u4f60\u662f\u5efa\u6750\u9500\u552e\u7cfb\u7edf\u7684\u5f00\u5355\u8bc6\u522b\u52a9\u624b\u3002\u4f60\u53ea\u8d1f\u8d23\u4ece\u9500\u552e\u53e3\u8bed\u6587\u672c\u4e2d\u62c6\u51fa\u5546\u54c1\u53eb\u6cd5\u548c\u6570\u91cf\uff0c\u4e0d\u8981\u5339\u914d\u5546\u54c1\u5e93\uff0c\u4e0d\u8981\u521b\u9020\u4ef7\u683c\u3002\u6570\u91cf\u4e0d\u660e\u786e\u65f6 quantity=null\u3002\u53ea\u8fd4\u56de JSON\u3002',
    },
    {
      role: 'user',
      content: JSON.stringify({
        task: '\u4ece orderText \u4e2d\u8bc6\u522b\u5546\u54c1\u53eb\u6cd5\u548c\u6570\u91cf\u3002',
        outputSchema: {
          items: [
            {
              rawName: '\u9500\u552e\u539f\u6587\u4e2d\u7684\u5546\u54c1\u53eb\u6cd5',
              quantity: '\u6570\u5b57\uff0c\u65e0\u6cd5\u786e\u5b9a\u5219 null',
              note: '\u53ef\u9009',
            },
          ],
        },
        rules: [
          '\u4e0d\u8981\u628a\u5ba2\u6237\u540d\u3001\u5730\u5740\u3001\u9001\u8d27\u65f6\u95f4\u8bc6\u522b\u4e3a\u5546\u54c1',
          '\u4e00\u5c0f\u6876\u3001\u4e00\u5927\u6876\u3001\u4e00\u888b\u3001\u4e00\u76d2\u3001\u4e00\u6839\u3001\u4e00\u5f20\u7b49\u53ef\u4ee5\u7406\u89e3\u4e3a\u6570\u91cf 1',
          '\u9519\u522b\u5b57\u53ef\u4ee5\u6309\u53e3\u8bed\u7406\u89e3\uff0c\u4f8b\u5982\u7f57\u6bcd=\u87ba\u6bcd\u3001\u7f57\u4e1d=\u87ba\u4e1d\u3001\u4ed8\u9aa8=\u526f\u9aa8',
        ],
        orderText: content,
      }),
    },
  ];
  const text = await callDeepSeek(messages);
  return validateAiDraft(db, parseJsonFromText(text));
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
      orders: db.orders,
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
    const product = db.products.find((item) => item.id === id);
    if (!product) return sendError(res, 404, "商品不存在");
    if (method === "PUT") {
      const payload = await readBody(req);
      const updated = normalizeProductPayload(payload, product);
      Object.assign(product, updated);
      writeDb(db);
      return sendJson(res, 200, { product: publicProduct(product) });
    }
  }

  if (method === "POST" && url.pathname === "/api/ai/order-draft") {
    const user = requireUser(req, res);
    if (!user) return;
    const { content } = await readBody(req);
    if (!String(content || "").trim()) return sendError(res, 400, "请先输入需要识别的订单内容");
    const db = readDb();
    try {
      const draft = await buildAiOrderDraft(db, String(content).slice(0, 2000));
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
      writeDb(db);
      return sendJson(res, 201, { order });
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
