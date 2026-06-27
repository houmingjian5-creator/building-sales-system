const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const DATA_DIR = path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "db.json");
const PORT = Number(process.env.PORT || 3000);

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
