"use strict";
const crypto = require("crypto");
const LIMIT = 500;
const INTENTS = ["unknown", "low", "medium", "high", "invalid"];
const RESULTS = ["connected", "no_answer", "busy", "invalid", "do_not_call", "other"];
const TAGS = ["装修公司负责人/工长", "工人", "业主", "其他"];
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
function admin(user) { return Boolean(user && ["管理员", "超级管理员"].indexOf(user.role) >= 0); }
function allowed(user) { return admin(user) || Boolean(user && user.role === "销售人员"); }
function blocked(value) { return value === true || Number(value) === 1; }
function tag(value, normalizeUnknown) {
  const result = text(value, 80);
  if (!result || TAGS.indexOf(result) >= 0) return result;
  if (normalizeUnknown) return "其他";
  fail(400, "请选择有效的资源标签");
}
function own(user, lead) { if (!admin(user) && lead.owner_id !== user.id) fail(403, "无权访问该私海资源"); }
function text(value, max) {
  const result = String(value == null ? "" : value).trim();
  if (result.length > max) fail(400, "字段内容过长");
  return result;
}
function phone(value, normalize) {
  const raw = text(value, 50);
  if (!/^[+\d\s()（）-]+$/.test(raw)) fail(400, "号码包含无效字符，请检查原始单元格");
  const result = normalize(raw);
  if (!/^1\d{10}$/.test(result) && !/^0\d{9,11}$/.test(result)) fail(400, "请输入有效的国内手机号或带区号座机号");
  return result;
}
function date(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d\d:\d\d)$/.test(String(value))) fail(400, "跟进时间必须包含时区");
  const d = new Date(value);
  if (!Number.isFinite(d.getTime())) fail(400, "跟进时间无效");
  return d;
}
function vault(enc, index) {
  if (!/^[a-f\d]{64}$/i.test(enc || "") || !/^[a-f\d]{64}$/i.test(index || "") || enc === index) fail(503, "外呼号码密钥尚未正确配置");
  const key = Buffer.from(enc, "hex");
  return {
    hash: function (value) { return crypto.createHmac("sha256", Buffer.from(index, "hex")).update(value).digest("hex"); },
    encrypt: function (value) {
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
      const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
      return ["v1", iv.toString("hex"), cipher.getAuthTag().toString("hex"), data.toString("base64")].join(":");
    },
    decrypt: function (value) {
      const parts = value.split(":");
      if (parts.length !== 4 || parts[0] !== "v1") fail(503, "不支持的号码密钥版本");
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(parts[1], "hex"));
      decipher.setAuthTag(Buffer.from(parts[2], "hex"));
      return Buffer.concat([decipher.update(Buffer.from(parts[3], "base64")), decipher.final()]).toString("utf8");
    }
  };
}
function publicLead(row, user, secrets) {
  const full = admin(user) || row.owner_id === user.id;
  // Public-pool free text may itself contain phone numbers. Only categorical fields
  // and a masked display are exposed; never spread a database row into a response.
  const result = { id: row.id, name: full ? row.name : "电话资源", phone: full ? secrets.decrypt(row.phone_cipher) : row.phone_mask,
    source: full ? row.source : safeCategory(row.source), region: full ? row.region : safeCategory(row.region), tags: full ? row.tags : safeCategory(row.tags),
    ownerId: row.owner_id, intent: row.intent, nextFollowupAt: row.next_followup_at,
    createdAt: row.created_at, version: row.version, canContact: full && !blocked(row.blocked) };
  if (full) { result.customerId = row.customer_id; result.contact = row.contact; result.address = row.address; result.consentStatus = row.consent_status; }
  return result;
}
function safeCategory(value) { return /[\d+]/.test(String(value || "")) ? "已隐藏" : String(value || ""); }
module.exports = { LIMIT, INTENTS, RESULTS, TAGS, fail, admin, allowed, blocked, tag, own, text, phone, date, vault, publicLead };
