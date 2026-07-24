const state = {
  route: "dashboard",
  user: null,
  query: "",
  customerOwnerFilter: "全部",
  orderQuery: "",
  orderSalesFilter: "全部",
  productQuery: "",
  category: "全部",
  productSubcategory: "",
  orderStatus: "全部",
  modal: null,
  toast: "",
  loading: false,
  cart: [],
  selectedCustomerId: "c1",
  salesUserId: "u2",
  orderType: "sale",
  aiDraft: null,
  aiLoading: false,
  aiError: "",
  aiText: "",
  aiGroups: [],
  aiActiveGroupId: "",
  aiLearnPairs: [],
  loginPasswordVisible: false,
  editProductQuery: "",
  editProductCategory: "全部",
  editProductSubcategory: "全部",
  editProductPickerOpen: false,
  orderDraftCustomerId: "",
  orderAddress: "",
  orderPhone: "",
  orderRemark: "",
  editCustomerQuery: "",
  editCustomerPickerOpen: false,
  selectedProductIds: [],
  assistantOpen: false,
  assistantMessages: [],
  assistantLoaded: false,
  assistantLoading: false,
  assistantError: "",
  assistantLastQuestion: "",
  assistantSide: (() => {
    try {
      return localStorage.getItem("xiaocai-side") === "left" ? "left" : "right";
    } catch (_) {
      return "right";
    }
  })(),
};

let inputRenderTimer = null;
let assistantAbortController = null;
let assistantStageTimer = null;
let suppressAssistantClick = false;

let salesUsers = [
  { id: "u1", name: "钱锦健", phone: "13800000001", password: "888888", role: "超级管理员", status: "启用" },
  { id: "u2", name: "侯俊键", phone: "13800000002", password: "888888", role: "销售人员", status: "启用" },
  { id: "u3", name: "沈海峰", phone: "13800000003", password: "888888", role: "销售人员", status: "启用" },
  { id: "u4", name: "管理员", phone: "13800000004", password: "888888", role: "管理员", status: "启用" },
  { id: "u5", name: "财务", phone: "13800000005", password: "888888", role: "财务", status: "启用" },
];

let customers = [
  { id: "c1", name: "钱勇6333", contact: "钱勇", phone: "15608096333", email: "", address: "明佑天府壹号28栋2单元102", ownerId: "u2", total: 4865.4, last: "2026/6/9", orders: 6 },
  { id: "c2", name: "王美4949", contact: "王美", phone: "13668164949", email: "", address: "华府大道建材市场", ownerId: "u2", total: 7664.9, last: "2026/6/8", orders: 9 },
  { id: "c3", name: "周9446", contact: "周先生", phone: "17628069446", email: "", address: "高新区工地库房", ownerId: "u3", total: 9604, last: "2026/6/7", orders: 11 },
  { id: "c4", name: "露哥9561", contact: "露哥", phone: "13548029561", email: "", address: "双流区项目部", ownerId: "u2", total: 5438.12, last: "2026/6/6", orders: 6 },
  { id: "c5", name: "张朝646", contact: "张朝", phone: "18109064646", email: "", address: "明佑天府壹号", ownerId: "u1", total: 2559.16, last: "2026/6/1", orders: 3 },
];

let products = [
  { id: "p1", brand: "木", cat1: "木", cat2: "木类小配件", name: "接头（好）", spec: "木工PITOU", unit: "个", price: 2, cost: 0.8, status: "在售", color: "#d9c3a1" },
  { id: "p2", brand: "木", cat1: "木", cat2: "木工辅材", name: "拼塑板（保温板隔热板）", spec: "灰色5cm / 1200*2400", unit: "张", price: 11, cost: 7.5, status: "在售", color: "#cbd5e1" },
  { id: "p3", brand: "水电", cat1: "水电", cat2: "水电辅材", name: "NM1-400S/3310315A AC230V", spec: "天正接触器", unit: "个", price: 580, cost: 430, status: "在售", color: "#bfdbfe" },
  { id: "p4", brand: "水电", cat1: "水电", cat2: "空气开关", name: "BH-0.66 30 I 300/5A 0.5级", spec: "互感器", unit: "个", price: 13.5, cost: 9.2, status: "在售", color: "#dbeafe" },
  { id: "p5", brand: "油", cat1: "油", cat2: "高德", name: "高德轻质石膏", spec: "20KG", unit: "袋", price: 14, cost: 10, status: "在售", color: "#fde68a" },
  { id: "p6", brand: "瓦", cat1: "瓦", cat2: "瓷砖胶", name: "拉法基一型瓷砖胶", spec: "20KG", unit: "袋", price: 22, cost: 17, status: "在售", color: "#e5e7eb" },
  { id: "p7", brand: "水电", cat1: "水电", cat2: "金杯线缆", name: "塔牌电线（双色ZA-BV6mm2）", spec: "双色ZA-BV6mm2", unit: "卷", price: 563, cost: 520, status: "在售", color: "#fca5a5" },
  { id: "p8", brand: "水电", cat1: "水电", cat2: "金杯线缆", name: "塔牌电线（单色ZA-BV10mm2）", spec: "单色ZA-BV10mm2", unit: "卷", price: 0, cost: 0, status: "在售", color: "#86efac" },
  { id: "p9", brand: "木", cat1: "木", cat2: "可耐福", name: "可耐福龙骨", spec: "1200*2400*9.5", unit: "根", price: 18.6, cost: 13, status: "在售", color: "#d6d3d1" },
];

let orders = [
  { id: "o1", no: "ORD1781230955350624", customerId: "c5", salesUserId: "u2", date: "2026/6/12", status: "待确认", payStatus: "未回款", amount: 4047.16, items: [{ productId: "p3", quantity: 1, price: 580 }, { productId: "p7", quantity: 2, price: 563 }, { productId: "p2", quantity: 35, price: 36 }] },
  { id: "o2", no: "ORD1781226813454163", customerId: "c3", salesUserId: "u3", date: "2026/6/12", status: "待确认", payStatus: "未回款", amount: 922, items: [{ productId: "p5", quantity: 7, price: 14 }] },
  { id: "o3", no: "ORD1781179803303841", customerId: "c4", salesUserId: "u2", date: "2026/6/11", status: "待确认", payStatus: "未回款", amount: 2370, items: [{ productId: "p6", quantity: 4, price: 22 }] },
  { id: "o4", no: "ORD178116787613288", customerId: "c1", salesUserId: "u2", date: "2026/6/11", status: "已完成", payStatus: "未回款", amount: 1072, items: [{ productId: "p1", quantity: 10, price: 2 }] },
];

const app = document.getElementById("app");

const money = (value) => `¥${Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
const byId = (list, id) => list.find((item) => item.id === id);
const icon = (name) => ({ dashboard: "概", customers: "客", products: "品", create: "开", orders: "单", returns: "退", users: "员" }[name] || "•");
const isAdmin = () => state.user && ["超级管理员", "管理员"].includes(state.user.role);

function cartStorageKey(type = state.orderType) {
  return state.user?.id ? `building-sales-cart:${state.user.id}:${type === "return" ? "return" : "sale"}` : "";
}

function persistCart(type = state.orderType) {
  const key = cartStorageKey(type);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(state.cart));
  } catch (_) {
    // The in-memory cart still works when browser storage is unavailable.
  }
}

function restoreCart(type = state.orderType) {
  const key = cartStorageKey(type);
  if (!key) return;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    state.cart = Array.isArray(saved) ? saved.filter((item) => {
      const product = byId(products, item.productId);
      return product && isProductActive(product) && normalizeQuantity(item.quantity) > 0;
    }).map((item) => ({
      productId: item.productId,
      quantity: normalizeQuantity(item.quantity),
      price: Number(item.price || 0),
    })) : [];
  } catch (_) {
    state.cart = [];
  }
}

function clearPersistedCart(type = state.orderType) {
  const key = cartStorageKey(type);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch (_) {
    // Ignore browser storage failures after a successful order save.
  }
}

function resetOrderDraft(customer = null) {
  state.orderDraftCustomerId = customer?.id || "";
  state.orderAddress = customer?.address || "";
  state.orderPhone = customer?.phone || "";
  state.orderRemark = "";
}

function ensureOrderDraft(customer) {
  if (!customer) return;
  if (state.orderDraftCustomerId !== customer.id) resetOrderDraft(customer);
}

function updateOrderDraftField(field, value) {
  if (field === "address") state.orderAddress = value;
  if (field === "phone") state.orderPhone = value;
  if (field === "remark") state.orderRemark = value;
}

function selectOrderCustomer(customerId) {
  state.selectedCustomerId = customerId;
  resetOrderDraft(byId(customers, customerId));
  render();
}

function orderItemDetails(item = {}) {
  const product = byId(products, item.productId) || {};
  const name = item.name || product.name || "";
  const spec = item.spec !== undefined && item.spec !== "" ? item.spec : product.spec || "";
  return { name, spec, label: spec ? `${name}（${spec}）` : name, unit: item.unit || product.unit || "" };
}

function setRoute(route) {
  state.route = route;
  state.query = "";
  state.modal = null;
  if (route === "returns") state.orderType = "return";
  if (route === "create") state.orderType = "sale";
  render();
}

function showToast(text) {
  state.toast = text;
  render();
  setTimeout(() => {
    state.toast = "";
    render();
  }, 1800);
}

function renderKeepingInput(inputId, selectionStart, selectionEnd) {
  render();
  setTimeout(() => {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.focus();
    if (typeof input.setSelectionRange === "function") {
      input.setSelectionRange(selectionStart, selectionEnd);
    }
  }, 0);
}

function scheduleInputRender(key, value, inputId, selectionStart, selectionEnd) {
  state[key] = value;
  const input = document.getElementById(inputId);
  if (input?.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => renderKeepingInput(inputId, selectionStart, selectionEnd), 180);
}

function bindTextCompositionGuards() {
  if (window.__buildingSalesCompositionBound) return;
  document.addEventListener("compositionstart", (event) => {
    if (!event.target.matches("input, textarea")) return;
    event.target.dataset.composing = "true";
    clearTimeout(inputRenderTimer);
  }, true);
  document.addEventListener("compositionend", (event) => {
    if (!event.target.matches("input, textarea")) return;
    event.target.dataset.composing = "false";
    const target = event.target;
    setTimeout(() => {
      if (target.isConnected) target.dispatchEvent(new Event("input", { bubbles: true }));
    }, 0);
  }, true);
  window.__buildingSalesCompositionBound = true;
}

function updatePageQuery(input) {
  scheduleInputRender("query", input.value, input.id, input.selectionStart, input.selectionEnd);
}

function updateProductQuery(input) {
  scheduleInputRender("productQuery", input.value, input.id, input.selectionStart, input.selectionEnd);
}

function setProductCategory(category) {
  state.category = category;
  state.productSubcategory = "";
  render();
}

function setProductSubcategory(category) {
  state.productSubcategory = category;
  render();
}

function toggleLoginPassword() {
  state.loginPasswordVisible = !state.loginPasswordVisible;
  const phone = document.getElementById("loginPhone")?.value || "";
  const password = document.getElementById("loginPassword")?.value || "";
  renderLogin();
  const phoneInput = document.getElementById("loginPhone");
  const input = document.getElementById("loginPassword");
  if (phoneInput) phoneInput.value = phone;
  if (input) {
    input.value = password;
    input.focus();
  }
}

function render() {
  if (state.user && !state.loading) persistCart();
  if (state.loading) {
    app.innerHTML = `<div class="login-shell"><section class="login-panel"><div class="login-card"><div class="brand-row"><div class="brand-mark">建</div><div><h1 class="page-title">建材销售开单系统</h1><p class="page-subtitle">正在加载...</p></div></div></div></section><section class="login-visual"><div class="visual-board"></div></section></div>`;
    return;
  }
  if (!state.user) {
    renderLogin();
    return;
  }

  app.innerHTML = `
    <div class="app-shell">
      ${state.toast ? `<div class="toast">✓ ${state.toast}</div>` : ""}
      <aside class="sidebar">
        <div class="side-brand"><div class="brand-mark">建</div><strong>建材订单管理</strong></div>
        <nav class="nav">
          ${navButton("dashboard", "销售概览")}
          ${navButton("customers", "客户管理")}
          ${navButton("products", "产品管理")}
          ${navButton("create", "销售开单")}
          ${navButton("orders", "订单管理")}
          ${navButton("returns", "退货单")}
          ${isAdmin() ? navButton("users", "人员管理") : ""}
        </nav>
        <div class="side-user">
          <strong>${state.user.name}</strong>
          <div class="hint" style="color: rgba(255,255,255,.75)">${state.user.role}</div>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div>
            <h1 class="page-title">${titleForRoute()}</h1>
            <p class="page-subtitle">${subtitleForRoute()}</p>
          </div>
          <div class="toolbar" style="margin:0">
            <button class="btn" onclick="setRoute('create')">开销售单</button>
            <button class="btn ghost" onclick="logout()">退出</button>
          </div>
        </header>
        <section class="content">${renderPage()}</section>
      </main>
      ${renderXiaocai()}
      ${renderModal()}
    </div>
  `;
}

function renderLogin() {
  app.innerHTML = `
    <div class="login-shell">
      <section class="login-panel">
        <div class="login-card">
          <div class="brand-row">
            <div class="brand-mark">建</div>
            <div><h1 class="page-title">建材销售开单系统</h1><p class="page-subtitle">手机号登录 · 客户产品订单一体化</p></div>
          </div>
          <div class="field"><label>手机号</label><input id="loginPhone" class="input" value="" placeholder="请输入已授权手机号" /></div>
          <div class="field"><label>密码</label><div class="password-field"><input id="loginPassword" class="input" type="${state.loginPasswordVisible ? "text" : "password"}" value="" placeholder="请输入登录密码" /><button type="button" class="password-toggle ${state.loginPasswordVisible ? "active" : ""}" onclick="toggleLoginPassword()" title="${state.loginPasswordVisible ? "隐藏密码" : "显示密码"}" aria-label="${state.loginPasswordVisible ? "隐藏密码" : "显示密码"}"></button></div></div>
          <button class="btn primary" style="width:100%" onclick="login()">登录系统</button>
        </div>
      </section>
      <section class="login-visual"><div class="visual-board"></div></section>
    </div>
  `;
}

async function login() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "登录失败");
    state.user = data.user;
    await loadBootstrap();
    showToast("登录成功");
  } catch (error) {
    alert(error.message);
  }
}

async function loadBootstrap() {
  const response = await fetch("/api/bootstrap");
  if (!response.ok) {
    return;
  }
  const data = await response.json();
  state.user = data.user;
  salesUsers = data.users;
  customers = data.customers;
  products = data.products;
  orders = data.orders;
  state.selectedCustomerId = customers[0]?.id || "";
  state.salesUserId = state.user?.id || salesUsers[0]?.id || "";
  resetOrderDraft(byId(customers, state.selectedCustomerId));
  restoreCart(state.orderType);
}

async function boot() {
  state.loading = true;
  render();
  try {
    await loadBootstrap();
  } catch {
    // 未登录时保持登录页。
  } finally {
    state.loading = false;
    render();
  }
}

async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } finally {
    assistantAbortController?.abort();
    clearInterval(assistantStageTimer);
    state.user = null;
    state.assistantOpen = false;
    state.assistantMessages = [];
    state.assistantLoaded = false;
    state.assistantLoading = false;
    state.assistantError = "";
    render();
  }
}

function localLoginFallback(phone, password) {
  const user = salesUsers.find((item) => item.phone === phone);
  if (!user || user.password !== password || user.status !== "启用") {
    alert("手机号或密码错误。");
    return;
  }
  state.user = user;
  showToast("登录成功");
}

function navButton(route, label) {
  return `<button class="${state.route === route ? "active" : ""}" onclick="setRoute('${route}')"><span class="nav-icon">${icon(route)}</span><span>${label}</span></button>`;
}

function titleForRoute() {
  return ({ dashboard: "销售概览", customers: "客户管理", products: "产品管理", create: "销售开单", orders: "订单管理", returns: "退货单", users: "人员管理" }[state.route]);
}

function subtitleForRoute() {
  return ({ dashboard: "查看本月与今日销售、客户和订单数据", customers: "管理客户信息和成交记录", products: "管理建材商品信息与价格", create: "选择客户和商品生成销售单", orders: "管理订单状态、打印和导出", returns: "从销售流程中创建退货单", users: "添加登录人员，维护手机号、密码和角色定位" }[state.route]);
}

function renderPage() {
  if (state.route === "dashboard") return renderDashboard();
  if (state.route === "customers") return renderCustomers();
  if (state.route === "products") return renderProducts();
  if (state.route === "create" || state.route === "returns") return renderCreateOrder();
  if (state.route === "orders") return renderOrders();
  if (state.route === "users" && isAdmin()) return renderUsers();
  return "";
}

function renderDashboard() {
  const total = orders.reduce((sum, item) => sum + item.amount, 0);
  const pending = orders.filter((item) => item.status === "待确认").length;
  return `
    <div class="grid kpi-grid">
      ${kpi("今日销售额", money(total), "dashboard")}
      ${kpi("客户数量", customers.length, "customers")}
      ${kpi("在售商品", products.filter((p) => p.status === "在售").length, "products")}
      ${kpi("待确认订单", pending, "orders")}
    </div>
    <div class="grid two-col" style="margin-top:16px">
      <div class="card card-pad">
        <h3>最近订单</h3>
        <div class="order-list">${orders.slice(0, 4).map(orderCard).join("")}</div>
      </div>
      <div class="card card-pad">
        <h3>高频建材分类</h3>
        ${["水电", "木", "油", "瓦"].map((cat) => `<div class="summary-row"><span>${cat}</span><strong>${products.filter((p) => p.cat1 === cat).length} 件商品</strong></div>`).join("")}
        <button class="btn primary" style="width:100%;margin-top:14px" onclick="setRoute('create')">开始开单</button>
      </div>
    </div>
  `;
}

function kpi(label, value, type) {
  return `<div class="card card-pad kpi"><div><div class="hint">${label}</div><div class="kpi-value">${value}</div></div><div class="kpi-icon">${icon(type)}</div></div>`;
}

function renderCustomers() {
  const q = state.query.trim();
  const list = customers.filter((c) => !q || [c.name, c.contact, c.phone].some((v) => v.includes(q)));
  return `
    <div class="toolbar">
      <input id="customerSearchInput" class="input" placeholder="搜索客户名称/联系人/电话" value="${state.query}" oninput="updatePageQuery(this)" />
      <div class="spacer"></div>
      <button class="btn primary" onclick="openModal('customer')">＋ 新增客户</button>
    </div>
    <div class="customer-list">${list.map(customerCard).join("")}</div>
  `;
}

function customerStats(customerId) {
  const list = orders.filter((order) => order.customerId === customerId && !String(order.no || "").startsWith("TH"));
  const total = list.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const last = list
    .map((order) => order.date)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || "-";
  return { total, last, count: list.length };
}

function customerCard(c) {
  const owner = byId(salesUsers, c.ownerId);
  const stats = customerStats(c.id);
  return `
    <div class="customer-card">
      <div>
        <div class="customer-name">${c.name} <span class="badge success">正常</span></div>
        <div class="meta"><span>☎ ${c.phone}</span><span>录入：${owner?.name || "-"}</span></div>
      </div>
      <div class="meta">
        <span>成交额：<strong>${money(stats.total)}</strong></span>
        <span>最近成交：${stats.last}</span>
        <span>共成交 ${stats.count} 单</span>
      </div>
      <div>
        ${actionButton("历史订单", "orders", `openModal('customerOrders','${c.id}')`)}
        ${actionButton("编辑", "edit", `openModal('customer','${c.id}')`)}
      </div>
    </div>
  `;
}

function renderProducts() {
  const q = state.productQuery.trim();
  const list = products.filter((p) => (state.category === "全部" || p.cat1 === state.category) && (!q || [p.name, p.spec, p.brand].some((v) => v.includes(q))));
  return `
    <div class="toolbar">
      <input id="productSearchInputLegacy" class="input" placeholder="搜索产品名称/编码/拼音" value="${state.productQuery}" oninput="updateProductQuery(this)" />
      <div class="spacer"></div>
      <button class="btn" onclick="showToast('产品列表已导出 CSV')">⇩ 下载</button>
      <button class="btn primary" onclick="openModal('product')">＋ 新增</button>
    </div>
    ${categoryTabs()}
    <div class="card table-wrap">
      <table>
        <thead><tr><th>品牌</th><th>类别</th><th>图片</th><th>商品名称</th><th>规格</th><th>单位</th><th>销售价</th><th>成本价</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${list.map((p) => `<tr><td>${p.brand}</td><td>${p.cat2}</td><td><div class="material-thumb" style="width:42px;height:32px;--thumb:${p.color}"></div></td><td><strong>${p.name}</strong></td><td>${p.spec}</td><td>${p.unit}</td><td class="num">${money(p.price)}</td><td class="num">${money(p.cost)}</td><td><span class="badge success">${p.status}</span></td><td>${actionButton("编辑", "edit", `openModal('product','${p.id}')`)}${actionButton("删除", "delete", "showToast('演示中未删除真实数据')")}</td></tr>`).join("")}</tbody>
      </table>
    </div>
  `;
}

function categoryTabs() {
  return `<div class="category-tabs">${["全部", "木", "水电", "油", "瓦"].map((cat) => `<button class="${state.category === cat ? "active" : ""}" onclick="state.category='${cat}';render()">${cat}</button>`).join("")}</div>`;
}

function renderCreateOrder() {
  const customer = byId(customers, state.selectedCustomerId) || customers[0];
  const productList = products.filter((p) => (state.category === "全部" || p.cat1 === state.category) && (!state.productQuery || [p.name, p.spec, p.cat2].some((v) => v.includes(state.productQuery))));
  return `
    <div class="card card-pad" style="margin-bottom:16px">
      <div class="form-grid">
        <div class="field"><label>选择客户 *</label><select class="select" onchange="state.selectedCustomerId=this.value;render()">${customers.map((c) => `<option value="${c.id}" ${c.id === customer.id ? "selected" : ""}>${c.name} - ${c.phone}</option>`).join("")}</select></div>
        <div class="field"><label>代下单销售人员</label><select class="select" onchange="state.salesUserId=this.value">${salesUsers.map((u) => `<option value="${u.id}" ${u.id === state.salesUserId ? "selected" : ""}>${u.name}</option>`).join("")}</select></div>
        <div class="field"><label>送货地址 *</label><input class="input" value="${customer.address}" /></div>
        <div class="field"><label>收货人手机号 *</label><input class="input" value="${customer.phone}" /></div>
      </div>
    </div>
    <div class="product-layout">
      <div>
        <div class="toolbar">
          <input id="orderProductSearchInput" class="input" placeholder="搜索商品名称、编码、拼音..." value="${state.productQuery}" oninput="updateProductQuery(this)" />
          <button class="btn primary" onclick="openAiOrderModal()">AI 帮我开单</button>
        </div>
        ${categoryTabs()}
        <div class="product-grid">${productList.map(productCard).join("")}</div>
      </div>
      <aside class="card card-pad cart">
        <h3>${state.orderType === "return" ? "退货清单" : "购物车"}</h3>
        ${state.cart.length ? state.cart.map(cartLine).join("") : `<div class="empty">还没有选择商品</div>`}
        <div class="summary-row"><span>共 ${state.cart.reduce((s, i) => s + i.quantity, 0)} 件</span><span>合计</span></div>
        <div class="summary-row"><span></span><span class="summary-total">${money(cartTotal())}</span></div>
        <button class="btn primary" style="width:100%" onclick="saveOrder()">${state.orderType === "return" ? "生成退货单" : "去结算"}</button>
      </aside>
    </div>
  `;
}

function productCard(p) {
  return `
    <article class="product-card">
      <div class="material-thumb" style="--thumb:${p.color}"></div>
      <div>
        <h4 class="product-title">${p.name}</h4>
        <div class="product-spec">${p.cat1} · ${p.cat2}<br />${p.spec}<br />单位：${p.unit}</div>
        <div class="price">${money(p.price)}</div>
      </div>
      ${actionButton("加入购物车", "plus", `addToCart('${p.id}')`)}
    </article>
  `;
}

function addToCart(productId) {
  const line = state.cart.find((item) => item.productId === productId);
  if (line) line.quantity += 1;
  else {
    const p = byId(products, productId);
    state.cart.push({ productId, quantity: 1, price: p.price });
  }
  showToast(`已添加 ${byId(products, productId).name}`);
}

function cartLine(item) {
  const p = byId(products, item.productId);
  return `
    <div class="cart-line">
      <div><strong>${p.name}</strong><div class="hint">${p.spec} · ${p.unit}</div><div class="num">${money(item.price)} / ${p.unit}</div></div>
      <div>
        <div class="qty"><button onclick="changeQty('${p.id}',-1)">−</button><strong>${item.quantity}</strong><button onclick="changeQty('${p.id}',1)">＋</button></div>
        <div class="num" style="margin-top:8px;text-align:right">${money(item.quantity * item.price)}</div>
      </div>
    </div>
  `;
}

function changeQty(productId, delta) {
  const line = state.cart.find((item) => item.productId === productId);
  if (!line) return;
  line.quantity += delta;
  if (line.quantity <= 0) state.cart = state.cart.filter((item) => item.productId !== productId);
  render();
}

function cartTotal() {
  return state.cart.reduce((sum, item) => {
    const product = byId(products, item.productId) || {};
    return sum + Number(item.quantity || 0) * signedOrderPrice(product, item.price);
  }, 0);
}

function isPositiveReturnCharge(item = {}) {
  const name = String(item.name || byId(products, item.productId)?.name || "");
  return name.includes("运费") || name.includes("搬运费");
}

function signedOrderPrice(item, price) {
  const value = Math.abs(Number(price || 0));
  if (state.orderType !== "return") return value;
  return isPositiveReturnCharge(item) ? value : -value;
}

function openAiOrderModal() {
  state.aiDraft = null;
  state.aiLoading = false;
  state.aiError = "";
  state.aiText = "";
  state.aiGroups = [{ id: `ai-${Date.now()}`, cat1: "", cat2: "", content: "" }];
  state.aiActiveGroupId = state.aiGroups[0].id;
  state.modal = { type: "aiOrder" };
  render();
}

function addAiGroup() {
  const group = { id: `ai-${Date.now()}`, cat1: "", cat2: "", content: "" };
  state.aiGroups.push(group);
  state.aiActiveGroupId = group.id;
  state.aiDraft = null;
  render();
}

function removeAiGroup(groupId) {
  if (state.aiGroups.length === 1) return;
  state.aiGroups = state.aiGroups.filter((group) => group.id !== groupId);
  if (!state.aiGroups.some((group) => group.id === state.aiActiveGroupId)) state.aiActiveGroupId = state.aiGroups[0].id;
  state.aiDraft = null;
  render();
}

function setAiGroupCategory(groupId, cat1) {
  const group = state.aiGroups.find((item) => item.id === groupId);
  if (!group) return;
  group.cat1 = cat1;
  group.cat2 = "";
  state.aiDraft = null;
  render();
}

function setAiGroupSubcategory(groupId, cat2) {
  const group = state.aiGroups.find((item) => item.id === groupId);
  if (!group) return;
  group.cat2 = cat2;
  state.aiDraft = null;
  render();
}

function updateAiGroupText(groupId, value) {
  const group = state.aiGroups.find((item) => item.id === groupId);
  if (group) group.content = value;
  state.aiDraft = null;
  state.aiError = "";
}

async function analyzeAiOrder() {
  const validGroups = state.aiGroups.filter((group) => group.cat1 && group.content.trim());
  if (!validGroups.length || validGroups.length !== state.aiGroups.length) {
    state.aiError = "每个材料窗口都需要选择一级分类并填写材料内容。请逐个检查上方标签。";
    render();
    return;
  }
  state.aiLoading = true;
  state.aiError = "";
  render();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);
  try {
    const response = await fetch("/api/ai/order-draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ groups: validGroups, customerId: state.selectedCustomerId }),
      signal: controller.signal,
    });
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      throw new Error(response.ok ? "服务器返回内容异常" : `服务器请求失败（${response.status}）`);
    }
    if (!response.ok) throw new Error(data.error || "AI 识别失败");
    const resultCount = [data.matched, data.needsQuantity, data.uncertain, data.unmatched]
      .reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
    if (!resultCount) throw new Error("AI没有返回任何材料，请检查输入内容后重试");
    state.aiDraft = data;
    state.aiLoading = false;
    state.aiError = "";
    render();
  } catch (error) {
    state.aiLoading = false;
    state.aiError = error.name === "AbortError" ? "识别等待超时，请稍后重试；材料较多时可以减少单次分类窗口数量。" : error.message;
    render();
  } finally {
    clearTimeout(timeoutId);
  }
}

function addDraftLine(productId, quantity) {
  const product = byId(products, productId);
  if (!product) return false;
  const value = Number(quantity);
  if (!isPositiveInteger(value)) return false;
  const line = state.cart.find((item) => item.productId === productId);
  if (line) line.quantity += value;
  else state.cart.push({ productId, quantity: value, price: product.price });
  return true;
}

function rememberAiChoice(rawName, productId, learnAlias = false) {
  if (!rawName || !productId) return;
  const existing = state.aiLearnPairs.find((item) => item.rawName === rawName && item.productId === productId);
  if (existing) {
    existing.learnAlias = existing.learnAlias || Boolean(learnAlias);
    return;
  }
  state.aiLearnPairs.push({ rawName, productId, learnAlias: Boolean(learnAlias) });
}

function normalizeAiAliasText(value) {
  return String(value || "").toLowerCase().replace(/[\s，,。；;、（）()\[\]【】_-]+/g, "");
}

function shouldOfferAiAlias(rawName, productId) {
  if (!isAdmin()) return false;
  const product = byId(products, productId);
  const raw = normalizeAiAliasText(rawName);
  if (!product || !raw) return false;
  return ![product.name, product.spec, product.brand, ...(product.aliases || [])]
    .some((value) => normalizeAiAliasText(value) === raw);
}

function aiAliasCheckbox(key) {
  return [...document.querySelectorAll("[data-ai-learn-alias]")]
    .find((input) => input.dataset.aiLearnAlias === String(key));
}

function renderAiAliasConsent(key, rawName, productId = "") {
  if (!isAdmin()) return "";
  const visible = productId && shouldOfferAiAlias(rawName, productId);
  return `<label class="ai-alias-consent ${visible ? "" : "is-hidden"}" data-ai-alias-wrap="${html(key)}">
    <input type="checkbox" data-ai-learn-alias="${html(key)}" />
    <span>将“${html(rawName || "该叫法")}”加入所选商品的别名 / 关键词库</span>
  </label>`;
}

function selectAiCandidateChoice(input) {
  const key = input.dataset.aiCandidateGroup || "";
  const wrap = [...document.querySelectorAll("[data-ai-alias-wrap]")]
    .find((element) => element.dataset.aiAliasWrap === key);
  const checkbox = aiAliasCheckbox(key);
  if (wrap && checkbox) {
    const visible = shouldOfferAiAlias(input.dataset.aiRawName, input.value);
    wrap.classList.toggle("is-hidden", !visible);
    if (!visible) checkbox.checked = false;
  }
  const matchedPicker = input.closest("[data-ai-matched-line]")?.querySelector(".ai-matched-picker");
  const summary = matchedPicker?.querySelector(":scope > summary");
  if (matchedPicker && summary) {
    matchedPicker.classList.add("has-selection");
    summary.textContent = `已选择替换商品：${input.dataset.aiProductName || "请确认"}`;
  }
}

function aiCandidateFromProduct(product) {
  return {
    productId: product.id,
    name: product.name,
    spec: product.spec,
    unit: product.unit,
    price: product.price,
    cat1: product.cat1,
    cat2: product.cat2,
    imageUrl: product.imageUrl || "",
    recommendation: "在当前分类商品库中找到",
  };
}

function aiCandidateOption(product, key, rawName, orderIndex = "") {
  const reason = product.recommendation ? `<small class="ai-recommendation">${html(product.recommendation)}</small>` : "";
  return `<label class="ai-candidate-option">
    <input type="radio" name="ai-candidate-${html(key)}" value="${html(product.productId)}" data-ai-candidate-product data-ai-candidate-group="${html(key)}" data-ai-order-index="${html(orderIndex)}" data-ai-raw-name="${html(rawName || "")}" data-ai-product-name="${html(product.name || "")}" onchange="selectAiCandidateChoice(this)" />
    ${product.imageUrl ? `<img class="ai-candidate-thumb" src="${html(product.imageUrl)}" alt="" loading="lazy" />` : ""}
    <span><strong>${html(product.name)}</strong><small>${html(product.spec || "无规格")} · ${html(product.unit || "-")} · ${html(product.cat1 || "-")}${product.cat2 ? " / " + html(product.cat2) : ""}</small>${reason}</span>
    <b>${money(product.price)}</b>
  </label>`;
}

function aiSearchSubcategories(cat1) {
  return [...new Set(products.filter((product) => !cat1 || product.cat1 === cat1).map((product) => product.cat2).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function aiSearchScopeControls(key, rawName, cat1, cat2, orderIndex) {
  const categories = PRODUCT_CATEGORIES.filter((item) => item !== "全部");
  const subcategories = aiSearchSubcategories(cat1);
  return `<div class="ai-search-scope">
    <select class="select" data-ai-search-cat1="${html(key)}" onchange="changeAiSearchCategory(this,${jsArg(key)},${jsArg(rawName)},${jsArg(orderIndex)})">
      <option value="">全部商品</option>
      ${categories.map((item) => `<option value="${html(item)}" ${item === cat1 ? "selected" : ""}>${html(item)}</option>`).join("")}
    </select>
    <select class="select" data-ai-search-cat2="${html(key)}" onchange="refreshAiManualSearch(${jsArg(key)},${jsArg(rawName)},${jsArg(orderIndex)})">
      <option value="">全部二级分类</option>
      ${subcategories.map((item) => `<option value="${html(item)}" ${item === cat2 ? "selected" : ""}>${html(item)}</option>`).join("")}
    </select>
  </div>`;
}

function changeAiSearchCategory(select, key, rawName, orderIndex) {
  const cat2Select = [...document.querySelectorAll("[data-ai-search-cat2]")]
    .find((element) => element.dataset.aiSearchCat2 === String(key));
  if (cat2Select) {
    cat2Select.innerHTML = `<option value="">全部二级分类</option>${aiSearchSubcategories(select.value).map((item) => `<option value="${html(item)}">${html(item)}</option>`).join("")}`;
  }
  refreshAiManualSearch(key, rawName, orderIndex);
}

function refreshAiManualSearch(key, rawName, orderIndex) {
  const input = [...document.querySelectorAll("[data-ai-manual-input]")]
    .find((element) => element.dataset.aiManualInput === String(key));
  if (input) updateAiManualSearch(input, key, rawName, "", "", orderIndex);
}

function aiManualCandidateScore(product, query) {
  return productSearchScore(product, query);
}

function updateAiManualSearch(input, key, rawName, cat1, cat2, orderIndex = "") {
  const query = input.value.trim();
  const cat1Select = [...document.querySelectorAll("[data-ai-search-cat1]")]
    .find((element) => element.dataset.aiSearchCat1 === String(key));
  const cat2Select = [...document.querySelectorAll("[data-ai-search-cat2]")]
    .find((element) => element.dataset.aiSearchCat2 === String(key));
  const selectedCat1 = cat1Select ? cat1Select.value : cat1;
  const selectedCat2 = cat2Select ? cat2Select.value : cat2;
  const candidates = products
    .filter((product) => isProductActive(product))
    .filter((product) => !selectedCat1 || product.cat1 === selectedCat1)
    .filter((product) => !selectedCat2 || product.cat2 === selectedCat2)
    .map((product) => ({ product, score: aiManualCandidateScore(product, query) }))
    .filter((entry) => !query || entry.score > 0)
    .sort((a, b) => b.score - a.score || String(a.product.name).localeCompare(String(b.product.name), "zh-CN"))
    .slice(0, 16)
    .map((entry) => entry.product)
    .map(aiCandidateFromProduct);
  const results = [...document.querySelectorAll("[data-ai-manual-results]")]
    .find((element) => element.dataset.aiManualResults === String(key));
  if (results) {
    results.innerHTML = candidates.length
      ? candidates.map((product) => aiCandidateOption(product, key, rawName, orderIndex)).join("")
      : `<div class="ai-manual-empty">当前搜索范围没有找到商品，请更换关键词、分类或选择“全部商品”。</div>`;
  }
}

function applyAiDraft() {
  if (!state.aiDraft) return;
  const entries = [];
  document.querySelectorAll("[data-ai-matched-line]").forEach((line) => {
    const replacement = line.querySelector("[data-ai-candidate-product]:checked");
    const quantityInput = line.querySelector("[data-ai-matched-quantity]");
    entries.push({
      orderIndex: Number(line.dataset.aiOrderIndex || 0),
      productId: replacement?.value || line.dataset.aiProductId,
      quantity: quantityInput?.value || "",
      rawName: line.dataset.aiRawName || "",
      lineKey: line.dataset.aiLineKey || "",
    });
  });
  document.querySelectorAll("[data-ai-quantity-product]").forEach((input) => {
    entries.push({ orderIndex: Number(input.dataset.aiOrderIndex || 0), productId: input.dataset.aiQuantityProduct, quantity: input.value, rawName: input.dataset.aiRawName, lineKey: input.dataset.aiLineKey });
  });
  document.querySelectorAll("[data-ai-candidate-product]:checked").forEach((input) => {
    if (input.closest("[data-ai-matched-line]")) return;
    const key = input.dataset.aiCandidateGroup;
    const quantityInput = [...document.querySelectorAll("[data-ai-candidate-quantity]")]
      .find((element) => element.dataset.aiCandidateQuantity === key);
    entries.push({ orderIndex: Number(input.dataset.aiOrderIndex || 0), productId: input.value, quantity: quantityInput ? quantityInput.value : "", rawName: input.dataset.aiRawName, lineKey: key });
  });
  const invalidEntries = entries.filter((entry) => !isPositiveInteger(entry.quantity));
  if (invalidEntries.length) {
    document.querySelectorAll("[data-ai-matched-quantity], [data-ai-quantity-product], [data-ai-candidate-quantity]").forEach((input) => {
      setQuantityInputValidity(input);
    });
    const firstInvalidKey = invalidEntries[0].lineKey;
    const firstInvalid = [...document.querySelectorAll("[data-ai-matched-quantity], [data-ai-quantity-product], [data-ai-candidate-quantity]")]
      .find((input) => input.dataset.aiLineKey === firstInvalidKey || input.dataset.aiCandidateQuantity === firstInvalidKey)
      || document.querySelector(".quantity-input-invalid");
    firstInvalid?.focus();
    firstInvalid?.scrollIntoView({ block: "center", behavior: "smooth" });
    alert("商品数量必须为大于 0 的整数，请检查标红的数量。");
    return;
  }
  entries.sort((a, b) => a.orderIndex - b.orderIndex).forEach((entry) => {
    const learnAlias = Boolean(aiAliasCheckbox(entry.lineKey)?.checked);
    if (addDraftLine(entry.productId, entry.quantity)) rememberAiChoice(entry.rawName, entry.productId, learnAlias);
  });
  persistCart();
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  closeModal();
  showToast(`AI 已填入 ${count} 件商品，请确认后保存订单`);
}

async function saveOrder() {
  if (!state.cart.length) {
    alert("请先添加商品。");
    return;
  }
  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: state.orderType,
        customerId: state.selectedCustomerId,
        salesUserId: state.salesUserId,
        amount: cartTotal(),
        items: state.cart.map((item) => ({ ...item })),
        aiLearnPairs: state.aiLearnPairs,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存订单失败");
    orders = [data.order, ...orders];
    state.cart = [];
    state.aiLearnPairs = [];
    state.route = "orders";
    state.modal = { type: "document", id: data.order.id };
    showToast(state.orderType === "return" ? "退货单已生成" : "销售单已生成");
  } catch (error) {
    alert(error.message);
  }
}

function renderOrders() {
  const list = orders.filter((o) => state.orderStatus === "全部" || o.status === state.orderStatus);
  return `
    <div class="toolbar">
      <input class="input" placeholder="搜索订单号/客户名称/手机号" />
      <select class="select" style="max-width:150px" onchange="state.orderStatus=this.value;render()">${["全部", "待确认", "已确认", "已发货", "已完成", "已取消", "已退货"].map((s) => `<option ${state.orderStatus === s ? "selected" : ""}>${s}</option>`).join("")}</select>
      <div class="spacer"></div>
      <button class="btn" onclick="setRoute('create')">＋ 开销售单</button>
      <button class="btn primary" onclick="state.orderType='sale';setRoute('create')">开单</button>
    </div>
    <div class="order-list">${list.map(orderCard).join("")}</div>
  `;
}

function orderCard(order) {
  const c = byId(customers, order.customerId);
  const s = byId(salesUsers, order.salesUserId);
  return `
    <div class="order-card">
      <div><div class="order-no">${order.no} ${statusBadge(order.status)} <span class="badge info">${order.payStatus}</span></div><div class="meta"><span>${c?.name}</span><span>${order.date}</span><span>销售：${s?.name}</span></div></div>
      <div class="meta"><span>${order.items.length} 项商品</span><span>客户电话：${c?.phone}</span></div>
      <div style="text-align:right"><div class="price">${money(order.amount)}</div>${actionButton("查看单据", "view", `openModal('document','${order.id}')`)}${actionButton("编辑", "edit", `openModal('editOrder','${order.id}')`)}${actionButton("改状态", "refresh", `cycleStatus('${order.id}')`)}</div>
    </div>
  `;
}

function statusBadge(status) {
  const kind = status === "已完成" ? "success" : status === "待确认" ? "warning" : status === "已取消" || status === "已退货" ? "danger" : "info";
  return `<span class="badge ${kind}">${status}</span>`;
}

function cycleStatus(orderId) {
  const order = byId(orders, orderId);
  const flow = ["待确认", "已确认", "已发货", "已完成"];
  order.status = flow[(flow.indexOf(order.status) + 1) % flow.length] || "待确认";
  showToast("状态更新成功");
}

function renderUsers() {
  return `
    <div class="toolbar">
      <input id="userSearchInput" class="input" placeholder="搜索姓名/手机号/角色" value="${state.query}" oninput="updatePageQuery(this)" />
      <div class="spacer"></div>
      <button class="btn primary" onclick="openModal('user')">＋ 添加人员</button>
    </div>
    <div class="card table-wrap">
      <table><thead><tr><th>姓名</th><th>登录手机号</th><th>登录密码</th><th>角色定位</th><th>账号状态</th><th>权限说明</th><th>操作</th></tr></thead>
      <tbody>${filteredUsers().map((u) => `<tr><td><strong>${u.name}</strong></td><td>${u.phone}</td><td class="num">${maskPassword(u.password)}</td><td>${u.role}</td><td><span class="badge ${u.status === "启用" ? "success" : "danger"}">${u.status}</span></td><td>${roleDesc(u.role)}</td><td>${actionButton("编辑", "edit", `openModal('user','${u.id}')`)}${actionButton(u.status === "启用" ? "停用" : "启用", "refresh", `toggleUserStatus('${u.id}')`)}</td></tr>`).join("")}</tbody></table>
    </div>
  `;
}

function filteredUsers() {
  const q = state.query.trim();
  return salesUsers.filter((u) => !q || [u.name, u.phone, u.role].some((v) => v.includes(q)));
}

function roleDesc(role) {
  if (role === "超级管理员") return "全部功能，包含人员管理";
  if (role === "管理员") return "管理客户、产品、订单和人员";
  if (role === "销售人员") return "创建订单，管理本人客户和订单";
  if (role === "财务") return "查看订单金额、回款和导出单据";
  return "按角色配置权限";
}

function maskPassword(password) {
  return password ? "•".repeat(Math.min(String(password).length, 8)) : "-";
}

async function toggleUserStatus(id) {
  const user = byId(salesUsers, id);
  if (!user) return;
  if (user.id === state.user.id) {
    alert("不能停用当前登录账号。");
    return;
  }
  const nextStatus = user.status === "启用" ? "停用" : "启用";
  try {
    const response = await fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "更新状态失败");
    Object.assign(user, data.user);
    showToast("人员状态已更新");
  } catch (error) {
    alert(error.message);
  }
}

function openModal(type, id = "") {
  state.modal = { type, id };
  render();
}

function closeModal() {
  state.modal = null;
  render();
}

function renderModal() {
  if (!state.modal) return "";
  const { type, id } = state.modal;
  if (type === "customer") return customerModal(id);
  if (type === "customerOrders") return customerOrdersModal(id);
  if (type === "product") return productModal(id);
  if (type === "productImage") return productImageModal(id);
  if (type === "document") return documentModal(id);
  if (type === "delivery") return deliveryModal(id);
  if (type === "editOrder") return editOrderModal(id);
  if (type === "user") return userModal();
  if (type === "aiOrder") return aiOrderModal();
  return "";
}

function aiOrderModal() {
  const customer = byId(customers, state.selectedCustomerId);
  const draft = state.aiDraft;
  const cat1Options = [...new Set(products.map((product) => product.cat1).filter(Boolean))];
  const activeGroup = state.aiGroups.find((group) => group.id === state.aiActiveGroupId) || state.aiGroups[0];
  const cat2Options = activeGroup ? [...new Set(products.filter((product) => product.cat1 === activeGroup.cat1).map((product) => product.cat2).filter(Boolean))] : [];
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal ai-modal">
        <div class="modal-head">
          <div><h3>AI 帮我开单</h3><div class="hint">当前客户：${customer ? `${customer.name} - ${customer.phone}` : "请先选择客户"}。AI 只匹配商品库商品，生成后还需要销售确认保存。</div></div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="ai-group-tabs">${state.aiGroups.map((group, index) => `<button class="ai-group-tab ${group.id === state.aiActiveGroupId ? "active" : ""}" onclick="state.aiActiveGroupId='${html(group.id)}';render()"><span>${html(group.cat2 || group.cat1 || `分类 ${index + 1}`)}</span>${state.aiGroups.length > 1 ? `<i onclick="event.stopPropagation();removeAiGroup('${html(group.id)}')">×</i>` : ""}</button>`).join("")}<button class="ai-group-add" onclick="addAiGroup()">＋ 添加分类窗口</button></div>
          ${activeGroup ? `<section class="ai-group-panel"><div class="ai-group-filters"><div class="field"><label>一级分类 *</label><select class="select" onchange="setAiGroupCategory('${html(activeGroup.id)}',this.value)"><option value="">请选择一级分类</option>${cat1Options.map((cat1) => `<option value="${html(cat1)}" ${activeGroup.cat1 === cat1 ? "selected" : ""}>${html(cat1)}</option>`).join("")}</select></div><div class="field"><label>二级分类（选填）</label><select class="select" ${activeGroup.cat1 ? "" : "disabled"} onchange="setAiGroupSubcategory('${html(activeGroup.id)}',this.value)"><option value="">全部二级分类</option>${cat2Options.map((cat2) => `<option value="${html(cat2)}" ${activeGroup.cat2 === cat2 ? "selected" : ""}>${html(cat2)}</option>`).join("")}</select></div></div><div class="field"><label>该分类下的材料清单</label><textarea class="textarea ai-textarea" oninput="updateAiGroupText('${html(activeGroup.id)}',this.value)" placeholder="只填写属于当前分类的材料，例如：20管6根，20弯头30个...">${html(activeGroup.content)}</textarea></div><div class="hint">匹配范围：${activeGroup.cat1 ? html(activeGroup.cat1) : "尚未选择"}${activeGroup.cat2 ? ` / ${html(activeGroup.cat2)}` : activeGroup.cat1 ? " / 全部二级分类" : ""}。系统不会跨出这个范围推荐商品。</div></section>` : ""}
          <div class="ai-actions">
            <button class="btn primary" onclick="analyzeAiOrder()" ${state.aiLoading ? "disabled" : ""}>${state.aiLoading ? "识别中..." : "开始识别"}</button>
            <span class="hint">${state.aiLoading ? "正在提交分类材料并等待AI解析，请不要关闭窗口。" : "唯一可靠商品自动匹配；不确定就留给你确认或进入未匹配。"}</span>
          </div>
          ${state.aiError ? `<div class="ai-error">${html(state.aiError)}</div>` : ""}
          ${draft ? renderAiDraft(draft) : ""}
        </div>
        <div class="modal-foot">
          <button class="btn" onclick="closeModal()">取消</button>
          <button class="btn primary" onclick="applyAiDraft()" ${draft ? "" : "disabled"}>填入开单页面</button>
        </div>
      </div>
    </div>
  `;
}

function renderAiDraft(draft) {
  const all = [...(draft.matched || []), ...(draft.needsQuantity || []), ...(draft.uncertain || []), ...(draft.unmatched || [])];
  const groupIds = [...new Set(all.map((item) => item.groupId || "ungrouped"))];
  return `<div class="ai-result">${groupIds.map((groupId) => {
    const matched = (draft.matched || []).filter((item) => (item.groupId || "ungrouped") === groupId);
    const needsQuantity = (draft.needsQuantity || []).filter((item) => (item.groupId || "ungrouped") === groupId);
    const uncertain = (draft.uncertain || []).filter((item) => (item.groupId || "ungrouped") === groupId);
    const unmatched = (draft.unmatched || []).filter((item) => (item.groupId || "ungrouped") === groupId);
    const title = (all.find((item) => (item.groupId || "ungrouped") === groupId) || {}).groupTitle || "识别结果";
    const issueCount = needsQuantity.length + uncertain.length + unmatched.length;
    return `<details class="ai-result-group" ${issueCount ? "open" : ""}><summary><strong>${html(title)}</strong><span><b class="success-text">已匹配 ${matched.length}</b>${issueCount ? ` · <b class="warning-text">需处理 ${issueCount}</b>` : ""}</span></summary><div class="ai-result-group-body">${renderAiMatched(matched)}${renderAiNeedsQuantity(needsQuantity)}${renderAiUncertain(uncertain)}${renderAiUnmatched(unmatched)}</div></details>`;
  }).join("")}</div>`;
}

function renderAiMatched(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>已匹配商品</h4>
      ${list.map((item, index) => {
        const key = item.lineKey || `${item.groupId || "matched"}-${index}`;
        return `
          <div class="ai-line-wrap ai-matched-line" data-ai-matched-line data-ai-line-key="${html(key)}" data-ai-product-id="${html(item.productId)}" data-ai-order-index="${html(item.orderIndex)}" data-ai-raw-name="${html(item.rawName || "")}">
            <div class="ai-line ai-matched-row">
              <div class="ai-matched-product">
                <strong>${html(orderItemDetails(item).label)}</strong>
                <div class="hint">${html(item.unit)} · 原文：${html(item.rawName || "-")}</div>
                ${item.recommendation ? `<div class="ai-match-reason">${html(item.recommendation)}</div>` : ""}
              </div>
              <label class="ai-matched-quantity"><span>数量</span><input class="input ai-small-input${isPositiveInteger(item.quantity) ? "" : " quantity-input-invalid"}" type="number" min="1" step="1" inputmode="numeric" value="${html(item.quantity)}" data-ai-matched-quantity oninput="setQuantityInputValidity(this)" /></label>
              <div class="num ai-matched-price">${money(item.price)}</div>
              <button type="button" class="icon-btn danger ai-matched-delete" title="删除该商品" aria-label="删除该商品" onclick="removeAiMatchedLine(this)">${svgIcon("delete")}</button>
            </div>
            <details class="ai-manual-picker ai-matched-picker">
              <summary>匹配有误？更换商品</summary>
              ${aiSearchScopeControls(key, item.rawName, item.cat1 || "", item.cat2 || "", item.orderIndex)}
              <div class="ai-manual-search"><input class="input" data-ai-manual-input="${html(key)}" placeholder="输入正确商品的名称、规格、品牌或关键词" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" oninput="updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" /></div>
              <div class="ai-candidate-list ai-manual-results" data-ai-manual-results="${html(key)}"><div class="ai-manual-empty">输入关键词后即时显示匹配商品。</div></div>
            </details>
            ${renderAiAliasConsent(key, item.rawName)}
          </div>
        `;
      }).join("")}
    </section>
  `;
}

function removeAiMatchedLine(button) {
  const line = button.closest("[data-ai-matched-line]");
  if (!line) return;
  const section = line.closest(".ai-section");
  line.classList.add("is-removing");
  setTimeout(() => {
    line.remove();
    if (section && !section.querySelector("[data-ai-matched-line]")) section.remove();
  }, 160);
}

function renderAiNeedsQuantity(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>需要补数量</h4>
      ${list.map((item) => `<div class="ai-line-wrap"><div class="ai-line"><div><strong>${html(orderItemDetails(item).label)}</strong><div class="hint">${html(item.unit)} · 原文：${html(item.rawName || "-")}</div>${item.quantityError ? `<div class="quantity-error-text">${html(item.quantityError)}</div>` : ""}${item.recommendation ? `<div class="ai-match-reason">${html(item.recommendation)}</div>` : ""}</div><input class="input ai-small-input${item.quantity && !isPositiveInteger(item.quantity) ? " quantity-input-invalid" : ""}" type="number" min="1" step="1" inputmode="numeric" value="${html(item.quantity || "")}" placeholder="整数数量" data-ai-quantity-product="${html(item.productId)}" data-ai-line-key="${html(item.lineKey)}" data-ai-order-index="${html(item.orderIndex)}" data-ai-raw-name="${html(item.rawName || "")}" oninput="setQuantityInputValidity(this)" /><div class="num">${money(item.price)}</div></div>${renderAiAliasConsent(item.lineKey, item.rawName, item.productId)}</div>`).join("")}
    </section>
  `;
}

function renderAiUncertain(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>需要选择商品</h4>
      ${list.map((item, index) => { const key = item.lineKey || `${item.groupId || "group"}-${index}`; const candidates = item.candidates || []; return `<div class="ai-candidate-block"><div class="ai-candidate-head"><div><strong>原文：${html(item.rawName || "-")}</strong><div class="hint">候选按客户习惯、出单频率和数量排序；没有合适商品时可在下方搜索。</div></div><input class="input ai-small-input${item.quantity && !isPositiveInteger(item.quantity) ? " quantity-input-invalid" : ""}" type="number" min="1" step="1" inputmode="numeric" value="${html(item.quantity || "")}" placeholder="整数数量" data-ai-candidate-quantity="${html(key)}" oninput="setQuantityInputValidity(this)" /></div><div class="ai-candidate-list">${candidates[0] ? aiCandidateOption(candidates[0], key, item.rawName, item.orderIndex) : ""}${candidates.length > 1 ? `<details class="ai-more-candidates"><summary>展开其他 ${candidates.length - 1} 个候选</summary>${candidates.slice(1).map((product) => aiCandidateOption(product, key, item.rawName, item.orderIndex)).join("")}</details>` : ""}</div><details class="ai-manual-picker"><summary>搜索其他商品</summary>${aiSearchScopeControls(key, item.rawName, item.cat1 || "", item.cat2 || "", item.orderIndex)}<div class="ai-manual-search"><input class="input" data-ai-manual-input="${html(key)}" placeholder="输入商品名称、规格、品牌或关键词" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" oninput="updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" /></div><div class="ai-candidate-list ai-manual-results" data-ai-manual-results="${html(key)}"><div class="ai-manual-empty">输入关键词后即时显示匹配商品。</div></div></details>${renderAiAliasConsent(key, item.rawName)}</div>`; }).join("")}
    </section>
  `;
}

function renderAiUnmatched(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>未匹配商品</h4>
      ${list.map((item, index) => { const key = item.lineKey || `${item.groupId || "unmatched"}-${index}`; const suggestions = item.suggestions || []; return `<div class="ai-candidate-block ai-unmatched-block"><div class="ai-candidate-head"><div><strong>原文：${html(item.rawName || "-")}</strong><div class="hint">${html(item.note || "未找到足够可靠的商品，请手动选择。")}</div></div><input class="input ai-small-input${item.quantity && !isPositiveInteger(item.quantity) ? " quantity-input-invalid" : ""}" type="number" min="1" step="1" inputmode="numeric" value="${html(item.quantity || "")}" placeholder="整数数量" data-ai-candidate-quantity="${html(key)}" oninput="setQuantityInputValidity(this)" /></div>${aiSearchScopeControls(key, item.rawName, item.cat1 || "", item.cat2 || "", item.orderIndex)}<div class="ai-manual-search"><input class="input" data-ai-manual-input="${html(key)}" placeholder="输入商品名称、规格、品牌或关键词" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" oninput="updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" /></div><div class="ai-candidate-list ai-manual-results" data-ai-manual-results="${html(key)}">${suggestions.length ? suggestions.map((product) => aiCandidateOption(product, key, item.rawName, item.orderIndex)).join("") : `<div class="ai-manual-empty">输入关键词后即时显示匹配商品。</div>`}</div>${renderAiAliasConsent(key, item.rawName)}</div>`; }).join("")}
    </section>
  `;
}
function customerModal(id) {
  const c = byId(customers, id) || {};
  const ownerId = c.ownerId || state.user?.id || "";
  return modalShell(id ? "编辑客户" : "新增客户", `
    <div class="form-grid">
      <div class="field"><label>客户名称 *</label><input id="customerName" class="input" value="${html(c.name || "")}" /></div>
      <div class="field"><label>联系人</label><input id="customerContact" class="input" value="${html(c.contact || "")}" /></div>
      <div class="field"><label>联系电话 *</label><input id="customerPhone" class="input" value="${html(c.phone || "")}" /></div>
      <div class="field"><label>邮箱</label><input id="customerEmail" class="input" value="${html(c.email || "")}" /></div>
      ${canChooseSalesperson() ? `<div class="field"><label>所属销售</label><select id="customerOwner" class="select">${activeSalesUsers().map((user) => `<option value="${html(user.id)}" ${user.id === ownerId ? "selected" : ""}>${html(user.name)}</option>`).join("")}</select></div>` : ""}
      <div class="field" style="grid-column:1/-1"><label>地址</label><input id="customerAddress" class="input" value="${html(c.address || "")}" placeholder="请输入地址" /></div>
    </div>
  `, "保存客户", `saveCustomer(${jsArg(id || "")})`);
}

async function saveCustomer(id) {
  const payload = {
    name: document.getElementById("customerName")?.value.trim() || "",
    contact: document.getElementById("customerContact")?.value.trim() || "",
    phone: document.getElementById("customerPhone")?.value.trim() || "",
    email: document.getElementById("customerEmail")?.value.trim() || "",
    address: document.getElementById("customerAddress")?.value.trim() || "",
    ownerId: document.getElementById("customerOwner")?.value || state.user?.id || "",
  };
  if (!payload.name || !payload.phone) {
    alert("客户名称和联系电话必填。");
    return;
  }
  try {
    const response = await fetch(id ? `/api/customers/${encodeURIComponent(id)}` : "/api/customers", {
      method: id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存客户失败");
    if (id) {
      const index = customers.findIndex((item) => item.id === id);
      if (index >= 0) customers[index] = data.customer;
    } else {
      customers.unshift(data.customer);
      state.selectedCustomerId = data.customer.id;
      resetOrderDraft(data.customer);
    }
    state.query = "";
    state.customerOwnerFilter = "全部";
    closeModal();
    showToast(id ? "客户信息已更新" : "客户已添加");
  } catch (error) {
    alert(error.message);
  }
}

function productModal(id) {
  const p = byId(products, id) || {};
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal side">
        <div class="modal-head"><h3>${id ? "编辑产品" : "新增产品"}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="product-image-editor">
            ${p.imageUrl ? `<img src="${html(p.imageUrl)}" alt="${html(p.name || "商品图片")}" />` : `<div class="product-image-placeholder">暂无商品图片</div>`}
            <div><label class="btn" for="productImageFile">选择图片</label><input id="productImageFile" type="file" accept="image/png,image/jpeg,image/webp" hidden onchange="previewProductImage(this)" /><div class="hint">支持 PNG、JPG、WebP，文件不超过 3MB。保存商品时一并上传。</div></div>
          </div>
          <div class="form-grid">
            ${field("产品品牌 *", p.brand || "")}
            ${field("产品名称 *", p.name || "")}
            ${field("规格型号", p.spec || "")}
            ${selectField("一级分类 *", ["木", "水电", "油", "瓦"], p.cat1)}
            ${field("二级分类 *", p.cat2 || "")}
            ${field("单位", p.unit || "")}
            ${field("销售价 *", p.price || "")}
            ${field("成本价", p.cost || "")}
          </div>
          <div class="field"><label>描述</label><textarea class="textarea" placeholder="请输入产品描述"></textarea></div>
          <div class="card card-pad"><div class="hint">产品图片：演示原型中以建材纹理缩略图代替，正式版会支持图片上传。</div></div>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="showToast('产品信息已保存');closeModal()">确认</button></div>
      </div>
    </div>
  `;
}

function productImageModal(id) {
  const product = byId(products, id);
  if (!product) return "";
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal product-image-modal">
        <div class="modal-head"><div><h3>${html(product.name)}</h3><div class="hint">${html(product.spec || "无规格")}</div></div><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          ${product.imageUrl ? `<img class="product-image-large" src="${html(product.imageUrl)}" alt="${html(product.name)}" />` : `<div class="product-image-empty">该商品暂未上传图片</div>`}
        </div>
        ${isAdmin() ? `<div class="modal-foot"><button class="btn" onclick="closeModal();openModal('product',${jsArg(product.id)})">编辑商品图片</button></div>` : ""}
      </div>
    </div>
  `;
}

function previewProductImage(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (file.size > 3 * 1024 * 1024) {
    alert("图片不能超过 3MB。");
    input.value = "";
    return;
  }
  const wrap = input.closest(".product-image-editor");
  const preview = wrap && wrap.querySelector("img, .product-image-placeholder");
  if (!preview) return;
  const url = URL.createObjectURL(file);
  if (preview.tagName === "IMG") preview.src = url;
  else preview.outerHTML = `<img src="${html(url)}" alt="商品图片预览" />`;
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

async function uploadProductImage(productId, file) {
  if (!file) return null;
  const response = await fetch(`/api/products/${encodeURIComponent(productId)}/image`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ image: await fileAsDataUrl(file) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "商品图片上传失败");
  return data.product;
}

function customerOrdersModal(id) {
  const c = byId(customers, id);
  const list = orders.filter((o) => o.customerId === id);
  return modalShell(`${c.name} 的历史订单`, `<div class="order-list">${list.length ? list.map(orderCard).join("") : "<div class='empty'>暂无订单</div>"}</div>`, "关闭", "closeModal()");
}

function editOrderModal(id) {
  const order = byId(orders, id);
  return modalShell("编辑订单", `
    <div class="form-grid">
      ${selectField("客户", customers.map((c) => c.name), byId(customers, order.customerId)?.name)}
      ${selectField("订单状态", ["待确认", "已确认", "已发货", "已完成", "已取消"], order.status)}
    </div>
    <div class="card table-wrap" style="margin-top:14px"><table><thead><tr><th>商品</th><th>数量</th><th>单价</th><th>小计</th></tr></thead><tbody>${order.items.map((item) => { const p = byId(products, item.productId); return `<tr><td>${p.name}</td><td>${item.quantity}</td><td>${money(item.price)}</td><td>${money(item.price * item.quantity)}</td></tr>`; }).join("")}</tbody></table></div>
  `, "保存修改", "showToast('订单已保存');closeModal()");
}

function deliveryModal(id) {
  const order = byId(orders, id);
  if (!order) return "";
  const customer = byId(customers, order.customerId) || {};
  const sales = byId(salesUsers, order.salesUserId) || {};
  const rows = getDisplayRows(order);
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal">
        <div class="modal-head"><h3>订单详情 - 送货单</h3><div class="document-actions"><button class="btn export-btn" onclick="downloadDeliveryImage('${order.id}')">${svgIcon("image")}<span>下载送货单</span></button><button class="icon-btn" onclick="closeModal()">×</button></div></div>
        <div class="modal-body">
          <div class="doc-preview delivery-preview">
            <h2>送货单</h2>
            <div class="doc-subtitle">材达家建材销售系统</div>
            <div class="doc-info">
              <div><span>客户：</span>${html(customer.name || "-")}</div>
              <div><span>单号：</span>${html(order.no || "-")}</div>
              <div><span>日期：</span>${html(order.date || "-")}</div>
              <div class="right"><span>销售：</span>${html(sales.name || "-")}</div>
              <div class="doc-address"><span>地址：</span>${html(order.address || customer.address || "-")}</div>
            </div>
            <table><thead><tr><th>编号</th><th>商品名称</th><th>单位</th><th>数量</th></tr></thead><tbody>${rows.map((row) => row.empty ? `<tr><td>${row.index}</td><td></td><td></td><td></td></tr>` : `<tr><td>${row.index}</td><td>${html(row.name)}</td><td>${html(row.unit)}</td><td>${html(row.quantity)}</td></tr>`).join("")}</tbody></table>
            <div class="delivery-bottom"><div><strong>收货电话：</strong>${html(order.phone || customer.phone || "-")}</div><div><strong>备注：</strong>${html(order.remark || "无")}</div></div>
          </div>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">关闭</button></div>
      </div>
    </div>
  `;
}

function documentModal(id) {
  const order = byId(orders, id);
  const c = byId(customers, order.customerId);
  const s = byId(salesUsers, order.salesUserId);
  const title = order.no.startsWith("TH") || order.status === "已退货" ? "退货单" : "销售订单";
  const rows = getDisplayRows(order);
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal order-document-modal">
        <div class="modal-head"><h3>订单详情 - ${title}</h3><button class="icon-btn modal-close-button" title="关闭" aria-label="关闭" onclick="closeModal()">${svgIcon("close")}</button></div>
        <div class="modal-body">
          <div class="document-toolbar">
            <div class="document-phone"><span>销售电话</span><strong>${html(s?.phone || c.phone || "-")}</strong></div>
            <div class="document-actions">
              <button class="btn export-btn" onclick="printOrder('${order.id}')">${svgIcon("print")}<span>打印</span></button>
              <button class="btn export-btn" onclick="copyOrderText('${order.id}')">${svgIcon("copy")}<span>导出文字版</span></button>
              <button class="btn export-btn primary" onclick="downloadOrderImage('${order.id}')">${svgIcon("image")}<span>导出图片</span></button>
            </div>
          </div>
          <div class="doc-preview">
            <h2>${title}</h2>
            <div class="doc-subtitle">材达家建材销售系统</div>
            <div class="doc-info">
              <div><span>客户：</span>${c.name}</div>
              <div><span>单号：</span>${order.no}</div>
              <div><span>日期：</span>${order.date}</div>
              <div class="right"><span>销售：</span>${s?.name || "-"}</div>
              <div class="doc-address"><span>地址：</span>${html(order.address || c.address || "-")}</div>
            </div>
            <table><thead><tr><th>编号</th><th>商品名称</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr></thead><tbody>${rows.map((row) => row.empty ? `<tr><td>${row.index}</td><td></td><td></td><td></td><td></td><td></td></tr>` : `<tr><td>${row.index}</td><td>${html(row.name)}</td><td>${html(row.unit)}</td><td>${row.quantity}</td><td>${money(row.price)}</td><td>${money(row.amount)}</td></tr>`).join("")}</tbody></table>
            <div class="doc-bottom">
              <div><strong>合计大写：</strong>${amountToChinese(order.amount)}<br /><strong>销售电话：</strong>${maskPhone(s?.phone || c.phone)}</div>
              <div class="doc-total"><span>此单合计金额：</span><strong>${money(order.amount)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function userModal() {
  const user = byId(salesUsers, state.modal.id) || {};
  return modalShell(user.id ? "编辑人员" : "添加人员", `
    <div class="form-grid">
      <div class="field"><label>姓名</label><input id="personName" class="input" value="${user.name || ""}" placeholder="请输入姓名" /></div>
      <div class="field"><label>登录手机号 *</label><input id="personPhone" class="input" value="${user.phone || ""}" placeholder="请输入手机号" /></div>
      <div class="field"><label>登录密码 *</label><input id="personPassword" class="input" value="${user.password || ""}" placeholder="请输入密码" /></div>
      <div class="field"><label>角色定位</label><select id="personRole" class="select">${["超级管理员", "管理员", "销售人员", "财务"].map((role) => `<option ${role === (user.role || "销售人员") ? "selected" : ""}>${role}</option>`).join("")}</select></div>
      <div class="field"><label>账号状态</label><select id="personStatus" class="select">${["启用", "停用"].map((status) => `<option ${status === (user.status || "启用") ? "selected" : ""}>${status}</option>`).join("")}</select></div>
    </div>
  `, "保存人员", `savePerson('${user.id || ""}')`);
}

function modalShell(title, body, actionText, action) {
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal">
        <div class="modal-head"><h3>${title}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">${body}</div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="${action}">${actionText}</button></div>
      </div>
    </div>
  `;
}

function field(label, value) {
  return `<div class="field"><label>${label}</label><input class="input" value="${value}" placeholder="请输入${label.replace("*", "")}" /></div>`;
}

function selectField(label, options, value) {
  return `<div class="field"><label>${label}</label><select class="select">${options.map((o) => `<option ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select></div>`;
}

function actionButton(title, type, onclick) {
  return `<button class="icon-btn ${type === "delete" ? "danger-soft" : ""}" title="${title}" aria-label="${title}" onclick="${onclick}">${svgIcon(type)}</button>`;
}

function svgIcon(type) {
  const icons = {
    view: `<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.6"/></svg>`,
    edit: `<svg viewBox="0 0 24 24"><path d="M13.5 6.5 17.5 10.5"/><path d="m5 19 3.5-.8L19 6.7a1.7 1.7 0 0 0-2.4-2.4L6.2 14.8 5 19Z"/><path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6"/></svg>`,
    delete: `<svg viewBox="0 0 24 24"><path d="M5 7h14"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 7l.7 12h6.6L16 7"/><path d="M9 7l1-2h4l1 2"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-13.4 5.9"/><path d="M4 12A8 8 0 0 1 17.4 6.1"/><path d="M17 3v4h-4"/><path d="M7 21v-4h4"/></svg>`,
    orders: `<svg viewBox="0 0 24 24"><path d="M6 4h12v16H6z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>`,
    plus: `<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
    image: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 18 4.5-4.5 3 3 2.5-2.5 4 4"/></svg>`,
    copy: `<svg viewBox="0 0 24 24"><rect x="8" y="8" width="11" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2"/></svg>`,
    truck: `<svg viewBox="0 0 24 24"><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>`,
    print: `<svg viewBox="0 0 24 24"><path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="9" rx="2"/><path d="M7 14h10v7H7z"/></svg>`,
    more: `<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
    grip: `<svg viewBox="0 0 24 24"><circle cx="9" cy="5" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="19" r="1.4"/></svg>`,
    up: `<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>`,
    down: `<svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="m6 6 12 12"/><path d="M18 6 6 18"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24"><path d="M5 12h13"/><path d="m14 7 5 5-5 5"/></svg>`,
  };
  return icons[type] || icons.view;
}

function maskPhone(phone) {
  return String(phone || "").replace(/(\d{3})\d+(\d{4})/, "$1****$2");
}

async function savePerson(id) {
  const name = document.getElementById("personName").value.trim();
  const phone = document.getElementById("personPhone").value.trim();
  const password = document.getElementById("personPassword").value.trim();
  const role = document.getElementById("personRole").value;
  const status = document.getElementById("personStatus").value;
  if (!name || !phone || !password) {
    alert("请填写姓名、手机号和密码。");
    return;
  }
  try {
    const response = await fetch(id ? `/api/users/${id}` : "/api/users", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, phone, password, role, status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存人员失败");
    if (id) {
      const user = byId(salesUsers, id);
      Object.assign(user, data.user);
    } else {
      salesUsers = [data.user, ...salesUsers];
    }
    closeModal();
    showToast("人员信息已保存");
  } catch (error) {
    alert(error.message);
  }
}

function amountToChinese(value) {
  const number = Math.abs(Number(value || 0));
  if (!number) return "零元整";
  const fraction = ["角", "分"];
  const digit = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"];
  const unit = [["元", "万", "亿"], ["", "拾", "佰", "仟"]];
  let head = value < 0 ? "负" : "";
  let suffix = "";
  fraction.forEach((item, index) => {
    const n = Math.floor(number * 10 * Math.pow(10, index)) % 10;
    if (n) suffix += digit[n] + item;
  });
  suffix = suffix || "整";
  let integer = Math.floor(number);
  let result = "";
  for (let i = 0; i < unit[0].length && integer > 0; i += 1) {
    let section = "";
    for (let j = 0; j < unit[1].length && integer > 0; j += 1) {
      section = digit[integer % 10] + unit[1][j] + section;
      integer = Math.floor(integer / 10);
    }
    result = section.replace(/(零.)*零$/, "").replace(/^$/, "零") + unit[0][i] + result;
  }
  return head + result.replace(/(零.)*零元/, "元").replace(/(零.)+/g, "零").replace(/^整$/, "零元整") + suffix;
}

function getOrderRows(order) {
  return order.items.map((item, index) => {
    const details = orderItemDetails(item);
    return {
      index: index + 1,
      name: details.label,
      unit: details.unit,
      quantity: item.quantity,
      price: item.price,
      amount: item.quantity * item.price,
    };
  });
}

function getDisplayRows(order) {
  const rows = getOrderRows(order);
  while (rows.length < 8) {
    rows.push({ index: rows.length + 1, empty: true });
  }
  return rows;
}

function getOrderDoc(orderId) {
  const order = byId(orders, orderId);
  const customer = byId(customers, order.customerId);
  const title = order.no.startsWith("TH") || order.status === "已退货" ? "退货单" : "销售订单";
  return { order, customer, title, rows: getOrderRows(order) };
}

function buildOrderText(orderId) {
  const order = byId(orders, orderId);
  if (!order) throw new Error("订单不存在");
  const customer = byId(customers, order.customerId) || {};
  const excludedTerms = ["运费", "搬运费", "货拉拉"];
  const productLines = (order.items || []).filter((item) => {
    const details = orderItemDetails(item);
    return !excludedTerms.some((term) => String(details.name || "").includes(term));
  }).map((item) => {
    const details = orderItemDetails(item);
    const quantity = Number(item.quantity);
    const quantityText = Number.isFinite(quantity) ? String(quantity) : String(item.quantity || "");
    return `${details.label}  ${quantityText}${details.unit || ""}`;
  });
  return [
    "【送货信息】",
    `联系电话：${order.phone || customer.phone || ""}`,
    `送货地址：${order.address || customer.address || ""}`,
    "",
    "【产品清单】",
    ...(productLines.length ? productLines : ["暂无产品"]),
    "",
    "【备注】",
    String(order.remark || "").trim() || "无",
  ].join("\n");
}

function fallbackCopyText(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("浏览器未允许复制，请稍后重试");
}

async function copyOrderText(orderId) {
  try {
    const text = buildOrderText(orderId);
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
      } catch (error) {
        fallbackCopyText(text);
      }
    } else {
      fallbackCopyText(text);
    }
    showToast("文字版已复制");
  } catch (error) {
    alert(error.message || "复制失败");
  }
}

function downloadBlob(filename, mimeType, content) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}

function downloadOrderHtml(orderId) {
  const { order, customer, title, rows } = getOrderDoc(orderId);
  const sales = byId(salesUsers, order.salesUserId);
  const displayRows = getDisplayRows(order);
  const rowsHtml = displayRows.map((row) => row.empty ? `
    <tr><td>${row.index}</td><td></td><td></td><td></td><td></td><td></td></tr>
  ` : `
    <tr>
      <td>${row.index}</td>
      <td>${html(row.name)}</td>
      <td>${html(row.unit)}</td>
      <td>${row.quantity}</td>
      <td>${money(row.price)}</td>
      <td>${money(row.amount)}</td>
    </tr>
  `).join("");
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>${title}_${order.no}</title>
  <style>
    body { margin: 0; background: #f6f8fb; color: #172033; font-family: "Microsoft YaHei", Arial, sans-serif; }
    .sheet { width: 980px; margin: 28px auto; background: white; border: 1px solid #d5dbe5; padding: 52px 44px 34px; }
    h1 { margin: 0; text-align: center; font-size: 32px; font-weight: 850; }
    .subtitle { margin: 9px 0 30px; text-align: center; color: #172033; font-size: 17px; font-weight: 650; }
    .info { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 28px; padding-bottom: 20px; font-size: 18px; font-weight: 650; }
    .info span { color: #172033; font-weight: 850; }
    .right { text-align: right; }
    .address { grid-column: 1 / -1; padding: 12px; border-radius: 4px; background: #eef2f7; }
    table { width: 100%; border-collapse: collapse; border: 1px solid #cfcfcf; font-size: 17px; }
    th, td { padding: 12px 10px; border-right: 1px solid #cfcfcf; border-bottom: 1px solid #cfcfcf; text-align: left; }
    th { background: #fff; color: #172033; font-weight: 850; }
    td:first-child, th:first-child, td:nth-child(3), th:nth-child(3), td:nth-child(4), th:nth-child(4) { text-align: center; }
    td:nth-child(5), td:nth-child(6) { text-align: right; }
    .bottom { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; margin-top: 24px; font-size: 17px; }
    .bottom strong { font-weight: 850; }
    .total { font-weight: 850; white-space: nowrap; }
    @media print { body { background: white; } .sheet { margin: 0; border: 0; width: auto; } }
  </style>
</head>
<body>
  <main class="sheet">
    <h1>${title}</h1>
    <div class="subtitle">材达家建材销售系统</div>
    <section class="info">
      <div><span>客户：</span>${customer.name}</div>
      <div><span>单号：</span>${order.no}</div>
      <div><span>日期：</span>${order.date}</div>
      <div class="right"><span>销售：</span>${sales?.name || "-"}</div>
      <div class="address"><span>地址：</span>${html(order.address || customer.address || "-")}</div>
    </section>
    <table>
      <thead><tr><th>编号</th><th>商品名称</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <section class="bottom">
      <div><strong>合计大写：</strong>${amountToChinese(order.amount)}<br /><strong>销售电话：</strong>${maskPhone(sales?.phone || customer.phone)}</div>
      <div class="total">此单合计金额：${money(order.amount)}</div>
    </section>
  </main>
</body>
</html>`;
  downloadBlob(`${title}_${order.no}.html`, "text/html;charset=utf-8", html);
  showToast("文档已下载");
}

function downloadOrderImage(orderId, deliveryOnly = false) {
  const documentData = getOrderDoc(orderId);
  const { order, customer } = documentData;
  const title = deliveryOnly ? "送货单" : documentData.title;
  const sales = byId(salesUsers, order.salesUserId);
  const rows = getOrderRows(order);
  const rowCount = Math.max(rows.length, 8);
  const tableY = 414;
  const rowHeight = 64;
  const tableEndY = tableY + rowHeight * (rowCount + 1);
  const summaryY = tableEndY + 70;
  const canvas = document.createElement("canvas");
  const scale = 2;
  const width = 1588;
  const height = Math.max(1162, summaryY + 130);
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d6dde8";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, width - 1, height - 1);

  ctx.fillStyle = "#172033";
  ctx.textAlign = "center";
  ctx.font = "800 42px Microsoft YaHei, Arial";
  ctx.fillText(title, width / 2, 122);
  ctx.font = "500 20px Microsoft YaHei, Arial";
  ctx.fillText("材达家建材销售系统", width / 2, 163);

  ctx.textAlign = "left";
  ctx.font = "400 25px Microsoft YaHei, Arial";
  ctx.fillText("客户：", 57, 236);
  ctx.font = "700 25px Microsoft YaHei, Arial";
  ctx.fillText(customer.name || "-", 120, 236);
  ctx.font = "400 25px Microsoft YaHei, Arial";
  ctx.fillText("日期：", 57, 299);
  ctx.fillText(order.date || "-", 120, 299);
  ctx.textAlign = "right";
  ctx.fillText(`单号：${order.no}`, width - 57, 236);
  ctx.fillText(`销售：${sales?.name || "-"}`, width - 57, 299);

  ctx.fillStyle = "#eef2f7";
  roundRect(ctx, 57, 309, width - 114, 63, 7);
  ctx.fill();
  ctx.fillStyle = "#172033";
  ctx.textAlign = "left";
  ctx.font = "700 24px Microsoft YaHei, Arial";
  ctx.fillText(`地址：${order.address || customer.address || "-"}`, 72, 350);

  const tableX = 57;
  const cols = deliveryOnly ? [84, 1050, 170, 169] : [84, 828, 112, 112, 168, 169];
  const tableW = cols.reduce((sum, value) => sum + value, 0);
  const headers = deliveryOnly ? ["编号", "商品名称", "单位", "数量"] : ["编号", "商品名称", "单位", "数量", "单价", "金额"];
  ctx.strokeStyle = "#cfcfcf";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(tableX, tableY, tableW, rowHeight * (rowCount + 1));
  let gridX = tableX;
  cols.slice(0, -1).forEach((col) => {
    gridX += col;
    ctx.beginPath(); ctx.moveTo(gridX, tableY); ctx.lineTo(gridX, tableEndY); ctx.stroke();
  });
  for (let i = 1; i <= rowCount; i += 1) {
    const y = tableY + rowHeight * i;
    ctx.beginPath(); ctx.moveTo(tableX, y); ctx.lineTo(tableX + tableW, y); ctx.stroke();
  }
  ctx.fillStyle = "#172033";
  ctx.font = "800 23px Microsoft YaHei, Arial";
  let headerX = tableX;
  headers.forEach((header, i) => {
    drawCellText(ctx, header, headerX, tableY, cols[i], rowHeight, "center");
    headerX += cols[i];
  });
  ctx.font = "400 22px Microsoft YaHei, Arial";
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = rows[rowIndex];
    const y = tableY + rowHeight * (rowIndex + 1);
    const values = row
      ? (deliveryOnly ? [rowIndex + 1, row.name, row.unit, row.quantity] : [rowIndex + 1, row.name, row.unit, row.quantity, money(row.price), money(row.amount)])
      : (deliveryOnly ? [rowIndex + 1, "", "", ""] : [rowIndex + 1, "", "", "", "", ""]);
    let cellX = tableX;
    values.forEach((value, i) => {
      drawCellText(ctx, String(value), cellX, y, cols[i], rowHeight, i === 1 ? "left" : (!deliveryOnly && i >= 4) ? "right" : "center");
      cellX += cols[i];
    });
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "#172033";
  if (deliveryOnly) {
    ctx.font = "700 23px Microsoft YaHei, Arial";
    ctx.fillText(`收货电话：${order.phone || customer.phone || "-"}`, 57, summaryY);
    ctx.font = "400 23px Microsoft YaHei, Arial";
    drawCellText(ctx, `备注：${order.remark || "无"}`, 57, summaryY + 20, width - 114, 52, "left");
  } else {
    ctx.font = "400 23px Microsoft YaHei, Arial";
    ctx.fillText("合计大写：", 57, summaryY);
    ctx.font = "700 23px Microsoft YaHei, Arial";
    ctx.fillText(amountToChinese(order.amount), 165, summaryY);
    ctx.textAlign = "right";
    ctx.font = "400 23px Microsoft YaHei, Arial";
    ctx.fillText(`此单合计金额：${money(order.amount)}`, width - 57, summaryY);
    ctx.textAlign = "left";
    ctx.font = "700 23px Microsoft YaHei, Arial";
    ctx.fillText(`销售电话：${maskPhone(sales?.phone || customer.phone)}`, 57, summaryY + 50);
  }

  canvas.toBlob((blob) => {
    downloadBlob(`${title}_${order.no}.png`, "image/png", blob);
    showToast(deliveryOnly ? "送货单已下载" : "图片已下载");
  }, "image/png");
}

function downloadDeliveryImage(orderId) {
  downloadOrderImage(orderId, true);
}

function drawTableGrid(ctx, x, y, cols, height) {
  const width = cols.reduce((sum, col) => sum + col, 0);
  ctx.strokeRect(x, y, width, height);
  let currentX = x;
  cols.slice(0, -1).forEach((col) => {
    currentX += col;
    ctx.beginPath();
    ctx.moveTo(currentX, y);
    ctx.lineTo(currentX, y + height);
    ctx.stroke();
  });
  for (let rowY = y + 66; rowY < y + height; rowY += 66) {
    ctx.beginPath();
    ctx.moveTo(x, rowY);
    ctx.lineTo(x + width, rowY);
    ctx.stroke();
  }
}

function drawCellText(ctx, text, x, y, width, height, align = "left") {
  const padding = 16;
  let drawX = x + padding;
  if (align === "center") drawX = x + width / 2;
  if (align === "right") drawX = x + width - padding;
  ctx.textAlign = align;
  const maxWidth = width - padding * 2;
  let value = text;
  while (ctx.measureText(value).width > maxWidth && value.length > 1) {
    value = `${value.slice(0, -2)}…`;
  }
  ctx.fillText(value, drawX, y + height / 2 + 9);
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function printOrder(orderId) {
  downloadOrderHtml(orderId);
  showToast("已生成可打印文档");
}

const PRODUCT_CATEGORIES = ["全部", "水电", "木", "瓦", "油", "辅助商品"];

function html(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function productSearchText(p) {
  const text = [p.code, p.name, p.spec, p.brand, p.cat1, p.cat2, p.unit, ...(p.aliases || [])].join(" ").toLowerCase();
  return `${text} ${normalizeProductSearchQuery(text)}`;
}

function normalizeProductSearchQuery(value) {
  return String(value || "").toLowerCase().replace(/[\s，。、“”‘’：:；;！!？?、,.（）()【】\[\]_-]+/g, "");
}

function productSearchScore(product, query) {
  const rawQuery = String(query || "").trim().toLowerCase();
  const normalized = normalizeProductSearchQuery(rawQuery);
  if (!normalized) return 1;
  const name = normalizeProductSearchQuery(product.name);
  const code = normalizeProductSearchQuery(product.code || product.id);
  const spec = normalizeProductSearchQuery(product.spec);
  const brand = normalizeProductSearchQuery(product.brand);
  const aliases = (product.aliases || []).map(normalizeProductSearchQuery);
  if (name === normalized) return 1200;
  if (code === normalized) return 1150;
  if (aliases.includes(normalized)) return 1100;
  if (name.startsWith(normalized)) return 950;
  if (name.includes(normalized)) return 850;
  if (spec === normalized) return 760;
  if (spec.includes(normalized)) return 680;
  if (brand === normalized) return 620;
  if (aliases.some((alias) => alias.includes(normalized))) return 580;
  return productSearchText(product).includes(rawQuery) || productSearchText(product).includes(normalized) ? 420 : 0;
}

function isProductActive(p) {
  return p.status !== "停用";
}

function productMeta(p) {
  return [p.cat1, p.cat2].filter(Boolean).join(" / ") || "-";
}

function categoryTabs() {
  return `<div class="category-tabs">${PRODUCT_CATEGORIES.map((cat) => `<button class="${state.category === cat ? "active" : ""}" onclick="setProductCategory('${cat}')">${cat}</button>`).join("")}</div>`;
}

function productSubcategories() {
  if (state.category === "全部") return [];
  return [...new Set(products
    .filter((p) => p.cat1 === state.category)
    .map((p) => p.cat2)
    .filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function subcategoryTabs() {
  const list = productSubcategories();
  if (!list.length) return "";
  return `
    <div class="subcategory-tabs">
      <button class="${!state.productSubcategory ? "active" : ""}" onclick="setProductSubcategory('')">全部二级分类</button>
      ${list.map((cat) => `<button class="${state.productSubcategory === cat ? "active" : ""}" onclick="setProductSubcategory(${JSON.stringify(cat)})">${html(cat)}</button>`).join("")}
    </div>
  `;
}

function filteredProducts() {
  const q = state.productQuery.trim().toLowerCase();
  const normalized = normalizeProductSearchQuery(q);
  return products.filter((p) => {
    const categoryOk = state.category === "全部" || p.cat1 === state.category;
    const subcategoryOk = !state.productSubcategory || p.cat2 === state.productSubcategory;
    const searchText = productSearchText(p);
    return categoryOk && subcategoryOk && (!q || searchText.includes(q) || searchText.includes(normalized));
  });
}

function renderProducts() {
  const list = filteredProducts();
  const visible = list.slice(0, 220);
  return `
    <div class="toolbar">
      <input id="productSearchInput" class="input" placeholder="搜索商品名称 / 规格 / 编码 / 别名" value="${html(state.productQuery)}" oninput="updateProductQuery(this)" />
      <div class="spacer"></div>
      <button class="btn primary" onclick="openModal('product')">新增商品</button>
    </div>
    ${categoryTabs()}
    ${subcategoryTabs()}
    <div class="hint" style="margin:8px 0 12px">共 ${list.length} 个商品${list.length > visible.length ? `，当前显示前 ${visible.length} 个，请用搜索缩小范围` : ""}</div>
    <div class="card table-wrap product-table">
      <table>
        <thead><tr><th>商品名称</th><th>规格</th><th>一级分类</th><th>二级分类</th><th>单位</th><th>销售价</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${visible.map((p) => `
          <tr>
            <td><div class="product-name-cell"><strong>${html(p.name)}</strong><span>${html(p.code || p.id)}</span></div></td>
            <td>${html(p.spec || "-")}</td>
            <td>${html(p.cat1 || "-")}</td>
            <td>${html(p.cat2 || "-")}</td>
            <td>${html(p.unit)}</td>
            <td class="num">${money(p.price)}</td>
            <td><span class="badge ${isProductActive(p) ? "success" : "danger"}">${html(p.status || "在售")}</span></td>
            <td>${actionButton("编辑", "edit", `openModal('product',${JSON.stringify(p.id)})`)}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function productCard(p) {
  return `
    <article class="product-card ${isProductActive(p) ? "" : "disabled"}">
      <div class="material-thumb" style="--thumb:${p.color || "#dbe4ef"}"></div>
      <div>
        <h4 class="product-title">${html(p.name)}</h4>
        <div class="product-spec">${html(p.spec || "无规格")}<br />${html(productMeta(p))} · ${html(p.unit)}</div>
        <div class="price">${money(p.price)}</div>
      </div>
      ${isProductActive(p) ? actionButton("加入购物车", "plus", `addToCart(${JSON.stringify(p.id)})`) : `<span class="badge danger">停用</span>`}
    </article>
  `;
}

function productModal(id) {
  const p = byId(products, id) || { cat1: "辅助商品", status: "在售", aliases: [] };
  const aliases = Array.isArray(p.aliases) ? p.aliases.join("，") : (p.aliases || "");
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal side">
        <div class="modal-head"><h3>${id ? "编辑商品" : "新增商品"}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="product-image-editor">
            ${p.imageUrl ? `<img src="${html(p.imageUrl)}" alt="${html(p.name || "商品图片")}" />` : `<div class="product-image-placeholder">暂无商品图片</div>`}
            <div><label class="btn" for="productImageFile">选择图片</label><input id="productImageFile" type="file" accept="image/png,image/jpeg,image/webp" hidden onchange="previewProductImage(this)" /><div class="hint">支持 PNG、JPG、WebP，文件不超过 3MB。保存商品时一并上传。</div></div>
          </div>
          <div class="form-grid">
            <div class="field"><label>商品名称 *</label><input id="productName" class="input" value="${html(p.name || "")}" /></div>
            <div class="field"><label>规格 *</label><input id="productSpec" class="input" value="${html(p.spec || "")}" placeholder="必须写清楚规格，便于开单选择" /></div>
            <div class="field"><label>一级分类 *</label><select id="productCat1" class="select">${PRODUCT_CATEGORIES.filter((cat) => cat !== "全部").map((cat) => `<option ${p.cat1 === cat ? "selected" : ""}>${cat}</option>`).join("")}</select></div>
            <div class="field"><label>二级分类</label><input id="productCat2" class="input" value="${html(p.cat2 || "")}" /></div>
            <div class="field"><label>单位 *</label><input id="productUnit" class="input" value="${html(p.unit || "")}" /></div>
            <div class="field"><label>销售价 *</label><input id="productPrice" class="input" type="number" step="0.01" value="${Number(p.price || 0)}" /></div>
            <div class="field"><label>成本价</label><input id="productCost" class="input" type="number" step="0.01" value="${Number(p.cost || 0)}" /></div>
            <div class="field"><label>状态</label><select id="productStatus" class="select">${["在售", "停用"].map((item) => `<option ${p.status === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          </div>
          <details class="advanced-box">
            <summary>高级设置</summary>
            <div class="form-grid" style="margin-top:12px">
              <div class="field"><label>商品编码</label><input id="productCode" class="input" value="${html(p.code || p.id || "")}" ${id ? "disabled" : ""} /></div>
              <div class="field" style="grid-column:1/-1"><label>别名 / 关键词</label><textarea id="productAliases" class="textarea" placeholder="例如：付骨，副骨，副龙骨。多个别名用逗号隔开">${html(aliases)}</textarea><div class="hint">AI 开单会使用这里的别名，但开单显示仍以商品库名称、规格、单位、价格为准。</div></div>
            </div>
          </details>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveProduct(${jsArg(id || "")})">保存商品</button></div>
      </div>
    </div>
  `;
}

async function saveProduct(id) {
  const payload = {
    code: document.getElementById("productCode")?.value.trim(),
    name: document.getElementById("productName").value.trim(),
    spec: document.getElementById("productSpec").value.trim(),
    cat1: document.getElementById("productCat1").value,
    cat2: document.getElementById("productCat2").value.trim(),
    unit: document.getElementById("productUnit").value.trim(),
    price: Number(document.getElementById("productPrice").value || 0),
    cost: Number(document.getElementById("productCost").value || 0),
    status: document.getElementById("productStatus").value,
    aliases: document.getElementById("productAliases").value.split(/[,，、;\n]/).map((item) => item.trim()).filter(Boolean),
  };
  if (!payload.name || !payload.unit) {
    alert("商品名称和单位必填。");
    return;
  }
  try {
    const response = await fetch(id ? `/api/products/${encodeURIComponent(id)}` : "/api/products", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存商品失败");
    if (id) {
      const index = products.findIndex((item) => item.id === id);
      if (index >= 0) products[index] = data.product;
    } else {
      products.unshift(data.product);
    }
    closeModal();
    showToast("商品信息已保存");
  } catch (error) {
    alert(error.message);
  }
}

function jsArg(value) {
  return html(JSON.stringify(value ?? ""));
}

function safeOnclick(code) {
  return html(code || "");
}

function actionButton(title, type, onclick) {
  return `<button class="icon-btn ${type === "delete" ? "danger-soft" : ""}" title="${html(title)}" aria-label="${html(title)}" onclick="${safeOnclick(onclick)}">${svgIcon(type)}</button>`;
}

function activeSalesUsers() {
  return salesUsers.filter((user) => user.status !== "停用");
}

function salesFilterOptions(selected) {
  return `
    <option value="全部" ${selected === "全部" ? "selected" : ""}>全部</option>
    ${activeSalesUsers().map((user) => `<option value="${html(user.id)}" ${selected === user.id ? "selected" : ""}>${html(user.name)}</option>`).join("")}
  `;
}

function updateCustomerOwnerFilter(value) {
  state.customerOwnerFilter = value;
  render();
}

function updateOrderSalesFilter(value) {
  state.orderSalesFilter = value;
  render();
}

function updateOrderQuery(input) {
  scheduleInputRender("orderQuery", input.value, input.id, input.selectionStart, input.selectionEnd);
}

function categoryTabs() {
  return `<div class="category-tabs primary-category-tabs">${PRODUCT_CATEGORIES.map((cat) => `<button class="${state.category === cat ? "active" : ""}" onclick="setProductCategory(${jsArg(cat)})">${html(cat)}</button>`).join("")}</div>`;
}

function subcategoryTabs() {
  const list = productSubcategories();
  if (!list.length) return "";
  return `
    <section class="subcategory-panel">
      <div class="subcategory-panel-head">
        <span>二级分类</span>
        <strong>${html(state.productSubcategory || "全部")}</strong>
      </div>
      <div class="subcategory-tabs">
        <button class="${!state.productSubcategory ? "active" : ""}" onclick="setProductSubcategory('')">全部二级分类</button>
        ${list.map((cat) => `<button class="${state.productSubcategory === cat ? "active" : ""}" onclick="setProductSubcategory(${jsArg(cat)})">${html(cat)}</button>`).join("")}
      </div>
    </section>
  `;
}

function filteredProducts() {
  const query = state.productQuery.trim();
  const scoped = products.filter((p) => {
    const categoryOk = state.category === "全部" || p.cat1 === state.category;
    const subcategoryOk = !state.productSubcategory || p.cat2 === state.productSubcategory;
    return categoryOk && subcategoryOk;
  });
  if (!query) return scoped;
  return scoped
    .map((product, index) => ({ product, index, score: productSearchScore(product, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.product);
}

function renderCustomers() {
  const q = state.query.trim();
  const list = customers.filter((c) => {
    const queryOk = !q || [c.name, c.contact, c.phone].some((v) => String(v || "").includes(q));
    const ownerOk = state.customerOwnerFilter === "全部" || c.ownerId === state.customerOwnerFilter;
    return queryOk && ownerOk;
  });
  return `
    <div class="toolbar filter-toolbar">
      <input id="customerSearchInput" class="input" placeholder="搜索客户名称/联系人/电话" value="${html(state.query)}" oninput="updatePageQuery(this)" />
      <select class="select compact-select" onchange="updateCustomerOwnerFilter(this.value)">
        ${salesFilterOptions(state.customerOwnerFilter)}
      </select>
      <button class="btn primary" onclick="openModal('customer')">＋ 新增客户</button>
    </div>
    <div class="customer-list">${list.length ? list.map(customerCard).join("") : `<div class="empty">没有符合条件的客户</div>`}</div>
  `;
}

function renderProducts() {
  const list = filteredProducts();
  const visible = list.slice(0, 220);
  return `
    <div class="toolbar filter-toolbar">
      <input id="productSearchInput" class="input" placeholder="搜索商品名称 / 规格 / 编码 / 别名" value="${html(state.productQuery)}" oninput="updateProductQuery(this)" />
      <div class="spacer"></div>
      <button class="btn primary" onclick="openModal('product')">新增商品</button>
    </div>
    ${categoryTabs()}
    ${subcategoryTabs()}
    <div class="hint product-count-hint">共 ${list.length} 个商品${list.length > visible.length ? `，当前显示前 ${visible.length} 个，请用搜索缩小范围` : ""}</div>
    <div class="card table-wrap product-table">
      <table>
        <thead><tr><th>商品名称</th><th>规格</th><th>一级分类</th><th>二级分类</th><th>单位</th><th>销售价</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${visible.map((p) => `
          <tr>
            <td><div class="product-name-cell"><strong>${html(p.name)}</strong><span>${html(p.code || p.id)}</span></div></td>
            <td>${html(p.spec || "-")}</td>
            <td>${html(p.cat1 || "-")}</td>
            <td>${html(p.cat2 || "-")}</td>
            <td>${html(p.unit || "-")}</td>
            <td class="num">${money(p.price)}</td>
            <td><span class="badge ${isProductActive(p) ? "success" : "danger"}">${html(p.status || "在售")}</span></td>
            <td>${actionButton("编辑", "edit", `openModal('product',${JSON.stringify(p.id)})`)}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function productCard(p) {
  return `
    <article class="product-card ${isProductActive(p) ? "" : "disabled"}">
      <div class="material-thumb" style="--thumb:${html(p.color || "#dbe4ef")}"></div>
      <div>
        <h4 class="product-title">${html(p.name)}</h4>
        <div class="product-spec">${html(p.spec || "无规格")}<br />${html(productMeta(p))} · ${html(p.unit || "-")}</div>
        <div class="price">${money(p.price)}</div>
      </div>
      ${isProductActive(p) ? `<button class="icon-btn product-add-btn" title="加入购物车" aria-label="加入购物车" onclick="addToCart(${jsArg(p.id)})">${svgIcon("plus")}</button>` : `<span class="badge danger">停用</span>`}
    </article>
  `;
}

function addToCart(productId) {
  const product = byId(products, productId);
  if (!product || !isProductActive(product)) return;
  const line = state.cart.find((item) => item.productId === productId);
  if (line) line.quantity += 1;
  else state.cart.push({ productId, quantity: 1, price: product.price });
  showToast(`已添加 ${product.name}`);
}

function renderCreateOrder() {
  const customer = byId(customers, state.selectedCustomerId) || customers[0];
  const productList = filteredProducts();
  const visible = productList.slice(0, 120);
  return `
    <div class="card card-pad" style="margin-bottom:16px">
      <div class="form-grid">
        <div class="field"><label>选择客户 *</label><select class="select" onchange="state.selectedCustomerId=this.value;render()">${customers.map((c) => `<option value="${html(c.id)}" ${c.id === customer?.id ? "selected" : ""}>${html(c.name)} - ${html(c.phone)}</option>`).join("")}</select></div>
        <div class="field"><label>代下单销售人员</label><select class="select" onchange="state.salesUserId=this.value">${activeSalesUsers().map((u) => `<option value="${html(u.id)}" ${u.id === state.salesUserId ? "selected" : ""}>${html(u.name)}</option>`).join("")}</select></div>
        <div class="field"><label>送货地址 *</label><input class="input" value="${html(customer?.address || "")}" /></div>
        <div class="field"><label>收货人手机号 *</label><input class="input" value="${html(customer?.phone || "")}" /></div>
      </div>
    </div>
    <div class="product-layout">
      <div>
        <div class="toolbar filter-toolbar">
          <input id="orderProductSearchInput" class="input" placeholder="搜索商品名称、编码、拼音..." value="${html(state.productQuery)}" oninput="updateProductQuery(this)" />
          <button class="btn primary" onclick="openAiOrderModal()">AI 帮我开单</button>
        </div>
        ${categoryTabs()}
        ${subcategoryTabs()}
        <div class="hint product-count-hint">共 ${productList.length} 个商品${productList.length > visible.length ? `，当前显示前 ${visible.length} 个，请用搜索缩小范围` : ""}</div>
        <div class="product-grid">${visible.map(productCard).join("")}</div>
      </div>
      <aside class="card card-pad cart">
        <h3>${state.orderType === "return" ? "退货清单" : "购物车"}</h3>
        ${state.cart.length ? state.cart.map(cartLine).join("") : `<div class="empty">还没有选择商品</div>`}
        <div class="summary-row"><span>共 ${state.cart.reduce((s, i) => s + i.quantity, 0)} 件</span><span>合计</span></div>
        <div class="summary-row"><span></span><span class="summary-total">${money(cartTotal())}</span></div>
        <button class="btn primary" style="width:100%" onclick="saveOrder()">${state.orderType === "return" ? "生成退货单" : "去结算"}</button>
      </aside>
    </div>
  `;
}

function renderOrders() {
  const q = state.orderQuery.trim();
  const list = orders.filter((order) => {
    const customer = byId(customers, order.customerId);
    const statusOk = state.orderStatus === "全部" || order.status === state.orderStatus;
    const salesOk = state.orderSalesFilter === "全部" || order.salesUserId === state.orderSalesFilter;
    const queryOk = !q || [order.no, customer?.name, customer?.phone].some((value) => String(value || "").includes(q));
    return statusOk && salesOk && queryOk;
  });
  return `
    <div class="toolbar filter-toolbar">
      <input id="orderSearchInput" class="input" placeholder="搜索订单号/客户名称/手机号" value="${html(state.orderQuery)}" oninput="updateOrderQuery(this)" />
      <select class="select compact-select" onchange="state.orderStatus=this.value;render()">${["全部", "待确认", "已确认", "已发货", "已完成", "已取消", "已退货"].map((s) => `<option ${state.orderStatus === s ? "selected" : ""}>${s}</option>`).join("")}</select>
      <select class="select compact-select" onchange="updateOrderSalesFilter(this.value)">
        ${salesFilterOptions(state.orderSalesFilter)}
      </select>
      <div class="spacer"></div>
      <button class="btn primary" onclick="state.orderType='sale';setRoute('create')">开单</button>
    </div>
    <div class="order-list">${list.length ? list.map(orderCard).join("") : `<div class="empty">没有符合条件的订单</div>`}</div>
  `;
}

const LOGIN_MEMORY_KEY = "caidajia_last_login";

function getRememberedLogin() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_MEMORY_KEY) || "{}");
  } catch {
    return {};
  }
}

function rememberLogin(phone, password) {
  localStorage.setItem(LOGIN_MEMORY_KEY, JSON.stringify({ phone, password }));
}

function isSalesRole() {
  return state.user?.role === "销售人员";
}

function canChooseSalesperson() {
  return isAdmin();
}

function visibleOrders() {
  if (!isSalesRole()) return orders;
  return orders.filter((order) => order.salesUserId === state.user.id);
}

function visibleCustomers() {
  if (!isSalesRole()) return customers;
  return customers.filter((customer) => customer.ownerId === state.user.id);
}

function ensureSalesScope() {
  if (isSalesRole()) {
    state.salesUserId = state.user.id;
    state.customerOwnerFilter = "全部";
    state.orderSalesFilter = "全部";
  }
  const allowedCustomers = visibleCustomers();
  if (!allowedCustomers.some((customer) => customer.id === state.selectedCustomerId)) {
    state.selectedCustomerId = allowedCustomers[0]?.id || "";
  }
}

function setRoute(route) {
  state.route = route;
  state.query = "";
  state.modal = null;
  if (route === "returns") state.orderType = "return";
  if (route === "create") state.orderType = "sale";
  ensureSalesScope();
  render();
}

function renderLogin() {
  const remembered = getRememberedLogin();
  const phone = html(remembered.phone || "");
  const password = html(remembered.password || "");
  app.innerHTML = `
    <div class="login-shell">
      <section class="login-panel">
        <div class="login-card">
          <div class="brand-row">
            <div class="brand-mark">建</div>
            <div><h1 class="page-title">建材销售开单系统</h1><p class="page-subtitle">手机号登录 · 客户产品订单一体化</p></div>
          </div>
          <div class="field"><label>手机号</label><input id="loginPhone" class="input" value="${phone}" placeholder="请输入已授权手机号" /></div>
          <div class="field"><label>密码</label><div class="password-field"><input id="loginPassword" class="input" type="${state.loginPasswordVisible ? "text" : "password"}" value="${password}" placeholder="请输入登录密码" /><button type="button" class="password-toggle ${state.loginPasswordVisible ? "active" : ""}" onclick="toggleLoginPassword()" title="${state.loginPasswordVisible ? "隐藏密码" : "显示密码"}" aria-label="${state.loginPasswordVisible ? "隐藏密码" : "显示密码"}"></button></div></div>
          <button class="btn primary" style="width:100%" onclick="login()">登录系统</button>
        </div>
      </section>
      <section class="login-visual">
        <div class="visual-board ai-login-hero" aria-hidden="true">
          <div class="tech-hero-copy">
            <span>CAIDAJIA INTELLIGENT ORDERING</span>
            <h2>AI 材料订单引擎</h2>
            <p>识别需求 · 锁定商品 · 生成订单</p>
          </div>
          <div class="tech-grid-floor"></div>
          <div class="tech-scan-line"></div>
          <div class="tech-orbit tech-orbit-outer"></div>
          <div class="tech-orbit tech-orbit-inner"></div>
          <div class="tech-ai-core">
            <div class="tech-core-face tech-core-face-back"></div>
            <div class="tech-core-face tech-core-face-front"></div>
            <div class="tech-core-label"><strong>AI</strong><span>智能开单引擎</span></div>
          </div>
          <div class="tech-category tech-category-water"><strong>水电材料</strong><span>规格识别 · 品牌匹配</span></div>
          <div class="tech-category tech-category-wood"><strong>木工材料</strong><span>名称纠错 · 系列锁定</span></div>
          <div class="tech-category tech-category-tile"><strong>瓦工材料</strong><span>数量解析 · 单位校验</span></div>
          <div class="tech-category tech-category-extra"><strong>辅助商品</strong><span>真实商品 · 实时价格</span></div>
          <i class="tech-beam tech-beam-water"></i>
          <i class="tech-beam tech-beam-wood"></i>
          <i class="tech-beam tech-beam-tile"></i>
          <i class="tech-beam tech-beam-extra"></i>
          <i class="tech-particle tech-particle-a"></i>
          <i class="tech-particle tech-particle-b"></i>
          <i class="tech-particle tech-particle-c"></i>
          <div class="tech-confidence">本次订单匹配置信度 <strong>96%</strong></div>
        </div>
      </section>
    </div>
  `;
}

async function login() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "登录失败");
    rememberLogin(phone, password);
    state.user = data.user;
    await loadBootstrap();
    showToast("登录成功");
  } catch (error) {
    alert(error.message);
  }
}

function localLoginFallback(phone, password) {
  const user = salesUsers.find((item) => item.phone === phone);
  if (!user || user.password !== password || user.status !== "启用") {
    alert("手机号或密码错误。");
    return;
  }
  rememberLogin(phone, password);
  state.user = user;
  ensureSalesScope();
  showToast("登录成功");
}

async function loadBootstrap() {
  const response = await fetch("/api/bootstrap");
  if (!response.ok) return;
  const data = await response.json();
  state.user = data.user;
  salesUsers = data.users;
  customers = data.customers;
  products = data.products;
  orders = data.orders;
  state.salesUserId = isSalesRole() ? state.user.id : state.user?.id || activeSalesUsers()[0]?.id || "";
  ensureSalesScope();
}

function renderDashboard() {
  const scopedOrders = visibleOrders();
  const scopedCustomers = visibleCustomers();
  const now = new Date();
  const validOrders = scopedOrders.filter(isPerformanceOrder);
  const validSalesOrders = validOrders.filter((order) => !isReturnOrder(order));
  const monthPerformanceOrders = validOrders.filter((order) => isSameBusinessMonth(order.date, now));
  const todayPerformanceOrders = validOrders.filter((order) => isSameBusinessDay(order.date, now));
  const monthOrders = validSalesOrders.filter((order) => isSameBusinessMonth(order.date, now));
  const todayOrders = validSalesOrders.filter((order) => isSameBusinessDay(order.date, now));
  const monthCustomers = new Set(monthOrders.map((order) => order.customerId).filter(Boolean));
  const todayCustomers = new Set(todayOrders.map((order) => order.customerId).filter(Boolean));
  const monthNewCustomers = scopedCustomers.filter((customer) => {
    const openedAt = customerOpenedDate(customer, validSalesOrders);
    return openedAt && openedAt.getFullYear() === now.getFullYear() && openedAt.getMonth() === now.getMonth();
  }).length;
  const monthSales = monthPerformanceOrders.reduce((sum, order) => sum + performanceOrderAmount(order), 0);
  const todaySales = todayPerformanceOrders.reduce((sum, order) => sum + performanceOrderAmount(order), 0);
  return `
    <section class="dashboard-metrics">
      <div class="dashboard-section-head"><strong>本月经营</strong><span>${now.getFullYear()} 年 ${now.getMonth() + 1} 月</span></div>
      <div class="dashboard-metric-grid month-metrics">
        ${dashboardMetric("本月销售额", money(monthSales), "¥", "blue", "有效订单销售合计")}
        ${dashboardMetric("本月下单客户数", monthCustomers.size, "客", "violet", "按客户去重")}
        ${dashboardMetric("本月新开客户数", monthNewCustomers, "新", "orange", "按首次建档或有效下单时间")}
        ${dashboardMetric("本月订单数量", monthOrders.length, "单", "cyan", "不含待确认和已取消")}
      </div>
      <div class="dashboard-section-head today-head"><strong>今日动态</strong><span>${now.getMonth() + 1} 月 ${now.getDate()} 日</span></div>
      <div class="dashboard-metric-grid today-metrics">
        ${dashboardMetric("今日销售额", money(todaySales), "¥", "green")}
        ${dashboardMetric("今日下单客户数", todayCustomers.size, "客", "gold")}
        ${dashboardMetric("今日订单数量", todayOrders.length, "单", "red")}
      </div>
    </section>
    <div class="grid two-col" style="margin-top:16px">
      <div class="card card-pad">
        <h3>最近订单</h3>
        <div class="order-list">${scopedOrders.slice(0, 4).map(orderCard).join("") || `<div class="empty">暂无订单</div>`}</div>
      </div>
      <div class="card card-pad">
        <h3>高频建材分类</h3>
        ${["水电", "木", "油", "瓦"].map((cat) => `<div class="summary-row"><span>${cat}</span><strong>${products.filter((p) => p.cat1 === cat).length} 件商品</strong></div>`).join("")}
        <button class="btn primary" style="width:100%;margin-top:14px" onclick="setRoute('create')">开始开单</button>
      </div>
    </div>
  `;
}

function businessDate(value) {
  const match = String(value || "").match(/(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameBusinessMonth(value, target) {
  const date = businessDate(value);
  return Boolean(date && date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth());
}

function isSameBusinessDay(value, target) {
  const date = businessDate(value);
  return Boolean(date && date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth() && date.getDate() === target.getDate());
}

function isReturnOrder(order) {
  return order?.type === "return" || String(order?.no || "").startsWith("TH") || order?.status === "已退货";
}

function isPerformanceOrder(order) {
  return order && !["待确认", "已取消"].includes(order.status);
}

function performanceOrderAmount(order) {
  if (!isReturnOrder(order)) return Number(order.amount || 0);
  if (!(order.items || []).length) return -Math.abs(Number(order.amount || 0));
  return order.items.reduce((sum, item) => {
    const amount = Math.abs(Number(item.quantity || 0) * Number(item.price || 0));
    return sum + (isPositiveReturnCharge(item) ? amount : -amount);
  }, 0);
}

function customerOpenedDate(customer, validOrders) {
  const createdAt = businessDate(customer.createdAt);
  if (createdAt) return createdAt;
  return validOrders
    .filter((order) => order.customerId === customer.id && !isReturnOrder(order))
    .map((order) => businessDate(order.date))
    .filter(Boolean)
    .sort((a, b) => a - b)[0] || null;
}

function dashboardMetric(label, value, iconText, tone, note = "") {
  return `<div class="dashboard-metric ${tone}"><div><div class="dashboard-metric-label">${html(label)}</div><div class="dashboard-metric-value">${html(value)}</div>${note ? `<div class="dashboard-metric-note">${html(note)}</div>` : ""}</div><div class="dashboard-metric-icon">${html(iconText)}</div></div>`;
}

function customerStats(customerId) {
  const list = visibleOrders().filter((order) => order.customerId === customerId && !String(order.no || "").startsWith("TH"));
  const total = list.reduce((sum, order) => sum + Number(order.amount || 0), 0);
  const last = list
    .map((order) => order.date)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || "-";
  return { total, last, count: list.length };
}

function renderCustomers() {
  const q = state.query.trim();
  const list = visibleCustomers().filter((c) => {
    const queryOk = !q || [c.name, c.contact, c.phone].some((v) => String(v || "").includes(q));
    const ownerOk = isSalesRole() || state.customerOwnerFilter === "全部" || c.ownerId === state.customerOwnerFilter;
    return queryOk && ownerOk;
  });
  return `
    <div class="toolbar filter-toolbar">
      <input id="customerSearchInput" class="input" placeholder="搜索客户名称/联系人/电话" value="${html(state.query)}" oninput="updatePageQuery(this)" />
      ${canChooseSalesperson() ? `<select class="select compact-select" onchange="updateCustomerOwnerFilter(this.value)">${salesFilterOptions(state.customerOwnerFilter)}</select>` : ""}
      <button class="btn primary" onclick="openModal('customer')">＋ 新增客户</button>
    </div>
    <div class="customer-list">${list.length ? list.map(customerCard).join("") : `<div class="empty">没有符合条件的客户</div>`}</div>
  `;
}

function renderCreateOrder() {
  ensureSalesScope();
  const customerList = visibleCustomers();
  const customer = byId(customerList, state.selectedCustomerId) || customerList[0];
  ensureOrderDraft(customer);
  const productList = filteredProducts();
  const visible = productList.slice(0, 120);
  const salespersonField = canChooseSalesperson()
    ? `<div class="field"><label>代下单销售人员</label><select class="select" onchange="state.salesUserId=this.value">${activeSalesUsers().map((u) => `<option value="${html(u.id)}" ${u.id === state.salesUserId ? "selected" : ""}>${html(u.name)}</option>`).join("")}</select></div>`
    : "";
  return `
    <div class="card card-pad" style="margin-bottom:16px">
      <div class="form-grid">
        <div class="field"><label>选择客户 *</label><select class="select" onchange="state.selectedCustomerId=this.value;render()">${customerList.map((c) => `<option value="${html(c.id)}" ${c.id === customer?.id ? "selected" : ""}>${html(c.name)} - ${html(c.phone)}</option>`).join("")}</select></div>
        ${salespersonField}
        <div class="field"><label>送货地址 *</label><input class="input" value="${html(customer?.address || "")}" /></div>
        <div class="field"><label>收货人手机号 *</label><input class="input" value="${html(customer?.phone || "")}" /></div>
      </div>
    </div>
    <div class="product-layout">
      <div>
        <div class="toolbar filter-toolbar">
          <input id="orderProductSearchInput" class="input" placeholder="搜索商品名称、编码、拼音..." value="${html(state.productQuery)}" oninput="updateProductQuery(this)" />
          <button class="btn primary" onclick="openAiOrderModal()">AI 帮我开单</button>
        </div>
        ${categoryTabs()}
        ${subcategoryTabs()}
        <div class="hint product-count-hint">共 ${productList.length} 个商品${productList.length > visible.length ? `，当前显示前 ${visible.length} 个，请用搜索缩小范围` : ""}</div>
        <div class="product-grid">${visible.map(productCard).join("")}</div>
      </div>
      <aside class="card card-pad cart">
        <h3>${state.orderType === "return" ? "退货清单" : "购物车"}</h3>
        ${state.cart.length ? state.cart.map(cartLine).join("") : `<div class="empty">还没有选择商品</div>`}
        <div class="summary-row"><span>共 ${state.cart.reduce((s, i) => s + i.quantity, 0)} 件</span><span>合计</span></div>
        <div class="summary-row"><span></span><span class="summary-total">${money(cartTotal())}</span></div>
        <button class="btn primary" style="width:100%" onclick="saveOrder()">${state.orderType === "return" ? "生成退货单" : "去结算"}</button>
      </aside>
    </div>
  `;
}

function renderOrders() {
  const q = state.orderQuery.trim();
  const list = visibleOrders().filter((order) => {
    const customer = byId(customers, order.customerId);
    const statusOk = state.orderStatus === "全部" || order.status === state.orderStatus;
    const salesOk = isSalesRole() || state.orderSalesFilter === "全部" || order.salesUserId === state.orderSalesFilter;
    const queryOk = !q || [order.no, customer?.name, customer?.phone].some((value) => String(value || "").includes(q));
    return statusOk && salesOk && queryOk;
  });
  return `
    <div class="toolbar filter-toolbar">
      <input id="orderSearchInput" class="input" placeholder="搜索订单号/客户名称/手机号" value="${html(state.orderQuery)}" oninput="updateOrderQuery(this)" />
      <select class="select compact-select" onchange="state.orderStatus=this.value;render()">${["全部", "待确认", "已确认", "已发货", "已完成", "已取消", "已退货"].map((s) => `<option ${state.orderStatus === s ? "selected" : ""}>${s}</option>`).join("")}</select>
      ${canChooseSalesperson() ? `<select class="select compact-select" onchange="updateOrderSalesFilter(this.value)">${salesFilterOptions(state.orderSalesFilter)}</select>` : ""}
      <div class="spacer"></div>
      <button class="btn primary" onclick="state.orderType='sale';setRoute('create')">开单</button>
    </div>
    <div class="order-list">${list.length ? list.map(orderCard).join("") : `<div class="empty">没有符合条件的订单</div>`}</div>
  `;
}

const ORDER_STATUS_FILTERS = ["全部", "待确认", "已确认", "已发货", "已完成", "已取消"];
const ORDER_STATUS_CHOICES = ["待确认", "已确认", "已发货", "已完成", "已取消"];
const PAY_STATUS_FILTERS = ["全部", "待回款", "已回款"];
const EDIT_PAGE_SIZES = { products: 50, createProducts: 24, orders: 20 };

function ensurePageState() {
  if (!state.pages) state.pages = {};
}

function scheduleInputValue(input, key, inputId = input.id) {
  const start = input.selectionStart || 0;
  const end = input.selectionEnd || start;
  scheduleInputRender(key, input.value, inputId, start, end);
}

function currentPage(key) {
  ensurePageState();
  return Math.max(1, Number(state.pages[key] || 1));
}

function setPage(key, page) {
  ensurePageState();
  state.pages[key] = Math.max(1, Number(page || 1));
  render();
}

function resetPage(key) {
  ensurePageState();
  state.pages[key] = 1;
}

function paginateList(list, key, pageSize) {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(currentPage(key), totalPages);
  state.pages[key] = page;
  const start = (page - 1) * pageSize;
  return { items: list.slice(start, start + pageSize), total, totalPages, page, start };
}

function paginationControls(key, page, totalPages, total) {
  if (totalPages <= 1) return "";
  return `
    <div class="pagination">
      <span>共 ${total} 条，第 ${page} / ${totalPages} 页</span>
      <button class="btn small" ${page <= 1 ? "disabled" : ""} onclick="setPage('${key}', ${page - 1})">上一页</button>
      <button class="btn small" ${page >= totalPages ? "disabled" : ""} onclick="setPage('${key}', ${page + 1})">下一页</button>
    </div>
  `;
}

function normalizeClientPayStatus(value) {
  return value === "已付款" || value === "已回款" ? "已回款" : "待回款";
}

function orderStatusTone(status) {
  if (status === "已确认") return "status-confirmed";
  if (status === "已发货") return "status-shipped";
  if (status === "已完成") return "status-completed";
  if (status === "已取消" || status === "已退货") return "status-canceled";
  return "status-pending";
}

function paymentStatusTone(status) {
  return normalizeClientPayStatus(status) === "已回款" ? "payment-paid" : "payment-pending";
}

function orderStatusOptions(selected) {
  return ORDER_STATUS_CHOICES.map((value) => `<option class="${orderStatusTone(value)}" value="${html(value)}" ${value === selected ? "selected" : ""}>${html(value)}</option>`).join("");
}

function paymentStatusOptions(selected) {
  return ["待回款", "已回款"].map((value) => `<option class="${paymentStatusTone(value)}" value="${value}" ${value === selected ? "selected" : ""}>${value}</option>`).join("");
}

function optionList(values, selected) {
  return values.map((value) => `<option value="${html(value)}" ${value === selected ? "selected" : ""}>${html(value)}</option>`).join("");
}

function subcategoriesForCat(cat1) {
  const values = products
    .filter((product) => product.cat1 === cat1 && product.cat2)
    .map((product) => product.cat2);
  return Array.from(new Set(values)).sort((a, b) => String(a).localeCompare(String(b), "zh-Hans-CN"));
}

function productCat2Control(cat1, current) {
  const list = subcategoriesForCat(cat1);
  const hasCurrent = current && list.includes(current);
  const selected = hasCurrent || !current ? current : "__new__";
  const showNew = selected === "__new__";
  return `
    <select id="productCat2Select" class="select" onchange="toggleNewProductCat2()">
      <option value="">不设置二级分类</option>
      ${list.map((item) => `<option value="${html(item)}" ${item === selected ? "selected" : ""}>${html(item)}</option>`).join("")}
      <option value="__new__" ${showNew ? "selected" : ""}>新增二级分类</option>
    </select>
    <input id="productCat2New" class="input subcategory-new-input" style="${showNew ? "" : "display:none"}" placeholder="请输入新的二级分类名称" value="${showNew ? html(current || "") : ""}" />
  `;
}

function refreshProductCat2Options() {
  const cat1 = document.getElementById("productCat1")?.value || "辅助商品";
  const wrap = document.getElementById("productCat2Wrap");
  if (wrap) wrap.innerHTML = productCat2Control(cat1, "");
}

function toggleNewProductCat2() {
  const input = document.getElementById("productCat2New");
  const select = document.getElementById("productCat2Select");
  if (input && select) input.style.display = select.value === "__new__" ? "" : "none";
}

function updateProductQuery(input) {
  state.productQuery = input.value;
  resetPage("products");
  resetPage("createProducts");
  if (state.route === "products") {
    renderProductTableResults();
    return;
  }
  if (state.route === "create" || state.route === "returns") {
    renderCreateProductResults();
    return;
  }
  if (input.dataset.composing !== "true") {
    clearTimeout(inputRenderTimer);
    inputRenderTimer = setTimeout(() => renderKeepingInput(input.id, input.selectionStart || 0, input.selectionEnd || 0), 80);
  }
}

function setProductCategory(category) {
  state.category = category;
  state.productSubcategory = "";
  resetPage("products");
  resetPage("createProducts");
  render();
}

function setProductSubcategory(category) {
  state.productSubcategory = category;
  resetPage("products");
  resetPage("createProducts");
  render();
}

function updateOrderQuery(input) {
  scheduleInputValue(input, "orderQuery", "orderSearchInput");
  resetPage("orders");
}

function updateOrderSalesFilter(value) {
  state.orderSalesFilter = value;
  resetPage("orders");
  render();
}

function updateOrderPayFilter(value) {
  state.orderPayStatus = value;
  resetPage("orders");
  render();
}

function updateOrderStatusFilter(value) {
  state.orderStatus = value;
  resetPage("orders");
  render();
}

function updateCustomerOwnerFilter(value) {
  state.customerOwnerFilter = value;
  render();
}

function renderProducts() {
  const list = filteredProducts();
  const pageData = paginateList(list, "products", EDIT_PAGE_SIZES.products);
  const canManage = isAdmin();
  return `
    <div class="toolbar">
      <input id="productSearchInput" class="input" placeholder="搜索商品名称 / 规格 / 编码 / 别名" value="${html(state.productQuery)}" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateProductQuery(this)" oninput="updateProductQuery(this)" />
      <div class="spacer"></div>
      <button id="productExportSelectedBtn" class="btn" onclick="exportProducts('selected')" ${state.selectedProductIds.length ? "" : "disabled"}>导出已选</button>
      <button class="btn" onclick="exportProducts('all')">导出全部</button>
      ${canManage ? `<button class="btn" onclick="downloadProductTemplate()">下载导入模板</button><button class="btn" onclick="document.getElementById('productImportFile').click()">批量上传</button><input id="productImportFile" type="file" accept=".xlsx" hidden onchange="importProducts(this)" /><button class="btn primary" onclick="openModal('product')">新增商品</button>` : ""}
    </div>
    ${categoryTabs()}
    ${subcategoryTabs()}
    <div id="productTableResults">${productTableResultsHtml(list, pageData, canManage)}</div>
  `;
}

function productThumbnail(product, extraClass = "") {
  if (product.imageUrl) {
    return `<button type="button" class="product-thumb-button ${extraClass}" title="查看商品图片" onclick="openModal('productImage',${jsArg(product.id)})"><img src="${html(product.imageUrl)}" alt="${html(product.name)}" loading="lazy" /></button>`;
  }
  return `<button type="button" class="product-thumb-button is-empty ${extraClass}" title="暂无商品图片" onclick="openModal('productImage',${jsArg(product.id)})"><span>暂无图</span></button>`;
}

function productTableResultsHtml(list, pageData, canManage = isAdmin()) {
  const selected = new Set(state.selectedProductIds || []);
  const pageAllSelected = pageData.items.length && pageData.items.every((product) => selected.has(product.id));
  return `
    <div class="product-list-summary"><span>共 ${list.length} 个商品，当前显示 ${pageData.items.length} 个</span><span>已选 ${selected.size} 个</span></div>
    <div class="card table-wrap product-table">
      <table>
        <thead><tr><th class="selection-cell"><input type="checkbox" title="选择当前页" ${pageAllSelected ? "checked" : ""} onchange="toggleCurrentProductPage(this.checked)" /></th><th>图片</th><th>商品名称</th><th>规格</th><th>一级分类</th><th>二级分类</th><th>单位</th><th>销售价</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${pageData.items.map((p) => `
          <tr>
            <td class="selection-cell"><input type="checkbox" ${selected.has(p.id) ? "checked" : ""} onchange="toggleProductSelection(${jsArg(p.id)},this.checked)" /></td>
            <td>${productThumbnail(p, "small")}</td>
            <td><div class="product-name-cell"><strong>${html(p.name)}</strong><span>${html(p.code || p.id)}</span></div></td>
            <td>${html(p.spec || "-")}</td>
            <td>${html(p.cat1 || "-")}</td>
            <td>${html(p.cat2 || "-")}</td>
            <td>${html(p.unit)}</td>
            <td class="num">${money(p.price)}</td>
            <td><span class="badge ${isProductActive(p) ? "success" : "danger"}">${html(p.status || "在售")}</span></td>
            <td class="row-actions">${actionButton("查看图片", "view", `openModal('productImage',${JSON.stringify(p.id)})`)}${canManage ? `${actionButton("编辑", "edit", `openModal('product',${JSON.stringify(p.id)})`)}${actionButton("删除", "delete", `deleteProduct(${JSON.stringify(p.id)})`)}` : ""}</td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
    ${paginationControls("products", pageData.page, pageData.totalPages, pageData.total)}
  `;
}

function renderProductTableResults() {
  const container = document.getElementById("productTableResults");
  if (!container) return;
  const list = filteredProducts();
  const pageData = paginateList(list, "products", EDIT_PAGE_SIZES.products);
  container.innerHTML = productTableResultsHtml(list, pageData);
}

function toggleProductSelection(productId, checked) {
  const selected = new Set(state.selectedProductIds || []);
  if (checked) selected.add(productId);
  else selected.delete(productId);
  state.selectedProductIds = Array.from(selected);
  renderProductTableResults();
  syncProductExportButton();
}

function toggleCurrentProductPage(checked) {
  const list = filteredProducts();
  const pageData = paginateList(list, "products", EDIT_PAGE_SIZES.products);
  const selected = new Set(state.selectedProductIds || []);
  pageData.items.forEach((product) => checked ? selected.add(product.id) : selected.delete(product.id));
  state.selectedProductIds = Array.from(selected);
  renderProductTableResults();
  syncProductExportButton();
}

function syncProductExportButton() {
  const button = document.getElementById("productExportSelectedBtn");
  if (button) button.disabled = !state.selectedProductIds.length;
}

function productModal(id) {
  const p = byId(products, id) || { cat1: "辅助商品", status: "在售", aliases: [] };
  const aliases = Array.isArray(p.aliases) ? p.aliases.join("，") : (p.aliases || "");
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal side">
        <div class="modal-head"><h3>${id ? "编辑商品" : "新增商品"}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field"><label>商品名称 *</label><input id="productName" class="input" value="${html(p.name || "")}" /></div>
            <div class="field"><label>规格</label><input id="productSpec" class="input" value="${html(p.spec || "")}" placeholder="可不填，有规格时建议写清楚" /></div>
            <div class="field"><label>一级分类 *</label><select id="productCat1" class="select" onchange="refreshProductCat2Options()">${PRODUCT_CATEGORIES.filter((cat) => cat !== "全部").map((cat) => `<option ${p.cat1 === cat ? "selected" : ""}>${html(cat)}</option>`).join("")}</select></div>
            <div class="field"><label>二级分类</label><div id="productCat2Wrap" class="stacked-field">${productCat2Control(p.cat1 || "辅助商品", p.cat2 || "")}</div></div>
            <div class="field"><label>单位 *</label><input id="productUnit" class="input" value="${html(p.unit || "")}" /></div>
            <div class="field"><label>销售价 *</label><input id="productPrice" class="input" type="number" step="0.01" value="${Number(p.price || 0)}" /></div>
            <div class="field"><label>成本价</label><input id="productCost" class="input" type="number" step="0.01" value="${Number(p.cost || 0)}" /></div>
            <div class="field"><label>状态</label><select id="productStatus" class="select">${["在售", "停用"].map((item) => `<option ${p.status === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          </div>
          <details class="advanced-box">
            <summary>高级设置</summary>
            <div class="form-grid" style="margin-top:12px">
              <div class="field"><label>商品编码</label><input id="productCode" class="input" value="${html(p.code || p.id || "")}" ${id ? "disabled" : ""} /></div>
              <div class="field" style="grid-column:1/-1"><label>别名 / 关键词</label><textarea id="productAliases" class="textarea" placeholder="多个别名用逗号或换行隔开">${html(aliases)}</textarea><div class="hint">AI 开单会使用别名辅助匹配，开单显示仍以商品库名称、规格、单位、价格为准。</div></div>
            </div>
          </details>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveProduct(${jsArg(id || "")})">保存商品</button></div>
      </div>
    </div>
  `;
}

async function saveProduct(id) {
  const cat2Select = document.getElementById("productCat2Select");
  const cat2New = document.getElementById("productCat2New");
  let cat2 = cat2Select?.value || "";
  if (cat2 === "__new__") cat2 = cat2New?.value.trim() || "";
  const payload = {
    code: document.getElementById("productCode")?.value.trim(),
    name: document.getElementById("productName").value.trim(),
    spec: document.getElementById("productSpec").value.trim(),
    cat1: document.getElementById("productCat1").value,
    cat2,
    unit: document.getElementById("productUnit").value.trim(),
    price: Number(document.getElementById("productPrice").value || 0),
    cost: Number(document.getElementById("productCost").value || 0),
    status: document.getElementById("productStatus").value,
    aliases: document.getElementById("productAliases").value.split(/[,，、\n]/).map((item) => item.trim()).filter(Boolean),
  };
  if (!payload.name || !payload.unit) {
    alert("商品名称和单位必填。");
    return;
  }
  try {
    const response = await fetch(id ? `/api/products/${encodeURIComponent(id)}` : "/api/products", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存商品失败");
    if (id) {
      const index = products.findIndex((item) => item.id === id);
      if (index >= 0) products[index] = data.product;
    } else {
      products.unshift(data.product);
    }
    closeModal();
    showToast("商品信息已保存");
  } catch (error) {
    alert(error.message);
  }
}

async function deleteProduct(id) {
  const product = byId(products, id);
  if (!product || !confirm(`确定删除“${product.name}”吗？历史订单不会受影响。`)) return;
  try {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "删除商品失败");
    const index = products.findIndex((item) => item.id === id);
    if (index >= 0) products[index] = data.product;
    showToast("商品已删除");
    render();
  } catch (error) {
    alert(error.message);
  }
}

function downloadProductTemplate() {
  const anchor = document.createElement("a");
  anchor.href = "/api/products/template";
  anchor.download = "产品批量导入模板.xlsx";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

async function exportProducts(mode) {
  const ids = mode === "selected" ? state.selectedProductIds : [];
  if (mode === "selected" && !ids.length) {
    alert("请先勾选需要导出的商品。");
    return;
  }
  try {
    const response = await fetch("/api/products/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "导出产品失败");
    }
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const filename = match ? decodeURIComponent(match[1]) : "产品列表.xlsx";
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    alert(error.message);
  }
}

async function importProducts(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  if (!/\.xlsx$/i.test(file.name)) {
    alert("请上传从系统下载的 .xlsx 模板。");
    input.value = "";
    return;
  }
  if (!confirm("导入将按商品编码更新已有商品，并新增不存在的编码。确认继续吗？")) {
    input.value = "";
    return;
  }
  try {
    const response = await fetch("/api/products/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ file: await fileAsDataUrl(file) }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "批量导入失败");
    products = data.products;
    state.selectedProductIds = [];
    input.value = "";
    render();
    showToast(`批量导入完成：新增 ${data.created} 个，更新 ${data.updated} 个`);
  } catch (error) {
    input.value = "";
    alert(error.message);
  }
}

function createProductResultsHtml(productList, pageData) {
  return `
    <div class="hint product-count-hint">共 ${productList.length} 个商品，当前显示 ${pageData.items.length} 个</div>
    ${pageData.items.length ? `<div class="product-grid">${pageData.items.map(productCard).join("")}</div>` : `<div class="empty">没有匹配的商品，请尝试商品名称、规格、编码或别名。</div>`}
    ${paginationControls("createProducts", pageData.page, pageData.totalPages, pageData.total)}
  `;
}

function renderCreateProductResults() {
  const container = document.getElementById("createProductResults");
  if (!container) return;
  const productList = filteredProducts().filter(isProductActive);
  const pageData = paginateList(productList, "createProducts", EDIT_PAGE_SIZES.createProducts);
  container.innerHTML = createProductResultsHtml(productList, pageData);
}

function renderCreateOrder() {
  ensureSalesScope();
  const customerList = visibleCustomers();
  const customer = byId(customerList, state.selectedCustomerId) || customerList[0];
  ensureOrderDraft(customer);
  const productList = filteredProducts().filter(isProductActive);
  const pageData = paginateList(productList, "createProducts", EDIT_PAGE_SIZES.createProducts);
  const salespersonField = canChooseSalesperson()
    ? `<div class="field"><label>代下单销售人员</label><select class="select" onchange="state.salesUserId=this.value">${activeSalesUsers().map((u) => `<option value="${html(u.id)}" ${u.id === state.salesUserId ? "selected" : ""}>${html(u.name)}</option>`).join("")}</select></div>`
    : "";
  return `
    <div class="card card-pad" style="margin-bottom:16px">
      <div class="form-grid">
        <div class="field"><label>选择客户 *</label><select class="select" onchange="selectOrderCustomer(this.value)">${customerList.map((c) => `<option value="${html(c.id)}" ${c.id === customer?.id ? "selected" : ""}>${html(c.name)} - ${html(c.phone)}</option>`).join("")}</select></div>
        ${salespersonField}
        <div class="field"><label>送货地址 *</label><input id="orderAddressInput" class="input" value="${html(state.orderAddress)}" oninput="updateOrderDraftField('address',this.value)" /></div>
        <div class="field"><label>收货人手机号 *</label><input id="orderPhoneInput" class="input" value="${html(state.orderPhone)}" oninput="updateOrderDraftField('phone',this.value)" /></div>
        <div class="field" style="grid-column:1/-1"><label>订单备注</label><textarea id="orderRemarkInput" class="textarea compact-textarea" placeholder="可填写配送说明、客户要求等" oninput="updateOrderDraftField('remark',this.value)">${html(state.orderRemark)}</textarea></div>
      </div>
    </div>
    <div class="product-layout">
      <div>
        <div class="toolbar filter-toolbar">
          <input id="orderProductSearchInput" class="input" placeholder="搜索商品名称、规格、编码、别名..." value="${html(state.productQuery)}" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateProductQuery(this)" oninput="updateProductQuery(this)" />
          <button class="btn primary" onclick="openAiOrderModal()">AI 帮我开单</button>
        </div>
        ${categoryTabs()}
        ${subcategoryTabs()}
        <div id="createProductResults">${createProductResultsHtml(productList, pageData)}</div>
      </div>
      <aside class="card card-pad cart">
        <h3>${state.orderType === "return" ? "退货清单" : "购物车"}</h3>
        ${state.cart.length ? state.cart.map(cartLine).join("") : `<div class="empty">还没有选择商品</div>`}
        <div class="summary-row"><span>共 ${state.cart.reduce((sum, item) => sum + item.quantity, 0)} 件</span><span>合计</span></div>
        <div class="summary-row"><span></span><span class="summary-total">${money(cartTotal())}</span></div>
        <button class="btn primary" style="width:100%" onclick="saveOrder()">${state.orderType === "return" ? "生成退货单" : "去结算"}</button>
      </aside>
    </div>
  `;
}

async function saveOrder() {
  const customer = byId(customers, state.selectedCustomerId);
  if (!customer || !state.cart.length) {
    alert("请选择客户和商品。");
    return;
  }
  if (state.cart.some((item) => !isPositiveInteger(item.quantity))) {
    alert("商品数量必须为大于 0 的整数，请检查购物车后再结算。");
    return;
  }
  const payload = {
    type: state.orderType,
    customerId: customer.id,
    salesUserId: canChooseSalesperson() ? state.salesUserId : state.user.id,
    amount: cartTotal(),
    phone: state.orderPhone.trim() || customer.phone || "",
    address: state.orderAddress.trim() || customer.address || "",
    remark: state.orderRemark.trim(),
    payStatus: "未付款",
    aiLearnPairs: state.aiLearnPairs,
    items: state.cart.map((item) => {
      const product = byId(products, item.productId) || {};
      return {
        productId: item.productId,
        name: product.name || "",
        spec: product.spec || "",
        unit: product.unit || "",
        quantity: item.quantity,
        price: signedOrderPrice(product, item.price),
      };
    }),
  };
  const response = await fetch("/api/orders", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    alert(data.error || "保存订单失败");
    return;
  }
  orders.unshift(data.order);
  (data.learnedAliases || []).forEach((learned) => {
    const product = byId(products, learned.productId);
    if (!product) return;
    product.aliases = Array.isArray(product.aliases) ? product.aliases : [];
    if (!product.aliases.includes(learned.rawName)) product.aliases.push(learned.rawName);
  });
  clearPersistedCart(state.orderType);
  state.cart = [];
  state.aiLearnPairs = [];
  resetOrderDraft(customer);
  state.orderType = "sale";
  resetPage("orders");
  showToast(data.learnedAliases?.length ? `订单已生成，并新增 ${data.learnedAliases.length} 个商品关键词` : "订单已生成");
  setRoute("orders");
}

function renderOrders() {
  const q = state.orderQuery.trim();
  const payFilter = state.orderPayStatus || "全部";
  const list = visibleOrders().filter((order) => {
    const customer = byId(customers, order.customerId);
    const statusOk = state.orderStatus === "全部" || order.status === state.orderStatus;
    const payOk = payFilter === "全部" || normalizeClientPayStatus(order.payStatus) === payFilter;
    const salesOk = isSalesRole() || state.orderSalesFilter === "全部" || order.salesUserId === state.orderSalesFilter;
    const queryOk = !q || [order.no, customer?.name, customer?.phone].some((value) => String(value || "").includes(q));
    return statusOk && payOk && salesOk && queryOk;
  });
  const pageData = paginateList(list, "orders", EDIT_PAGE_SIZES.orders);
  return `
    <div class="toolbar filter-toolbar order-filter-toolbar">
      <input id="orderSearchInput" class="input" placeholder="搜索订单号/客户名称/手机号" value="${html(state.orderQuery)}" oninput="updateOrderQuery(this)" />
      <div class="filter-field"><label>订单状态</label><select class="select compact-select" onchange="updateOrderStatusFilter(this.value)">${optionList(ORDER_STATUS_FILTERS, state.orderStatus || "全部")}</select></div>
      <div class="filter-field"><label>付款状态</label><select class="select compact-select" onchange="updateOrderPayFilter(this.value)">${optionList(PAY_STATUS_FILTERS, payFilter)}</select></div>
      ${canChooseSalesperson() ? `<div class="filter-field"><label>下单销售</label><select class="select compact-select" onchange="updateOrderSalesFilter(this.value)">${salesFilterOptions(state.orderSalesFilter)}</select></div>` : ""}
      <div class="spacer"></div>
      <button class="btn primary" onclick="state.orderType='sale';setRoute('create')">开单</button>
    </div>
    <div class="order-list">${pageData.items.length ? pageData.items.map(orderCard).join("") : `<div class="empty">没有符合条件的订单</div>`}</div>
    ${paginationControls("orders", pageData.page, pageData.totalPages, pageData.total)}
  `;
}

function orderCard(order) {
  const customer = byId(customers, order.customerId) || {};
  const salesperson = byId(salesUsers, order.salesUserId) || {};
  const payStatus = normalizeClientPayStatus(order.payStatus);
  return `
    <div class="order-card">
      <div>
        <h3>${html(order.no)}</h3>
        <div class="order-meta">
          <span>${html(customer.name || "-")}</span>
          <span>${html(order.date || "-")}</span>
          <span>销售：${html(salesperson.name || "-")}</span>
          <span>${(order.items || []).length} 项商品</span>
          <span>客户电话：${html(customer.phone || "-")}</span>
        </div>
      </div>
      <div class="order-right">
        <strong>${money(order.amount)}</strong>
        <div class="order-badges"><span class="badge warning">${html(order.status || "待确认")}</span><span class="badge ${payStatus === "已付款" ? "success" : "info"}">${payStatus}</span></div>
        <div class="order-status-controls">
          <select class="select inline-select" title="订单状态" onchange="updateOrderStatus(${jsArg(order.id)}, this.value)">${optionList(ORDER_STATUS_CHOICES, order.status || "待确认")}</select>
          <select class="select inline-select" title="付款状态" onchange="updateOrderPayment(${jsArg(order.id)}, this.value)">${optionList(["未付款", "已付款"], payStatus)}</select>
        </div>
        <div class="order-actions">
          ${actionButton("查看", "view", `openModal('order',${JSON.stringify(order.id)})`)}
          ${actionButton("编辑", "edit", `openModal('editOrder',${JSON.stringify(order.id)})`)}
          ${actionButton("导出图片", "refresh", `exportOrderImage(${JSON.stringify(order.id)})`)}
        </div>
      </div>
    </div>
  `;
}

async function patchOrder(id, payload, successText) {
  const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    alert(data.error || "修改订单失败");
    render();
    return;
  }
  const index = orders.findIndex((item) => item.id === id);
  if (index >= 0) orders[index] = data.order;
  showToast(successText || "订单已更新");
  render();
}

function updateOrderStatus(id, status) {
  patchOrder(id, { status }, "订单状态已更新");
}

function updateOrderPayment(id, payStatus) {
  patchOrder(id, { payStatus }, "付款状态已更新");
}

function productSelectOptions(selectedId) {
  return [`<option value="">手动录入商品</option>`].concat(
    products.filter(isProductActive).map((p) => `<option value="${html(p.id)}" ${p.id === selectedId ? "selected" : ""}>${html(p.name)} / ${html(p.spec || "-")} / ${money(p.price)}</option>`)
  ).join("");
}

function orderLineSnapshot(item = {}) {
  const product = byId(products, item.productId) || {};
  return {
    productId: item.productId || "",
    name: item.name || product.name || "",
    spec: item.spec !== undefined ? item.spec : product.spec || "",
    unit: item.unit || product.unit || "",
    quantity: Number(item.quantity || 1),
    price: Number(item.price !== undefined ? item.price : product.price || 0),
  };
}

function openModal(type, id) {
  state.modal = { type, id };
  if (type === "editOrder") {
    const order = byId(orders, id);
    const customer = byId(customers, order?.customerId);
    state.editOrderDraft = {
      orderId: id,
      customerId: order?.customerId || "",
      date: order?.date || "",
      phone: order?.phone || byId(customers, order?.customerId)?.phone || "",
      address: order?.address || byId(customers, order?.customerId)?.address || "",
      remark: order?.remark || "",
      items: (order?.items || []).map(orderLineSnapshot),
    };
    state.editProductPickerOpen = false;
    state.editProductQuery = "";
    state.editProductCategory = "全部";
    state.editProductSubcategory = "全部";
    state.editCustomerQuery = customer?.name || "";
    state.editCustomerPickerOpen = false;
  }
  render();
}

function closeModal() {
  state.modal = null;
  state.editOrderDraft = null;
  state.editProductPickerOpen = false;
  state.editCustomerPickerOpen = false;
  render();
}

function matchingEditCustomers() {
  const query = state.editCustomerQuery.trim().toLowerCase();
  return visibleCustomers().filter((customer) => !query || [customer.name, customer.contact, customer.phone]
    .some((value) => String(value || "").toLowerCase().includes(query))).slice(0, 20);
}

function renderEditCustomerResults() {
  const matches = matchingEditCustomers();
  return matches.length ? matches.map((customer) => `
    <button type="button" class="edit-customer-option ${customer.id === state.editOrderDraft?.customerId ? "selected" : ""}" onmousedown="event.preventDefault()" onclick="selectEditOrderCustomer(${jsArg(customer.id)})">
      <strong>${html(customer.name)}</strong><span>${html(customer.phone || "-")} · ${html(customer.address || "未填写地址")}</span>
    </button>`).join("") : `<div class="empty">没有匹配的客户</div>`;
}

function refreshEditCustomerResults() {
  const results = document.getElementById("editCustomerResults");
  if (!results) return;
  results.innerHTML = renderEditCustomerResults();
  results.classList.toggle("hidden", !state.editCustomerPickerOpen);
}

function openEditCustomerPicker() {
  state.editCustomerPickerOpen = true;
  refreshEditCustomerResults();
}

function closeEditCustomerPicker() {
  setTimeout(() => {
    state.editCustomerPickerOpen = false;
    document.getElementById("editCustomerResults")?.classList.add("hidden");
  }, 120);
}

function updateEditCustomerSearch(input) {
  state.editCustomerQuery = input.value;
  state.editCustomerPickerOpen = true;
  if (input.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(refreshEditCustomerResults, 120);
}

function selectEditOrderCustomer(customerId) {
  const customer = byId(visibleCustomers(), customerId);
  if (!customer || !state.editOrderDraft) return;
  state.editOrderDraft.customerId = customer.id;
  state.editOrderDraft.phone = customer.phone || "";
  state.editOrderDraft.address = customer.address || "";
  state.editCustomerQuery = customer.name || "";
  state.editCustomerPickerOpen = false;
  const input = document.getElementById("editCustomerSearch");
  const phone = document.getElementById("editOrderPhone");
  const address = document.getElementById("editOrderAddress");
  if (input) input.value = state.editCustomerQuery;
  if (phone) phone.value = state.editOrderDraft.phone;
  if (address) address.value = state.editOrderDraft.address;
  document.getElementById("editCustomerResults")?.classList.add("hidden");
}

function editOrderItemsHtml(draft) {
  return `
    <div class="edit-order-items">
      <div class="edit-order-items-head"><strong>订单商品</strong><span>${draft.items.length} 项</span></div>
      ${draft.items.length ? draft.items.map((item, index) => `
        <div class="edit-order-line" data-edit-order-line data-edit-order-index="${index}">
          <button type="button" class="edit-order-drag-handle" title="按住拖动调整顺序" aria-label="拖动商品调整顺序" onpointerdown="startEditOrderDrag(event)" onkeydown="handleEditOrderDragKey(event,${index})">${svgIcon("grip")}</button>
          <div class="edit-order-product"><strong>${html(orderItemDetails(item).label)}</strong><span>单位：${html(item.unit || "-")}</span></div>
          <label class="edit-order-quantity-field${isPositiveInteger(item.quantity) ? "" : " has-error"}"><span>数量</span><input id="editOrderItemQty${index}" class="input${isPositiveInteger(item.quantity) ? "" : " quantity-input-invalid"}" type="number" min="1" step="1" inputmode="numeric" value="${Number(item.quantity || 0)}" oninput="updateEditOrderLine(${index},'quantity',this.value);setQuantityInputValidity(this)" />${isPositiveInteger(item.quantity) ? "" : `<small class="quantity-error-text">历史数量不是整数，请修正</small>`}</label>
          <label><span>单价</span><input id="editOrderItemPrice${index}" class="input" type="number" step="0.01" value="${Number(item.price || 0)}" oninput="updateEditOrderLine(${index},'price',this.value)" /></label>
          <div id="editOrderSubtotal${index}" class="edit-order-subtotal">${money(Number(item.quantity || 0) * Number(item.price || 0))}</div>
          ${actionButton("删除商品", "delete", `removeEditOrderLine(${index})`)}
        </div>`).join("") : `<div class="empty">订单中还没有商品</div>`}
    </div>
  `;
}

function editProductPickerSlotHtml() {
  return state.editProductPickerOpen ? renderEditProductPicker() : "";
}

function editOrderModal(id) {
  const order = byId(orders, id);
  if (!order) return "";
  if (!state.editOrderDraft || state.editOrderDraft.orderId !== id) {
    state.editOrderDraft = { orderId: id, customerId: order.customerId, date: order.date || "", phone: order.phone || byId(customers, order.customerId)?.phone || "", address: order.address || "", remark: order.remark || "", items: (order.items || []).map(orderLineSnapshot) };
    state.editCustomerQuery = byId(customers, order.customerId)?.name || "";
  }
  const draft = state.editOrderDraft;
  const draftTotal = draft.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal large edit-order-modal">
        <div class="modal-head"><h3>编辑订单</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field edit-customer-field"><label>客户</label><div class="edit-customer-combobox"><input id="editCustomerSearch" class="input" value="${html(state.editCustomerQuery)}" placeholder="输入客户名称、联系人或手机号" autocomplete="off" role="combobox" onfocus="openEditCustomerPicker();this.select()" onblur="closeEditCustomerPicker()" oninput="updateEditCustomerSearch(this)" /><div id="editCustomerResults" class="edit-customer-results hidden">${renderEditCustomerResults()}</div></div></div>
            <div class="field"><label>订单日期</label><input id="editOrderDate" class="input" value="${html(draft.date)}" oninput="updateEditOrderMeta('date',this.value)" /></div>
            <div class="field" style="grid-column:1/-1"><label>收货人手机号</label><input id="editOrderPhone" class="input" value="${html(draft.phone)}" oninput="updateEditOrderMeta('phone',this.value)" /></div>
            <div class="field" style="grid-column:1/-1"><label>订单地址</label><input id="editOrderAddress" class="input" value="${html(draft.address)}" oninput="updateEditOrderMeta('address',this.value)" /></div>
            <div class="field" style="grid-column:1/-1"><label>订单备注</label><textarea id="editOrderRemark" class="textarea" placeholder="可填写客户特殊要求、配送说明等" oninput="updateEditOrderMeta('remark',this.value)">${html(draft.remark)}</textarea></div>
          </div>
          ${editOrderItemsHtml(draft)}
          <div class="edit-order-actions"><button id="editProductPickerToggle" class="btn" onclick="toggleEditProductPicker()">${state.editProductPickerOpen ? "收起商品库" : "+ 添加商品"}</button><strong>合计 <span id="editOrderTotal">${money(draftTotal)}</span></strong></div>
          <div id="editProductPickerSlot">${editProductPickerSlotHtml()}</div>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveOrderEdits(${jsArg(id)})">保存修改</button></div>
      </div>
    </div>
  `;
}

function updateEditOrderMeta(key, value) {
  if (state.editOrderDraft) state.editOrderDraft[key] = value;
}

function updateEditOrderLine(index, key, value) {
  const item = state.editOrderDraft?.items?.[index];
  if (!item) return;
  item[key] = Number(value || 0);
  const subtotal = document.getElementById(`editOrderSubtotal${index}`);
  if (subtotal) subtotal.textContent = money(Number(item.quantity || 0) * Number(item.price || 0));
  const total = document.getElementById("editOrderTotal");
  if (total) total.textContent = money(state.editOrderDraft.items.reduce((sum, line) => sum + Number(line.quantity || 0) * Number(line.price || 0), 0));
}

function refreshEditOrderItems(scrollTop = null) {
  if (!state.editOrderDraft) return;
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  const currentScrollTop = scrollTop === null ? (modalBody?.scrollTop || 0) : scrollTop;
  const section = document.querySelector(".edit-order-items");
  if (section) section.outerHTML = editOrderItemsHtml(state.editOrderDraft);
  const total = document.getElementById("editOrderTotal");
  if (total) total.textContent = money(state.editOrderDraft.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0));
  const nextBody = document.querySelector(".edit-order-modal .modal-body");
  if (nextBody) nextBody.scrollTop = currentScrollTop;
}

function toggleEditProductPicker() {
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  const scrollTop = modalBody?.scrollTop || 0;
  state.editProductPickerOpen = !state.editProductPickerOpen;
  const button = document.getElementById("editProductPickerToggle");
  const slot = document.getElementById("editProductPickerSlot");
  if (button) button.textContent = state.editProductPickerOpen ? "收起商品库" : "+ 添加商品";
  if (slot) slot.innerHTML = editProductPickerSlotHtml();
  if (modalBody) modalBody.scrollTop = scrollTop;
  if (state.editProductPickerOpen) {
    requestAnimationFrame(() => {
      const picker = document.querySelector(".edit-product-picker");
      picker?.scrollIntoView({ block: "start", behavior: "smooth" });
      document.getElementById("editProductSearch")?.focus();
    });
  }
}

function renderEditProductPicker() {
  const query = state.editProductQuery.trim().toLowerCase();
  const category = state.editProductCategory || "全部";
  const subcategories = ["全部", ...new Set(products.filter((p) => category === "全部" || p.cat1 === category).map((p) => p.cat2).filter(Boolean))];
  const matches = products.filter(isProductActive).filter((p) => {
    const queryOk = !query || [p.name, p.spec, p.brand, p.cat1, p.cat2, p.code].some((value) => String(value || "").toLowerCase().includes(query));
    return queryOk && (category === "全部" || p.cat1 === category) && (state.editProductSubcategory === "全部" || p.cat2 === state.editProductSubcategory);
  }).slice(0, 60);
  return `<section class="edit-product-picker">
    <div class="edit-product-filters">
      <input id="editProductSearch" class="input" value="${html(state.editProductQuery)}" placeholder="搜索商品名称、规格、品牌" oninput="updateEditProductFilter('query',this.value,this)" />
      <select class="select" onchange="updateEditProductFilter('category',this.value)">${optionList(PRODUCT_CATEGORIES, category)}</select>
      <select class="select" onchange="updateEditProductFilter('subcategory',this.value)">${optionList(subcategories, state.editProductSubcategory)}</select>
    </div>
    <div class="edit-product-results">${matches.length ? matches.map((p) => {
      const added = state.editOrderDraft.items.some((item) => item.productId === p.id);
      return `<div class="edit-product-result">${productThumbnail(p, "small")}<div><strong>${html(orderItemDetails(p).label)}</strong><span>${html(p.brand || p.cat2 || "-")} · ${html(p.unit || "-")} · ${money(p.price)}</span></div><button class="btn ${added ? "ghost" : "primary"}" ${added ? "disabled" : ""} onclick="addEditOrderProduct(${jsArg(p.id)})">${added ? "已添加" : "添加"}</button></div>`;
    }).join("") : `<div class="empty">没有匹配的商品</div>`}</div>
    ${matches.length >= 60 ? `<div class="hint">结果较多，请继续输入关键词缩小范围</div>` : ""}
  </section>`;
}

function updateEditProductFilter(type, value, input = null) {
  if (type === "query") state.editProductQuery = value;
  if (type === "category") { state.editProductCategory = value; state.editProductSubcategory = "全部"; }
  if (type === "subcategory") state.editProductSubcategory = value;
  if (input?.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => refreshEditProductPicker(type === "query"), type === "query" ? 180 : 0);
}

function refreshEditProductPicker(restoreSearchFocus = false) {
  const picker = document.querySelector(".edit-product-picker");
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  if (!picker || !modalBody) return;
  const scrollTop = modalBody.scrollTop;
  picker.outerHTML = renderEditProductPicker();
  modalBody.scrollTop = scrollTop;
  if (restoreSearchFocus) {
    const input = document.getElementById("editProductSearch");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  }
}

function addEditOrderProduct(productId) {
  const product = byId(products, productId);
  if (!product || !state.editOrderDraft || state.editOrderDraft.items.some((item) => item.productId === productId)) return;
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  const scrollTop = modalBody?.scrollTop || 0;
  state.editOrderDraft.items.push(orderLineSnapshot({ productId, quantity: 1 }));
  refreshEditOrderItems(scrollTop);
  refreshEditProductPicker(false);
  const nextBody = document.querySelector(".edit-order-modal .modal-body");
  if (nextBody) nextBody.scrollTop = scrollTop;
}

function removeEditOrderLine(index) {
  if (!state.editOrderDraft) return;
  const draft = state.editOrderDraft;
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  const scrollTop = modalBody?.scrollTop || 0;
  const line = document.querySelector(`[data-edit-order-index="${index}"]`);
  const finish = () => {
    draft.items.splice(index, 1);
    if (state.editOrderDraft !== draft) return;
    refreshEditOrderItems(scrollTop);
    if (state.editProductPickerOpen) refreshEditProductPicker(false);
    const nextBody = document.querySelector(".edit-order-modal .modal-body");
    if (nextBody) nextBody.scrollTop = scrollTop;
  };
  if (!line) {
    finish();
    return;
  }
  line.classList.add("is-removing");
  setTimeout(finish, 150);
}

function moveEditOrderLine(index, direction) {
  if (!state.editOrderDraft) return;
  const target = index + Number(direction || 0);
  if (target < 0 || target >= state.editOrderDraft.items.length) return;
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  const scrollTop = modalBody?.scrollTop || 0;
  const [item] = state.editOrderDraft.items.splice(index, 1);
  state.editOrderDraft.items.splice(target, 0, item);
  refreshEditOrderItems(scrollTop);
  requestAnimationFrame(() => document.querySelector(`[data-edit-order-index="${target}"] .edit-order-drag-handle`)?.focus());
}

function handleEditOrderDragKey(event, index) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  event.preventDefault();
  moveEditOrderLine(index, event.key === "ArrowUp" ? -1 : 1);
}

function startEditOrderDrag(event) {
  if (!state.editOrderDraft || event.button > 0) return;
  const line = event.currentTarget.closest("[data-edit-order-line]");
  const list = line?.parentElement;
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  if (!line || !list || !modalBody) return;
  event.preventDefault();
  state.editOrderDrag = { line, list, modalBody, pointerId: event.pointerId };
  event.currentTarget.setPointerCapture?.(event.pointerId);
  line.classList.add("is-dragging");
  document.body.classList.add("is-edit-order-dragging");
  document.addEventListener("pointermove", moveEditOrderDrag);
  document.addEventListener("pointerup", finishEditOrderDrag, { once: true });
  document.addEventListener("pointercancel", finishEditOrderDrag, { once: true });
}

function moveEditOrderDrag(event) {
  const drag = state.editOrderDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  event.preventDefault();
  const bodyRect = drag.modalBody.getBoundingClientRect();
  if (event.clientY < bodyRect.top + 64) drag.modalBody.scrollTop -= 18;
  if (event.clientY > bodyRect.bottom - 64) drag.modalBody.scrollTop += 18;
  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-edit-order-line]");
  if (!target || target.parentElement !== drag.list || target === drag.line) return;
  const lines = [...drag.list.querySelectorAll("[data-edit-order-line]")];
  const from = lines.indexOf(drag.line);
  const to = lines.indexOf(target);
  if (from < 0 || to < 0 || from === to) return;
  const positions = new Map(lines.map((element) => [element, element.getBoundingClientRect().top]));
  const [item] = state.editOrderDraft.items.splice(from, 1);
  state.editOrderDraft.items.splice(to, 0, item);
  if (to > from) drag.list.insertBefore(drag.line, target.nextSibling);
  else drag.list.insertBefore(drag.line, target);
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  [...drag.list.querySelectorAll("[data-edit-order-line]")].forEach((element) => {
    if (element === drag.line) return;
    const delta = (positions.get(element) || element.getBoundingClientRect().top) - element.getBoundingClientRect().top;
    if (!delta) return;
    element.getAnimations().forEach((animation) => animation.cancel());
    element.animate(
      [{ transform: `translateY(${delta}px)` }, { transform: "translateY(0)" }],
      { duration: 190, easing: "cubic-bezier(.2,.8,.2,1)" }
    );
  });
}

function finishEditOrderDrag(event) {
  const drag = state.editOrderDrag;
  if (!drag || (event.pointerId !== undefined && event.pointerId !== drag.pointerId)) return;
  const finalScrollTop = drag.modalBody.scrollTop;
  document.removeEventListener("pointermove", moveEditOrderDrag);
  document.removeEventListener("pointerup", finishEditOrderDrag);
  document.removeEventListener("pointercancel", finishEditOrderDrag);
  document.body.classList.remove("is-edit-order-dragging");
  state.editOrderDrag = null;
  refreshEditOrderItems(finalScrollTop);
}

async function saveOrderEdits(id) {
  const items = (state.editOrderDraft?.items || []).map((item, index) => ({
    productId: item.productId || "",
    name: item.name || "",
    spec: item.spec || "",
    unit: item.unit || "",
    quantity: Number(document.getElementById(`editOrderItemQty${index}`)?.value || 0),
    price: Number(document.getElementById(`editOrderItemPrice${index}`)?.value || 0),
  })).filter((item) => item.name);
  const invalidIndex = items.findIndex((item) => !isPositiveInteger(item.quantity));
  if (invalidIndex >= 0) {
    const input = document.getElementById(`editOrderItemQty${invalidIndex}`);
    setQuantityInputValidity(input);
    input?.focus();
    input?.scrollIntoView({ block: "center", behavior: "smooth" });
    alert("商品数量必须为大于 0 的整数，请修正后再保存。");
    return;
  }
  const amount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const payload = {
    customerId: state.editOrderDraft?.customerId,
    date: document.getElementById("editOrderDate")?.value.trim(),
    phone: document.getElementById("editOrderPhone")?.value.trim(),
    address: document.getElementById("editOrderAddress")?.value.trim(),
    remark: document.getElementById("editOrderRemark")?.value.trim(),
    items,
    amount,
  };
  const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok) {
    alert(data.error || "保存订单失败");
    return;
  }
  const index = orders.findIndex((item) => item.id === id);
  if (index >= 0) orders[index] = data.order;
  closeModal();
  showToast("订单已保存");
}

function cartItemForProduct(productId) {
  return state.cart.find((item) => item.productId === productId);
}

function isPositiveInteger(value) {
  const quantity = Number(value);
  return Number.isInteger(quantity) && quantity > 0;
}

function normalizeQuantity(value) {
  return isPositiveInteger(value) ? Number(value) : 0;
}

function setQuantityInputValidity(input) {
  if (!input) return false;
  const valid = isPositiveInteger(input.value);
  input.classList.toggle("quantity-input-invalid", !valid);
  input.setAttribute("aria-invalid", valid ? "false" : "true");
  const field = input.closest(".edit-order-quantity-field");
  if (field) {
    field.classList.toggle("has-error", !valid);
    const message = field.querySelector(".quantity-error-text");
    if (message) message.hidden = valid;
  }
  return valid;
}

function setCartQuantity(productId, value) {
  const line = cartItemForProduct(productId);
  if (!line) return;
  if (!isPositiveInteger(value)) {
    showToast("商品数量必须为大于 0 的整数");
    render();
    return;
  }
  line.quantity = Number(value);
  render();
}

function productCard(p) {
  const selectedLine = cartItemForProduct(p.id);
  const selected = Boolean(selectedLine);
  const active = isProductActive(p);
  const quantityControl = selected
    ? `<div class="product-card-qty" title="已选数量">
        <button type="button" onclick="event.stopPropagation();changeQty(${jsArg(p.id)}, -1)">-</button>
        <input class="qty-input" type="number" min="1" step="1" inputmode="numeric" value="${Number(selectedLine.quantity || 0)}" onclick="event.stopPropagation()" onchange="setCartQuantity(${jsArg(p.id)}, this.value)" onkeydown="if(event.key==='Enter')this.blur()" />
        <button type="button" onclick="event.stopPropagation();changeQty(${jsArg(p.id)}, 1)">+</button>
      </div>`
    : active
      ? `<button class="icon-btn product-add-btn" title="加入购物车" onclick="addToCart(${jsArg(p.id)})">${svgIcon("plus")}</button>`
      : `<span class="badge danger">停用</span>`;
  return `
    <article class="product-card ${active ? "" : "disabled"} ${selected ? "selected" : ""}">
      <div class="material-thumb"></div>
      <div>
        <h4 class="product-title">${html(p.name)}</h4>
        <div class="product-spec">${html(p.spec || "无规格")}</div>
        <div class="product-spec">${html(productMeta(p))} · ${html(p.unit || "-")}</div>
        <div class="price">${money(p.price)}</div>
      </div>
      ${quantityControl}
    </article>
  `;
}

function addToCart(productId) {
  const product = byId(products, productId);
  if (!product || !isProductActive(product)) return;
  const line = cartItemForProduct(productId);
  if (line) {
    line.quantity = normalizeQuantity(line.quantity) + 1;
  } else {
    state.cart.push({ productId, quantity: 1, price: Number(product.price || 0) });
  }
  render();
  showToast("已加入购物车");
}

function cartLine(item) {
  const p = byId(products, item.productId);
  if (!p) return "";
  const quantity = normalizeQuantity(item.quantity);
  const displayPrice = signedOrderPrice(p, item.price);
  return `
    <div class="cart-line">
      <div class="cart-line-main">
        <strong>${html(orderItemDetails(p).label)}</strong>
        <div class="product-spec">${money(displayPrice)} / ${html(p.unit || "-")}</div>
      </div>
      <div class="cart-line-side">
        <div class="cart-line-controls">
          <button type="button" onclick="changeQty(${jsArg(p.id)}, -1)">-</button>
          <input class="qty-input" type="number" min="1" step="1" inputmode="numeric" value="${quantity}" onchange="setCartQuantity(${jsArg(p.id)}, this.value)" onkeydown="if(event.key==='Enter')this.blur()" />
          <button type="button" onclick="changeQty(${jsArg(p.id)}, 1)">+</button>
        </div>
        <div class="cart-line-bottom">
          <strong class="cart-line-total">${money(quantity * displayPrice)}</strong>
          ${actionButton("从购物车删除", "delete", `removeCartItem(${JSON.stringify(p.id)})`)}
        </div>
      </div>
    </div>
  `;
}

function changeQty(productId, delta) {
  const line = cartItemForProduct(productId);
  if (!line) return;
  setCartQuantity(productId, normalizeQuantity(line.quantity) + Number(delta || 0));
}

function removeCartItem(productId) {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  state.cart = state.cart.filter((item) => item.productId !== productId);
  persistCart();
  render();
  requestAnimationFrame(() => window.scrollTo(scrollX, scrollY));
}

async function saveProduct(id) {
  const field = (fieldId) => document.getElementById(fieldId);
  const imageFile = field("productImageFile")?.files?.[0] || null;
  const cat2Select = field("productCat2Select");
  const cat2New = field("productCat2New");
  let cat2 = cat2Select?.value || "";
  if (cat2 === "__new__") cat2 = cat2New?.value?.trim() || "";
  const payload = {
    code: field("productCode")?.value?.trim() || "",
    name: field("productName")?.value?.trim() || "",
    spec: field("productSpec")?.value?.trim() || "",
    cat1: field("productCat1")?.value || "辅助商品",
    cat2,
    unit: field("productUnit")?.value?.trim() || "",
    price: Number(field("productPrice")?.value || 0),
    cost: Number(field("productCost")?.value || 0),
    status: field("productStatus")?.value || "在售",
    aliases: (field("productAliases")?.value || "")
      .split(/[,，、\n]/)
      .map((item) => item.trim())
      .filter(Boolean),
  };
  if (!payload.name || !payload.unit) {
    alert("商品名称和单位必填。");
    return;
  }
  try {
    const response = await fetch(id ? `/api/products/${encodeURIComponent(id)}` : "/api/products", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存商品失败");
    const savedId = data.product.id;
    let savedProduct = data.product;
    let imageError = "";
    if (imageFile) {
      try {
        savedProduct = await uploadProductImage(savedId, imageFile);
      } catch (error) {
        imageError = error.message || "商品图片上传失败";
      }
    }
    if (id) {
      const index = products.findIndex((item) => item.id === id);
      if (index >= 0) products[index] = savedProduct;
    } else {
      products.unshift(savedProduct);
    }
    closeModal();
    if (imageError) alert(`商品信息已保存，但图片上传失败：${imageError}`);
    else showToast("商品信息已保存");
  } catch (error) {
    alert(error.message);
  }
}

async function deleteProduct(id) {
  const product = byId(products, id);
  if (!product || !confirm(`确定删除“${product.name}”吗？历史订单不会受影响。`)) return;
  try {
    const response = await fetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
    let data = {};
    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }
    if (!response.ok) throw new Error(data.error || "删除商品失败");
    products = products.filter((item) => item.id !== id);
    state.cart = state.cart.filter((item) => item.productId !== id);
    showToast("商品已删除");
    render();
  } catch (error) {
    alert(error.message);
  }
}

function openOrderRoute(type = "sale") {
  const nextType = type === "return" ? "return" : "sale";
  persistCart(state.orderType);
  state.orderType = nextType;
  restoreCart(nextType);
  state.route = state.orderType === "return" ? "returns" : "create";
  state.modal = null;
  state.query = "";
  if (typeof resetPage === "function") resetPage("createProducts");
  ensureSalesScope();
  render();
}

function setRoute(route) {
  const previousType = state.orderType;
  persistCart(previousType);
  state.route = route;
  state.query = "";
  state.modal = null;
  if (route === "returns") state.orderType = "return";
  if (route === "create") state.orderType = "sale";
  if (state.orderType !== previousType) restoreCart(state.orderType);
  ensureSalesScope();
  render();
}

function handleRouteClick(route) {
  setRoute(route);
}

function handleOrderRouteClick(type) {
  openOrderRoute(type);
}

function navButton(route, label) {
  const activeClass = state.route === route ? "active" : "";
  return `<button type="button" class="${activeClass}" onclick="handleRouteClick(${jsArg(route)})"><span class="nav-icon">${icon(route)}</span><span>${html(label)}</span></button>`;
}

function orderBadgeClass(status) {
  return orderStatusTone(status);
}

function orderActionButton(title, type, action, orderId) {
  return `<button type="button" class="icon-btn order-tool-button" title="${html(title)}" aria-label="${html(title)}" onclick="handleOrderAction(${jsArg(action)}, ${jsArg(orderId)})">${svgIcon(type)}</button>`;
}

function orderMoreMenu(orderId) {
  return `<div class="order-more-menu order-popover-menu">
    <button type="button" class="icon-btn order-tool-button order-more-trigger" title="更多操作" aria-label="更多操作" onpointerdown="event.stopPropagation();this.parentElement.toggleAttribute('open')">${svgIcon("more")}</button>
    <div class="order-more-dropdown">
      <button type="button" onclick="repeatOrder(${jsArg(orderId)})"><span>${svgIcon("copy")}</span>再来一单</button>
      <button type="button" onclick="openModal('delivery',${jsArg(orderId)})"><span>${svgIcon("truck")}</span>开送货单</button>
      ${isAdmin() ? `<button type="button" class="danger" onclick="deleteOrder(${jsArg(orderId)})"><span>${svgIcon("delete")}</span>删除订单</button>` : ""}
    </div>
  </div>`;
}

function orderStatusMenu(orderId, selected) {
  return `<details class="order-status-menu order-popover-menu">
    <summary class="icon-btn order-tool-button" title="修改订单状态" aria-label="修改订单状态">${svgIcon("down")}</summary>
    <div class="order-status-dropdown">
      ${ORDER_STATUS_CHOICES.map((value) => `
        <button type="button" class="order-status-option ${orderStatusTone(value)} ${value === selected ? "selected" : ""}" onclick="updateOrderStatus(${jsArg(orderId)},${jsArg(value)})">
          <span class="status-dot"></span><span>${html(value)}</span>${value === selected ? `<b>✓</b>` : ""}
        </button>`).join("")}
    </div>
  </details>`;
}

function orderPaymentMenu(orderId, selected) {
  return `<details class="order-payment-menu order-popover-menu">
    <summary class="icon-btn order-tool-button order-payment-trigger" title="修改回款状态" aria-label="修改回款状态"><strong>￥</strong>${svgIcon("down")}</summary>
    <div class="order-status-dropdown payment-dropdown">
      ${["待回款", "已回款"].map((value) => `
        <button type="button" class="order-status-option ${paymentStatusTone(value)} ${value === selected ? "selected" : ""}" onclick="updateOrderPayment(${jsArg(orderId)},${jsArg(value)})">
          <span class="status-dot"></span><span>${value}</span>${value === selected ? `<b>✓</b>` : ""}
        </button>`).join("")}
    </div>
  </details>`;
}

function handleOrderAction(action, orderId) {
  if (action === "view") {
    openModal("document", orderId);
    return;
  }
  if (action === "edit") {
    openModal("editOrder", orderId);
    return;
  }
  if (action === "delete") {
    deleteOrder(orderId);
  }
}

function repeatOrder(orderId) {
  const order = byId(orders, orderId);
  if (!order) return alert("订单不存在");
  const customer = byId(visibleCustomers(), order.customerId);
  if (!customer) return alert("当前账号无权为该客户开单");
  const invalidQuantityItems = (order.items || []).filter((item) => !isPositiveInteger(item.quantity));
  if (invalidQuantityItems.length) {
    const names = invalidQuantityItems.slice(0, 3).map((item) => orderItemDetails(item).label).join("、");
    return alert(`该历史订单包含非整数数量（${names}${invalidQuantityItems.length > 3 ? "等" : ""}），请先编辑订单修正后再来一单。`);
  }

  const previousType = state.orderType;
  persistCart(previousType);
  state.orderType = "sale";
  restoreCart("sale");
  if (state.cart.length && !confirm("当前销售购物车已有商品，是否用这张订单覆盖？")) {
    state.orderType = previousType;
    restoreCart(previousType);
    return;
  }

  const unavailable = [];
  const nextCart = (order.items || []).map((item) => {
    const product = byId(products, item.productId);
    if (!product || !isProductActive(product)) {
      unavailable.push(orderItemDetails(item).label || item.productId);
      return null;
    }
    return { productId: product.id, quantity: Number(item.quantity), price: Number(product.price || 0) };
  }).filter(Boolean);
  if (!nextCart.length) {
    state.orderType = previousType;
    restoreCart(previousType);
    return alert("该订单中的商品当前均不在售，无法加入购物车");
  }

  state.cart = nextCart;
  state.selectedCustomerId = customer.id;
  const originalSalespersonActive = activeSalesUsers().some((user) => user.id === order.salesUserId);
  state.salesUserId = canChooseSalesperson() && originalSalespersonActive ? order.salesUserId : state.user.id;
  state.orderDraftCustomerId = customer.id;
  state.orderAddress = order.address || customer.address || "";
  state.orderPhone = order.phone || customer.phone || "";
  state.orderRemark = order.remark || "";
  state.route = "create";
  state.modal = null;
  state.query = "";
  resetPage("createProducts");
  persistCart("sale");
  render();
  showToast(unavailable.length ? `已恢复订单，${unavailable.length} 项已下架商品未加入` : "订单商品已放入购物车");
}

async function deleteOrder(orderId) {
  if (!isAdmin()) return alert("只有管理员可以删除订单");
  const order = byId(orders, orderId);
  const customer = byId(customers, order?.customerId) || {};
  if (!order || !confirm(`确定删除订单 ${order.no} 吗？\n客户：${customer.name || "-"}\n金额：${money(order.amount)}\n\n删除后订单将从业务页面和统计中隐藏。`)) return;
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return alert(data.error || "删除订单失败");
  orders = orders.filter((item) => item.id !== orderId);
  showToast("订单已删除");
  render();
}

function orderCard(order) {
  const customer = byId(customers, order.customerId) || {};
  const salesperson = byId(salesUsers, order.salesUserId) || {};
  const payStatus = normalizeClientPayStatus(order.payStatus);
  const status = order.status || "待确认";
  const address = order.address || customer.address || "-";
  const isReturn = order.type === "return" || String(order.no || "").startsWith("TH");
  const orderTypeLabel = isReturn ? "退货单" : "销售单";
  return `
    <article class="order-card order-card-polished">
      <div class="order-card-accent"></div>
      <div class="order-card-body">
        <div class="order-card-head">
          <div class="order-card-title-row">
            <h3>${html(order.no)}</h3>
            <span class="badge ${orderBadgeClass(status)}">${html(status)}</span>
            <span class="badge ${paymentStatusTone(payStatus)}">${html(payStatus)}</span>
          </div>
          <strong class="order-amount">${money(order.amount)}</strong>
        </div>
        <div class="order-card-meta order-card-meta-grid">
          <span><b>客户</b>${html(customer.name || "-")}</span>
          <span><b>日期</b>${html(order.date || "-")}</span>
          <span><b>销售</b>${html(salesperson.name || "-")}</span>
          <span><b>商品</b>${(order.items || []).length} 项</span>
          <span><b>电话</b>${html(customer.phone || "-")}</span>
        </div>
        <div class="order-card-bottom">
          <div class="order-card-address">地址：${html(address)}</div>
          <div class="order-actions order-icon-toolbar">
            ${orderActionButton("查看订单", "view", "view", order.id)}
            ${orderActionButton("编辑订单", "edit", "edit", order.id)}
            <span class="order-tool-divider"></span>
            ${orderStatusMenu(order.id, status)}
            ${orderPaymentMenu(order.id, payStatus)}
            ${orderMoreMenu(order.id)}
          </div>
        </div>
      </div>
    </article>
  `;
}

function exportOrderImage(orderId) {
  downloadOrderImage(orderId);
}

function bindGlobalClickHandlers() {
  if (window.__buildingSalesClickBound) return;
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".order-popover-menu[open]").forEach((menu) => {
      if (!menu.contains(event.target)) menu.removeAttribute("open");
    });
    const orderAction = event.target.closest("[data-order-action]");
    if (orderAction) {
      event.preventDefault();
      event.stopPropagation();
      handleOrderAction(orderAction.dataset.orderAction, orderAction.dataset.orderId);
      return;
    }

    const orderRoute = event.target.closest("[data-order-route]");
    if (orderRoute) {
      event.preventDefault();
      event.stopPropagation();
      handleOrderRouteClick(orderRoute.dataset.orderRoute);
      return;
    }

    const routeButton = event.target.closest("[data-route]");
    if (routeButton) {
      event.preventDefault();
      event.stopPropagation();
      handleRouteClick(routeButton.dataset.route);
    }
  });
  window.__buildingSalesClickBound = true;
}

function productCard(p) {
  const selectedLine = cartItemForProduct(p.id);
  const selected = Boolean(selectedLine);
  const active = isProductActive(p);
  const quantityControl = selected
    ? `<div class="product-card-qty" title="已选数量">
        <button type="button" onclick="event.stopPropagation();changeQty(${jsArg(p.id)},-1)">-</button>
        <input class="qty-input" type="number" min="1" step="1" inputmode="numeric" value="${Number(selectedLine.quantity || 0)}" onclick="event.stopPropagation()" onchange="setCartQuantity(${jsArg(p.id)},this.value)" onkeydown="if(event.key==='Enter')this.blur()" />
        <button type="button" onclick="event.stopPropagation();changeQty(${jsArg(p.id)},1)">+</button>
      </div>`
    : active
      ? `<button class="icon-btn product-add-btn" title="加入购物车" onclick="addToCart(${jsArg(p.id)})">${svgIcon("plus")}</button>`
      : `<span class="badge danger">停用</span>`;
  return `
    <article class="product-card ${active ? "" : "disabled"} ${selected ? "selected" : ""}">
      ${productThumbnail(p, "catalog")}
      <div>
        <h4 class="product-title">${html(p.name)}</h4>
        <div class="product-spec">${html(p.spec || "无规格")}</div>
        <div class="product-spec">${html(productMeta(p))} · ${html(p.unit || "-")}</div>
        <div class="price">${money(p.price)}</div>
      </div>
      ${quantityControl}
    </article>
  `;
}

function productModal(id) {
  const p = byId(products, id) || { cat1: "辅助商品", status: "在售", aliases: [] };
  const aliases = Array.isArray(p.aliases) ? p.aliases.join("，") : (p.aliases || "");
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal side">
        <div class="modal-head"><h3>${id ? "编辑商品" : "新增商品"}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="product-image-editor">
            ${p.imageUrl ? `<img src="${html(p.imageUrl)}" alt="${html(p.name || "商品图片")}" />` : `<div class="product-image-placeholder">暂无商品图片</div>`}
            <div><label class="btn" for="productImageFile">选择图片</label><input id="productImageFile" type="file" accept="image/png,image/jpeg,image/webp" hidden onchange="previewProductImage(this)" /><div class="hint">支持 PNG、JPG、WebP，文件不超过 3MB。保存商品时一并上传。</div></div>
          </div>
          <div class="form-grid">
            <div class="field"><label>商品名称 *</label><input id="productName" class="input" value="${html(p.name || "")}" /></div>
            <div class="field"><label>规格</label><input id="productSpec" class="input" value="${html(p.spec || "")}" placeholder="可不填，有规格时建议写清楚" /></div>
            <div class="field"><label>一级分类 *</label><select id="productCat1" class="select" onchange="refreshProductCat2Options()">${PRODUCT_CATEGORIES.filter((cat) => cat !== "全部").map((cat) => `<option ${p.cat1 === cat ? "selected" : ""}>${html(cat)}</option>`).join("")}</select></div>
            <div class="field"><label>二级分类</label><div id="productCat2Wrap" class="stacked-field">${productCat2Control(p.cat1 || "辅助商品", p.cat2 || "")}</div></div>
            <div class="field"><label>单位 *</label><input id="productUnit" class="input" value="${html(p.unit || "")}" /></div>
            <div class="field"><label>销售价 *</label><input id="productPrice" class="input" type="number" step="0.01" value="${Number(p.price || 0)}" /></div>
            <div class="field"><label>成本价</label><input id="productCost" class="input" type="number" step="0.01" value="${Number(p.cost || 0)}" /></div>
            <div class="field"><label>状态</label><select id="productStatus" class="select">${["在售", "停用"].map((item) => `<option ${p.status === item ? "selected" : ""}>${item}</option>`).join("")}</select></div>
          </div>
          <details class="advanced-box">
            <summary>高级设置</summary>
            <div class="form-grid" style="margin-top:12px">
              <div class="field"><label>商品编码</label><input id="productCode" class="input" value="${html(p.code || p.id || "")}" ${id ? "disabled" : ""} /></div>
              <div class="field" style="grid-column:1/-1"><label>别名 / 关键词</label><textarea id="productAliases" class="textarea" placeholder="多个别名用逗号或换行隔开">${html(aliases)}</textarea><div class="hint">AI 开单会使用别名辅助匹配，开单显示仍以商品库名称、规格、单位、价格为准。</div></div>
            </div>
          </details>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveProduct(${jsArg(id || "")})">保存商品</button></div>
      </div>
    </div>
  `;
}

function assistantScopeText() {
  if (isAdmin()) return "可查询全公司业务数据，成本与利润仅在管理员权限下显示";
  return state.user?.role === "销售人员"
    ? "只查询属于你的客户、订单和业绩数据"
    : "按当前账号权限查询业务数据";
}

function assistantWelcomeHtml() {
  const prompts = [
    "查询今日销售情况",
    "查询本月销售情况",
    "查看待回款订单",
    "查看本月热销商品",
    "查询客户最近购买",
  ];
  return `
    <div class="xiaocai-welcome">
      <img src="./assets/xiaocai.png" alt="" />
      <div><strong>你好，我是小材</strong><p>我可以帮你查询客户、商品、订单、回款和销售情况。</p></div>
    </div>
    <div class="xiaocai-scope">${svgIcon("view")}<span>${html(assistantScopeText())}</span></div>
    <div class="xiaocai-quick-grid">${prompts.map((prompt) => `<button type="button" onclick="sendXiaocai(${jsArg(prompt)})">${html(prompt)}</button>`).join("")}</div>
  `;
}

function assistantBlockHtml(block) {
  if (!block) return "";
  if (block.type === "metrics") {
    return `<div class="xiaocai-metrics">${(block.items || []).map((item) => `<div><span>${html(item.label)}</span><strong>${html(item.value)}</strong></div>`).join("")}</div>`;
  }
  if (block.type === "table") {
    return `
      <div class="xiaocai-table-wrap">
        ${block.title ? `<strong class="xiaocai-block-title">${html(block.title)}</strong>` : ""}
        <table class="xiaocai-table">
          <thead><tr>${(block.columns || []).map((column) => `<th>${html(column)}</th>`).join("")}</tr></thead>
          <tbody>${(block.rows || []).map((row) => `<tr>${row.map((cell) => `<td>${html(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
        </table>
      </div>
    `;
  }
  return "";
}

function assistantMessageHtml(message, index) {
  const isUser = message.role === "user";
  return `
    <div class="xiaocai-message ${isUser ? "is-user" : "is-assistant"}">
      ${isUser ? "" : `<img class="xiaocai-message-avatar" src="./assets/xiaocai.png" alt="小材" />`}
      <div class="xiaocai-message-content">
        <div class="xiaocai-bubble">${html(message.content || "").replace(/\n/g, "<br />")}</div>
        ${isUser ? "" : (message.blocks || []).map(assistantBlockHtml).join("")}
        ${isUser ? "" : `<div class="xiaocai-message-actions">
          ${(message.links || []).map((link) => `<button type="button" onclick="openXiaocaiRoute(${jsArg(link.route)})">${html(link.label)}</button>`).join("")}
          ${(message.followUps || []).map((prompt) => `<button type="button" onclick="sendXiaocai(${jsArg(prompt)})">${html(prompt)}</button>`).join("")}
        </div>`}
      </div>
    </div>
  `;
}

function renderXiaocai() {
  if (!state.user) return "";
  const sideClass = state.assistantSide === "left" ? "is-left" : "is-right";
  return `
    <div class="xiaocai-assistant ${sideClass} ${state.assistantOpen ? "is-open" : ""}">
      ${state.assistantOpen ? `
        <section class="xiaocai-panel" aria-label="小材 AI 业务助手">
          <header class="xiaocai-head">
            <div class="xiaocai-identity"><img src="./assets/xiaocai.png" alt="" /><div><strong>小材</strong><span><i></i>AI 业务助手</span></div></div>
            <div class="xiaocai-head-actions">
              <button type="button" class="icon-btn" title="清空聊天记录" aria-label="清空聊天记录" onclick="clearXiaocaiHistory()">${svgIcon("delete")}</button>
              <button type="button" class="icon-btn" title="收起小材" aria-label="收起小材" onclick="toggleXiaocai()">${svgIcon("close")}</button>
            </div>
          </header>
          <div id="xiaocaiMessages" class="xiaocai-messages">
            ${state.assistantMessages.length ? state.assistantMessages.map(assistantMessageHtml).join("") : assistantWelcomeHtml()}
            ${state.assistantLoading ? `<div class="xiaocai-message is-assistant"><img class="xiaocai-message-avatar" src="./assets/xiaocai.png" alt="" /><div class="xiaocai-thinking"><span></span><span></span><span></span><em id="xiaocaiStage">正在理解问题</em></div></div>` : ""}
            ${state.assistantError ? `<div class="xiaocai-error"><span>${html(state.assistantError)}</span><button type="button" onclick="retryXiaocai()">重试</button></div>` : ""}
          </div>
          <footer class="xiaocai-compose">
            <textarea id="xiaocaiInput" maxlength="500" placeholder="问小材：钱勇最近买过什么？" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false'" onkeydown="handleXiaocaiKey(event)"></textarea>
            <div><span>小材只读取你有权限的数据</span>${state.assistantLoading ? `<button type="button" class="xiaocai-stop" onclick="stopXiaocai()">停止</button>` : `<button type="button" class="xiaocai-send" title="发送" aria-label="发送" onclick="sendXiaocai()">${svgIcon("arrowRight")}</button>`}</div>
          </footer>
        </section>
      ` : ""}
      <button type="button" class="xiaocai-launcher" title="打开小材 AI 助手" aria-label="打开小材 AI 助手" onpointerdown="startXiaocaiDrag(event)" onclick="toggleXiaocai()">
        <span class="xiaocai-pulse"></span><img src="./assets/xiaocai.png" alt="" /><strong>小材</strong>
      </button>
    </div>
  `;
}

function scrollXiaocaiToBottom() {
  requestAnimationFrame(() => {
    const container = document.getElementById("xiaocaiMessages");
    if (container) container.scrollTop = container.scrollHeight;
  });
}

async function loadXiaocaiHistory() {
  if (state.assistantLoaded) return;
  try {
    const response = await fetch("/api/assistant/history");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "聊天记录加载失败");
    state.assistantMessages = Array.isArray(data.messages) ? data.messages : [];
    state.assistantLoaded = true;
    render();
    scrollXiaocaiToBottom();
  } catch (error) {
    state.assistantLoaded = true;
    state.assistantError = error.message;
    render();
  }
}

function toggleXiaocai() {
  if (suppressAssistantClick) return;
  state.assistantOpen = !state.assistantOpen;
  render();
  if (state.assistantOpen) {
    loadXiaocaiHistory();
    scrollXiaocaiToBottom();
    requestAnimationFrame(() => document.getElementById("xiaocaiInput")?.focus());
  }
}

function handleXiaocaiKey(event) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.currentTarget.dataset.composing === "true") return;
  event.preventDefault();
  sendXiaocai();
}

function startAssistantStages() {
  clearInterval(assistantStageTimer);
  const stages = ["正在理解问题", "正在查询业务数据", "正在整理答案"];
  let index = 0;
  assistantStageTimer = setInterval(() => {
    index = Math.min(index + 1, stages.length - 1);
    const stage = document.getElementById("xiaocaiStage");
    if (stage) stage.textContent = stages[index];
  }, 1800);
}

async function sendXiaocai(prompt = "") {
  if (state.assistantLoading) return;
  const input = document.getElementById("xiaocaiInput");
  const message = String(prompt || input?.value || "").trim();
  if (!message) return;
  if (input) input.value = "";
  state.assistantLastQuestion = message;
  state.assistantError = "";
  state.assistantLoading = true;
  state.assistantMessages.push({ id: `local-${Date.now()}`, role: "user", content: message, createdAt: new Date().toISOString() });
  render();
  scrollXiaocaiToBottom();
  startAssistantStages();
  assistantAbortController = new AbortController();
  try {
    const response = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
      signal: assistantAbortController.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "小材暂时无法回答");
    state.assistantMessages.push(data);
    state.assistantLoaded = true;
  } catch (error) {
    state.assistantError = error.name === "AbortError" ? "已停止本次查询" : error.message;
  } finally {
    clearInterval(assistantStageTimer);
    assistantAbortController = null;
    state.assistantLoading = false;
    render();
    scrollXiaocaiToBottom();
  }
}

function stopXiaocai() {
  assistantAbortController?.abort();
}

function retryXiaocai() {
  const question = state.assistantLastQuestion;
  const last = state.assistantMessages[state.assistantMessages.length - 1];
  if (last?.role === "user" && last.content === question) state.assistantMessages.pop();
  state.assistantError = "";
  sendXiaocai(question);
}

async function clearXiaocaiHistory() {
  if (!confirm("确定清空当前账号最近 30 天的小材聊天记录吗？")) return;
  try {
    const response = await fetch("/api/assistant/history", { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "清空失败");
    state.assistantMessages = [];
    state.assistantError = "";
    state.assistantLoaded = true;
    render();
  } catch (error) {
    state.assistantError = error.message;
    render();
  }
}

function openXiaocaiRoute(route) {
  if (!["dashboard", "customers", "products", "orders"].includes(route)) return;
  state.assistantOpen = false;
  setRoute(route);
}

function startXiaocaiDrag(event) {
  if (window.matchMedia("(max-width: 720px)").matches) return;
  const launcher = event.currentTarget;
  const startX = event.clientX;
  const startY = event.clientY;
  let moved = false;
  launcher.setPointerCapture?.(event.pointerId);
  const move = (moveEvent) => {
    const dx = moveEvent.clientX - startX;
    const dy = moveEvent.clientY - startY;
    if (Math.hypot(dx, dy) > 6) moved = true;
    launcher.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const finish = (upEvent) => {
    launcher.removeEventListener("pointermove", move);
    launcher.removeEventListener("pointerup", finish);
    launcher.removeEventListener("pointercancel", finish);
    launcher.style.transform = "";
    if (!moved) return;
    suppressAssistantClick = true;
    state.assistantSide = upEvent.clientX < window.innerWidth / 2 ? "left" : "right";
    try {
      localStorage.setItem("xiaocai-side", state.assistantSide);
    } catch (_) {
      // Keep the selected side for this session.
    }
    render();
    setTimeout(() => { suppressAssistantClick = false; }, 0);
  };
  launcher.addEventListener("pointermove", move);
  launcher.addEventListener("pointerup", finish);
  launcher.addEventListener("pointercancel", finish);
}

Object.assign(window, {
  setRoute,
  openOrderRoute,
  handleRouteClick,
  handleOrderRouteClick,
  handleOrderAction,
  repeatOrder,
  deleteOrder,
  saveCustomer,
  selectOrderCustomer,
  updateOrderDraftField,
  updateEditOrderMeta,
  updateEditOrderLine,
  moveEditOrderLine,
  handleEditOrderDragKey,
  startEditOrderDrag,
  openEditCustomerPicker,
  closeEditCustomerPicker,
  updateEditCustomerSearch,
  selectEditOrderCustomer,
  toggleEditProductPicker,
  updateEditProductFilter,
  refreshEditProductPicker,
  addEditOrderProduct,
  saveProduct,
  previewProductImage,
  downloadProductTemplate,
  exportProducts,
  importProducts,
  toggleProductSelection,
  toggleCurrentProductPage,
  changeAiSearchCategory,
  refreshAiManualSearch,
  removeAiMatchedLine,
  openModal,
  closeModal,
  updateOrderStatus,
  updateOrderPayment,
  downloadOrderImage,
  downloadDeliveryImage,
  copyOrderText,
  exportOrderImage,
  login,
  logout,
  toggleLoginPassword,
  toggleXiaocai,
  sendXiaocai,
  stopXiaocai,
  retryXiaocai,
  clearXiaocaiHistory,
  openXiaocaiRoute,
  handleXiaocaiKey,
  startXiaocaiDrag,
});

bindGlobalClickHandlers();
bindTextCompositionGuards();
boot();
