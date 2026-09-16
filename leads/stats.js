"use strict";

const Tasks = require("./tasks");
const DAY = 24 * 60 * 60 * 1000;

function value(params, key) {
  return params && typeof params.get === "function" ? params.get(key) : params && params[key];
}

function dateKey(year, month, day) {
  return String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-" + String(day).padStart(2, "0");
}

function parseDateKey(input) {
  const match = String(input || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null;
  return { year, month, day, key: dateKey(year, month, day), utcDay: Date.UTC(year, month - 1, day) };
}

function beijingDateKey(input) {
  const parsed = new Date(input == null ? Date.now() : input);
  if (Number.isNaN(parsed.getTime())) return null;
  const shifted = new Date(parsed.getTime() + 8 * 60 * 60 * 1000);
  return dateKey(shifted.getUTCFullYear(), shifted.getUTCMonth() + 1, shifted.getUTCDate());
}

function addDays(key, days) {
  const parsed = parseDateKey(key);
  if (!parsed) return null;
  const next = new Date(parsed.utcDay + Number(days || 0) * DAY);
  return dateKey(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate());
}

function mysqlUtc(key) {
  const parsed = parseDateKey(key);
  if (!parsed) return null;
  return new Date(parsed.utcDay - 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
}

function period(params, now) {
  const today = beijingDateKey(now), mode = String(value(params, "period") || "today");
  let from = today, to = today;
  if (mode === "week") from = addDays(today, -6);
  else if (mode === "month") from = today.slice(0, 8) + "01";
  else if (mode === "custom") {
    from = String(value(params, "from") || "");
    to = String(value(params, "to") || "");
    if (!parseDateKey(from) || !parseDateKey(to)) throw new Error("请选择有效的自定义日期范围");
  } else if (mode !== "today") throw new Error("请选择有效的统计时间范围");
  if (from > to) throw new Error("开始日期不能晚于结束日期");
  const span = (parseDateKey(to).utcDay - parseDateKey(from).utcDay) / DAY;
  if (span > 366) throw new Error("统计时间范围不能超过367天");
  return {
    mode, from, to,
    start: mysqlUtc(from),
    end: mysqlUtc(addDays(to, 1)),
    attributionStart: mysqlUtc(addDays(from, -7))
  };
}

function orderTimestamp(order) {
  const created = Date.parse(String(order && order.createdAt || ""));
  if (Number.isFinite(created)) return created;
  const number = String(order && order.no || "").match(/^ORD(\d{13})$/);
  if (number) {
    const embedded = Number(number[1]);
    if (embedded >= Date.UTC(2000, 0, 1) && embedded < Date.UTC(2100, 0, 1)) return embedded;
  }
  const match = String(order && order.date || "").match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  const parsed = match && parseDateKey(dateKey(Number(match[1]), Number(match[2]), Number(match[3])));
  return parsed ? parsed.utcDay - 8 * 60 * 60 * 1000 : null;
}

function attributeOrders(input) {
  const resources = input.resources || [], followups = input.followups || [], data = input.data || { customers: [], orders: [] };
  const start = Date.parse(input.period.start.replace(" ", "T") + "Z"), end = Date.parse(input.period.end.replace(" ", "T") + "Z");
  const byCustomer = new Map(resources.filter(r => r.customer_id).map(r => [r.customer_id, r.id]));
  const byLead = new Map();
  followups.forEach(f => {
    const time = Tasks.timestamp(f.created_at || f.createdAt);
    if (time === null) return;
    const list = byLead.get(f.lead_id) || [];
    list.push({ actorId: f.actor_id, time }); byLead.set(f.lead_id, list);
  });
  byLead.forEach(list => list.sort((a, b) => a.time - b.time));
  const result = { count: 0, amount: 0, byActor: {} };
  (data.orders || []).forEach(order => {
    if (!Tasks.validOrder(order)) return;
    const orderTime = orderTimestamp(order);
    if (orderTime === null || orderTime < start || orderTime >= end) return;
    let customer = (data.customers || []).find(c => c.id === order.customerId);
    if (!customer && input.customerOrderMatchesCustomer) customer = (data.customers || []).find(c => input.customerOrderMatchesCustomer(data, order, c));
    const leadId = customer && byCustomer.get(customer.id);
    if (!leadId) return;
    const candidates = (byLead.get(leadId) || []).filter(f => f.time <= orderTime && f.time >= orderTime - 7 * DAY);
    if (!candidates.length) return;
    const actorId = candidates[candidates.length - 1].actorId;
    if (input.ownerId && actorId !== input.ownerId) return;
    result.count++;
    result.amount += Number(input.effectiveOrderAmount ? input.effectiveOrderAmount(order) : order.amount || 0);
    result.byActor[actorId] = (result.byActor[actorId] || 0) + 1;
  });
  result.amount = Math.round(result.amount * 100) / 100;
  return result;
}

function lastSevenDays(now) {
  const today = beijingDateKey(now);
  return Array.from({ length: 7 }, (_, index) => addDays(today, index - 6));
}

module.exports = { DAY, parseDateKey, beijingDateKey, addDays, mysqlUtc, period, orderTimestamp, attributeOrders, lastSevenDays };
