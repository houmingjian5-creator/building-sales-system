"use strict";

const DAY = 24 * 60 * 60 * 1000;
const VALID_ORDER_STATUSES = ["已确认", "已发货", "已完成"];

function timestamp(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value.getTime();
  const text = String(value).trim();
  const mysql = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (mysql) return Date.UTC(Number(mysql[1]), Number(mysql[2]) - 1, Number(mysql[3]), Number(mysql[4]), Number(mysql[5]), Number(mysql[6] || 0));
  const parsed = new Date(text).getTime();
  return Number.isNaN(parsed) ? null : parsed;
}

function beijingDay(value, dateOnly) {
  if (!value) return null;
  const match = String(value).match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (dateOnly && match) return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / DAY);
  const time = timestamp(value);
  if (time === null) return null;
  const shifted = new Date(time + 8 * 60 * 60 * 1000);
  return Math.floor(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()) / DAY);
}

function validOrder(order) {
  return Boolean(order && !order.deletedAt && order.type !== "return" && String(order.no || "").indexOf("TH") !== 0 && VALID_ORDER_STATUSES.indexOf(order.status) >= 0 && beijingDay(order.date, true) !== null);
}

function classify(input) {
  const resource = input.resource || {};
  const nowTime = timestamp(input.now || new Date());
  const today = beijingDay(new Date(nowTime));
  const scheduled = timestamp(resource.next_followup_at || resource.nextFollowupAt);
  if (scheduled !== null && scheduled > nowTime) return null;

  const followups = (input.followups || []).map(function (item) {
    return { value: item.created_at || item.createdAt || item, time: timestamp(item.created_at || item.createdAt || item), day: beijingDay(item.created_at || item.createdAt || item) };
  }).filter(function (item) { return item.time !== null; }).sort(function (a, b) { return a.time - b.time; });
  const orders = (input.orders || []).filter(validOrder).map(function (order) {
    return { order: order, day: beijingDay(order.date, true) };
  }).sort(function (a, b) { return a.day - b.day; });
  const due = scheduled !== null && scheduled <= nowTime;
  const latestFollow = followups.length ? followups[followups.length - 1] : null;
  const base = {
    lastOrderAt: orders.length ? orders[orders.length - 1].order.date : null,
    lastFollowupAt: latestFollow ? latestFollow.value : null,
    privateEnteredAt: input.enteredAt || resource.created_at || resource.createdAt || null,
    scheduledAt: resource.next_followup_at || resource.nextFollowupAt || null,
    staleDays: 0
  };

  if (orders.length) {
    const lastOrder = orders[orders.length - 1];
    const orderAge = Math.max(0, today - lastOrder.day);
    const afterOrder = followups.filter(function (item) { return item.day >= lastOrder.day; });
    if (!afterOrder.length) {
      if (orderAge >= 20) return Object.assign(base, { tier: "priority", staleDays: orderAge, reason: "最近有效订单距今" + orderAge + "天，订单后尚未跟进" });
      if (orderAge >= 10) return Object.assign(base, { tier: "medium", staleDays: orderAge, reason: "最近有效订单距今" + orderAge + "天，订单后尚未跟进" });
      if (due) return Object.assign(base, { tier: "medium", staleDays: orderAge, reason: "已到手工设置的跟进时间" });
      return null;
    }
    const latest = afterOrder[afterOrder.length - 1];
    const sinceFollow = Math.max(0, today - latest.day);
    if (afterOrder.length === 1 && latest.day - lastOrder.day >= 20) return Object.assign(base, { tier: "medium", staleDays: sinceFollow, reason: "重点客户已完成首次跟进，等待继续维护" });
    if (sinceFollow >= 20) return Object.assign(base, { tier: "medium", staleDays: sinceFollow, reason: "最近一次跟进距今" + sinceFollow + "天，且没有更新订单" });
    if (due) return Object.assign(base, { tier: "medium", staleDays: sinceFollow, reason: "已到手工设置的跟进时间" });
    return null;
  }

  const enteredDay = beijingDay(input.enteredAt || resource.created_at || resource.createdAt) || today;
  const afterEntry = followups.filter(function (item) { return item.day >= enteredDay; });
  if (!afterEntry.length) return Object.assign(base, { tier: "pending", staleDays: Math.max(0, today - enteredDay), reason: input.customer ? "正式客户暂无有效订单，进入私海后尚未跟进" : "新进入私海，进入后尚未跟进" });
  const sinceFollow = Math.max(0, today - afterEntry[afterEntry.length - 1].day);
  if (sinceFollow >= 20) return Object.assign(base, { tier: "pending", staleDays: sinceFollow, reason: "无有效订单，最近一次跟进距今" + sinceFollow + "天" });
  if (due) return Object.assign(base, { tier: "pending", staleDays: sinceFollow, reason: "已到手工设置的跟进时间" });
  return null;
}

function compare(a, b, sort) {
  const mode = sort || "created_desc";
  const createdA = timestamp(a.createdAt || a.created_at) || 0, createdB = timestamp(b.createdAt || b.created_at) || 0;
  const enteredA = timestamp(a.seaEnteredAt || a.privateEnteredAt || a.createdAt || a.created_at) || 0;
  const enteredB = timestamp(b.seaEnteredAt || b.privateEnteredAt || b.createdAt || b.created_at) || 0;
  const followedA = timestamp(a.lastFollowupAt || a.last_followup_at), followedB = timestamp(b.lastFollowupAt || b.last_followup_at);
  let value = 0;
  if (mode === "sea_desc" || mode === "sea_asc") {
    if (enteredA !== enteredB) value = mode === "sea_desc" ? enteredB - enteredA : enteredA - enteredB;
  } else if (mode === "followed_desc" || mode === "followed_asc") {
    if (followedA === null && followedB !== null) return 1;
    if (followedA !== null && followedB === null) return -1;
    if (followedA !== followedB) value = mode === "followed_desc" ? followedB - followedA : followedA - followedB;
  } else if (mode === "count_desc" || mode === "count_asc") {
    value = mode === "count_desc" ? Number(b.followupCount || 0) - Number(a.followupCount || 0) : Number(a.followupCount || 0) - Number(b.followupCount || 0);
  } else if (createdA !== createdB) value = mode === "created_asc" ? createdA - createdB : createdB - createdA;
  if (value) return value;
  if (createdA !== createdB) return createdB - createdA;
  return mode === "created_asc" ? String(a.id).localeCompare(String(b.id)) : String(b.id).localeCompare(String(a.id));
}

function page(items, requested, size) {
  const pageSize = size || 20;
  const total = items.length;
  const last = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.max(1, Math.min(last, parseInt(requested, 10) || 1));
  return { total: total, page: current, pageSize: pageSize, items: items.slice((current - 1) * pageSize, current * pageSize) };
}

function shortReason(reason) {
  const value = String(reason || "");
  let match = value.match(/^最近有效订单距今(\d+)天，订单后尚未跟进$/);
  if (match) return "订单后" + match[1] + "天未跟进";
  match = value.match(/^最近一次跟进距今(\d+)天，且没有更新订单$/);
  if (match) return "跟进后" + match[1] + "天未下单";
  match = value.match(/^无有效订单，最近一次跟进距今(\d+)天$/);
  if (match) return "已" + match[1] + "天未跟进";
  if (value.indexOf("重点客户已完成首次跟进") === 0) return "重点客户已首次跟进";
  if (value.indexOf("新进入私海") === 0) return "新进入私海";
  if (value.indexOf("正式客户暂无有效订单") === 0) return "无订单且尚未跟进";
  if (value === "已到手工设置的跟进时间") return "预约跟进已到期";
  return value.length > 16 ? value.slice(0, 16) + "…" : value;
}

module.exports = { VALID_ORDER_STATUSES, timestamp, beijingDay, validOrder, classify, compare, page, shortReason };
