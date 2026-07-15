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
  aiText: "",
  aiLearnPairs: [],
  loginPasswordVisible: false,
};

let inputRenderTimer = null;

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
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => renderKeepingInput(inputId, selectionStart, selectionEnd), 180);
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
    state.user = null;
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
  return ({ dashboard: "查看今日销售、客户和订单状态", customers: "管理客户信息和成交记录", products: "管理建材商品信息与价格", create: "选择客户和商品生成销售单", orders: "管理订单状态、打印和导出", returns: "从销售流程中创建退货单", users: "添加登录人员，维护手机号、密码和角色定位" }[state.route]);
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
  return state.cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

function openAiOrderModal() {
  state.aiDraft = null;
  state.aiLoading = false;
  state.aiText = "";
  state.modal = { type: "aiOrder" };
  render();
}

async function analyzeAiOrder() {
  const content = document.getElementById("aiOrderText").value.trim();
  if (!content) {
    alert("请先粘贴客户发来的材料清单。");
    return;
  }
  state.aiText = content;
  state.aiLoading = true;
  render();
  try {
    const response = await fetch("/api/ai/order-draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content, customerId: state.selectedCustomerId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "AI 识别失败");
    state.aiDraft = data;
    state.aiLoading = false;
    render();
  } catch (error) {
    state.aiLoading = false;
    render();
    alert(error.message);
  }
}

function addDraftLine(productId, quantity) {
  const product = byId(products, productId);
  if (!product) return false;
  const value = Number(quantity);
  if (!Number.isFinite(value) || value <= 0) return false;
  const line = state.cart.find((item) => item.productId === productId);
  if (line) line.quantity += value;
  else state.cart.push({ productId, quantity: value, price: product.price });
  return true;
}

function rememberAiChoice(rawName, productId) {
  if (!rawName || !productId) return;
  state.aiLearnPairs.push({ rawName, productId });
}

function applyAiDraft() {
  if (!state.aiDraft) return;
  state.aiLearnPairs = [];
  state.aiDraft.matched.forEach((item) => {
    if (addDraftLine(item.productId, item.quantity)) rememberAiChoice(item.rawName, item.productId);
  });
  document.querySelectorAll("[data-ai-quantity-product]").forEach((input) => {
    if (addDraftLine(input.dataset.aiQuantityProduct, input.value)) rememberAiChoice(input.dataset.aiRawName, input.dataset.aiQuantityProduct);
  });
  document.querySelectorAll("[data-ai-candidate-product]").forEach((select) => {
    const quantityInput = document.querySelector(`[data-ai-candidate-quantity="${select.dataset.aiCandidateProduct}"]`);
    if (addDraftLine(select.value, quantityInput ? quantityInput.value : "")) rememberAiChoice(select.dataset.aiRawName, select.value);
  });
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
  if (type === "document") return documentModal(id);
  if (type === "editOrder") return editOrderModal(id);
  if (type === "user") return userModal();
  if (type === "aiOrder") return aiOrderModal();
  return "";
}

function aiOrderModal() {
  const customer = byId(customers, state.selectedCustomerId);
  const draft = state.aiDraft;
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal ai-modal">
        <div class="modal-head">
          <div><h3>AI 帮我开单</h3><div class="hint">当前客户：${customer ? `${customer.name} - ${customer.phone}` : "请先选择客户"}。AI 只匹配商品库商品，生成后还需要销售确认保存。</div></div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="field">
            <label>客户发来的材料清单</label>
            <textarea id="aiOrderText" class="textarea ai-textarea" oninput="state.aiText=this.value" placeholder="例如：石膏板18张主骨25根付骨47根丝杆4根，38钢钉3盒直钉3盒白乳胶一小桶...">${state.aiText}</textarea>
          </div>
          <div class="ai-actions">
            <button class="btn primary" onclick="analyzeAiOrder()" ${state.aiLoading ? "disabled" : ""}>${state.aiLoading ? "识别中..." : "开始识别"}</button>
            <span class="hint">名称、单位、价格最终都以商品库为准。</span>
          </div>
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
  return `
    <div class="ai-result">
      ${renderAiMatched(draft.matched || [])}
      ${renderAiNeedsQuantity(draft.needsQuantity || [])}
      ${renderAiUncertain(draft.uncertain || [])}
      ${renderAiUnmatched(draft.unmatched || [])}
    </div>
  `;
}

function renderAiMatched(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>已匹配商品</h4>
      ${list.map((item) => `<div class="ai-line"><div><strong>${html(item.name)}</strong><div class="hint">${html(item.spec || "")} · ${html(item.unit)} · 原文：${html(item.rawName || "-")}</div></div><div class="num">${html(item.quantity)} ${html(item.unit)}</div><div class="num">${money(item.price)}</div></div>`).join("")}
    </section>
  `;
}

function renderAiNeedsQuantity(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>需要补数量</h4>
      ${list.map((item) => `<div class="ai-line"><div><strong>${html(item.name)}</strong><div class="hint">${html(item.spec || "")} · ${html(item.unit)} · 原文：${html(item.rawName || "-")}</div></div><input class="input ai-small-input" type="number" min="0" step="0.01" placeholder="数量" data-ai-quantity-product="${html(item.productId)}" data-ai-raw-name="${html(item.rawName || "")}" /><div class="num">${money(item.price)}</div></div>`).join("")}
    </section>
  `;
}

function renderAiUncertain(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>需要选择商品</h4>
      ${list.map((item, index) => `<div class="ai-line ai-line-stack"><div><strong>原文：${html(item.rawName || "-")}</strong><div class="hint">请选择商品库中的准确商品</div></div><select class="select" data-ai-candidate-product="${index}" data-ai-raw-name="${html(item.rawName || "")}">${(item.candidates || []).map((product) => `<option value="${html(product.productId)}">${html(product.name)} / ${html(product.spec || "无规格")} / ${html(product.unit || "-")} / ${html(product.cat1 || "-")}${product.cat2 ? " · " + html(product.cat2) : ""} / ${money(product.price)}</option>`).join("")}</select><input class="input ai-small-input" type="number" min="0" step="0.01" value="${html(item.quantity || "")}" placeholder="数量" data-ai-candidate-quantity="${index}" /></div>`).join("")}
    </section>
  `;
}

function renderAiUnmatched(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>未匹配，暂不加入订单</h4>
      ${list.map((item) => `<div class="ai-line muted-line"><div><strong>${html(item.rawName || "-")}</strong><div class="hint">${html(item.note || "商品库中未找到明确商品")}</div></div></div>`).join("")}
    </section>
  `;
}
function customerModal(id) {
  const c = byId(customers, id) || {};
  return modalShell(id ? "编辑客户" : "新增客户", `
    <div class="form-grid">
      ${field("客户名称 *", c.name || "")}
      ${field("联系人", c.contact || "")}
      ${field("联系电话 *", c.phone || "")}
      ${field("邮箱", c.email || "")}
      <div class="field" style="grid-column:1/-1"><label>地址</label><input class="input" value="${c.address || ""}" placeholder="请输入地址" /></div>
    </div>
  `, "确认", "showToast('客户信息已更新');closeModal()");
}

function productModal(id) {
  const p = byId(products, id) || {};
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal side">
        <div class="modal-head"><h3>${id ? "编辑产品" : "新增产品"}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
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

function documentModal(id) {
  const order = byId(orders, id);
  const c = byId(customers, order.customerId);
  const s = byId(salesUsers, order.salesUserId);
  const title = order.no.startsWith("TH") || order.status === "已退货" ? "退货单" : "销售订单";
  const rows = getDisplayRows(order);
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal">
        <div class="modal-head"><h3>订单详情 - ${title}</h3><div class="document-actions"><button class="btn" onclick="downloadOrderImage('${order.id}')">⇩ 图片</button><button class="btn" onclick="downloadOrderHtml('${order.id}')">文档</button><button class="icon-btn" onclick="closeModal()">×</button></div></div>
        <div class="modal-body">
          <div class="doc-preview">
            <h2>${title}</h2>
            <div class="doc-subtitle">材达家建材销售系统</div>
            <div class="doc-info">
              <div><span>客户：</span>${c.name}</div>
              <div><span>单号：</span>${order.no}</div>
              <div><span>日期：</span>${order.date}</div>
              <div class="right"><span>销售：</span>${s?.name || "-"}</div>
              <div class="doc-address"><span>地址：</span>${c.address}</div>
            </div>
            <table><thead><tr><th>编号</th><th>商品名称</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr></thead><tbody>${rows.map((row) => row.empty ? `<tr><td>${row.index}</td><td></td><td></td><td></td><td></td><td></td></tr>` : `<tr><td>${row.index}</td><td>${row.name}</td><td>${row.unit}</td><td>${row.quantity}</td><td>${money(row.price)}</td><td>${money(row.amount)}</td></tr>`).join("")}</tbody></table>
            <div class="doc-bottom">
              <div><strong>合计大写：</strong>${amountToChinese(order.amount)}<br /><strong>销售电话：</strong>${maskPhone(s?.phone || c.phone)}</div>
              <div class="doc-total"><span>此单合计金额：</span><strong>${money(order.amount)}</strong></div>
            </div>
          </div>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">关闭</button><button class="btn primary" onclick="printOrder('${order.id}')">打印</button></div>
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
    view: `<svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.8"/></svg>`,
    edit: `<svg viewBox="0 0 24 24"><path d="M4 20h4.2L18.7 9.5a2.2 2.2 0 0 0 0-3.1l-1.1-1.1a2.2 2.2 0 0 0-3.1 0L4 15.8V20Z"/><path d="m13.8 6 4.2 4.2"/></svg>`,
    delete: `<svg viewBox="0 0 24 24"><path d="M5 7h14"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M8 7l.7 12h6.6L16 7"/><path d="M9 7l1-2h4l1 2"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-13.4 5.9"/><path d="M4 12A8 8 0 0 1 17.4 6.1"/><path d="M17 3v4h-4"/><path d="M7 21v-4h4"/></svg>`,
    orders: `<svg viewBox="0 0 24 24"><path d="M6 4h12v16H6z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>`,
    plus: `<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
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
    const product = byId(products, item.productId);
    return {
      index: index + 1,
      name: product?.name || "",
      unit: product?.unit || "",
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
      <td>${row.name}</td>
      <td>${row.unit}</td>
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
      <div class="address"><span>地址：</span>${customer.address}</div>
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

function downloadOrderImage(orderId) {
  const { order, customer, title } = getOrderDoc(orderId);
  const sales = byId(salesUsers, order.salesUserId);
  const rows = getOrderRows(order);
  const rowCount = Math.max(rows.length, 8);
  const tableY = 470;
  const headerH = 58;
  const rowHeight = 54;
  const tableEndY = tableY + headerH + 12 + rowCount * rowHeight;
  const summaryY = tableEndY + 120;
  const canvas = document.createElement("canvas");
  const scale = 2;
  const width = 1800;
  const height = Math.max(1450, summaryY + 190);
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#fdfdff";
  ctx.fillRect(0, 0, width, height);

  const pageX = 55;
  const pageY = 55;
  const pageW = width - 110;
  const pageH = height - 110;
  ctx.strokeStyle = "#dae1eb";
  ctx.lineWidth = 1;
  ctx.strokeRect(pageX, pageY, pageW, pageH);

  ctx.fillStyle = "#5c708a";
  ctx.textAlign = "left";
  ctx.font = "700 25px Microsoft YaHei, Arial";
  ctx.fillText("材达家建材销售系统", 75, 98);

  ctx.fillStyle = "#172033";
  ctx.font = "800 52px Microsoft YaHei, Arial";
  ctx.fillText(title, 75, 158);

  ctx.strokeStyle = "#3a5dd6";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(75, 210);
  ctx.lineTo(width - 75, 210);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#172033";
  ctx.font = "700 28px Microsoft YaHei, Arial";
  ctx.fillText(`客户  ${customer.name}`, 75, 270);
  ctx.font = "400 28px Microsoft YaHei, Arial";
  ctx.fillText(`地址  ${customer.address || "-"}`, 75, 330);
  ctx.fillText(`电话  ${maskPhone(customer.phone)}`, 75, 390);

  ctx.font = "700 27px Microsoft YaHei, Arial";
  ctx.fillText(`单号  ${order.no}`, 1190, 270);
  ctx.font = "400 27px Microsoft YaHei, Arial";
  ctx.fillText(`日期  ${order.date}`, 1190, 330);
  ctx.fillText(`销售  ${sales?.name || "-"}`, 1190, 390);

  const tableX = 75;
  const tableW = width - 150;
  const cols = [76, tableW - 76 - 170 - 90 - 90 - 145 - 135, 170, 90, 90, 145, 135];
  const headers = ["序号", "品名", "规格", "单位", "数量", "单价", "金额"];
  ctx.fillStyle = "#f5f7fb";
  ctx.fillRect(tableX, tableY, tableW, headerH);
  ctx.fillStyle = "#172033";
  ctx.font = "800 24px Microsoft YaHei, Arial";
  let headerX = tableX;
  headers.forEach((header, i) => {
    drawCellText(ctx, header, headerX, tableY, cols[i], headerH, i === 1 ? "left" : "center");
    headerX += cols[i];
  });

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(tableX, tableY + headerH);
  ctx.lineTo(tableX + tableW, tableY + headerH);
  ctx.stroke();

  ctx.font = "400 23px Microsoft YaHei, Arial";
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = rows[rowIndex];
    const y = tableY + headerH + 12 + rowHeight * rowIndex;
    if (row) {
      const product = byId(products, row.productId);
      const spec = product?.spec || "-";
      const values = [
        rowIndex + 1,
        row.name,
        spec,
        row.unit,
        row.quantity,
        money(row.price),
        money(row.amount)
      ];
      let cellX = tableX;
      ctx.fillStyle = "#172033";
      values.forEach((value, i) => {
        const align = i === 1 ? "left" : i === 6 ? "right" : "center";
        ctx.font = i === 1 ? "700 25px Microsoft YaHei, Arial" : "400 23px Microsoft YaHei, Arial";
        drawCellText(ctx, String(value), cellX, y, cols[i], 46, align);
        cellX += cols[i];
      });
    }
    ctx.strokeStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.moveTo(tableX, y + 46);
    ctx.lineTo(tableX + tableW, y + 46);
    ctx.stroke();
  }

  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(75, summaryY - 70);
  ctx.lineTo(width - 75, summaryY - 70);
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = "#172033";
  ctx.font = "700 29px Microsoft YaHei, Arial";
  ctx.fillText(`合计大写 ${amountToChinese(order.amount)}`, 75, summaryY);
  ctx.textAlign = "right";
  ctx.fillStyle = "#3a5dd6";
  ctx.font = "800 42px Microsoft YaHei, Arial";
  ctx.fillText(`合计金额 ${money(order.amount)}`, width - 75, summaryY);

  ctx.textAlign = "left";
  ctx.fillStyle = "#5c708a";
  ctx.font = "400 27px Microsoft YaHei, Arial";
  ctx.fillText("客户签收：____________________", 75, summaryY + 70);
  ctx.fillStyle = "#172033";
  ctx.font = "700 27px Microsoft YaHei, Arial";
  ctx.fillText(`销售电话：${maskPhone(sales?.phone || customer.phone)}`, 75, summaryY + 125);

  canvas.toBlob((blob) => {
    downloadBlob(`${title}_${order.no}.png`, "image/png", blob);
    showToast("图片已下载");
  }, "image/png");
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
  return [p.code, p.name, p.spec, p.cat1, p.cat2, p.unit, ...(p.aliases || [])].join(" ").toLowerCase();
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
  return products.filter((p) => {
    const categoryOk = state.category === "全部" || p.cat1 === state.category;
    const subcategoryOk = !state.productSubcategory || p.cat2 === state.productSubcategory;
    return categoryOk && subcategoryOk && (!q || productSearchText(p).includes(q));
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
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveProduct(${JSON.stringify(id || "")})">保存商品</button></div>
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
  const q = state.productQuery.trim().toLowerCase();
  return products.filter((p) => {
    const categoryOk = state.category === "全部" || p.cat1 === state.category;
    const subcategoryOk = !state.productSubcategory || p.cat2 === state.productSubcategory;
    return categoryOk && subcategoryOk && (!q || productSearchText(p).includes(q));
  });
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
        <div class="visual-board material-hero" aria-hidden="true">
          <div class="hero-sun"></div>
          <div class="hero-card hero-card-a"></div>
          <div class="hero-card hero-card-b"></div>
          <div class="hero-truck">
            <div class="truck-body"></div>
            <div class="truck-cab"></div>
            <div class="truck-wheel wheel-left"></div>
            <div class="truck-wheel wheel-right"></div>
          </div>
          <div class="hero-stack stack-wood"></div>
          <div class="hero-stack stack-tile"></div>
          <div class="hero-worker"></div>
          <div class="hero-title">材达家</div>
          <div class="hero-subtitle">建材开单 · 客户跟进 · 订单管理</div>
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
  const todayText = new Date().toLocaleDateString("zh-CN");
  const todayOrders = scopedOrders.filter((item) => {
    const date = new Date(item.date);
    return !Number.isNaN(date.getTime()) && date.toLocaleDateString("zh-CN") === todayText;
  });
  const total = todayOrders.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pending = scopedOrders.filter((item) => item.status === "待确认").length;
  return `
    <div class="grid kpi-grid">
      ${kpi("今日销售额", money(total), "dashboard")}
      ${kpi("客户数量", scopedCustomers.length, "customers")}
      ${kpi("在售商品", products.filter((p) => isProductActive(p)).length, "products")}
      ${kpi("待确认订单", pending, "orders")}
    </div>
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
const PAY_STATUS_FILTERS = ["全部", "未付款", "已付款"];
const EDIT_PAGE_SIZES = { products: 50, createProducts: 24, orders: 20 };

function ensurePageState() {
  if (!state.pages) state.pages = {};
}

function scheduleInputValue(input, key, inputId) {
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
  return value === "已付款" || value === "已回款" ? "已付款" : "未付款";
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
  scheduleInputValue(input, "productQuery", "productSearchInput");
  resetPage("products");
  resetPage("createProducts");
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
      <input id="productSearchInput" class="input" placeholder="搜索商品名称 / 规格 / 编码 / 别名" value="${html(state.productQuery)}" oninput="updateProductQuery(this)" />
      <div class="spacer"></div>
      ${canManage ? `<button class="btn primary" onclick="openModal('product')">新增商品</button>` : ""}
    </div>
    ${categoryTabs()}
    ${subcategoryTabs()}
    <div class="hint" style="margin:8px 0 12px">共 ${list.length} 个商品，当前显示 ${pageData.items.length} 个</div>
    <div class="card table-wrap product-table">
      <table>
        <thead><tr><th>商品名称</th><th>规格</th><th>一级分类</th><th>二级分类</th><th>单位</th><th>销售价</th><th>状态</th>${canManage ? "<th>操作</th>" : ""}</tr></thead>
        <tbody>${pageData.items.map((p) => `
          <tr>
            <td><div class="product-name-cell"><strong>${html(p.name)}</strong><span>${html(p.code || p.id)}</span></div></td>
            <td>${html(p.spec || "-")}</td>
            <td>${html(p.cat1 || "-")}</td>
            <td>${html(p.cat2 || "-")}</td>
            <td>${html(p.unit)}</td>
            <td class="num">${money(p.price)}</td>
            <td><span class="badge ${isProductActive(p) ? "success" : "danger"}">${html(p.status || "在售")}</span></td>
            ${canManage ? `<td class="row-actions">${actionButton("编辑", "edit", `openModal('product',${JSON.stringify(p.id)})`)}${actionButton("删除", "delete", `deleteProduct(${JSON.stringify(p.id)})`)}</td>` : ""}
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
    ${paginationControls("products", pageData.page, pageData.totalPages, pageData.total)}
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
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveProduct(${JSON.stringify(id || "")})">保存商品</button></div>
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

function renderCreateOrder() {
  ensureSalesScope();
  const customerList = visibleCustomers();
  const customer = byId(customerList, state.selectedCustomerId) || customerList[0];
  const productList = filteredProducts().filter(isProductActive);
  const pageData = paginateList(productList, "createProducts", EDIT_PAGE_SIZES.createProducts);
  const salespersonField = canChooseSalesperson()
    ? `<div class="field"><label>代下单销售人员</label><select class="select" onchange="state.salesUserId=this.value">${activeSalesUsers().map((u) => `<option value="${html(u.id)}" ${u.id === state.salesUserId ? "selected" : ""}>${html(u.name)}</option>`).join("")}</select></div>`
    : "";
  return `
    <div class="card card-pad" style="margin-bottom:16px">
      <div class="form-grid">
        <div class="field"><label>选择客户 *</label><select class="select" onchange="state.selectedCustomerId=this.value;render()">${customerList.map((c) => `<option value="${html(c.id)}" ${c.id === customer?.id ? "selected" : ""}>${html(c.name)} - ${html(c.phone)}</option>`).join("")}</select></div>
        ${salespersonField}
        <div class="field"><label>送货地址 *</label><input id="orderAddressInput" class="input" value="${html(customer?.address || "")}" /></div>
        <div class="field"><label>收货人手机号 *</label><input id="orderPhoneInput" class="input" value="${html(customer?.phone || "")}" /></div>
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
        <div class="hint product-count-hint">共 ${productList.length} 个商品，当前显示 ${pageData.items.length} 个</div>
        <div class="product-grid">${pageData.items.map(productCard).join("")}</div>
        ${paginationControls("createProducts", pageData.page, pageData.totalPages, pageData.total)}
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
  const payload = {
    type: state.orderType,
    customerId: customer.id,
    salesUserId: canChooseSalesperson() ? state.salesUserId : state.user.id,
    amount: cartTotal(),
    address: document.getElementById("orderAddressInput")?.value.trim() || customer.address || "",
    payStatus: "未付款",
    items: state.cart.map((item) => {
      const product = byId(products, item.productId) || {};
      return {
        productId: item.productId,
        name: product.name || "",
        spec: product.spec || "",
        unit: product.unit || "",
        quantity: item.quantity,
        price: item.price,
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
  state.cart = [];
  state.orderType = "sale";
  resetPage("orders");
  showToast("订单已生成");
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
  const salesperson = byId(users, order.salesUserId) || {};
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
          ${actionButton("查看", "view", `openModal('order',${jsArg(order.id)})`)}
          ${actionButton("编辑", "edit", `openModal('editOrder',${jsArg(order.id)})`)}
          ${actionButton("导出图片", "refresh", `exportOrderImage(${jsArg(order.id)})`)}
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
    state.editOrderDraft = { orderId: id, items: (order?.items || []).map(orderLineSnapshot) };
  }
  render();
}

function closeModal() {
  state.modal = null;
  state.editOrderDraft = null;
  render();
}

function editOrderModal(id) {
  const order = byId(orders, id);
  if (!order) return "";
  if (!state.editOrderDraft || state.editOrderDraft.orderId !== id) {
    state.editOrderDraft = { orderId: id, items: (order.items || []).map(orderLineSnapshot) };
  }
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal large">
        <div class="modal-head"><h3>编辑订单</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field"><label>客户</label><select id="editOrderCustomer" class="select">${customers.map((customer) => `<option value="${html(customer.id)}" ${customer.id === order.customerId ? "selected" : ""}>${html(customer.name)}</option>`).join("")}</select></div>
            <div class="field"><label>订单日期</label><input id="editOrderDate" class="input" value="${html(order.date || "")}" /></div>
            <div class="field" style="grid-column:1/-1"><label>订单地址</label><input id="editOrderAddress" class="input" value="${html(order.address || byId(customers, order.customerId)?.address || "")}" /></div>
            <div class="field" style="grid-column:1/-1"><label>订单备注</label><textarea id="editOrderRemark" class="textarea" placeholder="可填写客户特殊要求、配送说明等">${html(order.remark || "")}</textarea></div>
          </div>
          <div class="table-wrap edit-order-table">
            <table>
              <thead><tr><th>商品</th><th>规格</th><th>单位</th><th>数量</th><th>单价</th><th>小计</th><th>操作</th></tr></thead>
              <tbody>${state.editOrderDraft.items.map((item, index) => `
                <tr>
                  <td>
                    <select class="select mini-select" onchange="selectEditOrderProduct(${index}, this.value)">${productSelectOptions(item.productId)}</select>
                    <input id="editOrderItemName${index}" class="input mini-input" value="${html(item.name)}" placeholder="商品名称" />
                  </td>
                  <td><input id="editOrderItemSpec${index}" class="input mini-input" value="${html(item.spec || "")}" /></td>
                  <td><input id="editOrderItemUnit${index}" class="input mini-input unit-input" value="${html(item.unit || "")}" /></td>
                  <td><input id="editOrderItemQty${index}" class="input mini-input num-input" type="number" step="0.01" value="${Number(item.quantity || 0)}" /></td>
                  <td><input id="editOrderItemPrice${index}" class="input mini-input num-input" type="number" step="0.01" value="${Number(item.price || 0)}" /></td>
                  <td>${money(Number(item.quantity || 0) * Number(item.price || 0))}</td>
                  <td>${actionButton("删除", "delete", `removeEditOrderLine(${index})`)}</td>
                </tr>
              `).join("")}</tbody>
            </table>
          </div>
          <button class="btn" style="margin-top:12px" onclick="addEditOrderLine()">添加商品</button>
        </div>
        <div class="modal-foot"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveOrderEdits(${jsArg(id)})">保存修改</button></div>
      </div>
    </div>
  `;
}

function selectEditOrderProduct(index, productId) {
  const item = state.editOrderDraft?.items?.[index];
  if (!item) return;
  item.productId = productId;
  const product = byId(products, productId);
  if (product) {
    item.name = product.name || "";
    item.spec = product.spec || "";
    item.unit = product.unit || "";
    item.price = Number(product.price || 0);
  }
  render();
}

function addEditOrderLine() {
  if (!state.editOrderDraft) return;
  state.editOrderDraft.items.push(orderLineSnapshot({ quantity: 1 }));
  render();
}

function removeEditOrderLine(index) {
  if (!state.editOrderDraft) return;
  state.editOrderDraft.items.splice(index, 1);
  render();
}

async function saveOrderEdits(id) {
  const items = (state.editOrderDraft?.items || []).map((item, index) => ({
    productId: item.productId || "",
    name: document.getElementById(`editOrderItemName${index}`)?.value.trim() || "",
    spec: document.getElementById(`editOrderItemSpec${index}`)?.value.trim() || "",
    unit: document.getElementById(`editOrderItemUnit${index}`)?.value.trim() || "",
    quantity: Number(document.getElementById(`editOrderItemQty${index}`)?.value || 0),
    price: Number(document.getElementById(`editOrderItemPrice${index}`)?.value || 0),
  })).filter((item) => item.name && item.quantity > 0);
  const amount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const payload = {
    customerId: document.getElementById("editOrderCustomer")?.value,
    date: document.getElementById("editOrderDate")?.value.trim(),
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

boot();
