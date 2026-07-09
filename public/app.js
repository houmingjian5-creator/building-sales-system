const state = {
  route: "dashboard",
  user: null,
  query: "",
  productQuery: "",
  category: "全部",
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
};

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
          <div class="field"><label>手机号</label><input id="loginPhone" class="input" value="13800000002" placeholder="请输入已授权手机号" /></div>
          <div class="field"><label>密码</label><input id="loginPassword" class="input" type="password" value="888888" placeholder="请输入登录密码" /></div>
          <button class="btn primary" style="width:100%" onclick="login()">登录系统</button>
          <p class="hint">演示密码均为 888888。管理员手机号：13800000001 / 13800000004；销售：13800000002；财务：13800000005。</p>
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
      <input class="input" placeholder="搜索客户名称/联系人/电话" value="${state.query}" oninput="state.query=this.value;render()" />
      <div class="spacer"></div>
      <button class="btn primary" onclick="openModal('customer')">＋ 新增客户</button>
    </div>
    <div class="customer-list">${list.map(customerCard).join("")}</div>
  `;
}

function customerCard(c) {
  const owner = byId(salesUsers, c.ownerId);
  return `
    <div class="customer-card">
      <div>
        <div class="customer-name">${c.name} <span class="badge success">正常</span></div>
        <div class="meta"><span>☎ ${c.phone}</span><span>录入：${owner?.name || "-"}</span></div>
      </div>
      <div class="meta">
        <span>成交额：<strong>${money(c.total)}</strong></span>
        <span>最近成交：${c.last}</span>
        <span>共成交 ${c.orders} 单</span>
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
      <input class="input" placeholder="搜索产品名称/编码/拼音" value="${state.productQuery}" oninput="state.productQuery=this.value;render()" />
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
          <input class="input" placeholder="搜索商品名称、编码、拼音..." value="${state.productQuery}" oninput="state.productQuery=this.value;render()" />
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
  if (!product) return;
  const value = Number(quantity);
  if (!Number.isFinite(value) || value <= 0) return;
  const line = state.cart.find((item) => item.productId === productId);
  if (line) line.quantity += value;
  else state.cart.push({ productId, quantity: value, price: product.price });
}

function applyAiDraft() {
  if (!state.aiDraft) return;
  state.aiDraft.matched.forEach((item) => addDraftLine(item.productId, item.quantity));
  document.querySelectorAll("[data-ai-quantity-product]").forEach((input) => {
    addDraftLine(input.dataset.aiQuantityProduct, input.value);
  });
  document.querySelectorAll("[data-ai-candidate-product]").forEach((select) => {
    const quantityInput = document.querySelector(`[data-ai-candidate-quantity="${select.dataset.aiCandidateProduct}"]`);
    addDraftLine(select.value, quantityInput ? quantityInput.value : "");
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
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存订单失败");
    orders = [data.order, ...orders];
    state.cart = [];
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
      <input class="input" placeholder="搜索姓名/手机号/角色" value="${state.query}" oninput="state.query=this.value;render()" />
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
      ${list.map((item) => `<div class="ai-line"><div><strong>${item.name}</strong><div class="hint">${item.spec || ""} · ${item.unit} · 原文：${item.rawName || "-"}</div></div><div class="num">${item.quantity} ${item.unit}</div><div class="num">${money(item.price)}</div></div>`).join("")}
    </section>
  `;
}

function renderAiNeedsQuantity(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>需要补数量</h4>
      ${list.map((item) => `<div class="ai-line"><div><strong>${item.name}</strong><div class="hint">${item.spec || ""} · ${item.unit} · 原文：${item.rawName || "-"}</div></div><input class="input ai-small-input" type="number" min="0" step="0.01" placeholder="数量" data-ai-quantity-product="${item.productId}" /><div class="num">${money(item.price)}</div></div>`).join("")}
    </section>
  `;
}

function renderAiUncertain(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>需要选择商品</h4>
      ${list.map((item, index) => `<div class="ai-line ai-line-stack"><div><strong>原文：${item.rawName || "-"}</strong><div class="hint">请选择商品库中的准确商品</div></div><select class="select" data-ai-candidate-product="${index}">${(item.candidates || []).map((product) => `<option value="${product.productId}">${product.name} / ${product.spec || ""} / ${money(product.price)}</option>`).join("")}</select><input class="input ai-small-input" type="number" min="0" step="0.01" value="${item.quantity || ""}" placeholder="数量" data-ai-candidate-quantity="${index}" /></div>`).join("")}
    </section>
  `;
}

function renderAiUnmatched(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>未匹配，暂不加入订单</h4>
      ${list.map((item) => `<div class="ai-line muted-line"><div><strong>${item.rawName || "-"}</strong><div class="hint">${item.note || "商品库中未找到明确商品"}</div></div></div>`).join("")}
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
  const title = order.no.startsWith("TH") || order.status === "已退货" ? "退货单" : "销售单";
  const rows = getDisplayRows(order);
  return `
    <div class="modal-backdrop" onclick="if(event.target.className==='modal-backdrop')closeModal()">
      <div class="modal">
        <div class="modal-head"><h3>订单详情 - ${title}</h3><div class="document-actions"><button class="btn" onclick="downloadOrderImage('${order.id}')">⇩ 图片</button><button class="btn" onclick="downloadOrderHtml('${order.id}')">文档</button><button class="icon-btn" onclick="closeModal()">×</button></div></div>
        <div class="modal-body">
          <div class="doc-preview">
            <h2>${title}</h2>
            <div class="doc-subtitle">小侯家建材销售系统</div>
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
  const title = order.no.startsWith("TH") || order.status === "已退货" ? "退货单" : "销售单";
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
    <div class="subtitle">小侯家建材销售系统</div>
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
  const rows = getDisplayRows(order);
  const canvas = document.createElement("canvas");
  const scale = 2;
  const width = 1600;
  const rowHeight = 66;
  const height = 1180;
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "#d5dbe5";
  ctx.lineWidth = 1;
  ctx.strokeRect(2, 2, width - 4, height - 4);

  ctx.fillStyle = "#172033";
  ctx.textAlign = "center";
  ctx.font = "800 42px Microsoft YaHei, Arial";
  ctx.fillText(title, width / 2, 118);
  ctx.font = "600 22px Microsoft YaHei, Arial";
  ctx.fillText("小侯家建材销售系统", width / 2, 160);

  ctx.textAlign = "left";
  ctx.font = "700 25px Microsoft YaHei, Arial";
  ctx.fillStyle = "#172033";
  ctx.fillText("客户：", 58, 236);
  ctx.fillText("日期：", 58, 300);
  ctx.textAlign = "right";
  ctx.fillText("单号：", 1285, 236);
  ctx.fillText("销售：", 1285, 300);
  ctx.textAlign = "left";
  ctx.font = "400 25px Microsoft YaHei, Arial";
  ctx.fillText(customer.name, 122, 236);
  ctx.fillText(order.date, 122, 300);
  ctx.textAlign = "left";
  ctx.fillText(order.no, 1290, 236);
  ctx.fillText(sales?.name || "-", 1290, 300);

  ctx.fillStyle = "#eef2f7";
  roundRect(ctx, 58, 318, width - 116, 62, 5);
  ctx.fill();
  ctx.fillStyle = "#172033";
  ctx.textAlign = "left";
  ctx.font = "700 25px Microsoft YaHei, Arial";
  ctx.fillText("地址：", 72, 357);
  ctx.font = "400 25px Microsoft YaHei, Arial";
  ctx.fillText(customer.address, 142, 357);

  const tableX = 58;
  const tableY = 424;
  const cols = [86, 836, 114, 114, 170, 170];
  const headers = ["编号", "商品名称", "单位", "数量", "单价", "金额"];
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#cfcfcf";
  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(tableX, tableY, width - 120, rowHeight);
  drawTableGrid(ctx, tableX, tableY, cols, rowHeight * (rows.length + 1));
  ctx.fillStyle = "#334155";
  ctx.font = "800 25px Microsoft YaHei, Arial";
  let x = tableX;
  headers.forEach((header, i) => {
    drawCellText(ctx, header, x, tableY, cols[i], rowHeight, i === 1 ? "center" : "center");
    x += cols[i];
  });

  ctx.font = "400 25px Microsoft YaHei, Arial";
  rows.forEach((row, rowIndex) => {
    const y = tableY + rowHeight * (rowIndex + 1);
    const values = row.empty ? [row.index, "", "", "", "", ""] : [row.index, row.name, row.unit, row.quantity, money(row.price), money(row.amount)];
    let cellX = tableX;
    ctx.fillStyle = "#172033";
    values.forEach((value, i) => {
      const align = i === 1 ? "left" : i >= 4 ? "right" : "center";
      drawCellText(ctx, String(value), cellX, y, cols[i], rowHeight, align);
      cellX += cols[i];
    });
  });

  ctx.textAlign = "left";
  ctx.fillStyle = "#172033";
  ctx.font = "700 25px Microsoft YaHei, Arial";
  ctx.fillText("合计大写：", 58, 1072);
  ctx.font = "400 25px Microsoft YaHei, Arial";
  ctx.fillText(amountToChinese(order.amount), 188, 1072);
  ctx.font = "700 25px Microsoft YaHei, Arial";
  ctx.fillText("销售电话：", 58, 1126);
  ctx.font = "400 25px Microsoft YaHei, Arial";
  ctx.fillText(maskPhone(sales?.phone || customer.phone), 188, 1126);
  ctx.textAlign = "right";
  ctx.font = "800 25px Microsoft YaHei, Arial";
  ctx.fillText(`此单合计金额: ${money(order.amount)}`, width - 58, 1072);

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
  for (let rowY = y + 48; rowY < y + height; rowY += 48) {
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

boot();
