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
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[（）]/g, (char) => (char === "（" ? "(" : ")"));
}

function productAliases(product) {
  const terms = [product.name, product.spec, product.brand, product.cat1, product.cat2];
  const text = `${product.name} ${product.spec}`.toLowerCase();
  const rules = [
    [/石膏|螺丝|罗丝/, ["石膏罗丝", "石膏螺丝", "石膏丝"]],
    [/螺母|罗母/, ["罗母", "螺母"]],
    [/副骨|付骨|辅骨/, ["付骨", "副骨", "辅骨"]],
    [/主骨/, ["主骨", "主龙骨"]],
    [/木龙骨/, ["木龙骨", "木方"]],
    [/石膏板/, ["石膏板"]],
    [/钢钉/, ["钢钉", "38钢钉"]],
    [/直钉/, ["直钉"]],
    [/白乳胶/, ["白乳胶"]],
    [/水泥/, ["水泥"]],
    [/搬运/, ["搬运费", "搬运"]],
    [/运费/, ["运费", "送货费"]],
  ];
  rules.forEach(([pattern, aliases]) => {
    if (pattern.test(text)) terms.push(...aliases);
  });
  return [...new Set(terms.filter(Boolean))];
}

function catalogForAi(products) {
  return products.map((product) => ({
    id: product.id,
    name: product.name,
    spec: product.spec,
    unit: product.unit,
    price: product.price,
    category: product.cat2 || product.cat1 || "",
    aliases: productAliases(product),
  }));
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
    const rawName = String(line.rawName || line.name || "").trim();
    const quantity = Number(line.quantity);
    const candidates = Array.isArray(line.candidates) ? line.candidates : [];
    const product = db.products.find((item) => item.id === line.productId);
    const candidateIds = [...new Set([line.productId, ...candidates.map((item) => item.productId || item.id)].filter(Boolean))];
    const candidateProducts = candidateIds
      .map((id) => db.products.find((item) => item.id === id))
      .filter(Boolean)
      .map((item) => ({ productId: item.id, name: item.name, spec: item.spec, unit: item.unit, price: item.price }));

    if (!product) {
      if (candidateProducts.length) {
        uncertain.push({ rawName, quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null, candidates: candidateProducts });
        return;
      }
      unmatched.push({ rawName, note: line.note || "商品库中未确认匹配商品" });
      return;
    }

    if (candidateProducts.length > 1 || line.confidence === "low") {
      uncertain.push({ rawName, quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : null, candidates: candidateProducts });
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
  const catalog = catalogForAi(db.products);
  const messages = [
    {
      role: "system",
      content:
        "你是建材销售系统的开单识别助手。你只能把用户输入的口语化材料清单匹配到给定商品库中的商品，不能创造商品、不能改价格、不能输出商品库外商品。数量不明确则 quantity=null。商品不确定时给 candidates。只返回 JSON。",
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "从 orderText 中识别商品和数量，并匹配 catalog 商品 id。",
        outputSchema: {
          items: [
            {
              rawName: "销售原文中的商品叫法",
              productId: "确定匹配时填写商品 id，否则 null",
              quantity: "数字，无法确定则 null",
              confidence: "high 或 low",
              candidates: [{ productId: "候选商品 id" }],
              note: "可选",
            },
          ],
        },
        rules: [
          "商品必须来自 catalog",
          "最终开单名称、单位、价格由系统商品库决定",
          "一小桶、一大桶、一袋等口语单位只用于理解数量，最终单位用商品库单位",
          "错别字可以理解，例如罗母=螺母、罗丝=螺丝、付骨=副骨，但不确定要给候选",
        ],
        catalog,
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
