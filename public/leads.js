/* No phone data is persisted in browser storage. */
let leadsState, leadStatsRefreshTimer;
function resetLeads() { if (leadStatsRefreshTimer) clearTimeout(leadStatsRefreshTimer); leadStatsRefreshTimer = null; leadsState = { tab: "public", page: 1, items: [], tasks: null, taskPages: { priority: 1, medium: 1, pending: 1 }, selected: [], detail: null, editing: false, adding: false, total: 0, error: "", filters: { sort: "created_desc" }, statsFilters: { period: "today", owner: "", from: "", to: "" }, imports: [], batch: null, mapping: null, stats: null, busy: false }; }
resetLeads();
const leadTags = ["装修公司负责人/工长", "工人", "业主", "其他"];
const leadWechatStatuses = ["unknown", "rejected", "agreed_pending", "approved"];
const leadWechatLabels = { unknown: "未判断", rejected: "拒绝", agreed_pending: "同意但未通过", approved: "已通过" };
const leadSorts = [["sea_desc", "入海时间近→远"], ["sea_asc", "入海时间远→近"], ["created_desc", "录入系统时间近→远"], ["created_asc", "录入系统时间远→近"], ["followed_desc", "上次跟进时间近→远"], ["followed_asc", "上次跟进时间远→近"], ["count_desc", "跟进次数多→少"], ["count_asc", "跟进次数少→多"]];
const leadLabels = { invalid: "无效", connected: "有效接通", no_answer: "未接", busy: "占线", do_not_call: "拒绝联系", other: "其他", claim: "领取", return: "退回", assign: "分配", recycle: "回收", manual_create: "手工新增", manual_claim: "手工领取", update_tag: "修改标签", update_wechat_status: "修改微信状态", update_resource: "修改资源资料", convert_customer: "转客户", update_customer: "更新客户", migrate_customer: "历史客户关联", unlink_customer: "解除客户关联", ready: "待导入", success: "成功", duplicate: "重复", raw: "未映射", processing: "处理中", preview: "已预览", mapping: "待映射", done: "完成" };
function leadTime(value) { return value ? new Date(value).toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }) : "未设置"; }
function leadListTime(value, empty) {
  if (!value) return empty || "未设置";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).replace(/\//g, "-");
}
function leadOrderDate(value) { return value ? String(value).replace(/\//g, "-") : "无"; }
function leadMoney(value) { return "¥" + Number(value || 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function leadListPill(value, kind) { return `<span class="lead-list-pill ${kind || ""}">${html(value || "未设置")}</span>`; }
function renderLeadMineList(items) {
  if (!items.length) return '<p class="lead-list-empty">暂无符合条件的资源</p>';
  return `<div class="lead-list-shell"><div class="lead-list lead-list-mine" role="table" aria-label="我的私海资源">
    <div class="lead-list-head" role="row"><span>客户 / 电话</span><span>标签</span><span>微信状态</span><span>最近跟进时间</span><span>最近跟进内容</span><span>跟进次数</span><span>录入时间</span><span>操作</span></div>
    ${items.map(r => `<div class="lead-list-row" role="row"><div class="lead-list-customer"><input type="checkbox" aria-label="选择${html(r.name)}" data-lead-id="${r.id}" ${leadsState.selected.indexOf(r.id) >= 0 ? "checked" : ""} onchange="leadSelect('${r.id}',this.checked)"><span><b>${html(r.name)}</b><small>${html(r.phone)}</small></span></div><div data-label="标签">${leadListPill(r.tags || "未设置", "lead-tag-pill")}</div><div data-label="微信状态"><select class="select lead-wechat-select" aria-label="${html(r.name)}的微信状态" onchange="leadWechatStatusSave(this,'${r.id}')">${leadWechatOptions(r.wechatStatus)}</select></div><div data-label="最近跟进时间">${html(leadListTime(r.lastFollowupAt, "未跟进"))}</div><div class="lead-list-content" data-label="最近跟进内容" title="${html(r.lastFollowupContent || "暂无跟进内容")}">${html(r.lastFollowupContent || "暂无跟进内容")}</div><div data-label="跟进次数">${Number(r.followupCount || 0)} 次</div><div data-label="录入时间">${html(leadListTime(r.createdAt, "未知"))}</div><div data-label="操作"><button class="btn lead-list-action" onclick="leadDetail('${r.id}')">详情 / 跟进</button></div></div>`).join("")}
  </div></div>`;
}
function renderLeadTaskList(items, tier) {
  if (!items.length) return '<p class="lead-list-empty">本等级暂无需要跟进的资源</p>';
  return `<div class="lead-list-shell lead-task-list-shell"><div class="lead-list lead-list-tasks" role="table" aria-label="跟进任务资源">
    <div class="lead-list-head" role="row"><span>客户 / 电话</span><span>入级原因（简写）</span><span>标签</span><span>下单金额</span><span>下单笔数</span><span>最近订单（时间）</span><span>最近跟进时间</span><span>最近跟进内容</span><span>跟进次数</span><span>操作</span></div>
    ${items.map(r => `<div class="lead-list-row lead-list-tier-${tier}" role="row"><div class="lead-list-customer"><input type="checkbox" aria-label="选择${html(r.name)}" data-lead-id="${r.id}" ${leadsState.selected.indexOf(r.id) >= 0 ? "checked" : ""} onchange="leadSelect('${r.id}',this.checked)"><span><b>${html(r.name)}</b><small>${html(r.phone)}</small></span></div><div class="lead-list-reason" data-label="入级原因" title="${html(r.reason)}">${html(r.reasonShort || r.reason)}</div><div data-label="标签">${leadListPill(r.tags || "未设置", "lead-tag-pill")}</div><div class="lead-list-money" data-label="下单金额">${html(leadMoney(r.orderAmount))}</div><div data-label="下单笔数">${Number(r.orderCount || 0)} 笔</div><div data-label="最近订单">${html(leadOrderDate(r.lastOrderAt))}</div><div data-label="最近跟进时间">${html(leadListTime(r.lastFollowupAt, "未跟进"))}</div><div class="lead-list-content" data-label="最近跟进内容" title="${html(r.lastFollowupContent || "暂无跟进内容")}">${html(r.lastFollowupContent || "暂无跟进内容")}</div><div data-label="跟进次数">${Number(r.followupCount || 0)} 次</div><div data-label="操作"><button class="btn lead-list-action" onclick="leadDetail('${r.id}')">详情 / 跟进</button></div></div>`).join("")}
  </div></div>`;
}
async function leadRequest(path, payload, key, method) {
  const actor = state.user && state.user.id;
  const options = payload === undefined ? {} : { method: method || "POST", headers: { "content-type": "application/json", "x-idempotency-key": key || Array.from(crypto.getRandomValues(new Uint8Array(16))).map(v => v.toString(16).padStart(2, "0")).join("") }, body: JSON.stringify(payload), timeoutMs: 60000 };
  const response = await apiFetch("/api/leads/" + path, options);
  const data = await response.json();
  if (!state.user || state.user.id !== actor) throw new Error("登录账号已变化，请重新打开资源页面");
  if (!response.ok) throw new Error(data.error || "操作失败");
  return data;
}
async function leadAction(task) {
  if (leadsState.busy) return;
  leadsState.busy = true;
  try { await task(); } catch (error) { alert(error.message); }
  finally { leadsState.busy = false; if (state.user && state.route === "leads") render(); }
}
async function loadLeads() {
  if (!state.leadsCapability || !state.leadsCapability.enabled) return;
  const owner = state.user.id, tab = leadsState.tab, page = leadsState.page, taskPages = JSON.stringify(leadsState.taskPages), statsFilters = JSON.stringify(leadsState.statsFilters);
  try {
    let data;
    if (!state.leadsCapability.active) data = await leadRequest("setup");
    else if (tab === "imports") data = await leadRequest("imports");
    else if (tab === "stats") data = await leadRequest("stats?" + new URLSearchParams(leadsState.statsFilters).toString());
    else if (tab === "audit") data = await leadRequest("audit?page=" + page);
    else if (tab === "tasks") data = await leadRequest("tasks?" + new URLSearchParams(Object.assign({}, leadsState.filters, { priorityPage: leadsState.taskPages.priority, mediumPage: leadsState.taskPages.medium, pendingPage: leadsState.taskPages.pending })).toString());
    else data = await leadRequest("resources?" + new URLSearchParams(Object.assign({}, leadsState.filters, { scope: tab, page })).toString());
    if (!state.user || state.user.id !== owner || leadsState.tab !== tab || leadsState.page !== page || (tab === "tasks" && JSON.stringify(leadsState.taskPages) !== taskPages) || (tab === "stats" && JSON.stringify(leadsState.statsFilters) !== statsFilters)) return;
    if (!state.leadsCapability.active) leadsState.setup = data;
    else if (tab === "imports") leadsState.imports = data.batches;
    else if (tab === "stats") leadsState.stats = data;
    else if (tab === "audit") leadsState.audits = data.items;
    else if (tab === "tasks") leadsState.tasks = data.groups;
    else { leadsState.items = data.items; leadsState.total = data.total; }
    leadsState.error = "";
  } catch (error) { leadsState.error = error.message; }
  if (state.user && state.route === "leads") { render(); if (tab === "stats") scheduleLeadStatsRefresh(); }
}
function scheduleLeadStatsRefresh() { if (leadStatsRefreshTimer) clearTimeout(leadStatsRefreshTimer); leadStatsRefreshTimer = setTimeout(() => { if (state.user && state.route === "leads" && leadsState.tab === "stats" && !leadsState.busy) loadLeads(); }, 15000); }
function leadTab(tab) { if (leadStatsRefreshTimer) clearTimeout(leadStatsRefreshTimer); leadStatsRefreshTimer = null; leadsState.tab = tab; leadsState.page = 1; leadsState.taskPages = { priority: 1, medium: 1, pending: 1 }; leadsState.selected = []; leadsState.detail = null; leadsState.filters = { sort: "created_desc" }; loadLeads(); }
function leadFilter() {
  ["tag", "wechatStatus", "due", "followed", "sort"].forEach(key => { const el = document.getElementById("lead-filter-" + key); leadsState.filters[key] = el ? el.value : ""; });
  const search = document.getElementById("lead-filter-q"); leadsState.filters.q = search ? search.value.trim() : "";
  ["from", "to"].forEach(key => { const value = document.getElementById("lead-filter-" + key).value; leadsState.filters[key] = value ? new Date(value + (key === "from" ? "T00:00:00+08:00" : "T23:59:59+08:00")).toISOString() : ""; });
  leadsState.page = 1; leadsState.taskPages = { priority: 1, medium: 1, pending: 1 }; leadsState.selected = []; loadLeads();
}
function leadOwnerFilter(value) { leadsState.filters.owner = value; leadsState.page = 1; leadsState.selected = []; loadLeads(); }
function leadSort(value) { leadsState.filters.sort = value; leadsState.page = 1; leadsState.taskPages = { priority: 1, medium: 1, pending: 1 }; leadsState.selected = []; loadLeads(); }
function leadSyncSelectionControls() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("[data-lead-id]").forEach(el => { el.checked = leadsState.selected.indexOf(el.dataset.leadId) >= 0; });
  document.querySelectorAll("[data-lead-page-select]").forEach(el => {
    const ids = (el.dataset.leadPageIds || "").split(",").filter(Boolean), count = ids.filter(id => leadsState.selected.indexOf(id) >= 0).length;
    el.checked = Boolean(ids.length) && count === ids.length; el.indeterminate = count > 0 && count < ids.length;
  });
  document.querySelectorAll(".lead-selected-count").forEach(el => { el.textContent = "已选择 " + leadsState.selected.length + " 条"; });
}
function leadSelect(id, checked) {
  if (checked && leadsState.selected.indexOf(id) < 0 && leadsState.selected.length >= 100) { alert("每次最多选择100条资源，请先取消部分资源"); leadSyncSelectionControls(); return; }
  leadsState.selected = checked ? Array.from(new Set(leadsState.selected.concat(id))) : leadsState.selected.filter(x => x !== id); leadSyncSelectionControls();
}
function leadSelectPage(input) {
  const ids = (input.dataset.leadPageIds || "").split(",").filter(Boolean);
  if (input.checked) {
    const merged = Array.from(new Set(leadsState.selected.concat(ids)));
    if (merged.length > 100) { alert("全选本页后会超过100条，请先取消部分已选资源"); leadSyncSelectionControls(); return; }
    leadsState.selected = merged;
  } else leadsState.selected = leadsState.selected.filter(id => ids.indexOf(id) < 0);
  leadSyncSelectionControls();
}
function leadPage(delta) { leadsState.page = Math.max(1, leadsState.page + delta); loadLeads(); }
function leadTaskPage(tier, delta) { leadsState.taskPages[tier] = Math.max(1, leadsState.taskPages[tier] + delta); loadLeads(); }
function leadJumpValue(inputId, maximum) {
  const input = document.getElementById(inputId), value = Number(input && input.value);
  if (!Number.isInteger(value) || value < 1 || value > maximum) { alert("请输入1至" + maximum + "之间的页码"); return null; }
  return value;
}
function leadPageJump(maximum) { const value = leadJumpValue("lead-page-jump", maximum); if (value !== null) { leadsState.page = value; loadLeads(); } }
function leadTaskPageJump(tier, maximum) { const value = leadJumpValue("lead-task-page-jump-" + tier, maximum); if (value !== null) { leadsState.taskPages[tier] = value; loadLeads(); } }
function leadOptions(keys, selected) { return keys.map(k => `<option value="${k}" ${k === selected ? "selected" : ""}>${leadLabels[k]}</option>`).join(""); }
function leadWechatOptions(selected, includeAll) { return (includeAll ? '<option value="">全部微信状态</option>' : "") + leadWechatStatuses.map(k => `<option value="${k}" ${k === (selected || "unknown") ? "selected" : ""}>${leadWechatLabels[k]}</option>`).join(""); }
function leadTagOptions(selected, allLabel) { return `<option value="">${allLabel || "未设置"}</option>` + leadTags.map(tag => `<option value="${html(tag)}" ${tag === selected ? "selected" : ""}>${html(tag)}</option>`).join(""); }
function leadFilterTagOptions(selected) { return `<option value="">全部标签</option><option value="unset" ${selected === "unset" ? "selected" : ""}>未设置</option>` + leadTags.map(tag => `<option value="${html(tag)}" ${tag === selected ? "selected" : ""}>${html(tag)}</option>`).join(""); }
function leadSortOptions(selected) { return leadSorts.map(item => `<option value="${item[0]}" ${item[0] === (selected || "created_desc") ? "selected" : ""}>${item[1]}</option>`).join(""); }
function renderLeadPageSelection(items, key) {
  const ids = (items || []).map(item => item.id), chosen = ids.filter(id => leadsState.selected.indexOf(id) >= 0).length;
  return `<label class="lead-page-select"><input type="checkbox" data-lead-page-select data-lead-page-ids="${ids.join(",")}" ${ids.length && chosen === ids.length ? "checked" : ""} onchange="leadSelectPage(this)"> 全选本页</label><span class="lead-selected-count">已选择 ${leadsState.selected.length} 条</span>`;
}
function renderLeadPageJump(id, page, total, pageSize, action) {
  const pages = Math.max(1, Math.ceil(Number(total || 0) / Number(pageSize || 20)));
  return `<span class="lead-page-jump"><label for="${id}">跳至</label><input class="input" id="${id}" type="number" min="1" max="${pages}" value="${page}" inputmode="numeric" onkeydown="if(event.key==='Enter'){event.preventDefault();${action}(${pages})}"><span>页</span><button class="btn" onclick="${action}(${pages})">跳转</button></span>`;
}
function renderLeadTaskFilters() {
  const f = leadsState.filters;
  return `<div class="lead-toolbar"><input class="input lead-search" id="lead-filter-q" value="${html(f.q || "")}" placeholder="搜索客户名称或完整电话" maxlength="160" onkeydown="if(event.key==='Enter'){event.preventDefault();leadFilter()}"><select class="select" id="lead-filter-sort" onchange="leadSort(this.value)">${leadSortOptions(f.sort)}</select><select class="select" id="lead-filter-tag">${leadFilterTagOptions(f.tag)}</select><select class="select" id="lead-filter-followed"><option value="">全部跟进记录</option><option value="yes" ${f.followed === "yes" ? "selected" : ""}>有跟进记录</option><option value="no" ${f.followed === "no" ? "selected" : ""}>无跟进记录</option></select><select class="select" id="lead-filter-due"><option value="">全部跟进时间</option><option value="scheduled" ${f.due === "scheduled" ? "selected" : ""}>已设任务</option><option value="overdue" ${f.due === "overdue" ? "selected" : ""}>逾期未跟进</option></select><label>创建起日<input class="input" type="date" id="lead-filter-from" value="${html((f.from || "").slice(0, 10))}"></label><label>创建止日<input class="input" type="date" id="lead-filter-to" value="${html((f.to || "").slice(0, 10))}"></label><button class="btn" onclick="leadFilter()">筛选</button></div>`;
}
const leadTierInfo = {
  priority: { title: "重点跟进客户", color: "橙色", help: "已关联正式客户且有有效订单；最近有效订单已满20天，订单后仍没有跟进。完成一次跟进后会进入中等跟进。" },
  medium: { title: "中等跟进客户", color: "黄色", help: "包括最近有效订单已满10天但不足20天且订单后未跟进的客户；重点客户首次跟进后也会进入本级。再次跟进后暂时隐藏，20天没有新订单或新跟进时重新出现。" },
  pending: { title: "待跟进客户", color: "淡绿色", help: "包括新进入本人私海且进入后从未跟进的普通资源，以及没有有效订单的正式客户。跟进后暂时隐藏，20天未再次跟进时重新出现。" }
};
function renderLeadTaskGroup(tier) {
  const group = leadsState.tasks && leadsState.tasks[tier] || { items: [], total: 0, page: 1, pageSize: 20 }, info = leadTierInfo[tier];
  return `<section class="lead-tier lead-tier-${tier}"><div class="lead-tier-head"><h3><span class="lead-tier-icon" aria-label="${info.color}标识"></span>${info.title}<span class="lead-tier-count">${group.total}条</span></h3><details class="lead-tier-help"><summary>为什么这些客户会进入此等级</summary><p>${info.help}</p><p>手工设置的跟进时间到期时，有有效订单的客户进入中等跟进，无有效订单的资源进入待跟进；未来预约时间未到时不会提前显示。</p></details></div>${renderLeadTaskList(group.items, tier)}<div class="lead-actions"><button class="btn" onclick="leadTaskPage('${tier}',-1)" ${group.page <= 1 ? "disabled" : ""}>上一页</button><span>第${group.page}页，共${group.total}条</span><button class="btn" onclick="leadTaskPage('${tier}',1)" ${group.page * group.pageSize >= group.total ? "disabled" : ""}>下一页</button>${renderLeadPageJump("lead-task-page-jump-" + tier, group.page, group.total, group.pageSize, "leadTaskPageJump.bind(null,'" + tier + "')")}${renderLeadPageSelection(group.items, tier)}</div></section>`;
}
function renderLeadTasks() {
  return `${renderLeadTaskFilters()}<div class="lead-actions"><button class="btn" onclick="leadMove('return')">退回选中资源</button></div><p class="lead-note">系统根据有效订单、进入私海时间、跟进记录和预约时间自动计算；每个等级可展开查看入选规则。</p>${["priority", "medium", "pending"].map(renderLeadTaskGroup).join("")}`;
}
function renderLeads() {
  if (!state.leadsCapability || !state.leadsCapability.enabled) return "<p>没有外呼资源权限</p>";
  setTimeout(leadSyncSelectionControls, 0);
  const tabs = [["public", "公海池"], ["mine", "我的私海"], ["tasks", "跟进任务"]].concat(isAdmin() ? [["all", "全部资源"], ["imports", "资源导入"], ["stats", "外呼数据"], ["audit", "外呼日志"]] : []);
  let body;
  if (!state.leadsCapability.active) {
    const report = leadsState.setup;
    body = `<div class="lead-card"><h3>外呼准备检查</h3><p>当前未激活，不影响旧业务。现有客户只做关联，不修改原客户数据。</p>${report ? `<p>现有客户 ${report.total} 条，待处理问题 ${report.errors.length} 项</p>${report.errors.map(e => `<p>${html(e.customerId || e.ownerId)}：${html(e.reason)}</p>`).join("")}` : ""}<p>数据库建表、迁移和启用步骤请按部署说明执行。</p>${report && !report.errors.length ? '<button class="btn" onclick="leadInitialize()">初始化现有客户关联</button>' : ""}</div>`;
  } else if (leadsState.tab === "imports") body = renderLeadImports();
  else if (leadsState.tab === "stats") body = renderLeadStats();
  else if (leadsState.tab === "audit") body = renderLeadAudit();
  else if (leadsState.tab === "tasks") body = renderLeadTasks();
  else {
    const f = leadsState.filters;
    const ownerOptions = salesUsers.filter(u => ["销售人员", "管理员", "超级管理员"].indexOf(u.role) >= 0 && u.status === "启用").map(u => `<option value="${html(u.id)}" ${f.owner === u.id ? "selected" : ""}>${html(u.name)}</option>`).join("");
    body = `<div class="lead-toolbar">${leadsState.tab === "all" && isAdmin() ? `<select class="select lead-owner-filter" id="lead-filter-owner" onchange="leadOwnerFilter(this.value)"><option value="">全部负责人</option>${ownerOptions}</select>` : ""}<input class="input lead-search" id="lead-filter-q" value="${html(f.q || "")}" placeholder="搜索客户名称或完整电话" maxlength="160" onkeydown="if(event.key==='Enter'){event.preventDefault();leadFilter()}"><select class="select" id="lead-filter-sort" onchange="leadSort(this.value)">${leadSortOptions(f.sort)}</select><select class="select" id="lead-filter-tag">${leadFilterTagOptions(f.tag)}</select><select class="select" id="lead-filter-followed"><option value="">全部跟进记录</option><option value="yes" ${f.followed === "yes" ? "selected" : ""}>有跟进记录</option><option value="no" ${f.followed === "no" ? "selected" : ""}>无跟进记录</option></select>${leadsState.tab === "mine" ? `<select class="select" id="lead-filter-wechatStatus">${leadWechatOptions(f.wechatStatus, true)}</select>` : ""}<select class="select" id="lead-filter-due"><option value="">全部跟进时间</option><option value="scheduled" ${f.due === "scheduled" ? "selected" : ""}>已设任务</option><option value="overdue" ${f.due === "overdue" ? "selected" : ""}>逾期未跟进</option></select><label>创建起日<input class="input" type="date" id="lead-filter-from" value="${html((f.from || "").slice(0, 10))}"></label><label>创建止日<input class="input" type="date" id="lead-filter-to" value="${html((f.to || "").slice(0, 10))}"></label><button class="btn" onclick="leadFilter()">筛选</button></div>
      <div class="lead-actions">${leadsState.tab === "mine" ? '<button class="btn primary" onclick="leadAddOpen()">添加资源</button>' : ""}${leadsState.tab === "public" ? '<button class="btn primary" onclick="leadMove(\'claim\')">领取选中资源</button>' : '<button class="btn" onclick="leadMove(\'return\')">退回选中资源</button>'}${isAdmin() ? `<select class="select" id="lead-assign-owner"><option value="">分配给负责人</option>${ownerOptions}</select><button class="btn" onclick="leadMove('assign')">分配选中</button><button class="btn" onclick="leadMove('recycle')">回收选中</button>` : ""}</div>
      <p class="lead-note">私海上限500条，正式客户计入容量。公海仅显示脱敏信息；正式客户所属在客户管理中由管理员调整。</p>
      ${leadsState.tab === "mine" ? renderLeadMineList(leadsState.items) : `<div class="lead-grid">${leadsState.items.map(r => `<article class="lead-card"><label><input type="checkbox" data-lead-id="${r.id}" ${leadsState.selected.indexOf(r.id) >= 0 ? "checked" : ""} onchange="leadSelect('${r.id}',this.checked)"> ${html(r.name)}</label><p class="lead-phone">${html(r.phone)}</p><p>${html(r.region || "未标注地区")}</p><p>标签：${html(r.tags || "未设置")}</p><p>下次跟进：${html(leadTime(r.nextFollowupAt))}</p>${isAdmin() || r.ownerId === state.user.id ? `<button class="btn" onclick="leadDetail('${r.id}')">详情 / 跟进</button>` : "领取后查看完整信息"}</article>`).join("") || "<p>暂无符合条件的资源</p>"}</div>`}<div class="lead-actions"><button class="btn" onclick="leadPage(-1)" ${leadsState.page <= 1 ? "disabled" : ""}>上一页</button><span>第${leadsState.page}页，共${leadsState.total}条</span><button class="btn" onclick="leadPage(1)" ${leadsState.page * 20 >= leadsState.total ? "disabled" : ""}>下一页</button>${renderLeadPageJump("lead-page-jump", leadsState.page, leadsState.total, 20, "leadPageJump")}${renderLeadPageSelection(leadsState.items)}</div>`;
  }
  return `<section class="lead-module"><h2>外呼管理</h2><div class="lead-tabs">${tabs.map(t => `<button class="btn ${leadsState.tab === t[0] ? "primary" : ""}" onclick="leadTab('${t[0]}')">${t[1]}</button>`).join("")}</div>${leadsState.error ? `<p role="alert">${html(leadsState.error)}</p>${isAdmin() ? '<button class="btn" onclick="leadRecover()">恢复待完成的客户同步</button>' : ""}` : ""}${body}${leadsState.detail ? renderLeadDetail() : ""}${leadsState.adding ? renderLeadAdd() : ""}</section>`;
}
function leadMove(action) { leadAction(async () => {
  if (!leadsState.selected.length) throw new Error("请先选择资源");
  const owner = document.getElementById("lead-assign-owner");
  if (!confirm("确认" + (leadLabels[action] || action) + "已选择的 " + leadsState.selected.length + " 条资源？")) return;
  await leadRequest("move", { action, ids: leadsState.selected, ownerId: owner ? owner.value : "" });
  leadsState.selected = []; await loadLeads();
}); }
function leadAddOpen() { leadsState.adding = true; render(); }
function renderLeadAdd() {
  return `<div class="lead-overlay"><section class="lead-drawer lead-add-drawer" role="dialog" aria-modal="true" aria-label="添加私海资源"><button class="btn" onclick="leadsState.adding=false;render()">关闭</button><h2>添加私海资源</h2><p class="lead-note">这里只添加外呼资源，不会在客户管理中创建正式客户。</p><label>姓名（必填）<input class="input" id="lead-add-name" maxlength="160"></label><label>电话（必填）<input class="input" id="lead-add-phone" maxlength="50" inputmode="tel"></label><label>标签（可选）<select class="select" id="lead-add-tag">${leadTagOptions("", "未设置")}</select></label><button class="btn primary" onclick="leadAddSave()">保存到我的私海</button></section></div>`;
}
function leadAddSave() { leadAction(async () => {
  const name = document.getElementById("lead-add-name").value.trim(), phone = document.getElementById("lead-add-phone").value.trim(), tag = document.getElementById("lead-add-tag").value;
  if (!name || !phone) throw new Error("姓名和电话必填");
  const membership = await leadRequest("lookup", { phone });
  if (membership.location === "mine") {
    leadsState.adding = false;
    leadsState.detail = await leadRequest("resources/" + membership.resourceId);
    return;
  }
  if (membership.location === "other") throw new Error("该号码已在其他销售私海，请联系管理员调配");
  const claimPublic = membership.location === "public";
  if (claimPublic && !confirm("该号码已在公海，是否领取到我的私海？公海原信息将保留。")) return;
  const result = await leadRequest("resources", { name, phone, tag, claimPublic });
  leadsState.adding = false;
  await loadLeads();
  leadsState.detail = await leadRequest("resources/" + result.resourceId);
}); }
async function leadDetail(id, page) { await leadAction(async () => {
  const actor = state.user.id, data = await leadRequest("resources/" + id + "?page=" + (page || 1));
  if (state.user && state.user.id === actor && state.route === "leads") { leadsState.detail = data; leadsState.editing = false; }
}); }
function renderLeadDetail() {
  const d = leadsState.detail, r = d.resource;
  const profile = leadsState.editing ? `<div class="lead-profile-edit"><label>客户姓名<input class="input" id="lead-edit-name" maxlength="160" value="${html(r.name)}"></label><label>电话号码<input class="input" id="lead-edit-phone" maxlength="50" inputmode="tel" value="${html(r.phone)}" ${isAdmin() ? "" : "readonly"}></label><p class="lead-note">${isAdmin() ? "管理员可修改姓名和电话；已关联正式客户时将同步客户资料。" : "销售人员只能修改本人私海资源的姓名，电话号码仅管理员可修改。"}</p><div class="lead-actions"><button class="btn primary" onclick="leadResourceSave()">保存资料</button><button class="btn" onclick="leadsState.editing=false;render()">取消</button></div></div>` : `<div><h2>${html(r.name)}</h2><p class="lead-phone">${html(r.phone)}</p><button class="btn lead-edit-resource" onclick="leadsState.editing=true;render()">编辑资料</button></div>`;
  return `<div class="lead-overlay"><section class="lead-drawer" role="dialog" aria-modal="true" aria-label="资源详情"><button class="btn" onclick="leadsState.detail=null;leadsState.editing=false;render()">关闭</button><div class="lead-detail-head">${profile}<label class="lead-fixed-tag">固定标签<select class="select" id="lead-fixed-tag" onchange="leadTagSave(this)">${leadTagOptions(r.tags, "未设置")}</select></label></div><p>${html(r.address || "")}</p><p>来源：${html(r.source || "未填写")}</p><div class="lead-actions">${r.canContact ? `<a class="btn primary" href="tel:${html(r.phone)}" onclick="event.preventDefault();leadDial()">调起电话</a>` : "禁止联系"}${r.customerId ? '<span>已关联正式客户</span>' : '<span>正式客户请在客户管理中新增</span>'}</div><p class="lead-note">调起电话不代表已接通。以下结果由销售手工填写。</p>
    <label>跟进结果<select class="select" id="lead-result">${leadOptions(["connected", "no_answer", "busy", "invalid", "do_not_call", "other"])}</select></label><label>跟进内容<textarea class="input" id="lead-content" maxlength="4000"></textarea></label><label>下次跟进（北京时间）<input class="input" id="lead-next" type="datetime-local"></label><button class="btn primary" onclick="leadFollow()">保存跟进</button>
    <h3>跟进历史</h3>${d.followups.map(f => `<div class="lead-history"><b>${html(f.actor_name)}</b> · ${html(leadTime(f.created_at))}<p>${html(leadLabels[f.result] || f.result)}</p><p>${html(f.content)}</p></div>`).join("") || "暂无记录"}<h3>流转历史</h3>${d.movements.map(m => `<p>${html(leadTime(m.created_at))} ${html(m.actor_name)}：${html(leadLabels[m.action] || m.action)}</p>`).join("")}<h3>关联订单摘要（${d.orderTotal}）</h3>${d.orders.map(o => `<p>${html(o.no || o.id)} · ${html(o.status)} · ${html(o.date)} · ¥${html(String(o.amount || 0))}</p>`).join("") || "暂无关联订单"}<div class="lead-actions"><button class="btn" ${d.historyPage <= 1 ? "disabled" : ""} onclick="leadDetail('${r.id}',${d.historyPage - 1})">上一页历史</button><span>第${d.historyPage}页</span><button class="btn" ${Math.max(d.followups.length, d.movements.length, d.orders.length) < 50 ? "disabled" : ""} onclick="leadDetail('${r.id}',${d.historyPage + 1})">下一页历史</button></div></section></div>`;
}
function leadResourceSave() { leadAction(async () => {
  const r = leadsState.detail.resource, payload = { name: document.getElementById("lead-edit-name").value.trim(), version: r.version };
  if (!payload.name) throw new Error("客户姓名必填");
  if (isAdmin()) payload.phone = document.getElementById("lead-edit-phone").value.trim();
  const result = await leadRequest("resources/" + r.id, payload, null, "PATCH");
  r.name = result.name; r.phone = result.phone; r.version = result.version; leadsState.editing = false;
  leadsState.items.forEach(item => { if (item.id === r.id) { item.name = result.name; item.phone = result.phone; item.version = result.version; } });
  if (leadsState.tasks) Object.keys(leadsState.tasks).forEach(tier => leadsState.tasks[tier].items.forEach(item => { if (item.id === r.id) { item.name = result.name; item.phone = result.phone; item.version = result.version; } }));
  showToast("资源资料已更新");
}); }
function leadTagSave(select) { leadAction(async () => {
  const r = leadsState.detail.resource;
  select.disabled = true;
  const result = await leadRequest("resources/" + r.id, { tag: select.value, version: r.version }, null, "PATCH");
  r.tags = result.tag; r.version = result.version;
  leadsState.items.forEach(item => { if (item.id === r.id) item.tags = result.tag; });
  showToast("资源标签已更新");
}); }
function leadWechatStatusSave(select, id) { leadAction(async () => {
  const r = leadsState.items.find(item => item.id === id);
  if (!r) throw new Error("资源已变化，请刷新列表");
  select.disabled = true;
  const result = await leadRequest("resources/" + r.id + "/wechat-status", { wechatStatus: select.value, version: r.version }, null, "PATCH");
  r.wechatStatus = result.wechatStatus; r.version = result.version;
  if (leadsState.detail && leadsState.detail.resource.id === r.id) {
    leadsState.detail.resource.wechatStatus = result.wechatStatus;
    leadsState.detail.resource.version = result.version;
  }
  showToast("微信状态已更新");
}); }
function leadFollow() { leadAction(async () => {
  const r = leadsState.detail.resource, time = document.getElementById("lead-next").value;
  await leadRequest("resources/" + r.id + "/followups", { result: document.getElementById("lead-result").value, content: document.getElementById("lead-content").value, nextFollowupAt: time ? new Date(time + ":00+08:00").toISOString() : null });
  leadsState.detail = await leadRequest("resources/" + r.id); await loadLeads();
}); }
function leadRecover() { leadAction(async () => { if (confirm("按已记录的客户修改恢复同步？")) { await leadRequest("recover", {}); await loadLeads(); } }); }
function leadInitialize() { leadAction(async () => {
  if (!confirm("请先确认维护窗口内已暂停客户修改，且已审阅核对报告。现在在MySQL补建现有客户资源？原客户数据不会修改。")) return;
  await leadRequest("setup", { confirm: "MIGRATE_EXISTING_CUSTOMERS" });
  alert("关联初始化已完成。请按部署说明配置激活开关并重启服务。");
}); }
function leadDial() { leadAction(async () => {
  const result = await leadRequest("resources/" + leadsState.detail.resource.id + "/dial", {});
  window.location.href = "tel:" + result.phone;
}); }
function renderLeadImports() {
  const m = leadsState.mapping, batch = leadsState.batch;
  return `<div class="lead-card"><h3>导入资源</h3><p>支持.xlsx、CSV。单文件最多5MB、5000条；重复号码不覆盖已有资源。先预览，再确认导入。</p><input type="file" id="lead-file" accept=".xlsx,.csv"><select class="select" id="lead-encoding"><option value="utf-8">CSV UTF-8</option><option value="gb18030">CSV GB18030 / GBK</option></select><input class="input" id="lead-sheet" placeholder="Excel工作表名（留空为第一张）"><button class="btn" onclick="leadUpload()">读取文件</button>
  ${m ? `<p>共${m.total}条。请确认字段映射：</p><div class="lead-mapping">${["phone", "name", "contact", "address", "source", "region", "tags"].map((key, i) => `<label>${["电话（必选）", "名称", "联系人", "地址", "来源", "地区", "标签"][i]}<select class="select" id="lead-map-${key}"><option value="-1">不导入</option>${m.headers.map((h, j) => `<option value="${j}">${html(h || "第" + (j + 1) + "列")}</option>`).join("")}</select></label>`).join("")}</div><h4>文件前5行</h4>${m.sample.map(r => `<p>${r.map(v => html(v)).join(" / ")}</p>`).join("")}<button class="btn" onclick="leadPreview()">校验并生成预览</button>` : ""}
  ${batch ? `<h4>批次 ${html(batch.batchId)}</h4><p>${batch.counts.map(c => html(leadLabels[c.status] || c.status) + "：" + c.total).join(" · ")}</p>${batch.rows.map(r => `<p>第${r.row_no}行：${html(leadLabels[r.status] || r.status)} ${html(r.message)}</p>`).join("")}<div class="lead-actions"><button class="btn" onclick="leadBatch('${batch.batchId}',${Math.max(1, (leadsState.batchPage || 1) - 1)})">上一页明细</button><button class="btn" onclick="leadBatch('${batch.batchId}',${(leadsState.batchPage || 1) + 1})">下一页明细</button><button class="btn primary" onclick="leadCommit('${batch.batchId}')">确认导入 / 继续未完成批次</button></div>` : ""}</div><h3>最近导入批次</h3>${leadsState.imports.map(b => `<div class="lead-card"><p>${html(b.filename)} · ${html(leadLabels[b.status] || b.status)} · ${b.total}条</p><button class="btn" onclick="leadBatch('${b.id}')">查看结果</button></div>`).join("")}`;
}
function leadUpload() { leadAction(async () => {
  const file = document.getElementById("lead-file").files[0];
  if (!file || file.size > 5 * 1024 * 1024) throw new Error("请选择不超过5MB的文件");
  const encoding = document.getElementById("lead-encoding").value, sheet = document.getElementById("lead-sheet").value;
  const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1]); reader.onerror = reject; reader.readAsDataURL(file); });
  leadsState.mapping = await leadRequest("imports/inspect", { filename: file.name, base64, encoding, sheet }); leadsState.batch = null;
}); }
function leadPreview() { leadAction(async () => {
  const mapping = {}; ["phone", "name", "contact", "address", "source", "region", "tags"].forEach(k => { mapping[k] = Number(document.getElementById("lead-map-" + k).value); });
  const batchId = leadsState.mapping.batchId;
  await leadRequest("imports/" + batchId + "/preview", { mapping });
  leadsState.mapping = null; leadsState.batch = await leadRequest("imports/" + batchId); leadsState.batchPage = 1; await loadLeads();
}); }
function leadBatch(id, page) { leadAction(async () => { leadsState.batchPage = page || 1; leadsState.batch = await leadRequest("imports/" + id + "?page=" + leadsState.batchPage); }); }
function leadCommit(id) { leadAction(async () => {
  if (!confirm("确认导入校验通过的资源？重复和失败行会跳过，不覆盖原数据。")) return;
  const actor = state.user.id; let result;
  do {
    result = await leadRequest("imports/" + id + "/commit", {});
    if (!state.user || state.user.id !== actor || state.route !== "leads") return;
    leadsState.batch = await leadRequest("imports/" + id); render();
  } while (!result.done);
  await loadLeads();
}); }
function renderLeadStats() {
  const s = leadsState.stats; if (!s) return "<p>正在加载</p>";
  const f = leadsState.statsFilters, names = id => { const found = salesUsers.find(u => u.id === id); return found ? found.name : id || "未知"; };
  const users = salesUsers.filter(u => ["销售人员", "管理员", "超级管理员"].indexOf(u.role) >= 0 && u.status !== "停用");
  const counts = new Map((s.resources || []).map(r => [r.owner_id, r]));
  const cards = users.filter(u => !f.owner || u.id === f.owner).map(u => Object.assign({ owner_id: u.id, total: 0, customers: 0 }, counts.get(u.id) || {})).sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
  const labels = { connected: "有效接通", no_answer: "未接", busy: "占线", invalid: "无效号码", do_not_call: "拒绝联系", other: "其他" };
  const maximum = Math.max(1, ...(s.results || []).map(r => Number(r.total || 0)));
  const trend = s.trend || [], maxTrend = Math.max(1, ...trend.map(r => Number(r.total || 0)));
  const points = trend.map((r, i) => `${24 + i * 152},${120 - Math.round(Number(r.total || 0) / maxTrend * 96)}`).join(" ");
  return `<div class="lead-stats-dashboard">
    <div class="lead-stats-filters"><div class="lead-stats-period">${[["today","今日"],["week","近7天"],["month","本月"],["custom","自定义"]].map(item => `<button class="btn ${f.period === item[0] ? "primary" : ""}" onclick="leadStatsPeriod('${item[0]}')">${item[1]}</button>`).join("")}</div>${f.period === "custom" ? `<label>开始日期 <input class="input" type="date" id="lead-stats-from" value="${html(f.from || "")}" onchange="leadStatsCustom()"></label><label>结束日期 <input class="input" type="date" id="lead-stats-to" value="${html(f.to || "")}" onchange="leadStatsCustom()"></label>` : ""}<select class="select" aria-label="筛选销售" onchange="leadStatsOwner(this.value)"><option value="">全部销售</option>${users.map(u => `<option value="${html(u.id)}" ${f.owner === u.id ? "selected" : ""}>${html(u.name)}</option>`).join("")}</select><button class="btn" onclick="loadLeads()">刷新</button><span class="lead-stats-live">自动更新 · 15秒</span></div>
    <div class="lead-stats-heading"><h3>销售资源情况</h3><small>资源和正式客户关联为当前存量，不随日期变化</small></div>
    <div class="lead-stats-sales">${cards.map(r => `<div class="lead-stats-sales-card"><b>${html(names(r.owner_id))}</b><div><span>名下资源<strong>${Number(r.total || 0)}</strong><small>条</small></span><span>已关联客户<strong>${Number(r.customers || 0)}</strong><small>位</small></span></div></div>`).join("") || '<p class="lead-list-empty">暂无销售资源</p>'}</div>
    <div class="lead-stats-kpis"><div><small>跟进客户</small><strong>${Number(s.kpis.followedCustomers || 0)}</strong></div><div><small>有效接通客户</small><strong>${Number(s.kpis.connectedCustomers || 0)}</strong></div><div><small>微信已通过资源</small><strong>${Number(s.kpis.approved || 0)}</strong></div><div title="下单前7天内最后一次跟进归属该销售；按订单录入时间统计"><small>跟进促成订单 ⓘ</small><strong>${Number(s.kpis.attributedOrders || 0)}</strong><em>单</em></div></div>
    <div class="lead-stats-main"><section class="lead-stats-panel"><h3>实时跟进动态</h3><p>销售最新跟进记录自动更新；仅展示所选时间范围</p><div class="lead-stats-table-wrap"><table><thead><tr><th>时间</th><th>销售</th><th>客户</th><th>跟进结果</th><th>最近跟进内容</th><th>微信状态</th><th>操作</th></tr></thead><tbody>${(s.recent || []).map(r => `<tr><td>${html(leadListTime(r.createdAt))}</td><td>${html(r.actorName || names(r.actorId))}</td><td><b>${html(r.name)}</b><small>${html(r.phone)}</small></td><td><span class="lead-stats-pill">${html(labels[r.result] || r.result)}</span></td><td class="lead-stats-content" title="${html(r.content)}">${html(r.content)}</td><td>${html(leadWechatLabels[r.wechatStatus] || "未判断")}</td><td><button class="btn" onclick="leadDetail('${r.leadId}')">查看</button></td></tr>`).join("") || '<tr><td colspan="7">该时间范围暂无跟进记录</td></tr>'}</tbody></table></div></section>
      <div class="lead-stats-side"><section class="lead-stats-panel"><h3>当前活跃销售</h3><p>按最近跟进时间排序</p>${(s.active || []).map(r => `<div class="lead-stats-active"><b>${html(r.actorName || names(r.actorId))}</b><span>跟进 ${Number(r.followedCustomers || 0)} 位</span><span>接通 ${Number(r.connectedCustomers || 0)} 位</span><small>${html(leadListTime(r.lastFollowupAt))}</small></div>`).join("") || '<p>暂无销售跟进</p>'}</section><section class="lead-stats-panel"><h3>跟进结果分布</h3>${(s.results || []).map(r => `<div class="lead-stats-result"><span>${html(labels[r.result] || r.result)}</span><i><b style="width:${Math.round(Number(r.total || 0) / maximum * 100)}%"></b></i><strong>${Number(r.total || 0)}</strong></div>`).join("") || '<p>暂无跟进结果</p>'}</section></div></div>
    <section class="lead-stats-panel lead-stats-trend"><h3>近7天跟进趋势</h3><p>每日有跟进记录的去重客户数</p><svg role="img" aria-label="近7天跟进客户趋势" viewBox="0 0 960 135" preserveAspectRatio="none"><polyline fill="none" stroke="#3d61df" stroke-width="4" points="${points}"/></svg><div>${trend.map(r => `<span>${html(r.day.slice(5))}<b>${Number(r.total || 0)}</b></span>`).join("")}</div></section><p class="lead-note">${html(s.note)}</p>
  </div>`;
}
function leadStatsPeriod(period) { leadsState.statsFilters.period = period; if (period !== "custom" || leadsState.statsFilters.from && leadsState.statsFilters.to) loadLeads(); else render(); }
function leadStatsOwner(owner) { leadsState.statsFilters.owner = owner; loadLeads(); }
function leadStatsCustom() { const from = document.getElementById("lead-stats-from"), to = document.getElementById("lead-stats-to"); leadsState.statsFilters.from = from ? from.value : ""; leadsState.statsFilters.to = to ? to.value : ""; if (leadsState.statsFilters.from && leadsState.statsFilters.to) loadLeads(); }
function renderLeadAudit() {
  const rows = leadsState.audits || [];
  const names = { dial_intent: "调起拨号", followup: "填写跟进", update_wechat_status: "修改微信状态", sync_customer: "同步客户", import_upload: "上传导入文件", import_preview: "预览导入", import_resource: "导入资源", import_chunk: "提交导入批次", migrate_customers: "初始化客户关联" };
  return rows.map(r => {
    const actor = salesUsers.find(u => u.id === r.actor_id);
    return `<div class="lead-card"><p>${html(leadTime(r.created_at))} · ${html(actor ? actor.name : r.actor_id)} · ${html(names[r.action] || leadLabels[r.action] || r.action)}</p><p>资源：${html(r.lead_id || "批次/系统")} · 请求：${html(r.request_id)}</p></div>`;
  }).join("") + `<div class="lead-actions"><button class="btn" onclick="leadPage(-1)" ${leadsState.page <= 1 ? "disabled" : ""}>上一页</button><span>第${leadsState.page}页</span><button class="btn" onclick="leadPage(1)" ${rows.length < 50 ? "disabled" : ""}>下一页</button></div>`;
}
