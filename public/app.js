const initialCostDateRange = costDatePresetRange("month");

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
  selectedCustomerId: "",
  salesUserId: "u2",
  orderType: "sale",
  aiDraft: null,
  aiLoading: false,
  aiError: "",
  aiText: "",
  aiGroups: [],
  aiActiveGroupId: "",
  aiActiveResultKey: "",
  aiDraftDirty: false,
  aiSourceDirty: false,
  aiSourceEditorOpen: false,
  aiDraftCustomerId: "",
  aiDraftOrderType: "",
  aiLearnPairs: [],
  loginPasswordVisible: false,
  editProductQuery: "",
  editProductCategory: "全部",
  editProductSubcategory: "全部",
  editProductPickerOpen: false,
  orderDraftCustomerId: "",
  createCustomerQuery: "",
  createCustomerPickerOpen: false,
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
  assistantStage: "正在理解问题",
  costOrders: [],
  costLoading: false,
  costLoaded: false,
  costError: "",
  costQuery: "",
  costStatusFilter: "全部",
  costReconcileFilter: "全部",
  costSalesFilters: [],
  costDateFrom: initialCostDateRange.from,
  costDateTo: initialCostDateRange.to,
  costSupplierFilters: [],
  costSupplierOptions: [],
  costSalesInitialized: false,
  costSalesMenuOpen: false,
  costSupplierMenuOpen: false,
  costMobileFiltersOpen: false,
  costExpandedOrderId: "",
  costSavingId: "",
  dashboardSalesFilters: [],
  dashboardSalesMenuOpen: false,
  dashboardCustomerDetail: "",
  dashboardTrendMetric: "sales",
  dashboardData: null,
  dashboardLoading: false,
  productCategories: {},
  dataLoaded: { customers: false, products: false, createProducts: false, orders: false, dashboard: false },
  remotePages: {},
  customerOrderDetails: {},
  auditItems: [],
  auditLoading: false,
  auditError: "",
  auditFilters: { startDate: "", endDate: "", actorId: "", entityType: "", result: "", keyword: "" },
  mobileMoreOpen: false,
  mobileCartOpen: false,
  mobileFilterOpen: "",
  mobileOrderDetailsOpen: false,
  cartStorageWarningShown: false
};

let inputRenderTimer = null;
let toastTimer = null;
let assistantAbortController = null;
let assistantStageTimer = null;
let lastRenderedRoute = "";
const motionCloseTimers = {};

function motionIsReduced() {
  return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function cancelMotionClose(key) {
  if (!motionCloseTimers[key]) return;
  clearTimeout(motionCloseTimers[key]);
  delete motionCloseTimers[key];
}

function closeWithMotion(key, selector, finish) {
  cancelMotionClose(key);
  const layer = document.querySelector(selector);
  if (!layer || motionIsReduced()) {
    finish();
    return;
  }
  layer.classList.add("motion-overlay-exit");
  motionCloseTimers[key] = setTimeout(() => {
    delete motionCloseTimers[key];
    finish();
  }, 160);
}

function pulseMotion(selector) {
  requestAnimationFrame(() => {
    document.querySelectorAll(selector).forEach((element) => {
      element.classList.remove("motion-value-pop");
      void element.offsetWidth;
      element.classList.add("motion-value-pop");
      setTimeout(() => element.classList.remove("motion-value-pop"), 360);
    });
  });
}

let salesUsers = [
{ id: "u1", name: "钱锦健", phone: "13800000001", role: "超级管理员", status: "启用" },
{ id: "u2", name: "侯俊键", phone: "13800000002", role: "销售人员", status: "启用" },
{ id: "u3", name: "沈海峰", phone: "13800000003", role: "销售人员", status: "启用" },
{ id: "u4", name: "管理员", phone: "13800000004", role: "管理员", status: "启用" },
{ id: "u5", name: "财务", phone: "13800000005", role: "财务", status: "启用" }];


let customers = [
{ id: "c1", name: "钱勇6333", contact: "钱勇", phone: "15608096333", email: "", address: "明佑天府壹号28栋2单元102", ownerId: "u2", total: 4865.4, last: "2026/6/9", orders: 6 },
{ id: "c2", name: "王美4949", contact: "王美", phone: "13668164949", email: "", address: "华府大道建材市场", ownerId: "u2", total: 7664.9, last: "2026/6/8", orders: 9 },
{ id: "c3", name: "周9446", contact: "周先生", phone: "17628069446", email: "", address: "高新区工地库房", ownerId: "u3", total: 9604, last: "2026/6/7", orders: 11 },
{ id: "c4", name: "露哥9561", contact: "露哥", phone: "13548029561", email: "", address: "双流区项目部", ownerId: "u2", total: 5438.12, last: "2026/6/6", orders: 6 },
{ id: "c5", name: "张朝646", contact: "张朝", phone: "18109064646", email: "", address: "明佑天府壹号", ownerId: "u1", total: 2559.16, last: "2026/6/1", orders: 3 }];


let products = [
{ id: "p1", brand: "木", cat1: "木", cat2: "木类小配件", name: "接头（好）", spec: "木工PITOU", unit: "个", price: 2, cost: 0.8, status: "在售", color: "#d9c3a1" },
{ id: "p2", brand: "木", cat1: "木", cat2: "木工辅材", name: "拼塑板（保温板隔热板）", spec: "灰色5cm / 1200*2400", unit: "张", price: 11, cost: 7.5, status: "在售", color: "#cbd5e1" },
{ id: "p3", brand: "水电", cat1: "水电", cat2: "水电辅材", name: "NM1-400S/3310315A AC230V", spec: "天正接触器", unit: "个", price: 580, cost: 430, status: "在售", color: "#bfdbfe" },
{ id: "p4", brand: "水电", cat1: "水电", cat2: "空气开关", name: "BH-0.66 30 I 300/5A 0.5级", spec: "互感器", unit: "个", price: 13.5, cost: 9.2, status: "在售", color: "#dbeafe" },
{ id: "p5", brand: "油", cat1: "油", cat2: "高德", name: "高德轻质石膏", spec: "20KG", unit: "袋", price: 14, cost: 10, status: "在售", color: "#fde68a" },
{ id: "p6", brand: "瓦", cat1: "瓦", cat2: "瓷砖胶", name: "拉法基一型瓷砖胶", spec: "20KG", unit: "袋", price: 22, cost: 17, status: "在售", color: "#e5e7eb" },
{ id: "p7", brand: "水电", cat1: "水电", cat2: "金杯线缆", name: "塔牌电线（双色ZA-BV6mm2）", spec: "双色ZA-BV6mm2", unit: "卷", price: 563, cost: 520, status: "在售", color: "#fca5a5" },
{ id: "p8", brand: "水电", cat1: "水电", cat2: "金杯线缆", name: "塔牌电线（单色ZA-BV10mm2）", spec: "单色ZA-BV10mm2", unit: "卷", price: 0, cost: 0, status: "在售", color: "#86efac" },
{ id: "p9", brand: "木", cat1: "木", cat2: "可耐福", name: "可耐福龙骨", spec: "1200*2400*9.5", unit: "根", price: 18.6, cost: 13, status: "在售", color: "#d6d3d1" }];


let orders = [
{ id: "o1", no: "ORD1781230955350624", customerId: "c5", salesUserId: "u2", date: "2026/6/12", status: "待确认", payStatus: "未回款", amount: 4047.16, items: [{ productId: "p3", quantity: 1, price: 580 }, { productId: "p7", quantity: 2, price: 563 }, { productId: "p2", quantity: 35, price: 36 }] },
{ id: "o2", no: "ORD1781226813454163", customerId: "c3", salesUserId: "u3", date: "2026/6/12", status: "待确认", payStatus: "未回款", amount: 922, items: [{ productId: "p5", quantity: 7, price: 14 }] },
{ id: "o3", no: "ORD1781179803303841", customerId: "c4", salesUserId: "u2", date: "2026/6/11", status: "待确认", payStatus: "未回款", amount: 2370, items: [{ productId: "p6", quantity: 4, price: 22 }] },
{ id: "o4", no: "ORD178116787613288", customerId: "c1", salesUserId: "u2", date: "2026/6/11", status: "已完成", payStatus: "未回款", amount: 1072, items: [{ productId: "p1", quantity: 10, price: 2 }] }];


const app = document.getElementById("app");

const money = (value) => `¥${Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
const byId = (list, id) => list.find((item) => item.id === id);
const icon = (name) => ({ dashboard: "概", customers: "客", products: "品", create: "开", orders: "单", returns: "退", users: "员", costs: "本", audit: "记" })[name] || "•";
const isAdmin = () => state.user && ["超级管理员", "管理员"].includes(state.user.role);

function cartStorageKey(type = state.orderType) {var _state$user;
  return (_state$user = state.user) !== null && _state$user !== void 0 && _state$user.id ? `building-sales-cart:${state.user.id}:${type === "return" ? "return" : "sale"}` : "";
}

function cartSnapshot(product, fallback = {}) {
  return {
    name: String((product === null || product === void 0 ? void 0 : product.name) || fallback.name || "未知商品"),
    spec: String((product === null || product === void 0 ? void 0 : product.spec) || fallback.spec || ""),
    unit: String((product === null || product === void 0 ? void 0 : product.unit) || fallback.unit || ""),
    cat1: String((product === null || product === void 0 ? void 0 : product.cat1) || fallback.cat1 || ""),
    cat2: String((product === null || product === void 0 ? void 0 : product.cat2) || fallback.cat2 || "")
  };
}

function normalizedCartPrice(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || !/^\d+(?:\.\d{1,2})?$/.test(String(value))) {
    const fallbackNumber = Number(fallback);
    return Number.isFinite(fallbackNumber) && fallbackNumber >= 0 ? Math.round(fallbackNumber * 100) / 100 : 0;
  }
  return Math.round(number * 100) / 100;
}

function cartStorageFailureMessage() {
  if (state.cartStorageWarningShown) return;
  state.cartStorageWarningShown = true;
  alert("当前购物车无法在关闭页面后保存，请检查浏览器是否允许本地存储或清理浏览器空间。");
}

function persistCart(type = state.orderType, notifyFailure = false) {
  const key = cartStorageKey(type);
  if (!key) return false;
  try {
    const stored = state.cart.map((item) => {
      const product = byId(products, item.productId);
      return {
        productId: item.productId,
        quantity: normalizeQuantity(item.quantity),
        price: normalizedCartPrice(item.price, (product === null || product === void 0 ? void 0 : product.price) || 0),
        ...cartSnapshot(product, item)
      };
    });
    localStorage.setItem(key, JSON.stringify(stored));
    return true;
  } catch (_) {
    if (notifyFailure) cartStorageFailureMessage();
    return false;
  }
}

function restoreCart(type = state.orderType) {
  const key = cartStorageKey(type);
  if (!key) return;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    state.cart = Array.isArray(saved) ? saved.filter((item) => item && item.productId && normalizeQuantity(item.quantity) > 0).map((item) => {
      const product = byId(products, item.productId);
      return {
        productId: item.productId,
        quantity: normalizeQuantity(item.quantity),
        price: normalizedCartPrice(item.price, (product === null || product === void 0 ? void 0 : product.price) || 0),
        ...cartSnapshot(product, item)
      };
    }) : [];
  } catch (_) {
    state.cart = [];
    cartStorageFailureMessage();
  }
}

function clearPersistedCart(type = state.orderType) {
  const key = cartStorageKey(type);
  if (!key) return;
  try {
    localStorage.removeItem(key);
  } catch (_) {

    // Ignore browser storage failures after a successful order save.
  }}

function resetOrderDraft(customer = null) {
  state.orderDraftCustomerId = (customer === null || customer === void 0 ? void 0 : customer.id) || "";
  state.orderAddress = "";
  state.orderPhone = (customer === null || customer === void 0 ? void 0 : customer.phone) || "";
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
  const customer = byId(orderCustomerChoices(), customerId);
  if (!customer) return;
  state.selectedCustomerId = customerId;
  state.createCustomerQuery = orderCustomerLabel(customer);
  state.createCustomerPickerOpen = false;
  state.mobileOrderDetailsOpen = false;
  resetOrderDraft(customer);
  render();
}

function toggleMobileOrderDetails() {
  state.mobileOrderDetailsOpen = !state.mobileOrderDetailsOpen;
  render();
}

function matchingCreateCustomers() {
  const query = state.createCustomerQuery.trim().toLowerCase();
  return orderCustomerChoices().filter((customer) => !query || [customer.name, customer.contact, customer.phone].
  some((value) => String(value || "").toLowerCase().includes(query))).slice(0, 30);
}

function renderCreateCustomerResults() {
  const matches = matchingCreateCustomers();
  return matches.length ? matches.map((customer) => `
    <button type="button" class="edit-customer-option ${customer.id === state.selectedCustomerId ? "selected" : ""}" onmousedown="event.preventDefault()" onclick="selectOrderCustomer(${jsArg(customer.id)})">
      <strong>${html(customer.name)}</strong><span>${html(customer.phone || "-")} · ${html(customer.address || "未填写地址")}</span>
    </button>`).join("") : `<div class="empty">没有匹配的客户</div>`;
}

function refreshCreateCustomerResults() {
  const results = document.getElementById("createCustomerResults");
  if (!results) return;
  results.innerHTML = renderCreateCustomerResults();
  results.classList.toggle("hidden", !state.createCustomerPickerOpen);
}

function openCreateCustomerPicker() {
  state.createCustomerPickerOpen = true;
  refreshCreateCustomerResults();
}

function closeCreateCustomerPicker() {
  setTimeout(() => {var _document$getElementB;
    state.createCustomerPickerOpen = false;
    const customer = byId(orderCustomerChoices(), state.selectedCustomerId);
    state.createCustomerQuery = orderCustomerLabel(customer);
    const input = document.getElementById("createCustomerSearch");
    if (input) input.value = state.createCustomerQuery;
    (_document$getElementB = document.getElementById("createCustomerResults")) === null || _document$getElementB === void 0 || _document$getElementB.classList.add("hidden");
  }, 150);
}

function updateCreateCustomerSearch(input) {
  state.createCustomerQuery = input.value;
  state.createCustomerPickerOpen = true;
  if (input.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(refreshCreateCustomerResults, 100);
}

function setOrderSalesperson(userId) {
  if (!canChooseSalesperson() || !activeSalesUsers().some((user) => user.id === userId)) return;
  state.salesUserId = userId;
  state.selectedCustomerId = "";
  state.createCustomerQuery = "";
  state.createCustomerPickerOpen = false;
  resetOrderDraft(null);
  render();
  loadCustomers({ forCreate: true }).then(render).catch((error) => alert(error.message));
}

function customerOrderAddresses(customerId) {
  const customer = byId(customers, customerId);
  if (customer && Array.isArray(customer.orderAddresses)) return customer.orderAddresses;
  const seen = new Set();
  return orders.
  filter((order) => order.customerId === customerId && !order.deletedAt).
  map((order) => String(order.address || "").trim()).
  filter((address) => {
    if (!address || seen.has(address)) return false;
    seen.add(address);
    return true;
  }).
  slice(0, 10);
}

function addressHistoryMenuHtml(customerId, mode) {
  const addresses = customerOrderAddresses(customerId);
  const menuId = mode === "edit" ? "editOrderAddressHistory" : "orderAddressHistory";
  return `
    <div id="${menuId}" class="address-history-menu">
      ${addresses.length ? addresses.map((address) => `
        <button type="button" data-address="${html(address)}" onmousedown="event.preventDefault()" onclick="selectAddressHistory(this,${jsArg(mode)})">
          ${svgIcon("orders")}<span>${html(address)}</span>
        </button>`).join("") : `<div class="address-history-empty">该客户暂无历史下单地址</div>`}
    </div>
  `;
}

function openAddressHistory(mode) {var _document$getElementB2;
  const menuId = mode === "edit" ? "editOrderAddressHistory" : "orderAddressHistory";
  (_document$getElementB2 = document.getElementById(menuId)) === null || _document$getElementB2 === void 0 || _document$getElementB2.classList.add("open");
}

function closeAddressHistory(mode) {
  const menuId = mode === "edit" ? "editOrderAddressHistory" : "orderAddressHistory";
  setTimeout(() => {var _document$getElementB3;return (_document$getElementB3 = document.getElementById(menuId)) === null || _document$getElementB3 === void 0 ? void 0 : _document$getElementB3.classList.remove("open");}, 120);
}

function selectAddressHistory(button, mode) {var _button$dataset;
  const address = (button === null || button === void 0 || (_button$dataset = button.dataset) === null || _button$dataset === void 0 ? void 0 : _button$dataset.address) || "";
  if (mode === "edit") {
    updateEditOrderMeta("address", address);
    const input = document.getElementById("editOrderAddress");
    if (input) input.value = address;
  } else {
    updateOrderDraftField("address", address);
    const input = document.getElementById("orderAddressInput");
    if (input) input.value = address;
  }
  closeAddressHistory(mode);
}

function orderCustomerForDisplay(order = {}) {
  const customer = byId(customers, order.customerId) || {};
  return {
    ...customer,
    id: customer.id || order.customerId || "",
    name: customer.name || order.customerName || "已删除客户",
    phone: customer.phone || order.customerPhone || order.phone || "",
    address: customer.address || order.customerAddress || order.address || ""
  };
}

function orderAddressForDisplay(order, customer = {}) {
  if (Object.prototype.hasOwnProperty.call(order || {}, "address")) {
    return String(order.address || "");
  }
  return String(customer.address || "");
}

function orderItemDetails(item = {}) {
  const product = byId(products, item.productId) || {};
  const name = item.name || product.name || "";
  const spec = item.spec !== undefined && item.spec !== "" ? item.spec : product.spec || "";
  return { name, spec, label: spec ? `${name}（${spec}）` : name, unit: item.unit || product.unit || "" };
}

function showToast(text) {
  state.toast = text;
  const shell = document.querySelector(".app-shell");
  let toast = document.querySelector(".toast");
  if (shell && !toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    shell.prepend(toast);
  }
  if (toast) toast.textContent = `✓ ${text}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    state.toast = "";
    const current = document.querySelector(".toast");
    if (!current || motionIsReduced()) {
      if (current) current.remove();
      return;
    }
    current.classList.add("motion-toast-exit");
    setTimeout(() => {
      if (current.isConnected) current.remove();
    }, 160);
  }, 1800);
}

function scheduleInputRender(key, value, inputId, selectionStart, selectionEnd) {
  state[key] = value;
  const input = document.getElementById(inputId);
  if ((input === null || input === void 0 ? void 0 : input.dataset.composing) === "true") return;
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
  state.query = input.value;
  resetPage("customers");
  if (input.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => loadCustomers().then(renderCustomerResults).catch((error) => alert(error.message)), 220);
}

function toggleLoginPassword() {var _document$getElementB4, _document$getElementB5;
  state.loginPasswordVisible = !state.loginPasswordVisible;
  const phone = ((_document$getElementB4 = document.getElementById("loginPhone")) === null || _document$getElementB4 === void 0 ? void 0 : _document$getElementB4.value) || "";
  const password = ((_document$getElementB5 = document.getElementById("loginPassword")) === null || _document$getElementB5 === void 0 ? void 0 : _document$getElementB5.value) || "";
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
  document.body.classList.toggle("cart-drawer-open", Boolean(state.user && state.mobileCartOpen));
  if (state.user && !state.loading) persistCart();
  if (state.loading) {
    app.innerHTML = `<div class="login-shell"><section class="login-panel"><div class="login-card"><div class="brand-row"><div class="brand-mark">建</div><div><h1 class="page-title">建材销售开单系统</h1><p class="page-subtitle">正在加载...</p></div></div></div></section><section class="login-visual"><div class="visual-board"></div></section></div>`;
    return;
  }
  if (!state.user) {
    lastRenderedRoute = "";
    renderLogin();
    return;
  }

  const routeChanged = lastRenderedRoute !== state.route;
  lastRenderedRoute = state.route;

  app.innerHTML = `
    <div class="app-shell mobile-v2 route-${html(state.route)} ${["create", "returns"].includes(state.route) ? "has-mobile-cart" : ""}">
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
          ${isAdmin() ? navButton("costs", "成本控制") : ""}
          ${isAdmin() ? navButton("audit", "操作日志") : ""}
        </nav>
        <button type="button" class="side-assistant-entry ${state.assistantOpen ? "active" : ""}" title="小材 AI 业务助手" aria-label="打开小材 AI 业务助手" onclick="openXiaocai()">
          <img src="./assets/xiaocai.png" alt="" />
          <span><strong>小材</strong><small>AI 业务助手</small></span>
        </button>
        <div class="side-user" title="${html(`${state.user.name} · ${state.user.role}`)}">
          <span class="side-user-avatar" aria-hidden="true">${html(String(state.user.name || "人").slice(0, 1))}</span>
          <div class="side-user-details"><strong>${state.user.name}</strong>
          <div class="hint" style="color: rgba(255,255,255,.75)">${state.user.role}</div></div>
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
        <section class="content ${routeChanged ? "motion-page-enter" : ""}">${renderPage()}</section>
      </main>
      ${renderMobileNavigation()}
      ${renderMobileMoreSheet()}
      ${renderMobileFilterSheet()}
      ${renderMobileCart()}
      ${renderXiaocai()}
      ${renderModal()}
    </div>
  `;
}

async function boot() {
  state.loading = true;
  render();
  try {
    await loadBootstrap();
  } catch {

    // 未登录时保持登录页。
  } finally {state.loading = false;
    render();
  }
}

async function logout() {
  persistCart(state.orderType, true);
  try {
    await apiFetch("/api/logout", { method: "POST" });
  } finally {var _assistantAbortContro;
    (_assistantAbortContro = assistantAbortController) === null || _assistantAbortContro === void 0 || _assistantAbortContro.abort();
    clearInterval(assistantStageTimer);
    state.user = null;
    state.route = "dashboard";
    state.assistantOpen = false;
    state.assistantMessages = [];
    state.assistantLoaded = false;
    state.assistantLoading = false;
    state.assistantError = "";
    state.costOrders = [];
    state.costLoaded = false;
    state.costLoading = false;
    state.costError = "";
    state.costSavingId = "";
    state.costReconcileFilter = "全部";
    state.costSalesFilters = [];
    const costDateRange = costDatePresetRange("month");
    state.costDateFrom = costDateRange.from;
    state.costDateTo = costDateRange.to;
    state.costSupplierFilters = [];
    state.costSalesInitialized = false;
    state.costSalesMenuOpen = false;
    state.costSupplierMenuOpen = false;
    state.costMobileFiltersOpen = false;
    state.costExpandedOrderId = "";
    state.dashboardData = null;
    state.dashboardError = "";
    state.productCategories = {};
    state.remotePages = {};
    state.customerOrderDetails = {};
    state.dataLoaded = { customers: false, products: false, createProducts: false, orders: false, dashboard: false };
    state.auditItems = [];
    state.auditError = "";
    state.mobileMoreOpen = false;
    state.mobileCartOpen = false;
    state.mobileFilterOpen = "";
    state.aiDraft = null;
    state.aiGroups = [];
    state.aiActiveGroupId = "";
    state.aiActiveResultKey = "";
    state.aiDraftDirty = false;
    state.aiSourceDirty = false;
    state.aiSourceEditorOpen = false;
    state.aiDraftCustomerId = "";
    state.aiDraftOrderType = "";
    render();
  }
}

function mobilePrimaryRouteButton(route, label) {
  return `<button type="button" class="${state.route === route ? "active" : ""}" onclick="setRoute(${jsArg(route)})"><span class="nav-icon">${icon(route)}</span><span>${html(label)}</span></button>`;
}

function renderMobileNavigation() {
  const moreActive = ["products", "returns", "users", "costs", "audit"].includes(state.route) || state.mobileMoreOpen;
  return `
    <nav class="mobile-bottom-nav" aria-label="手机端主导航">
      ${mobilePrimaryRouteButton("dashboard", "概览")}
      ${mobilePrimaryRouteButton("customers", "客户")}
      ${mobilePrimaryRouteButton("create", "开单")}
      ${mobilePrimaryRouteButton("orders", "订单")}
      <button type="button" class="${moreActive ? "active" : ""}" onclick="toggleMobileMore()"><span class="nav-icon">•••</span><span>更多</span></button>
    </nav>
  `;
}

function mobileMoreRouteButton(route, label) {
  return `<button type="button" class="${state.route === route ? "active" : ""}" onclick="setRoute(${jsArg(route)})"><span class="nav-icon">${icon(route)}</span><span>${html(label)}</span></button>`;
}

function renderMobileMoreSheet() {var _state$user2, _state$user3;
  if (!state.mobileMoreOpen) return "";
  const canExportProducts = state.route === "products" && state.user && state.user.role !== "销售人员";
  return `
    <div class="mobile-sheet-layer mobile-more-layer" onclick="closeMobileMore()">
      <section class="mobile-sheet mobile-more-sheet" role="dialog" aria-modal="true" aria-label="更多功能" onclick="event.stopPropagation()">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-head"><div><strong>更多功能</strong><span>${html(((_state$user2 = state.user) === null || _state$user2 === void 0 ? void 0 : _state$user2.name) || "")} · ${html(((_state$user3 = state.user) === null || _state$user3 === void 0 ? void 0 : _state$user3.role) || "")}</span></div><button type="button" class="icon-btn" onclick="closeMobileMore()" aria-label="关闭">×</button></div>
        <div class="mobile-more-grid">
          <button type="button" class="mobile-assistant-entry" onclick="openXiaocai()"><span class="nav-icon"><img src="./assets/xiaocai.png" alt="" /></span><span>小材 AI 助手</span></button>
          ${mobileMoreRouteButton("products", "产品管理")}
          ${mobileMoreRouteButton("returns", "退货开单")}
          ${isAdmin() ? mobileMoreRouteButton("users", "人员管理") : ""}
          ${isAdmin() ? mobileMoreRouteButton("costs", "成本控制") : ""}
          ${isAdmin() ? mobileMoreRouteButton("audit", "操作日志") : ""}
          ${canExportProducts ? `<button type="button" onclick="closeMobileMore();exportProducts('selected')" ${state.selectedProductIds.length ? "" : "disabled"}><span class="nav-icon">选</span><span>导出已选</span></button><button type="button" onclick="closeMobileMore();exportProducts('all')"><span class="nav-icon">导</span><span>导出全部</span></button>` : ""}
        </div>
        <button type="button" class="mobile-logout-button" onclick="closeMobileMore();logout()"><span class="nav-icon">退</span><span>退出登录</span></button>
      </section>
    </div>
  `;
}

function toggleMobileMore() {
  cancelMotionClose("mobileMore");
  if (state.mobileMoreOpen) {
    closeMobileMore();
    return;
  }
  state.mobileMoreOpen = true;
  state.mobileCartOpen = false;
  render();
}

function closeMobileMore() {
  closeWithMotion("mobileMore", ".mobile-more-layer", () => {
    state.mobileMoreOpen = false;
    render();
  });
}

function mobileFilterSelect(label, value, options, handler) {
  return `<label class="mobile-filter-field"><span>${html(label)}</span><select class="select" onchange="${handler}">${optionList(options, value)}</select></label>`;
}

function renderMobileFilterSheet() {
  if (!state.mobileFilterOpen) return "";
  let fields = "";
  if (state.mobileFilterOpen === "customers") {
    fields = canChooseSalesperson() ? `<label class="mobile-filter-field"><span>客户归属</span><select class="select" onchange="updateCustomerOwnerFilter(this.value)">${salesFilterOptions(state.customerOwnerFilter)}</select></label>` : `<div class="hint">销售人员仅显示自己的客户。</div>`;
  } else if (state.mobileFilterOpen === "orders") {
    fields = mobileFilterSelect("订单状态", state.orderStatus || "全部", ORDER_STATUS_FILTERS, "updateOrderStatusFilter(this.value)") +
      mobileFilterSelect("付款状态", state.orderPayStatus || "全部", PAY_STATUS_FILTERS, "updateOrderPayFilter(this.value)") +
      (canChooseSalesperson() ? `<label class="mobile-filter-field"><span>下单销售</span><select class="select" onchange="updateOrderSalesFilter(this.value)">${salesFilterOptions(state.orderSalesFilter)}</select></label>` : "");
  } else if (state.mobileFilterOpen === "products") {
    fields = mobileFilterSelect("一级分类", state.category, ["全部", "水电", "木", "瓦", "油", "辅助商品"], "setProductCategory(this.value)");
  } else if (state.mobileFilterOpen === "audit") {
    fields = `<label class="mobile-filter-field"><span>开始日期</span><input class="input" type="date" value="${html(state.auditFilters.startDate)}" onchange="updateAuditFilter('startDate',this.value)" /></label><label class="mobile-filter-field"><span>结束日期</span><input class="input" type="date" value="${html(state.auditFilters.endDate)}" onchange="updateAuditFilter('endDate',this.value)" /></label><label class="mobile-filter-field"><span>操作人员</span><select class="select" onchange="updateAuditFilter('actorId',this.value)"><option value="">全部操作人员</option>${salesUsers.map((user) => `<option value="${html(user.id)}" ${state.auditFilters.actorId === user.id ? "selected" : ""}>${html(user.name)}</option>`).join("")}</select></label>${mobileFilterSelect("业务类型", state.auditFilters.entityType, ["", "账号", "客户", "商品", "订单", "成本", "人员", "操作日志", "批量数据"], "updateAuditFilter('entityType',this.value)")}${mobileFilterSelect("操作结果", state.auditFilters.result, ["", "成功", "失败"], "updateAuditFilter('result',this.value)")}`;
  }
  return `<div class="mobile-sheet-layer mobile-filter-layer" onclick="closeMobileFilter()"><section class="mobile-sheet mobile-filter-sheet" role="dialog" aria-modal="true" aria-label="筛选条件" onclick="event.stopPropagation()"><div class="mobile-sheet-handle"></div><div class="mobile-sheet-head"><div><strong>筛选条件</strong><span>调整后列表立即更新</span></div><button type="button" class="icon-btn" onclick="closeMobileFilter()" aria-label="关闭">×</button></div><div class="mobile-filter-fields">${fields}</div><button type="button" class="btn primary mobile-filter-done" onclick="closeMobileFilter()">完成</button></section></div>`;
}

function toggleMobileFilter(route) {
  cancelMotionClose("mobileFilter");
  if (state.mobileFilterOpen === route) {
    closeMobileFilter();
    return;
  }
  state.mobileFilterOpen = route;
  state.mobileMoreOpen = false;
  state.mobileCartOpen = false;
  render();
}

function closeMobileFilter() {
  closeWithMotion("mobileFilter", ".mobile-filter-layer", () => {
    state.mobileFilterOpen = "";
    render();
  });
}

function mobileFilterChip(label, value, resetCall) {
  if (!value || value === "全部") return "";
  const shown = byId(salesUsers, value) ? byId(salesUsers, value).name : value;
  return `<button type="button" class="mobile-filter-chip" onclick="${resetCall}"><span>${html(label)}：${html(shown)}</span><b>×</b></button>`;
}

function mobileCartItemCount() {
  return state.cart.reduce((sum, item) => sum + normalizeQuantity(item.quantity), 0);
}

function renderMobileCart() {
  if (!["create", "returns"].includes(state.route)) return "";
  const itemCount = mobileCartItemCount();
  const title = state.orderType === "return" ? "退货清单" : "购物车";
  return `
    <div class="mobile-cart-bar">
      <button type="button" class="mobile-cart-summary" onclick="toggleMobileCart()" aria-label="查看购物车，共 ${itemCount} 件商品">
        <span class="mobile-cart-icon">${svgIcon("orders")}${itemCount ? `<i>${itemCount}</i>` : ""}</span>
        <span><small>${title}</small><strong>${money(cartTotal())}</strong></span>
      </button>
      <button type="button" class="mobile-cart-open" onclick="toggleMobileCart()">查看并结算</button>
    </div>
    ${state.mobileCartOpen ? `
      <div class="cart-drawer-layer mobile-sheet-layer mobile-cart-layer" onclick="closeMobileCart()">
        <section class="cart-drawer mobile-sheet mobile-cart-sheet" role="dialog" aria-modal="true" aria-label="${title}" onclick="event.stopPropagation()">
          <div class="mobile-sheet-handle"></div>
          <div class="cart-drawer-head mobile-sheet-head"><div><strong>${title}</strong><span>共 ${itemCount} 件商品</span></div><button type="button" class="icon-btn" onclick="closeMobileCart()" aria-label="关闭">×</button></div>
          <div id="cartItemsScroller" class="cart-drawer-lines mobile-cart-lines">${state.cart.length ? state.cart.map(cartLine).join("") : `<div class="empty">还没有选择商品</div>`}</div>
          <div class="cart-drawer-checkout mobile-cart-checkout">
            <div><span>共 ${itemCount} 件 · 合计</span><strong>${money(cartTotal())}</strong></div>
            <button type="button" class="btn primary" onclick="saveOrder()">${state.orderType === "return" ? "生成退货单" : "提交订单"}</button>
          </div>
        </section>
      </div>
    ` : ""}
  `;
}

function toggleMobileCart() {
  cancelMotionClose("mobileCart");
  if (state.mobileCartOpen) {
    closeMobileCart();
    return;
  }
  state.mobileCartOpen = true;
  state.mobileMoreOpen = false;
  render();
}

function closeMobileCart() {
  closeWithMotion("mobileCart", ".mobile-cart-layer", () => {
    state.mobileCartOpen = false;
    render();
  });
}

function desktopCartButton() {
  const itemCount = mobileCartItemCount();
  return `<button type="button" class="btn desktop-cart-trigger" onclick="toggleMobileCart()" aria-label="打开购物车，共 ${itemCount} 件">
    <span class="desktop-cart-trigger-icon">${svgIcon("orders")}${itemCount ? `<i>${itemCount}</i>` : ""}</span>
    <span>${state.orderType === "return" ? "退货清单" : "购物车"}</span>
    <strong>${itemCount} 件 · ${money(cartTotal())}</strong>
  </button>`;
}

function titleForRoute() {
  return { dashboard: "销售概览", customers: "客户管理", products: "产品管理", create: "销售开单", orders: "订单管理", returns: "退货单", users: "人员管理", costs: "成本控制", audit: "操作日志" }[state.route];
}

function subtitleForRoute() {
  return { dashboard: "查看本月与今日销售、客户和订单数据", customers: "管理客户信息和成交记录", products: "管理建材商品信息与价格", create: "选择客户和商品生成销售单", orders: "管理订单状态、打印和导出", returns: "从销售流程中创建退货单", users: "添加登录人员，维护手机号、密码和角色定位", costs: "核算订单材料成本、运输成本与实际盈利", audit: "查询关键业务操作与错误请求编号" }[state.route];
}

function renderPage() {
  if (state.route === "dashboard") return renderDashboardRemote();
  if (state.route === "customers") return renderCustomers();
  if (state.route === "products") return renderProducts();
  if (state.route === "create" || state.route === "returns") return renderCreateOrder();
  if (state.route === "orders") return renderOrders();
  if (state.route === "users" && isAdmin()) return renderUsers();
  if (state.route === "costs" && isAdmin()) return renderCostControl();
  if (state.route === "audit" && isAdmin()) return renderAuditCenter();
  return "";
}

function kpi(label, value, type) {
  return `<div class="card card-pad kpi"><div><div class="hint">${label}</div><div class="kpi-value">${value}</div></div><div class="kpi-icon">${icon(type)}</div></div>`;
}

function customerCard(c) {
  const owner = byId(salesUsers, c.ownerId);
  const stats = c.stats && typeof c.stats === "object" ? c.stats : customerStats(c.id);
  return `
    <article class="customer-card">
      <div class="customer-main">
        <div class="customer-name">${c.name} <span class="badge success">正常</span></div>
        <div class="meta"><span>☎ ${c.phone}</span><span>录入：${(owner === null || owner === void 0 ? void 0 : owner.name) || "-"}</span></div>
      </div>
      <div class="meta customer-stats">
        <span>成交额：<strong>${money(stats.total)}</strong></span>
        <span>最近成交：${stats.last}</span>
        <span>共成交 ${stats.count} 单</span>
      </div>
      <div class="customer-actions customer-actions-desktop">
        ${actionButton("历史订单", "orders", `openModal('customerOrders','${c.id}')`)}
        ${actionButton("编辑", "edit", `openModal('customer','${c.id}')`)}
        ${isAdmin() ? actionButton("删除客户", "delete", `deleteCustomer(${JSON.stringify(c.id)})`) : ""}
      </div>
      <div class="mobile-row-actions customer-actions-mobile">
        <button type="button" class="mobile-row-primary" onclick="openModal('customerOrders',${jsArg(c.id)})">查看详情</button>
        <details class="mobile-row-more"><summary aria-label="更多操作">•••</summary><div><button type="button" onclick="openModal('customer',${jsArg(c.id)})">编辑客户</button>${isAdmin() ? `<button type="button" class="danger" onclick="deleteCustomer(${JSON.stringify(c.id)})">删除客户</button>` : ""}</div></details>
      </div>
    </article>
  `;
}

function cartTotal() {
  return state.cart.reduce((sum, item) => {
    const product = byId(products, item.productId) || item || {};
    return sum + Number(item.quantity || 0) * signedOrderPrice(product, item.price);
  }, 0);
}

function isPositiveReturnCharge(item = {}) {var _byId;
  const name = String(item.name || ((_byId = byId(products, item.productId)) === null || _byId === void 0 ? void 0 : _byId.name) || "");
  return name.includes("运费") || name.includes("搬运费");
}

function signedOrderPrice(item, price) {
  const value = Math.abs(Number(price || 0));
  if (state.orderType !== "return") return value;
  return isPositiveReturnCharge(item) ? value : -value;
}

function openAiOrderModal() {
  state.aiLoading = false;
  const aiSessionChanged = state.aiDraftCustomerId !== state.selectedCustomerId || state.aiDraftOrderType !== state.orderType;
  if (!state.aiGroups.length || aiSessionChanged) {
    state.aiDraft = null;
    state.aiDraftDirty = false;
    state.aiSourceDirty = false;
    state.aiSourceEditorOpen = false;
    state.aiError = "";
    state.aiText = "";
    state.aiGroups = [{ id: `ai-${Date.now()}`, cat1: "", cat2: "", content: "" }];
    state.aiActiveGroupId = state.aiGroups[0].id;
    state.aiActiveResultKey = "";
    state.aiDraftCustomerId = state.selectedCustomerId;
    state.aiDraftOrderType = state.orderType;
  }
  state.modal = { type: "aiOrder" };
  render();
}

function addAiGroup() {
  const group = { id: `ai-${Date.now()}`, cat1: "", cat2: "", content: "" };
  state.aiGroups.push(group);
  state.aiActiveGroupId = group.id;
  state.aiSourceDirty = true;
  render();
}

function removeAiGroup(groupId) {
  if (state.aiGroups.length === 1) return;
  state.aiGroups = state.aiGroups.filter((group) => group.id !== groupId);
  if (!state.aiGroups.some((group) => group.id === state.aiActiveGroupId)) state.aiActiveGroupId = state.aiGroups[0].id;
  state.aiSourceDirty = true;
  render();
}

function setAiGroupCategory(groupId, cat1) {
  const group = state.aiGroups.find((item) => item.id === groupId);
  if (!group) return;
  group.cat1 = cat1;
  group.cat2 = "";
  state.aiSourceDirty = true;
  render();
}

function setAiGroupSubcategory(groupId, cat2) {
  const group = state.aiGroups.find((item) => item.id === groupId);
  if (!group) return;
  group.cat2 = cat2;
  state.aiSourceDirty = true;
  render();
}

function updateAiGroupText(groupId, value) {
  const group = state.aiGroups.find((item) => item.id === groupId);
  if (group) group.content = value;
  state.aiSourceDirty = true;
  state.aiError = "";
}

function setAiActiveGroup(groupId) {
  if (!state.aiGroups.some((group) => group.id === groupId)) return;
  state.aiActiveGroupId = groupId;
  render();
}

function setAiSourceEditorOpen(open) {
  state.aiSourceEditorOpen = Boolean(open);
}

async function analyzeAiOrder() {
  const validGroups = state.aiGroups.filter((group) => group.cat1 && group.content.trim());
  if (!validGroups.length || validGroups.length !== state.aiGroups.length) {
    state.aiError = "每个材料窗口都需要选择一级分类并填写材料内容。请逐个检查上方标签。";
    render();
    return;
  }
  if (state.aiDraft && state.aiDraftDirty && !confirm("重新识别会重新生成全部匹配结果，并清除你刚才更换商品、修改数量或删除商品等人工调整。确定继续吗？")) {
    return;
  }
  state.aiLoading = true;
  state.aiError = "";
  render();
  try {
    const response = await apiFetch("/api/ai/order-draft", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ groups: validGroups, customerId: state.selectedCustomerId }),
      timeoutMs: 65000
    });
    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      throw new Error(response.ok ? "服务器返回内容异常" : `服务器请求失败（${response.status}）`);
    }
    if (!response.ok) throw new Error(data.error || "AI 识别失败");
    const resultCount = [data.matched, data.needsQuantity, data.uncertain, data.unmatched].
    reduce((sum, list) => sum + (Array.isArray(list) ? list.length : 0), 0);
    if (!resultCount) throw new Error("AI没有返回任何材料，请检查输入内容后重试");
    const draftProducts = [];
    [data.matched, data.needsQuantity, data.uncertain, data.unmatched].forEach((list) => {
      (Array.isArray(list) ? list : []).forEach((item) => {
        if (item && item.productId) draftProducts.push({ ...item, id: item.productId });
        (Array.isArray(item && item.candidates) ? item.candidates : []).forEach((candidate) => {
          if (candidate && candidate.productId) draftProducts.push({ ...candidate, id: candidate.productId });
        });
      });
    });
    mergeProductCache(draftProducts);
    state.aiDraft = data;
    state.aiDraftDirty = false;
    state.aiSourceDirty = false;
    state.aiDraftCustomerId = state.selectedCustomerId;
    state.aiDraftOrderType = state.orderType;
    const draftItems = aiDraftItems(data);
    const firstIssue = draftItems.find((item) => item.status !== "confirmed");
    state.aiActiveResultKey = (firstIssue || draftItems[0] || {}).key || "";
    state.aiLoading = false;
    state.aiError = "";
    render();
  } catch (error) {
    state.aiLoading = false;
    state.aiError = error.message;
    render();
  }
}

function addDraftLine(productId, quantity) {
  const product = byId(products, productId);
  if (!product) return false;
  const value = Number(quantity);
  if (!isPositiveInteger(value)) return false;
  const line = state.cart.find((item) => item.productId === productId);
  if (line) line.quantity += value;else
  state.cart.push({ productId, quantity: value, price: product.price, ...cartSnapshot(product) });
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

function aiDraftEntryKey(item, type, index) {
  return String(item.lineKey || `${item.groupId || type}-${type}-${index}`);
}

function findAiDraftEntry(key, draft = state.aiDraft) {
  if (!draft) return null;
  const lists = [
  ["matched", "matched"],
  ["needsQuantity", "needsQuantity"],
  ["uncertain", "uncertain"],
  ["unmatched", "unmatched"]];

  for (const [listName, type] of lists) {
    const list = Array.isArray(draft[listName]) ? draft[listName] : [];
    for (let index = 0; index < list.length; index += 1) {
      if (aiDraftEntryKey(list[index], type, index) === String(key)) {
        return { item: list[index], list, listName, type, index };
      }
    }
  }
  return null;
}

function markAiDraftModified() {
  state.aiDraftDirty = true;
}

function updateAiDraftQuantity(key, value) {
  const entry = findAiDraftEntry(key);
  if (!entry) return;
  entry.item.quantity = value;
  markAiDraftModified();
}

function persistAiDraftProductSelection(key, productId) {
  const entry = findAiDraftEntry(key);
  const product = byId(products, productId);
  if (!entry || !product) return null;
  entry.item.selectedProductId = product.id;
  entry.item.productId = product.id;
  entry.item.name = product.name;
  entry.item.spec = product.spec;
  entry.item.unit = product.unit;
  entry.item.price = product.price;
  entry.item.cat1 = product.cat1;
  entry.item.cat2 = product.cat2;
  entry.item.imageUrl = product.imageUrl || "";
  entry.item.recommendation = "销售已人工选择";
  markAiDraftModified();
  return entry.item;
}

function setAiAliasConsent(input) {var _input$dataset;
  const entry = findAiDraftEntry((input === null || input === void 0 || (_input$dataset = input.dataset) === null || _input$dataset === void 0 ? void 0 : _input$dataset.aiLearnAlias) || "");
  if (!entry) return;
  entry.item.learnAlias = Boolean(input.checked);
  markAiDraftModified();
}

function normalizeAiAliasText(value) {
  return String(value || "").toLowerCase().replace(/[\s，,。；;、（）()\[\]【】_-]+/g, "");
}

function shouldOfferAiAlias(rawName, productId) {
  if (!isAdmin()) return false;
  const product = byId(products, productId);
  const raw = normalizeAiAliasText(rawName);
  if (!product || !raw) return false;
  return ![product.name, product.spec, product.brand, ...(product.aliases || [])].
  some((value) => normalizeAiAliasText(value) === raw);
}

function aiAliasCheckbox(key) {
  return [...document.querySelectorAll("[data-ai-learn-alias]")].
  find((input) => input.dataset.aiLearnAlias === String(key));
}

function renderAiAliasConsent(key, rawName, productId = "") {var _entry$item, _entry$item2, _entry$item3;
  if (!isAdmin()) return "";
  const entry = findAiDraftEntry(key);
  const selectedProductId = productId || (entry === null || entry === void 0 || (_entry$item = entry.item) === null || _entry$item === void 0 ? void 0 : _entry$item.selectedProductId) || (entry === null || entry === void 0 || (_entry$item2 = entry.item) === null || _entry$item2 === void 0 ? void 0 : _entry$item2.productId) || "";
  const visible = selectedProductId && shouldOfferAiAlias(rawName, selectedProductId);
  return `<label class="ai-alias-consent ${visible ? "" : "is-hidden"}" data-ai-alias-wrap="${html(key)}">
    <input type="checkbox" data-ai-learn-alias="${html(key)}" ${entry !== null && entry !== void 0 && (_entry$item3 = entry.item) !== null && _entry$item3 !== void 0 && _entry$item3.learnAlias ? "checked" : ""} onchange="setAiAliasConsent(this)" />
    <span>将“${html(rawName || "该叫法")}”加入所选商品的别名 / 关键词库</span>
  </label>`;
}

function selectAiCandidateChoice(input) {var _input$closest;
  const key = input.dataset.aiCandidateGroup || "";
  persistAiDraftProductSelection(key, input.value);
  const wrap = [...document.querySelectorAll("[data-ai-alias-wrap]")].
  find((element) => element.dataset.aiAliasWrap === key);
  const checkbox = aiAliasCheckbox(key);
  if (wrap && checkbox) {
    const visible = shouldOfferAiAlias(input.dataset.aiRawName, input.value);
    wrap.classList.toggle("is-hidden", !visible);
    if (!visible) {
      checkbox.checked = false;
      const entry = findAiDraftEntry(key);
      if (entry) entry.item.learnAlias = false;
    }
  }
  const matchedPicker = (_input$closest = input.closest("[data-ai-matched-line]")) === null || _input$closest === void 0 ? void 0 : _input$closest.querySelector(".ai-matched-picker");
  const summary = matchedPicker === null || matchedPicker === void 0 ? void 0 : matchedPicker.querySelector(":scope > summary");
  if (matchedPicker && summary) {
    matchedPicker.classList.add("has-selection");
    summary.textContent = `已选择替换商品：${input.dataset.aiProductName || "请确认"}`;
  }
  const navItem = [...document.querySelectorAll("[data-ai-nav-key]")].
  find((element) => element.dataset.aiNavKey === key);
  if (navItem) {
    const panel = input.closest("[data-ai-detail-key]");
    const quantityInput = panel === null || panel === void 0 ? void 0 : panel.querySelector("[data-ai-matched-quantity], [data-ai-candidate-quantity]");
    updateAiNavStatus(navItem, isPositiveInteger(Number(quantityInput === null || quantityInput === void 0 ? void 0 : quantityInput.value)) ? "confirmed" : "pending");
    const match = navItem.querySelector("[data-ai-nav-match]");
    if (match) {
      match.textContent = input.dataset.aiProductName || "已选择商品";
      match.classList.remove("is-empty");
    }
    refreshAiStatusCounts();
  }
}

function updateAiNavStatus(navItem, status) {
  if (!navItem) return;
  navItem.dataset.aiNavStatus = status;
  navItem.classList.remove("is-confirmed", "is-pending", "is-unmatched");
  navItem.classList.add(`is-${status}`);
  const badge = navItem.querySelector("[data-ai-nav-status]");
  if (badge) {
    badge.textContent = aiStatusLabel(status);
    badge.classList.remove("is-confirmed", "is-pending", "is-unmatched");
    badge.classList.add(`is-${status}`);
  }
}

function refreshAiStatusCounts() {
  const counts = { confirmed: 0, pending: 0, unmatched: 0 };
  document.querySelectorAll("[data-ai-nav-status-value]").forEach((item) => {
    const status = item.dataset.aiNavStatus;
    if (counts[status] !== undefined) counts[status] += 1;
  });
  Object.keys(counts).forEach((status) => {
    document.querySelectorAll(`[data-ai-status-count="${status}"]`).forEach((element) => {
      element.textContent = counts[status];
    });
  });
  document.querySelectorAll("[data-ai-total-count]").forEach((element) => {
    element.textContent = counts.confirmed + counts.pending + counts.unmatched;
  });
}

function updateAiNavQuantity(input) {
  setQuantityInputValidity(input);
  const key = input.dataset.aiNavQuantity || input.dataset.aiLineKey || input.dataset.aiCandidateQuantity || "";
  updateAiDraftQuantity(key, input.value);
  const navItem = [...document.querySelectorAll("[data-ai-nav-key]")].
  find((element) => element.dataset.aiNavKey === String(key));
  const quantity = navItem === null || navItem === void 0 ? void 0 : navItem.querySelector("[data-ai-nav-quantity-value]");
  if (quantity) quantity.textContent = input.value || "待补";
  const panel = input.closest("[data-ai-detail-key]");
  const selectedProduct = panel === null || panel === void 0 ? void 0 : panel.querySelector("[data-ai-candidate-product]:checked");
  if (input.matches("[data-ai-matched-quantity]") || selectedProduct) {
    updateAiNavStatus(navItem, isPositiveInteger(Number(input.value)) ? "confirmed" : "pending");
    refreshAiStatusCounts();
  }
}

function setAiResultActive(key) {
  state.aiActiveResultKey = key;
  document.querySelectorAll("[data-ai-nav-key]").forEach((item) => {
    item.classList.toggle("active", item.dataset.aiNavKey === String(key));
  });
  document.querySelectorAll("[data-ai-detail-key]").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.aiDetailKey === String(key));
  });
  const activePanel = [...document.querySelectorAll("[data-ai-detail-key]")].
  find((panel) => panel.dataset.aiDetailKey === String(key));
  activePanel === null || activePanel === void 0 || activePanel.scrollTo({ top: 0 });
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
    recommendation: "在当前分类商品库中找到"
  };
}

function aiCandidateOption(product, key, rawName, orderIndex = "", selectedProductId = "") {
  const reason = product.recommendation ? `<small class="ai-recommendation">${html(product.recommendation)}</small>` : "";
  return `<label class="ai-candidate-option">
    <input type="radio" name="ai-candidate-${html(key)}" value="${html(product.productId)}" ${String(selectedProductId || "") === String(product.productId || "") ? "checked" : ""} data-ai-candidate-product data-ai-candidate-group="${html(key)}" data-ai-order-index="${html(orderIndex)}" data-ai-raw-name="${html(rawName || "")}" data-ai-product-name="${html(product.name || "")}" onchange="selectAiCandidateChoice(this)" />
    ${product.imageUrl ? `<img class="ai-candidate-thumb" src="${html(product.imageUrl)}" alt="" loading="lazy" />` : ""}
    <span><strong>${html(product.name)}</strong><small>${html(product.spec || "无规格")} · ${html(product.unit || "-")} · ${html(product.cat1 || "-")}${product.cat2 ? " / " + html(product.cat2) : ""}</small>${reason}</span>
    <b>${money(product.price)}</b>
  </label>`;
}

function aiSearchSubcategories(cat1) {
  if (cat1 && Array.isArray(state.productCategories[cat1])) return state.productCategories[cat1];
  return [...new Set(products.filter((product) => !cat1 || product.cat1 === cat1).map((product) => product.cat2).filter(Boolean))].
  sort((a, b) => a.localeCompare(b, "zh-CN"));
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
  const cat2Select = [...document.querySelectorAll("[data-ai-search-cat2]")].
  find((element) => element.dataset.aiSearchCat2 === String(key));
  if (cat2Select) {
    cat2Select.innerHTML = `<option value="">全部二级分类</option>${aiSearchSubcategories(select.value).map((item) => `<option value="${html(item)}">${html(item)}</option>`).join("")}`;
  }
  refreshAiManualSearch(key, rawName, orderIndex);
}

function refreshAiManualSearch(key, rawName, orderIndex) {
  const input = [...document.querySelectorAll("[data-ai-manual-input]")].
  find((element) => element.dataset.aiManualInput === String(key));
  if (input) updateAiManualSearch(input, key, rawName, "", "", orderIndex);
}

function aiManualCandidateScore(product, query) {
  return productSearchScore(product, query);
}

async function updateAiManualSearch(input, key, rawName, cat1, cat2, orderIndex = "") {
  const query = input.value.trim();
  const cat1Select = [...document.querySelectorAll("[data-ai-search-cat1]")].
  find((element) => element.dataset.aiSearchCat1 === String(key));
  const cat2Select = [...document.querySelectorAll("[data-ai-search-cat2]")].
  find((element) => element.dataset.aiSearchCat2 === String(key));
  const selectedCat1 = cat1Select ? cat1Select.value : cat1;
  const selectedCat2 = cat2Select ? cat2Select.value : cat2;
  const response = await latestApiFetch(`ai-products-${key}`, `/api/products${queryString({ page: 1, pageSize: 16, q: query, category1: selectedCat1, category2: selectedCat2, status: "在售" })}`);
  if (!response) return;
  const data = await response.json();
  if (!response.ok) return;
  const matchedProducts = data.items || [];
  mergeProductCache(matchedProducts);
  const candidates = matchedProducts.map(aiCandidateFromProduct);
  const results = [...document.querySelectorAll("[data-ai-manual-results]")].
  find((element) => element.dataset.aiManualResults === String(key));
  if (results) {var _findAiDraftEntry;
    const selectedProductId = ((_findAiDraftEntry = findAiDraftEntry(key)) === null || _findAiDraftEntry === void 0 || (_findAiDraftEntry = _findAiDraftEntry.item) === null || _findAiDraftEntry === void 0 ? void 0 : _findAiDraftEntry.selectedProductId) || "";
    results.innerHTML = candidates.length ?
    candidates.map((product) => aiCandidateOption(product, key, rawName, orderIndex, selectedProductId)).join("") :
    `<div class="ai-manual-empty">当前搜索范围没有找到商品，请更换关键词、分类或选择“全部商品”。</div>`;
  }
}

function applyAiDraft() {
  if (!state.aiDraft) return;
  const entries = aiDraftItems(state.aiDraft).
  map((item) => ({
    orderIndex: Number(item.orderIndex || 0),
    productId: item.selectedProductId || (item.aiType === "matched" || item.aiType === "needsQuantity" ? item.productId : ""),
    quantity: item.quantity || "",
    rawName: item.rawName || "",
    lineKey: item.key,
    learnAlias: Boolean(item.learnAlias)
  })).
  filter((entry) => entry.productId);
  const invalidEntries = entries.filter((entry) => !isPositiveInteger(entry.quantity));
  if (invalidEntries.length) {
    document.querySelectorAll("[data-ai-matched-quantity], [data-ai-quantity-product], [data-ai-candidate-quantity]").forEach((input) => {
      setQuantityInputValidity(input);
    });
    const firstInvalidKey = invalidEntries[0].lineKey;
    const firstInvalid = [...document.querySelectorAll("[data-ai-matched-quantity], [data-ai-quantity-product], [data-ai-candidate-quantity]")].
    find((input) => input.dataset.aiLineKey === firstInvalidKey || input.dataset.aiCandidateQuantity === firstInvalidKey) ||
    document.querySelector(".quantity-input-invalid");
    firstInvalid === null || firstInvalid === void 0 || firstInvalid.focus();
    firstInvalid === null || firstInvalid === void 0 || firstInvalid.scrollIntoView({ block: "center", behavior: "smooth" });
    alert("商品数量必须为大于 0 的整数，请检查标红的数量。");
    return;
  }
  entries.sort((a, b) => a.orderIndex - b.orderIndex).forEach((entry) => {
    if (addDraftLine(entry.productId, entry.quantity)) rememberAiChoice(entry.rawName, entry.productId, entry.learnAlias);
  });
  persistCart();
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  closeModal();
  showToast(`AI 已填入 ${count} 件商品，请确认后保存订单`);
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
  const list = filteredUsers();
  return `
    <div class="mobile-page-tools user-mobile-tools"><input id="userSearchInputMobile" class="input" placeholder="搜索姓名/手机号/角色" value="${html(state.query)}" oninput="updateUserQuery(this)" /><button class="btn primary" onclick="openModal('user')">添加人员</button></div>
    <div class="toolbar desktop-page-tools">
      <input id="userSearchInput" class="input" placeholder="搜索姓名/手机号/角色" value="${state.query}" oninput="updateUserQuery(this)" />
      <div class="spacer"></div>
      <button class="btn primary" onclick="openModal('user')">＋ 添加人员</button>
    </div>
    <div class="card table-wrap user-table">
      <table><thead><tr><th>姓名</th><th>登录手机号</th><th>登录密码</th><th>角色定位</th><th>账号状态</th><th>权限说明</th><th>操作</th></tr></thead>
      <tbody>${list.map((u) => `<tr><td><strong>${u.name}</strong></td><td>${u.phone}</td><td class="num">${maskPassword(u.password)}</td><td>${u.role}</td><td><span class="badge ${u.status === "启用" ? "success" : "danger"}">${u.status}</span></td><td>${roleDesc(u.role)}</td><td>${actionButton("编辑", "edit", `openModal('user','${u.id}')`)}${actionButton(u.status === "启用" ? "停用" : "启用", "refresh", `toggleUserStatus('${u.id}')`)}</td></tr>`).join("")}</tbody></table>
    </div>
    <div class="mobile-table-head user-mobile-head"><span>人员 / 手机</span><span>角色 / 状态</span><span>操作</span></div>
    <div class="user-mobile-list">${list.map((u) => `
      <article class="user-mobile-item">
        <div><strong>${html(u.name)}</strong><span>${html(u.phone || "-")}</span></div>
        <div><b>${html(u.role || "-")}</b><span class="badge ${u.status === "启用" ? "success" : "danger"}">${html(u.status || "-")}</span></div>
        <small>${html(roleDesc(u.role))}</small>
        <div class="row-actions user-actions-desktop">${actionButton("编辑", "edit", `openModal('user','${u.id}')`)}${actionButton(u.status === "启用" ? "停用" : "启用", "refresh", `toggleUserStatus('${u.id}')`)}</div>
        <div class="mobile-row-actions user-actions-mobile"><button type="button" class="mobile-row-primary" onclick="openModal('user',${jsArg(u.id)})">编辑</button><details class="mobile-row-more"><summary aria-label="更多操作">•••</summary><div><button type="button" onclick="toggleUserStatus(${jsArg(u.id)})">${u.status === "启用" ? "停用账号" : "启用账号"}</button></div></details></div>
      </article>`).join("")}</div>
  `;
}

function filteredUsers() {
  const q = state.query.trim();
  return salesUsers.filter((u) => !q || [u.name, u.phone, u.role].some((v) => v.includes(q)));
}

function updateUserQuery(input) {
  state.query = input.value;
  const list = filteredUsers();
  const tableBody = document.querySelector(".user-table tbody");
  const mobileList = document.querySelector(".user-mobile-list");
  const template = document.createElement("template");
  template.innerHTML = renderUsers();
  const nextBody = template.content.querySelector(".user-table tbody");
  const nextMobileList = template.content.querySelector(".user-mobile-list");
  if (tableBody && nextBody) tableBody.replaceWith(nextBody);
  if (mobileList && nextMobileList) mobileList.replaceWith(nextMobileList);
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
    const response = await apiFetch(`/api/users/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: nextStatus })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "更新状态失败");
    Object.assign(user, data.user);
    showToast("人员状态已更新");
  } catch (error) {
    alert(error.message);
  }
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
  if (type === "paymentAmount") return paymentAmountModal(id);
  if (type === "user") return userModal();
  if (type === "aiOrder") return aiOrderModal();
  return "";
}

function aiOrderModal() {
  const customer = byId(customers, state.selectedCustomerId);
  const draft = state.aiDraft;
  const cat1Options = productPrimaryCategories();
  const activeGroup = state.aiGroups.find((group) => group.id === state.aiActiveGroupId) || state.aiGroups[0];
  const cat2Options = activeGroup ? productSubcategoriesFor(activeGroup.cat1) : [];
  const sourceEditor = `
    <div class="ai-group-tabs">${state.aiGroups.map((group, index) => `<button class="ai-group-tab ${group.id === state.aiActiveGroupId ? "active" : ""}" onclick="setAiActiveGroup(${jsArg(group.id)})"><span>${html(group.cat2 || group.cat1 || `分类 ${index + 1}`)}</span>${state.aiGroups.length > 1 ? `<i onclick="event.stopPropagation();removeAiGroup(${jsArg(group.id)})">×</i>` : ""}</button>`).join("")}<button class="ai-group-add" onclick="addAiGroup()">＋ 添加分类窗口</button></div>
    ${activeGroup ? `<section class="ai-group-panel"><div class="ai-group-filters"><div class="field"><label>一级分类 *</label><select class="select" onchange="setAiGroupCategory('${html(activeGroup.id)}',this.value)"><option value="">请选择一级分类</option>${cat1Options.map((cat1) => `<option value="${html(cat1)}" ${activeGroup.cat1 === cat1 ? "selected" : ""}>${html(cat1)}</option>`).join("")}</select></div><div class="field"><label>二级分类（选填）</label><select class="select" ${activeGroup.cat1 ? "" : "disabled"} onchange="setAiGroupSubcategory('${html(activeGroup.id)}',this.value)"><option value="">全部二级分类</option>${cat2Options.map((cat2) => `<option value="${html(cat2)}" ${activeGroup.cat2 === cat2 ? "selected" : ""}>${html(cat2)}</option>`).join("")}</select></div></div><div class="field"><label>该分类下的材料清单</label><textarea class="textarea ai-textarea" oninput="updateAiGroupText('${html(activeGroup.id)}',this.value)" placeholder="只填写属于当前分类的材料，例如：20管6根，20弯头30个...">${html(activeGroup.content)}</textarea></div><div class="hint">匹配范围：${activeGroup.cat1 ? html(activeGroup.cat1) : "尚未选择"}${activeGroup.cat2 ? ` / ${html(activeGroup.cat2)}` : activeGroup.cat1 ? " / 全部二级分类" : ""}。系统不会跨出这个范围推荐商品。</div></section>` : ""}
    <div class="ai-actions">
      <button class="btn primary" onclick="analyzeAiOrder()" ${state.aiLoading ? "disabled" : ""}>${state.aiLoading ? "识别中..." : draft ? "重新识别" : "开始识别"}</button>
      <span class="hint">${state.aiLoading ? "正在提交分类材料并等待AI解析，请不要关闭窗口。" : state.aiSourceDirty && draft ? "原始材料已修改；下方人工调整仍会保留，只有点击重新识别才会生成新结果。" : "唯一可靠商品自动匹配；不确定就留给你确认或进入未匹配。"}</span>
    </div>`;
  return `
    <div class="modal-backdrop">
      <div class="modal ai-modal ${draft ? "has-results" : ""}">
        <div class="modal-head">
          <div><h3>AI 帮我开单</h3><div class="hint">当前客户：${customer ? `${customer.name} - ${customer.phone}` : "请先选择客户"}。AI 只匹配商品库商品，生成后还需要销售确认保存。</div></div>
          <button class="icon-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body">
          ${draft ? `<details class="ai-source-editor" ${state.aiSourceEditorOpen ? "open" : ""} ontoggle="setAiSourceEditorOpen(this.open)"><summary>查看或修改原始材料并重新识别</summary><div class="ai-source-editor-body">${sourceEditor}</div></details>` : sourceEditor}
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
  const items = aiDraftItems(draft);
  if (!items.length) return "";
  if (!items.some((item) => item.key === state.aiActiveResultKey)) {
    state.aiActiveResultKey = (items.find((item) => item.status !== "confirmed") || items[0]).key;
  }
  const counts = items.reduce((result, item) => {
    result[item.status] += 1;
    return result;
  }, { confirmed: 0, pending: 0, unmatched: 0 });
  return `
    <div class="ai-result ai-master-detail">
      <aside class="ai-result-master">
        <div class="ai-master-head">
          <div><strong>AI识别的商品需求</strong><span>共 <b data-ai-total-count>${items.length}</b> 条</span></div>
          <div class="ai-status-summary">
            <span class="ai-status-chip">全部 <b data-ai-total-count>${items.length}</b></span>
            ${aiStatusSummary("confirmed", "已确定", counts.confirmed)}
            ${aiStatusSummary("pending", "待确定", counts.pending)}
            ${aiStatusSummary("unmatched", "未匹配", counts.unmatched)}
          </div>
        </div>
        <div class="ai-master-list">
          ${items.map((item, index) => renderAiNavItem(item, index)).join("")}
        </div>
      </aside>
      <section class="ai-result-detail">
        ${items.map((item) => renderAiDetailPanel(item)).join("")}
      </section>
    </div>`;
}

function aiDraftItems(draft) {
  const entries = [];
  const append = (list, type, status) => {
    (list || []).forEach((item, index) => {
      if (item.userDeleted) return;
      let currentStatus = status;
      if (type === "matched" || type === "needsQuantity") {
        currentStatus = isPositiveInteger(item.quantity) ? "confirmed" : "pending";
      } else if (item.selectedProductId) {
        currentStatus = isPositiveInteger(item.quantity) ? "confirmed" : "pending";
      }
      entries.push({
        ...item,
        aiType: type,
        status: currentStatus,
        key: aiDraftEntryKey(item, type, index)
      });
    });
  };
  append(draft.matched, "matched", "confirmed");
  append(draft.needsQuantity, "needsQuantity", "pending");
  append(draft.uncertain, "uncertain", "pending");
  append(draft.unmatched, "unmatched", "unmatched");
  return entries.sort((a, b) => Number(a.orderIndex || 0) - Number(b.orderIndex || 0));
}

function aiStatusSummary(status, label, count) {
  return `<span class="ai-status-chip is-${status}">${label} <b data-ai-status-count="${status}">${count}</b></span>`;
}

function aiStatusLabel(status) {
  return status === "confirmed" ? "已确定" : status === "pending" ? "待确定" : "未匹配";
}

function aiNavMatchText(item) {var _item$candidates;
  if (item.selectedProductId) return item.name || "销售已选择商品";
  if (item.aiType === "matched" || item.aiType === "needsQuantity") return item.name || "已匹配商品";
  if (item.aiType === "uncertain" && (_item$candidates = item.candidates) !== null && _item$candidates !== void 0 && _item$candidates[0]) return `首选候选：${item.candidates[0].name}`;
  return "尚未选择商品";
}

function renderAiNavItem(item, index) {
  const active = item.key === state.aiActiveResultKey;
  const matchText = aiNavMatchText(item);
  const empty = item.aiType === "unmatched" && !item.selectedProductId;
  return `
    <button type="button" class="ai-nav-item is-${item.status} ${active ? "active" : ""}" data-ai-nav-key="${html(item.key)}" data-ai-nav-status-value data-ai-nav-status="${html(item.status)}" onclick="setAiResultActive(${jsArg(item.key)})">
      <span class="ai-nav-index">${index + 1}</span>
      <span class="ai-nav-content">
        <span class="ai-nav-title"><strong>${html(item.rawName || item.name || "未命名商品")}</strong><em class="ai-status-badge is-${item.status}" data-ai-nav-status>${aiStatusLabel(item.status)}</em></span>
        <span class="ai-nav-original">原文：${html(item.rawName || "-")}</span>
        <span class="ai-nav-match ${empty ? "is-empty" : ""}" data-ai-nav-match>${html(matchText)}</span>
        <span class="ai-nav-meta">${html(item.groupTitle || "识别结果")}</span>
      </span>
      <span class="ai-nav-quantity">数量 <b data-ai-nav-quantity-value>${html(item.quantity || "待补")}</b></span>
    </button>`;
}

function aiDraftProduct(item) {
  return {
    productId: item.productId,
    name: item.name,
    spec: item.spec,
    unit: item.unit,
    price: item.price,
    cat1: item.cat1 || "",
    cat2: item.cat2 || "",
    imageUrl: item.imageUrl || "",
    recommendation: item.recommendation || ""
  };
}

function aiCurrentProductCard(item) {
  const product = aiDraftProduct(item);
  return `
    <div class="ai-current-product-card">
      <span class="ai-current-check">✓</span>
      ${product.imageUrl ? `<img class="ai-candidate-thumb" src="${html(product.imageUrl)}" alt="" loading="lazy" />` : ""}
      <span><strong>${html(product.name || "已匹配商品")}</strong><small>${html(product.spec || "无规格")} · ${html(product.unit || "-")} · ${html(product.cat1 || "-")}${product.cat2 ? " / " + html(product.cat2) : ""}</small>${product.recommendation ? `<small class="ai-recommendation">${html(product.recommendation)}</small>` : ""}</span>
      <b>${money(product.price)}</b>
    </div>`;
}

function aiDetailQuantity(item) {
  const common = `class="input ai-detail-quantity${item.quantity && !isPositiveInteger(item.quantity) ? " quantity-input-invalid" : ""}" type="number" min="1" step="1" inputmode="numeric" value="${html(item.quantity || "")}" placeholder="整数" data-ai-nav-quantity="${html(item.key)}"`;
  if (item.aiType === "matched" || item.aiType === "needsQuantity") {
    return `<input ${common} data-ai-matched-quantity data-ai-line-key="${html(item.key)}" oninput="updateAiNavQuantity(this)" />`;
  }
  return `<input ${common} data-ai-candidate-quantity="${html(item.key)}" oninput="updateAiNavQuantity(this)" />`;
}

function aiCandidateWorkspace(item) {
  const originalCandidates = item.aiType === "uncertain" ? item.candidates || [] : item.aiType === "unmatched" ? item.suggestions || [] : [];
  const selectedCandidate = item.selectedProductId ? aiDraftProduct(item) : null;
  const candidates = [selectedCandidate, ...originalCandidates].
  filter(Boolean).
  filter((candidate, index, list) => list.findIndex((entry) => entry.productId === candidate.productId) === index);
  const current = item.aiType === "matched" || item.aiType === "needsQuantity";
  return `
    <section class="ai-detail-section">
      <div class="ai-detail-section-head"><div><strong>${current ? "当前匹配商品" : "推荐商品"}</strong><span>${current ? "如匹配有误，可在下方搜索并替换" : "候选按客户习惯、出单频率和数量排序"}</span></div>${candidates.length ? `<span>共 ${candidates.length} 个候选</span>` : ""}</div>
      ${current ? aiCurrentProductCard(item) : candidates.length ? `
        <div class="ai-candidate-list">
          ${candidates[0] ? aiCandidateOption(candidates[0], item.key, item.rawName, item.orderIndex, item.selectedProductId) : ""}
          ${candidates.length > 1 ? `<details class="ai-more-candidates" open><summary>展开更多推荐（共 ${candidates.length} 个）</summary>${candidates.slice(1).map((product) => aiCandidateOption(product, item.key, item.rawName, item.orderIndex, item.selectedProductId)).join("")}</details>` : ""}
        </div>` : `<div class="ai-manual-empty">暂时没有可靠候选，请在下方搜索商品。</div>`}
    </section>
    <section class="ai-detail-section ai-search-other-section">
      <div class="ai-detail-section-head"><div><strong>搜索其他商品</strong><span>候选不合适时，可从真实商品库中重新选择</span></div></div>
      ${aiSearchScopeControls(item.key, item.rawName, item.cat1 || "", item.cat2 || "", item.orderIndex)}
      <div class="ai-manual-search"><input class="input" data-ai-manual-input="${html(item.key)}" placeholder="输入商品名称、规格、品牌或关键词" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateAiManualSearch(this,${jsArg(item.key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" oninput="updateAiManualSearch(this,${jsArg(item.key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" /></div>
      <div class="ai-candidate-list ai-manual-results" data-ai-manual-results="${html(item.key)}"><div class="ai-manual-empty">输入关键词后即时显示匹配商品；选中后会同步到左侧。</div></div>
    </section>
    ${renderAiAliasConsent(item.key, item.rawName)}`;
}

function renderAiDetailPanel(item) {
  const active = item.key === state.aiActiveResultKey;
  const matchedAttributes = item.aiType === "matched" || item.aiType === "needsQuantity" ?
  ` data-ai-matched-line data-ai-line-key="${html(item.key)}" data-ai-product-id="${html(item.productId)}" data-ai-order-index="${html(item.orderIndex)}" data-ai-raw-name="${html(item.rawName || "")}"` :
  "";
  return `
    <div class="ai-detail-panel ${active ? "active" : ""}" data-ai-detail-key="${html(item.key)}"${matchedAttributes}>
      <div class="ai-detail-head">
        <div><span>正在处理</span><h4>${html(item.rawName || item.name || "未命名商品")}</h4><small>${html(item.groupTitle || "识别结果")} · ${aiStatusLabel(item.status)}</small></div>
        <label><span>数量</span>${aiDetailQuantity(item)}</label>
        ${item.aiType === "matched" ? `<button type="button" class="icon-btn danger ai-matched-delete" title="删除该商品" aria-label="删除该商品" onclick="removeAiMatchedLine(this)">${svgIcon("delete")}</button>` : ""}
      </div>
      <div class="ai-detail-scroll">${aiCandidateWorkspace(item)}</div>
    </div>`;
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

function removeAiMatchedLine(button) {var _remaining$;
  const line = button.closest("[data-ai-matched-line]");
  if (!line) return;
  const key = line.dataset.aiLineKey || line.dataset.aiDetailKey || "";
  const entry = findAiDraftEntry(key);
  if (!entry) return;
  entry.item.userDeleted = true;
  markAiDraftModified();
  const remaining = aiDraftItems(state.aiDraft);
  if (state.aiActiveResultKey === key) state.aiActiveResultKey = ((_remaining$ = remaining[0]) === null || _remaining$ === void 0 ? void 0 : _remaining$.key) || "";
  render();
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
      ${list.map((item, index) => {const key = item.lineKey || `${item.groupId || "group"}-${index}`;const candidates = item.candidates || [];return `<div class="ai-candidate-block"><div class="ai-candidate-head"><div><strong>原文：${html(item.rawName || "-")}</strong><div class="hint">候选按客户习惯、出单频率和数量排序；没有合适商品时可在下方搜索。</div></div><input class="input ai-small-input${item.quantity && !isPositiveInteger(item.quantity) ? " quantity-input-invalid" : ""}" type="number" min="1" step="1" inputmode="numeric" value="${html(item.quantity || "")}" placeholder="整数数量" data-ai-candidate-quantity="${html(key)}" oninput="setQuantityInputValidity(this)" /></div><div class="ai-candidate-list">${candidates[0] ? aiCandidateOption(candidates[0], key, item.rawName, item.orderIndex) : ""}${candidates.length > 1 ? `<details class="ai-more-candidates"><summary>展开其他 ${candidates.length - 1} 个候选</summary>${candidates.slice(1).map((product) => aiCandidateOption(product, key, item.rawName, item.orderIndex)).join("")}</details>` : ""}</div><details class="ai-manual-picker"><summary>搜索其他商品</summary>${aiSearchScopeControls(key, item.rawName, item.cat1 || "", item.cat2 || "", item.orderIndex)}<div class="ai-manual-search"><input class="input" data-ai-manual-input="${html(key)}" placeholder="输入商品名称、规格、品牌或关键词" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" oninput="updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" /></div><div class="ai-candidate-list ai-manual-results" data-ai-manual-results="${html(key)}"><div class="ai-manual-empty">输入关键词后即时显示匹配商品。</div></div></details>${renderAiAliasConsent(key, item.rawName)}</div>`;}).join("")}
    </section>
  `;
}

function renderAiUnmatched(list) {
  if (!list.length) return "";
  return `
    <section class="ai-section">
      <h4>未匹配商品</h4>
      ${list.map((item, index) => {const key = item.lineKey || `${item.groupId || "unmatched"}-${index}`;const suggestions = item.suggestions || [];return `<div class="ai-candidate-block ai-unmatched-block"><div class="ai-candidate-head"><div><strong>原文：${html(item.rawName || "-")}</strong><div class="hint">${html(item.note || "未找到足够可靠的商品，请手动选择。")}</div></div><input class="input ai-small-input${item.quantity && !isPositiveInteger(item.quantity) ? " quantity-input-invalid" : ""}" type="number" min="1" step="1" inputmode="numeric" value="${html(item.quantity || "")}" placeholder="整数数量" data-ai-candidate-quantity="${html(key)}" oninput="setQuantityInputValidity(this)" /></div>${aiSearchScopeControls(key, item.rawName, item.cat1 || "", item.cat2 || "", item.orderIndex)}<div class="ai-manual-search"><input class="input" data-ai-manual-input="${html(key)}" placeholder="输入商品名称、规格、品牌或关键词" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" oninput="updateAiManualSearch(this,${jsArg(key)},${jsArg(item.rawName || "")},${jsArg(item.cat1 || "")},${jsArg(item.cat2 || "")},${jsArg(item.orderIndex)})" /></div><div class="ai-candidate-list ai-manual-results" data-ai-manual-results="${html(key)}">${suggestions.length ? suggestions.map((product) => aiCandidateOption(product, key, item.rawName, item.orderIndex)).join("") : `<div class="ai-manual-empty">输入关键词后即时显示匹配商品。</div>`}</div>${renderAiAliasConsent(key, item.rawName)}</div>`;}).join("")}
    </section>
  `;
}
function customerModal(id) {var _state$user4;
  const c = byId(customers, id) || {};
  const ownerId = c.ownerId || ((_state$user4 = state.user) === null || _state$user4 === void 0 ? void 0 : _state$user4.id) || "";
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

async function saveCustomer(id) {var _document$getElementB6, _document$getElementB7, _document$getElementB8, _document$getElementB9, _document$getElementB0, _document$getElementB1, _state$user5;
  const payload = {
    name: ((_document$getElementB6 = document.getElementById("customerName")) === null || _document$getElementB6 === void 0 ? void 0 : _document$getElementB6.value.trim()) || "",
    contact: ((_document$getElementB7 = document.getElementById("customerContact")) === null || _document$getElementB7 === void 0 ? void 0 : _document$getElementB7.value.trim()) || "",
    phone: ((_document$getElementB8 = document.getElementById("customerPhone")) === null || _document$getElementB8 === void 0 ? void 0 : _document$getElementB8.value.trim()) || "",
    email: ((_document$getElementB9 = document.getElementById("customerEmail")) === null || _document$getElementB9 === void 0 ? void 0 : _document$getElementB9.value.trim()) || "",
    address: ((_document$getElementB0 = document.getElementById("customerAddress")) === null || _document$getElementB0 === void 0 ? void 0 : _document$getElementB0.value.trim()) || "",
    ownerId: ((_document$getElementB1 = document.getElementById("customerOwner")) === null || _document$getElementB1 === void 0 ? void 0 : _document$getElementB1.value) || ((_state$user5 = state.user) === null || _state$user5 === void 0 ? void 0 : _state$user5.id) || ""
  };
  if (!payload.name || !payload.phone) {
    alert("客户名称和联系电话必填。");
    return;
  }
  try {
    const response = await apiFetch(id ? `/api/customers/${encodeURIComponent(id)}` : "/api/customers", {
      method: id ? "PATCH" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
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
    if (state.route === "customers") await loadCustomers();
    if (state.route === "create" || state.route === "returns") await loadCustomers({ forCreate: true });
    render();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteCustomer(id) {
  if (!isAdmin()) return alert("只有管理员和超级管理员可以删除客户");
  const customer = byId(customers, id);
  if (!customer) return;
  const stats = customerStats(customer.id);
  const message = stats.count ?
  `确定删除客户“${customer.name}”吗？\n\n该客户有 ${stats.count} 笔历史订单。删除后客户将从客户列表和开单选择中移除，历史订单仍会保留。` :
  `确定删除客户“${customer.name}”吗？\n电话：${customer.phone || "-"}\n\n删除后无法恢复。`;
  if (!confirm(message)) return;
  const response = await apiFetch(`/api/customers/${encodeURIComponent(id)}`, { method: "DELETE" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return alert(data.error || "删除客户失败");
  orders.forEach((order) => {
    if (order.customerId !== id) return;
    if (!order.customerName) order.customerName = customer.name || customer.contact || "";
    if (!order.customerPhone) order.customerPhone = customer.phone || order.phone || "";
    if (!order.customerAddress) order.customerAddress = customer.address || order.address || "";
  });
  customers = customers.filter((item) => item.id !== id);
  if (state.selectedCustomerId === id) {
    state.selectedCustomerId = "";
    state.createCustomerQuery = "";
    state.createCustomerPickerOpen = false;
    resetOrderDraft(null);
  }
  showToast("客户已删除");
  await loadCustomers();
  render();
}

function productImageModal(id) {
  const product = byId(products, id);
  if (!product) return "";
  const imageUrls = productImageUrls(product);
  return `
    <div class="modal-backdrop">
      <div class="modal product-image-modal">
        <div class="modal-head"><div><h3>${html(product.name)}</h3><div class="hint">${html(product.spec || "无规格")}</div></div><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          ${imageUrls.length ? `<div class="product-image-gallery">${imageUrls.map((imageUrl, index) => `
            <figure><img class="product-image-large" src="${html(imageUrl)}" alt="${html(product.name)} 第 ${index + 1} 张图片" /><figcaption>第 ${index + 1} 张</figcaption></figure>
          `).join("")}</div>` : `<div class="product-image-empty">该商品暂未上传图片</div>`}
        </div>
        ${isAdmin() ? `<div class="modal-foot"><button class="btn" onclick="closeModal();openModal('product',${jsArg(product.id)})">编辑商品图片</button></div>` : ""}
      </div>
    </div>
  `;
}

function productImageUrls(product) {
  const urls = Array.isArray(product === null || product === void 0 ? void 0 : product.imageUrls) ? product.imageUrls.filter(Boolean) : [];
  if (!urls.length && product !== null && product !== void 0 && product.imageUrl) urls.push(product.imageUrl);
  return Array.from(new Set(urls));
}

function previewProductImage(input) {var _input$closest2;
  const files = Array.from(input.files || []);
  if (!files.length) return;
  const product = byId(products, input.dataset.productId || "") || {};
  const availableCount = Math.max(0, 6 - productImageUrls(product).length);
  if (files.length > availableCount) {
    alert(`每个商品最多保存 6 张图片，当前还可以选择 ${availableCount} 张。`);
    input.value = "";
    return;
  }
  const oversized = files.find((file) => file.size > 12 * 1024 * 1024);
  if (oversized) {
    alert(`“${oversized.name}”超过 12MB，请先压缩后上传。`);
    input.value = "";
    return;
  }
  const preview = (_input$closest2 = input.closest(".product-image-editor")) === null || _input$closest2 === void 0 ? void 0 : _input$closest2.querySelector(".product-image-selection");
  if (!preview) return;
  preview.innerHTML = files.map((file, index) => {
    const url = URL.createObjectURL(file);
    return `<figure><img src="${html(url)}" alt="待上传图片 ${index + 1}" /><figcaption>${html(file.name)}</figcaption></figure>`;
  }).join("");
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
  const response = await apiFetch(`/api/products/${encodeURIComponent(productId)}/image`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ image: await fileAsDataUrl(file) })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 413) throw new Error("图片请求超过服务器限制，请刷新后重试");
    throw new Error(data.error || "商品图片上传失败");
  }
  return data.product;
}

function loadProductImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`无法识别图片“${file.name}”，请转换为 JPG、PNG 或 WebP 后重试`));
    };
    image.src = url;
  });
}

function canvasImageBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function prepareProductImage(file) {
  const targetBytes = 650 * 1024;
  const supportedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (file.size > 12 * 1024 * 1024) throw new Error(`“${file.name}”超过 12MB`);
  if (file.size <= targetBytes && supportedTypes.includes(String(file.type || "").toLowerCase())) return file;
  const image = await loadProductImage(file);
  const maxSide = 1600;
  const baseScale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  let width = Math.max(1, Math.round((image.naturalWidth || image.width) * baseScale));
  let height = Math.max(1, Math.round((image.naturalHeight || image.height) * baseScale));
  let blob = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);
    blob = await canvasImageBlob(canvas, "image/webp", Math.max(0.58, 0.86 - attempt * 0.06));
    if (!blob) blob = await canvasImageBlob(canvas, "image/jpeg", Math.max(0.58, 0.86 - attempt * 0.06));
    if (blob && blob.size <= targetBytes) return blob;
    width = Math.max(640, Math.round(width * 0.82));
    height = Math.max(480, Math.round(height * 0.82));
  }
  if (!blob || blob.size > targetBytes) throw new Error(`“${file.name}”自动压缩失败，请换一张图片后重试`);
  return blob;
}

async function deleteProductImage(button, productId, imageUrl) {var _button$closest;
  if (!isAdmin()) return alert("只有管理员可以删除商品图片");
  if (!confirm("确定删除这张商品图片吗？")) return;
  const filename = decodeURIComponent(String(imageUrl || "").split("/").pop() || "");
  const response = await apiFetch(`/api/products/${encodeURIComponent(productId)}/images/${encodeURIComponent(filename)}`, { method: "DELETE" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return alert(data.error || "删除商品图片失败");
  const index = products.findIndex((item) => item.id === productId);
  if (index >= 0) products[index] = data.product;
  (_button$closest = button.closest(".product-existing-image")) === null || _button$closest === void 0 || _button$closest.remove();
  const gallery = document.querySelector(".product-existing-images");
  if (gallery && !gallery.children.length) gallery.innerHTML = `<div class="product-image-placeholder">暂无商品图片</div>`;
  showToast("商品图片已删除");
}

function customerOrdersModal(id) {
  const c = byId(customers, id);
  const detail = state.customerOrderDetails[id];
  if (!c) return modalShell("客户历史订单", "<div class='empty'>客户不存在或已无权查看</div>", "关闭", "closeModal()");
  let content = "<div class='empty'>正在加载完整历史订单...</div>";
  if (detail && detail.error) content = `<div class="empty">${html(detail.error)}<br><button class="btn small" onclick="loadCustomerOrderHistory(${jsArg(id)})">重新加载</button></div>`;
  if (detail && !detail.loading && !detail.error) {
    const list = Array.isArray(detail.orders) ? detail.orders : [];
    content = `<div class="order-list">${list.length ? list.map(orderCard).join("") : "<div class='empty'>暂无订单</div>"}</div>`;
  }
  return modalShell(`${c.name} 的历史订单`, content, "关闭", "closeModal()");
}

function mergeOrderCache(items) {
  (Array.isArray(items) ? items : []).forEach((item) => {
    const index = orders.findIndex((order) => order.id === item.id);
    if (index >= 0) orders[index] = item;
    else orders.push(item);
  });
}

async function loadCustomerOrderHistory(id) {
  state.customerOrderDetails[id] = { loading: true, error: "", orders: [] };
  if (state.modal && state.modal.type === "customerOrders" && state.modal.id === id) render();
  try {
    const response = await latestApiFetch(`customer-orders-${id}`, `/api/customers/${encodeURIComponent(id)}/orders`);
    if (!response) return;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "客户历史订单加载失败");
    const list = Array.isArray(data.orders) ? data.orders : [];
    mergeOrderCache(list);
    state.customerOrderDetails[id] = { loading: false, error: "", orders: list };
    if (data.customer) {
      const customer = byId(customers, id);
      if (customer && data.customer.stats) customer.stats = data.customer.stats;
    }
  } catch (error) {
    state.customerOrderDetails[id] = { loading: false, error: error.message || "客户历史订单加载失败", orders: [] };
  }
  if (state.modal && state.modal.type === "customerOrders" && state.modal.id === id) render();
}

function deliveryModal(id) {
  const order = byId(orders, id);
  if (!order) return "";
  const customer = byId(customers, order.customerId) || {};
  const sales = byId(salesUsers, order.salesUserId) || {};
  const rows = getDisplayRows(order);
  return `
    <div class="modal-backdrop">
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
              <div class="doc-address"><span>地址：</span>${html(orderAddressForDisplay(order, customer) || "-")}</div>
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
  if (!order) {
    return `<div class="modal-backdrop">
      <div class="modal order-document-modal">
        <div class="modal-head"><h3>订单详情</h3><button class="icon-btn modal-close-button" title="关闭" aria-label="关闭" onclick="closeModal()">${svgIcon("close")}</button></div>
        <div class="modal-body"><div class="empty">订单不存在或列表已经刷新，请关闭后重新打开。</div></div>
      </div>
    </div>`;
  }
  const c = orderCustomerForDisplay(order);
  const s = byId(salesUsers, order.salesUserId);
  const title = order.no.startsWith("TH") || order.status === "已退货" ? "退货单" : "销售订单";
  const rows = getDisplayRows(order);
  const mobileRows = rows.filter((row) => !row.empty);
  return `
    <div class="modal-backdrop">
      <div class="modal order-document-modal">
        <div class="modal-head"><h3>订单详情 - ${title}</h3><button class="icon-btn modal-close-button" title="关闭" aria-label="关闭" onclick="closeModal()">${svgIcon("close")}</button></div>
        <div class="modal-body">
          <section class="order-document-mobile-view">
            <div class="order-document-mobile-summary">
              <div class="order-document-mobile-title"><div><span>订单编号</span><strong>${html(order.no)}</strong></div><b>${html(order.status || "-")}</b></div>
              <div class="order-document-mobile-total"><span>订单金额</span><strong>${money(order.amount)}</strong><small>共 ${mobileRows.length} 种商品</small></div>
              <div class="order-document-mobile-meta">
                <span><b>客户</b>${html(c.name || "-")}</span><span><b>日期</b>${html(order.date || "-")}</span>
                <span><b>销售</b>${html((s === null || s === void 0 ? void 0 : s.name) || "-")}</span><span><b>电话</b>${html(order.phone || c.phone || "-")}</span>
              </div>
              <div class="order-document-mobile-address"><b>地址</b><span>${html(orderAddressForDisplay(order, c) || "-")}</span></div>
            </div>
            <div class="order-document-mobile-section-title"><strong>商品明细</strong><span>${mobileRows.length} 种</span></div>
            <div class="order-document-mobile-list">${mobileRows.map((row) => `<article><span class="document-item-index">${row.index}</span><div><strong>${html(row.name)}</strong><small>${html(row.spec || "无规格")} · ${html(row.unit || "-")}</small><span>${html(row.quantity)} × ${money(row.price)}</span></div><b>${money(row.amount)}</b></article>`).join("")}</div>
            <div class="order-document-mobile-remark"><b>备注</b><span>${html(String(order.remark || "").trim() || "无")}</span></div>
            <div class="order-document-mobile-actions">
              <button class="btn" onclick="printOrder('${order.id}')">${svgIcon("print")}<span>打印</span></button>
              <button class="btn" onclick="copyOrderText('${order.id}')">${svgIcon("copy")}<span>复制文字</span></button>
              <button class="btn primary" onclick="downloadOrderImage('${order.id}')">${svgIcon("image")}<span>导出图片</span></button>
            </div>
          </section>
          <div class="document-toolbar">
            <div class="document-phone"><span>销售电话</span><strong>${html((s === null || s === void 0 ? void 0 : s.phone) || c.phone || "-")}</strong></div>
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
              <div><span>客户：</span>${html(c.name || "-")}</div>
              <div><span>单号：</span>${html(order.no || "-")}</div>
              <div><span>日期：</span>${html(order.date || "-")}</div>
              <div class="right"><span>销售：</span>${html((s === null || s === void 0 ? void 0 : s.name) || "-")}</div>
              <div class="doc-address"><span>地址：</span>${html(orderAddressForDisplay(order, c) || "-")}</div>
            </div>
            <table><thead><tr><th>编号</th><th>商品名称</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr></thead><tbody>${rows.map((row) => row.empty ? `<tr><td>${row.index}</td><td></td><td></td><td></td><td></td><td></td></tr>` : `<tr><td>${row.index}</td><td>${html(row.name)}</td><td>${html(row.unit)}</td><td>${row.quantity}</td><td>${money(row.price)}</td><td>${money(row.amount)}</td></tr>`).join("")}</tbody></table>
            <div class="order-document-mobile-items">${rows.filter((row) => !row.empty).map((row) => `<article><span class="document-item-index">${row.index}</span><div><strong>${html(row.name)}</strong><small>${html(row.spec || "无规格")} · ${html(row.unit || "-")}</small><span>数量 ${html(row.quantity)} × ${money(row.price)}</span></div><b>${money(row.amount)}</b></article>`).join("")}</div>
            <div class="doc-bottom">
              <div><strong>合计大写：</strong>${amountToChinese(order.amount)}<br /><strong>销售电话：</strong>${html((s === null || s === void 0 ? void 0 : s.phone) || "-")}</div>
              <div class="doc-total"><span>此单合计金额：</span><strong>${money(order.amount)}</strong></div>
            </div>
            <div class="doc-remark"><strong>备注：</strong><span>${html(String(order.remark || "").trim() || "无")}</span></div>
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
      <div class="field"><label>${user.id ? "修改密码（选填）" : "登录密码 *"}</label><input id="personPassword" class="input" type="password" value="" autocomplete="new-password" placeholder="${user.id ? "留空表示不修改密码" : "请输入密码"}" /></div>
      <div class="field"><label>角色定位</label><select id="personRole" class="select">${["超级管理员", "管理员", "销售人员", "财务"].map((role) => `<option ${role === (user.role || "销售人员") ? "selected" : ""}>${role}</option>`).join("")}</select></div>
      <div class="field"><label>账号状态</label><select id="personStatus" class="select">${["启用", "停用"].map((status) => `<option ${status === (user.status || "启用") ? "selected" : ""}>${status}</option>`).join("")}</select></div>
    </div>
  `, "保存人员", `savePerson('${user.id || ""}')`);
}

function modalShell(title, body, actionText, action) {
  return `
    <div class="modal-backdrop">
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

function svgIcon(type) {
  const icons = {
    view: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.06 12.35a1 1 0 0 1 0-.7C3.72 7.75 7.55 5 12 5s8.28 2.75 9.94 6.65a1 1 0 0 1 0 .7C20.28 16.25 16.45 19 12 19s-8.28-2.75-9.94-6.65Z"/><circle cx="12" cy="12" r="3"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.38 2.63a2.12 2.12 0 0 1 3 3l-9.02 9.01a2 2 0 0 1-.85.51l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.88a2 2 0 0 1 .5-.85Z"/></svg>`,
    delete: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></svg>`,
    refresh: `<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 0 1-13.4 5.9"/><path d="M4 12A8 8 0 0 1 17.4 6.1"/><path d="M17 3v4h-4"/><path d="M7 21v-4h4"/></svg>`,
    orders: `<svg viewBox="0 0 24 24"><path d="M6 4h12v16H6z"/><path d="M9 8h6"/><path d="M9 12h6"/><path d="M9 16h4"/></svg>`,
    plus: `<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>`,
    image: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 18 4.5-4.5 3 3 2.5-2.5 4 4"/></svg>`,
    copy: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>`,
    truck: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17h4V5H2v12h3"/><path d="M14 9h4l4 4v4h-3"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>`,
    print: `<svg viewBox="0 0 24 24"><path d="M7 8V3h10v5"/><rect x="4" y="8" width="16" height="9" rx="2"/><path d="M7 14h10v7H7z"/></svg>`,
    more: `<svg class="filled-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.35"/><circle cx="12" cy="12" r="1.35"/><circle cx="19" cy="12" r="1.35"/></svg>`,
    grip: `<svg viewBox="0 0 24 24"><circle cx="9" cy="5" r="1.4"/><circle cx="15" cy="5" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="19" r="1.4"/><circle cx="15" cy="19" r="1.4"/></svg>`,
    up: `<svg viewBox="0 0 24 24"><path d="m6 15 6-6 6 6"/></svg>`,
    down: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9.5 5 5 5-5"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="m6 6 12 12"/><path d="M18 6 6 18"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24"><path d="M5 12h13"/><path d="m14 7 5 5-5 5"/></svg>`
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
  if (!name || !phone || !id && !password) {
    alert(id ? "请填写姓名和手机号。" : "请填写姓名、手机号和密码。");
    return;
  }
  try {
    const payload = { name, phone, role, status };
    if (password) payload.password = password;
    const response = await apiFetch(id ? `/api/users/${id}` : "/api/users", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
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
      amount: item.quantity * item.price
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
  const customer = orderCustomerForDisplay(order);
  const title = order.no.startsWith("TH") || order.status === "已退货" ? "退货单" : "销售订单";
  return { order, customer, title, rows: getOrderRows(order) };
}

function buildOrderText(orderId) {
  const order = byId(orders, orderId);
  if (!order) throw new Error("订单不存在");
  const customer = orderCustomerForDisplay(order);
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
  `送货地址：${orderAddressForDisplay(order, customer)}`,
  "",
  "【产品清单】",
  ...(productLines.length ? productLines : ["暂无产品"]),
  "",
  "【备注】",
  String(order.remark || "").trim() || "无"].
  join("\n");
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
    .remark { margin-top: 18px; padding-top: 16px; border-top: 1px solid #d5dbe5; font-size: 17px; line-height: 1.7; white-space: pre-wrap; overflow-wrap: anywhere; }
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
      <div class="right"><span>销售：</span>${(sales === null || sales === void 0 ? void 0 : sales.name) || "-"}</div>
      <div class="address"><span>地址：</span>${html(orderAddressForDisplay(order, customer) || "-")}</div>
    </section>
    <table>
      <thead><tr><th>编号</th><th>商品名称</th><th>单位</th><th>数量</th><th>单价</th><th>金额</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    <section class="bottom">
      <div><strong>合计大写：</strong>${amountToChinese(order.amount)}<br /><strong>销售电话：</strong>${html((sales === null || sales === void 0 ? void 0 : sales.phone) || "-")}</div>
      <div class="total">此单合计金额：${money(order.amount)}</div>
    </section>
    <section class="remark"><strong>备注：</strong>${html(String(order.remark || "").trim() || "无")}</section>
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
  const remark = String(order.remark || "").trim() || "无";
  const remarkLineCount = remark.
  split(/\r?\n/).
  reduce((count, line) => count + Math.max(1, Math.ceil(line.length / 52)), 0);
  const height = Math.max(1162, summaryY + 145 + remarkLineCount * 32);
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
  ctx.fillText(`销售：${(sales === null || sales === void 0 ? void 0 : sales.name) || "-"}`, width - 57, 299);

  ctx.fillStyle = "#eef2f7";
  roundRect(ctx, 57, 309, width - 114, 63, 7);
  ctx.fill();
  ctx.fillStyle = "#172033";
  ctx.textAlign = "left";
  ctx.font = "700 24px Microsoft YaHei, Arial";
  ctx.fillText(`地址：${orderAddressForDisplay(order, customer) || "-"}`, 72, 350);

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
    ctx.beginPath();ctx.moveTo(gridX, tableY);ctx.lineTo(gridX, tableEndY);ctx.stroke();
  });
  for (let i = 1; i <= rowCount; i += 1) {
    const y = tableY + rowHeight * i;
    ctx.beginPath();ctx.moveTo(tableX, y);ctx.lineTo(tableX + tableW, y);ctx.stroke();
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
    const values = row ?
    deliveryOnly ? [rowIndex + 1, row.name, row.unit, row.quantity] : [rowIndex + 1, row.name, row.unit, row.quantity, money(row.price), money(row.amount)] :
    deliveryOnly ? [rowIndex + 1, "", "", ""] : [rowIndex + 1, "", "", "", "", ""];
    let cellX = tableX;
    values.forEach((value, i) => {
      drawCellText(ctx, String(value), cellX, y, cols[i], rowHeight, i === 1 ? "left" : !deliveryOnly && i >= 4 ? "right" : "center");
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
    ctx.fillText(`销售电话：${(sales === null || sales === void 0 ? void 0 : sales.phone) || "-"}`, 57, summaryY + 50);
    ctx.font = "700 23px Microsoft YaHei, Arial";
    ctx.fillText("备注：", 57, summaryY + 100);
    ctx.font = "400 23px Microsoft YaHei, Arial";
    drawWrappedText(ctx, remark, 126, summaryY + 100, width - 183, 32);
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

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  let lineY = y;
  String(text || "").split(/\r?\n/).forEach((paragraph) => {
    let line = "";
    Array.from(paragraph).forEach((char) => {
      const nextLine = line + char;
      if (line && ctx.measureText(nextLine).width > maxWidth) {
        ctx.fillText(line, x, lineY);
        line = char;
        lineY += lineHeight;
      } else {
        line = nextLine;
      }
    });
    if (line) ctx.fillText(line, x, lineY);
    lineY += lineHeight;
  });
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
  return String(value !== null && value !== void 0 ? value : "").
  replace(/&/g, "&amp;").
  replace(/</g, "&lt;").
  replace(/>/g, "&gt;").
  replace(/"/g, "&quot;").
  replace(/'/g, "&#39;");
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

function productPrimaryCategories() {
  const catalogCategories = state.productCategories && typeof state.productCategories === "object"
    ? Object.keys(state.productCategories).filter(Boolean)
    : [];
  const loadedCategories = products.map((product) => product.cat1).filter(Boolean);
  return Array.from(new Set(catalogCategories.concat(loadedCategories)))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function productSubcategoriesFor(category) {
  if (!category) return [];
  const catalogItems = state.productCategories && Array.isArray(state.productCategories[category])
    ? state.productCategories[category]
    : [];
  const loadedItems = products
    .filter((product) => product.cat1 === category)
    .map((product) => product.cat2)
    .filter(Boolean);
  return Array.from(new Set(catalogItems.concat(loadedItems)))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function productSubcategories() {
  if (state.category === "全部") return [];
  return productSubcategoriesFor(state.category);
}

function jsArg(value) {
  return html(JSON.stringify(value !== null && value !== void 0 ? value : ""));
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
  return scoped.
  map((product, index) => ({ product, index, score: productSearchScore(product, query) })).
  filter((entry) => entry.score > 0).
  sort((a, b) => b.score - a.score || a.index - b.index).
  map((entry) => entry.product);
}

const LOGIN_MEMORY_KEY = "caidajia_last_login";

function getRememberedLogin() {
  try {
    const remembered = JSON.parse(localStorage.getItem(LOGIN_MEMORY_KEY) || "{}");
    if (remembered.password) {
      localStorage.setItem(LOGIN_MEMORY_KEY, JSON.stringify({ phone: remembered.phone || "" }));
    }
    return { phone: remembered.phone || "" };
  } catch {
    return {};
  }
}

function rememberLogin(phone) {
  localStorage.setItem(LOGIN_MEMORY_KEY, JSON.stringify({ phone }));
}

function isSalesRole() {var _state$user6;
  return ((_state$user6 = state.user) === null || _state$user6 === void 0 ? void 0 : _state$user6.role) === "销售人员";
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

function orderCustomerChoices() {var _state$user7;
  const salesUserId = isSalesRole() ? (_state$user7 = state.user) === null || _state$user7 === void 0 ? void 0 : _state$user7.id : state.salesUserId;
  return visibleCustomers().filter((customer) => customer.ownerId === salesUserId);
}

function orderCustomerLabel(customer) {
  return customer ? `${customer.name || ""} - ${customer.phone || ""}` : "";
}

function ensureSalesScope() {
  if (isSalesRole()) {
    state.salesUserId = state.user.id;
    state.customerOwnerFilter = "全部";
    state.orderSalesFilter = "全部";
  }
  if (!isSalesRole() && !activeSalesUsers().some((user) => user.id === state.salesUserId)) {var _state$user8, _activeSalesUsers$;
    state.salesUserId = ((_state$user8 = state.user) === null || _state$user8 === void 0 ? void 0 : _state$user8.id) || ((_activeSalesUsers$ = activeSalesUsers()[0]) === null || _activeSalesUsers$ === void 0 ? void 0 : _activeSalesUsers$.id) || "";
  }
  const allowedCustomers = orderCustomerChoices();
  if (state.selectedCustomerId && !allowedCustomers.some((customer) => customer.id === state.selectedCustomerId)) {
    state.selectedCustomerId = "";
    state.createCustomerQuery = "";
    resetOrderDraft(null);
  }
  const selectedCustomer = byId(allowedCustomers, state.selectedCustomerId);
  if (!state.createCustomerPickerOpen) state.createCustomerQuery = orderCustomerLabel(selectedCustomer);
}

function renderLogin() {
  const remembered = getRememberedLogin();
  const phone = html(remembered.phone || "");
  app.innerHTML = `
    <div class="login-shell login-city-shell">
      <section class="login-city-scene" aria-hidden="true">
        <div class="login-city-shade"></div>
        <div class="login-city-route login-city-route-a"></div>
        <div class="login-city-route login-city-route-b"></div>
        <i class="login-city-node login-city-node-a"></i>
        <i class="login-city-node login-city-node-b"></i>
        <i class="login-city-node login-city-node-c"></i>
        <i class="login-city-node login-city-node-d"></i>
      </section>
      <div class="login-city-brand">
        <div class="brand-mark">建</div>
        <div>
          <strong>材达家建材销售系统</strong>
          <span>客户 · 商品 · 订单一体化管理</span>
        </div>
      </div>
      <section class="login-panel">
        <form class="login-card" onsubmit="event.preventDefault(); login()">
          <div class="login-card-heading">
            <span>CAIDAJIA BUSINESS SYSTEM</span>
            <h1>欢迎回来</h1>
            <p>登录材达家，继续处理客户订单与配送业务。</p>
          </div>
          <div class="field"><label>手机号</label><input id="loginPhone" class="input" value="${phone}" autocomplete="username" placeholder="请输入已授权手机号" /></div>
          <div class="field"><label>密码</label><div class="password-field"><input id="loginPassword" class="input" type="${state.loginPasswordVisible ? "text" : "password"}" value="" autocomplete="current-password" placeholder="请输入登录密码" /><button type="button" class="password-toggle ${state.loginPasswordVisible ? "active" : ""}" onclick="toggleLoginPassword()" title="${state.loginPasswordVisible ? "隐藏密码" : "显示密码"}" aria-label="${state.loginPasswordVisible ? "隐藏密码" : "显示密码"}"></button></div></div>
          <button type="submit" class="btn primary" style="width:100%">登录系统</button>
          <div class="login-security-note"><i></i><span>安全连接 · 业务数据加密保护</span></div>
        </form>
      </section>
    </div>
  `;
}

async function login() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  try {
    const response = await apiFetch("/api/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "登录失败");
    rememberLogin(phone);
    state.user = data.user;
    await loadBootstrap();
    showToast("登录成功");
  } catch (error) {
    alert(error.message);
  }
}

function localLoginFallback(phone, password) {
  alert("暂时无法连接服务器，请稍后重试。");
}

async function loadBootstrap() {var _state$user9, _activeSalesUsers$2;
  const response = await apiFetch("/api/bootstrap?mode=summary");
  if (!response.ok) return;
  const data = await response.json();
  state.user = data.user;
  salesUsers = data.users || [];
  customers = [];
  products = [];
  orders = [];
  state.productCategories = data.categories || {};
  state.bootstrapCounts = data.counts || {};
  state.dataLoaded = { customers: false, products: false, createProducts: false, orders: false, dashboard: false };
  state.remotePages = {};
  state.salesUserId = isSalesRole() ? state.user.id : ((_state$user9 = state.user) === null || _state$user9 === void 0 ? void 0 : _state$user9.id) || ((_activeSalesUsers$2 = activeSalesUsers()[0]) === null || _activeSalesUsers$2 === void 0 ? void 0 : _activeSalesUsers$2.id) || "";
  state.dashboardSalesFilters = [];
  state.dashboardSalesMenuOpen = false;
  state.dashboardCustomerDetail = "";
  ensureSalesScope();
  await loadRouteData(state.route, true);
}

function queryString(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "全部") search.set(key, value);
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

function mergeProductCache(items) {
  const map = new Map(products.map((item) => [item.id, item]));
  (items || []).forEach((item) => map.set(item.id, item));
  products = Array.from(map.values());
}

async function hydrateCartProducts() {
  const ids = Array.from(new Set(state.cart.map((item) => item.productId).filter(Boolean)));
  if (!ids.length) return;
  const response = await apiFetch(`/api/products${queryString({ ids: ids.join(","), page: 1, pageSize: Math.min(200, ids.length) })}`);
  if (!response.ok) return;
  const data = await response.json();
  mergeProductCache(data.items || data.products || []);
}

async function loadDashboard(force = false) {
  if (state.dashboardLoading && !force || state.dataLoaded.dashboard && !force) return;
  state.dashboardLoading = true;
  try {
    const response = await latestApiFetch("dashboard", `/api/dashboard${queryString({ salesUserIds: state.dashboardSalesFilters.join(",") })}`);
    if (!response) return;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "销售概览加载失败");
    state.dashboardData = data;
    orders = data.recentOrders || [];
    state.dataLoaded.dashboard = true;
  } catch (error) {
    state.dashboardError = error.message;
  } finally {
    state.dashboardLoading = false;
    if (state.route === "dashboard") render();
  }
}

async function loadCustomers(options = {}) {
  const forCreate = Boolean(options.forCreate);
  const page = forCreate ? 1 : currentPage("customers");
  const params = forCreate ? { page: 1, pageSize: 200, salesUserId: canChooseSalesperson() ? options.salesUserId || state.salesUserId : "" } : {
    page, pageSize: 30, q: state.query,
    salesUserId: canChooseSalesperson() ? state.customerOwnerFilter : ""
  };
  const response = await latestApiFetch(forCreate ? "create-customers" : "customers", `/api/customers${queryString(params)}`);
  if (!response) return;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "客户数据加载失败");
  customers = data.items || data.customers || [];
  if (!forCreate) state.remotePages.customers = data.items ? data : { items: customers, page: 1, pageSize: customers.length, total: customers.length, totalPages: 1 };
  state.dataLoaded.customers = true;
}

async function loadProductsForRoute(route = state.route) {
  const key = route === "products" ? "products" : "createProducts";
  const params = {
    page: currentPage(key), pageSize: EDIT_PAGE_SIZES[key], q: state.productQuery,
    category1: state.category === "全部" ? "" : state.category,
    category2: state.productSubcategory,
    status: route === "products" ? "" : "在售"
  };
  const response = await latestApiFetch(key, `/api/products${queryString(params)}`);
  if (!response) return;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "商品数据加载失败");
  state.remotePages[key] = data;
  mergeProductCache(data.items || []);
  state.dataLoaded[key] = true;
}

async function loadOrders() {
  const params = {
    page: currentPage("orders"), pageSize: EDIT_PAGE_SIZES.orders, q: state.orderQuery,
    status: state.orderStatus, payStatus: state.orderPayStatus,
    salesUserId: canChooseSalesperson() ? state.orderSalesFilter : ""
  };
  const response = await latestApiFetch("orders", `/api/orders${queryString(params)}`);
  if (!response) return;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "订单数据加载失败");
  orders = data.items || data.orders || [];
  state.remotePages.orders = data.items ? data : { items: orders, page: 1, pageSize: orders.length, total: orders.length, totalPages: 1 };
  state.dataLoaded.orders = true;
}

async function loadRouteData(route, force = false) {
  try {
    if (route === "dashboard") return await loadDashboard(force);
    if (route === "customers") await loadCustomers();
    if (route === "products") await loadProductsForRoute("products");
    if (route === "orders") await loadOrders();
    if (route === "create" || route === "returns") {
      await Promise.all([loadCustomers({ forCreate: true }), loadProductsForRoute(route)]);
      restoreCart(state.orderType);
      await hydrateCartProducts();
    }
    if (route === "audit" && isAdmin()) await loadAuditLogs();
    if (state.user && state.route === route) render();
  } catch (error) {
    state.routeLoadError = error.message;
    if (state.user) render();
  }
}

function renderDashboard() {
  const allVisibleOrders = visibleOrders();
  const scopedOrders = dashboardFilteredOrders();
  const now = new Date();
  const validOrders = scopedOrders.filter(isPerformanceOrder);
  const validSalesOrders = validOrders.filter((order) => !isReturnOrder(order));
  const monthPerformanceOrders = validOrders.filter((order) => isSameBusinessMonth(order.date, now));
  const todayPerformanceOrders = validOrders.filter((order) => isSameBusinessDay(order.date, now));
  const monthOrders = validSalesOrders.filter((order) => isSameBusinessMonth(order.date, now));
  const todayOrders = validSalesOrders.filter((order) => isSameBusinessDay(order.date, now));
  const monthCustomers = new Set(monthOrders.map((order) => order.customerId).filter(Boolean));
  const todayCustomers = new Set(todayOrders.map((order) => order.customerId).filter(Boolean));
  const allValidSalesOrders = allVisibleOrders.filter((order) => isPerformanceOrder(order) && !isReturnOrder(order));
  const monthNewCustomerIds = new Set(Array.from(monthCustomers).filter((customerId) => {
    const firstOrderAt = firstValidCustomerOrderDate(customerId, allValidSalesOrders);
    return firstOrderAt && firstOrderAt.getFullYear() === now.getFullYear() && firstOrderAt.getMonth() === now.getMonth();
  }));
  const monthSales = monthPerformanceOrders.reduce((sum, order) => sum + performanceOrderAmount(order), 0);
  const todaySales = todayPerformanceOrders.reduce((sum, order) => sum + performanceOrderAmount(order), 0);
  return `
    <section class="dashboard-metrics">
      ${dashboardSalesFilterHtml()}
      <div class="dashboard-section-head"><strong>本月经营</strong><span>${now.getFullYear()} 年 ${now.getMonth() + 1} 月</span></div>
      <div class="dashboard-metric-grid month-metrics">
        ${dashboardMetric("本月销售额", money(monthSales), "¥", "blue", "除待确认、已取消外，按实际订单金额汇总")}
        ${dashboardMetric("本月下单客户数", monthCustomers.size, "客", "violet", "本月有效销售单客户去重 · 点击查看", "month")}
        ${dashboardMetric("本月新开客户数", monthNewCustomerIds.size, "新", "orange", "首次有效下单发生在本月 · 点击查看", "new")}
        ${dashboardMetric("本月订单数量", monthPerformanceOrders.length, "单", "cyan", "除待确认和已取消外的全部订单")}
      </div>
      ${dashboardCustomerDetailHtml(state.dashboardCustomerDetail, monthCustomers, monthNewCustomerIds, monthOrders, allValidSalesOrders)}
      <div class="dashboard-section-head today-head"><strong>今日动态</strong><span>${now.getMonth() + 1} 月 ${now.getDate()} 日</span></div>
      <div class="dashboard-metric-grid today-metrics">
        ${dashboardMetric("今日销售额", money(todaySales), "¥", "green", "按今日有效订单实际金额汇总")}
        ${dashboardMetric("今日下单客户数", todayCustomers.size, "客", "gold", "今日有效销售单客户去重")}
        ${dashboardMetric("今日订单数量", todayPerformanceOrders.length, "单", "red", "除待确认和已取消外的全部订单")}
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

function dashboardFilteredOrders() {
  const scoped = visibleOrders();
  if (isSalesRole() || !state.dashboardSalesFilters.length) return scoped;
  return scoped.filter((order) => state.dashboardSalesFilters.includes(order.salesUserId));
}

function dashboardSalesFilterHtml() {
  if (!canChooseSalesperson()) return "";
  const users = activeSalesUsers();
  const selectedNames = users.filter((user) => state.dashboardSalesFilters.includes(user.id)).map((user) => user.name);
  const label = selectedNames.length ? `已选 ${selectedNames.length} 人` : "全部销售人员";
  return `
    <div class="dashboard-filter-row">
      <span>销售人员筛选</span>
      <div class="cost-sales-filter dashboard-sales-filter">
        <button type="button" class="select cost-sales-trigger" onclick="toggleDashboardSalesMenu()">
          <span>${html(label)}</span><span class="cost-chevron">⌄</span>
        </button>
        ${state.dashboardSalesMenuOpen ? `
          <div class="cost-sales-menu">
            <button type="button" class="cost-sales-all ${!state.dashboardSalesFilters.length ? "selected" : ""}" onclick="clearDashboardSalespeople()">全部销售人员</button>
            ${users.map((user) => `
              <label class="cost-sales-option">
                <input type="checkbox" ${state.dashboardSalesFilters.includes(user.id) ? "checked" : ""} onchange="toggleDashboardSalesperson(${jsArg(user.id)})" />
                <span>${html(user.name)}</span>
              </label>`).join("")}
          </div>` : ""}
      </div>
    </div>`;
}

function toggleDashboardSalesMenu() {
  state.dashboardSalesMenuOpen = !state.dashboardSalesMenuOpen;
  render();
}

function toggleDashboardSalesperson(userId) {
  const selected = new Set(state.dashboardSalesFilters);
  if (selected.has(userId)) selected.delete(userId);else
  selected.add(userId);
  state.dashboardSalesFilters = Array.from(selected);
  state.dashboardCustomerDetail = "";
  render();
  loadDashboard(true);
}

function clearDashboardSalespeople() {
  state.dashboardSalesFilters = [];
  state.dashboardCustomerDetail = "";
  render();
  loadDashboard(true);
}

function toggleDashboardCustomerDetail(type) {
  state.dashboardCustomerDetail = state.dashboardCustomerDetail === type ? "" : type;
  render();
}

function firstValidCustomerOrderDate(customerId, validSalesOrders) {
  return validSalesOrders.
  filter((order) => order.customerId === customerId).
  map((order) => businessDate(order.date)).
  filter(Boolean).
  sort((a, b) => a - b)[0] || null;
}

function dashboardCustomerDetailHtml(type, monthCustomerIds, monthNewCustomerIds, monthOrders, allValidSalesOrders) {
  if (!type) return "";
  const ids = type === "new" ? monthNewCustomerIds : monthCustomerIds;
  const title = type === "new" ? "本月新开客户明细" : "本月下单客户明细";
  const rows = Array.from(ids).map((customerId) => {
    const customer = byId(customers, customerId) || {};
    const customerOrders = monthOrders.filter((order) => order.customerId === customerId);
    const salesNames = Array.from(new Set(customerOrders.map((order) => {var _byId2;return (_byId2 = byId(salesUsers, order.salesUserId)) === null || _byId2 === void 0 ? void 0 : _byId2.name;}).filter(Boolean)));
    const amount = customerOrders.reduce((sum, order) => sum + effectiveOrderAmount(order), 0);
    const firstOrderAt = firstValidCustomerOrderDate(customerId, allValidSalesOrders);
    return { customer, customerOrders, salesNames, amount, firstOrderAt };
  }).sort((a, b) => String(a.customer.name || "").localeCompare(String(b.customer.name || ""), "zh-CN"));
  return `
    <section class="dashboard-customer-detail">
      <div class="dashboard-customer-detail-head"><strong>${title}</strong><button type="button" onclick="toggleDashboardCustomerDetail(${jsArg(type)})">收起</button></div>
      ${rows.length ? `<div class="dashboard-customer-table">
        <div class="dashboard-customer-row dashboard-customer-row-head"><span>客户</span><span>电话</span><span>销售人员</span><span>本月订单</span><span>本月金额</span><span>首次下单</span></div>
        ${rows.map((item) => `<div class="dashboard-customer-row">
          <strong>${html(item.customer.name || "未知客户")}</strong>
          <span>${html(item.customer.phone || "-")}</span>
          <span>${html(item.salesNames.join("、") || "-")}</span>
          <span>${item.customerOrders.length} 单</span>
          <span>${money(item.amount)}</span>
          <span>${html(item.firstOrderAt ? `${item.firstOrderAt.getFullYear()}/${item.firstOrderAt.getMonth() + 1}/${item.firstOrderAt.getDate()}` : "-")}</span>
        </div>`).join("")}
      </div>` : `<div class="empty">暂无符合条件的客户</div>`}
    </section>`;
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
  return (order === null || order === void 0 ? void 0 : order.type) === "return" || String((order === null || order === void 0 ? void 0 : order.no) || "").startsWith("TH") || (order === null || order === void 0 ? void 0 : order.status) === "已退货";
}

function actualPaidAmount(order) {
  if (!order || order.actualPaidAmount === undefined || order.actualPaidAmount === null || order.actualPaidAmount === "") {
    return null;
  }
  const value = Number(order.actualPaidAmount);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function effectiveOrderAmount(order) {
  const actualAmount = actualPaidAmount(order);
  return actualAmount === null ? Number((order === null || order === void 0 ? void 0 : order.amount) || 0) : actualAmount;
}

function isPerformanceOrder(order) {
  return order && !["待确认", "已取消"].includes(order.status);
}

function performanceOrderAmount(order) {
  if (!isReturnOrder(order)) return effectiveOrderAmount(order);
  if (!(order.items || []).length) return -Math.abs(Number(order.amount || 0));
  return order.items.reduce((sum, item) => {
    const amount = Math.abs(Number(item.quantity || 0) * Number(item.price || 0));
    return sum + (isPositiveReturnCharge(item) ? amount : -amount);
  }, 0);
}

function dashboardMetric(label, value, iconText, tone, note = "", detailType = "") {
  const tag = detailType ? "button" : "div";
  const action = detailType ? ` type="button" onclick="toggleDashboardCustomerDetail(${jsArg(detailType)})"` : "";
  return `<${tag}${action} class="dashboard-metric ${tone} ${detailType ? "clickable" : ""}"><div><div class="dashboard-metric-label">${html(label)}</div><div class="dashboard-metric-value">${html(value)}</div>${note ? `<div class="dashboard-metric-note">${html(note)}</div>` : ""}</div><div class="dashboard-metric-icon">${html(iconText)}</div></${tag}>`;
}

function customerStats(customerId) {
  const list = visibleOrders().filter((order) => order.customerId === customerId && !String(order.no || "").startsWith("TH"));
  const total = list.reduce((sum, order) => sum + effectiveOrderAmount(order), 0);
  const last = list.
  map((order) => order.date).
  filter(Boolean).
  sort((a, b) => new Date(b) - new Date(a))[0] || "-";
  return { total, last, count: list.length };
}

function renderCustomers() {
  const remote = state.remotePages.customers;
  const list = remote ? remote.items : visibleCustomers();
  return `
    <div class="mobile-page-tools"><input id="customerSearchInputMobile" class="input" placeholder="搜索客户名称/联系人/电话" value="${html(state.query)}" oninput="updatePageQuery(this)" /><button type="button" class="btn mobile-filter-button" onclick="toggleMobileFilter('customers')">筛选</button><button class="btn primary" onclick="openModal('customer')">新增</button></div>
    <div class="mobile-filter-chips">${mobileFilterChip("归属", state.customerOwnerFilter, "updateCustomerOwnerFilter('全部')")}</div>
    <div class="toolbar filter-toolbar desktop-page-tools">
      <input id="customerSearchInput" class="input" placeholder="搜索客户名称/联系人/电话" value="${html(state.query)}" oninput="updatePageQuery(this)" />
      ${canChooseSalesperson() ? `<select class="select compact-select" onchange="updateCustomerOwnerFilter(this.value)">${salesFilterOptions(state.customerOwnerFilter)}</select>` : ""}
      <button class="btn primary" onclick="openModal('customer')">＋ 新增客户</button>
    </div>
    <div id="customerResultsPanel">${customerResultsHtml(list, remote)}</div>
  `;
}

function customerResultsHtml(list, remote) {
  return `<div class="mobile-table-head customer-mobile-head"><span>客户 / 联系方式</span><span>成交数据</span><span>操作</span></div>
    <div class="customer-list">${list.length ? list.map(customerCard).join("") : `<div class="empty">没有符合条件的客户</div>`}</div>
    ${remote ? paginationControls("customers", remote.page, remote.totalPages, remote.total) : ""}`;
}

function renderCustomerResults() {
  const container = document.getElementById("customerResultsPanel");
  if (!container) return;
  const remote = state.remotePages.customers;
  const list = remote ? remote.items : visibleCustomers();
  container.innerHTML = customerResultsHtml(list, remote);
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
  if (key === "products") loadProductsForRoute("products").then(render).catch((error) => alert(error.message));else
  if (key === "createProducts") loadProductsForRoute(state.route).then(render).catch((error) => alert(error.message));else
  if (key === "orders") loadOrders().then(render).catch((error) => alert(error.message));else
  if (key === "customers") loadCustomers().then(render).catch((error) => alert(error.message));else
  if (key === "audit") loadAuditLogs(state.pages[key]);
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
  if (state.productCategories && Array.isArray(state.productCategories[cat1])) {
    return state.productCategories[cat1];
  }
  const values = products.
  filter((product) => product.cat1 === cat1 && product.cat2).
  map((product) => product.cat2);
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

function refreshProductCat2Options() {var _document$getElementB10;
  const cat1 = ((_document$getElementB10 = document.getElementById("productCat1")) === null || _document$getElementB10 === void 0 ? void 0 : _document$getElementB10.value) || "辅助商品";
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
  if (input.dataset.composing === "true") return;
  if (state.route === "products") renderProductTableResults();
  if (state.route === "create" || state.route === "returns") renderCreateProductResults();
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => loadProductsForRoute(state.route).then(() => {
    if (state.route === "products") renderProductTableResults();
    if (state.route === "create" || state.route === "returns") renderCreateProductResults();
  }).catch((error) => alert(error.message)), 220);
}

function setProductCategory(category) {
  state.category = category;
  state.productSubcategory = "";
  resetPage("products");
  resetPage("createProducts");
  render();
  loadProductsForRoute(state.route).then(render).catch((error) => alert(error.message));
}

function setProductSubcategory(category) {
  state.productSubcategory = category;
  resetPage("products");
  resetPage("createProducts");
  render();
  loadProductsForRoute(state.route).then(render).catch((error) => alert(error.message));
}

function updateOrderQuery(input) {
  state.orderQuery = input.value;
  resetPage("orders");
  if (input.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => loadOrders().then(renderOrderResults).catch((error) => alert(error.message)), 220);
}

function updateOrderSalesFilter(value) {
  state.orderSalesFilter = value;
  resetPage("orders");
  render();
  loadOrders().then(render).catch((error) => alert(error.message));
}

function updateOrderPayFilter(value) {
  state.orderPayStatus = value;
  resetPage("orders");
  render();
  loadOrders().then(render).catch((error) => alert(error.message));
}

function updateOrderStatusFilter(value) {
  state.orderStatus = value;
  resetPage("orders");
  render();
  loadOrders().then(render).catch((error) => alert(error.message));
}

function updateCustomerOwnerFilter(value) {
  state.customerOwnerFilter = value;
  resetPage("customers");
  render();
  loadCustomers().then(render).catch((error) => alert(error.message));
}

function renderProducts() {var _state$user0;
  const remote = state.remotePages.products;
  const list = remote ? remote.items : filteredProducts();
  const pageData = remote ? { items: remote.items, page: remote.page, pageSize: remote.pageSize, total: remote.total, totalPages: remote.totalPages, start: (remote.page - 1) * remote.pageSize } : paginateList(list, "products", EDIT_PAGE_SIZES.products);
  const canManage = isAdmin();
  const canExport = ((_state$user0 = state.user) === null || _state$user0 === void 0 ? void 0 : _state$user0.role) !== "销售人员";
  return `
    <div class="mobile-page-tools product-mobile-primary"><input id="productSearchInputMobile" class="input" placeholder="搜索商品名称/规格/编码/别名" value="${html(state.productQuery)}" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateProductQuery(this)" oninput="updateProductQuery(this)" /><button type="button" class="btn mobile-filter-button" onclick="toggleMobileFilter('products')">筛选</button>${canManage ? `<button class="btn primary" onclick="openModal('product')">新增</button>` : ""}<details class="mobile-page-more"><summary aria-label="页面更多操作">•••</summary><div>${canManage ? `<button type="button" onclick="downloadProductTemplate()">下载模板</button><button type="button" onclick="document.getElementById('productImportFile').click()">批量上传</button>` : ""}${canExport ? `<button type="button" onclick="exportProducts('selected')" ${state.selectedProductIds.length ? "" : "disabled"}>导出已选</button><button type="button" onclick="exportProducts('all')">导出全部</button>` : ""}</div></details></div>
    <div class="mobile-filter-chips">${mobileFilterChip("分类", state.category, "setProductCategory('全部')")}</div>
    <div class="toolbar product-management-toolbar desktop-page-tools">
      <input id="productSearchInput" class="input" placeholder="搜索商品名称 / 规格 / 编码 / 别名" value="${html(state.productQuery)}" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateProductQuery(this)" oninput="updateProductQuery(this)" />
      <div class="spacer"></div>
      <div class="product-desktop-actions">
        ${canExport ? `<button id="productExportSelectedBtn" class="btn" onclick="exportProducts('selected')" ${state.selectedProductIds.length ? "" : "disabled"}>导出已选</button><button class="btn" onclick="exportProducts('all')">导出全部</button>` : ""}
        ${canManage ? `<button class="btn" onclick="downloadProductTemplate()">下载导入模板</button><button class="btn" onclick="document.getElementById('productImportFile').click()">批量上传</button><button class="btn primary" onclick="openModal('product')">新增商品</button>` : ""}
      </div>
      ${canManage ? `<input id="productImportFile" type="file" accept=".xlsx" hidden onchange="importProducts(this)" />` : ""}
      <div class="product-mobile-actions"></div>
    </div>
    ${categoryTabs()}
    ${subcategoryTabs()}
    <div id="productTableResults">${productTableResultsHtml(list, pageData, canManage, canExport)}</div>
  `;
}

function productThumbnail(product, extraClass = "") {
  if (product.imageUrl) {
    return `<button type="button" class="product-thumb-button ${extraClass}" title="查看商品图片" onclick="openModal('productImage',${jsArg(product.id)})"><img src="${html(product.imageUrl)}" alt="${html(product.name)}" loading="lazy" /></button>`;
  }
  return `<button type="button" class="product-thumb-button is-empty ${extraClass}" title="暂无商品图片" onclick="openModal('productImage',${jsArg(product.id)})"><span>暂无图</span></button>`;
}

function productTableResultsHtml(list, pageData, canManage = isAdmin(), canExport = ((_state$user1) => (_state$user1 = state.user) === null || _state$user1 === void 0 ? void 0 : _state$user1.role)() !== "销售人员") {
  const selected = new Set(state.selectedProductIds || []);
  const pageAllSelected = pageData.items.length && pageData.items.every((product) => selected.has(product.id));
  const productActions = (product) => `${actionButton("查看图片", "view", `openModal('productImage',${JSON.stringify(product.id)})`)}${canManage ? `${actionButton("编辑", "edit", `openModal('product',${JSON.stringify(product.id)})`)}${actionButton("删除", "delete", `deleteProduct(${JSON.stringify(product.id)})`)}` : ""}`;
  return `
    <div class="product-list-summary"><span>共 ${pageData.total} 个商品，当前显示 ${pageData.items.length} 个</span>${canExport ? `<span>已选 ${selected.size} 个</span>` : ""}</div>
    <div class="card table-wrap product-table">
      <table>
        <thead><tr>${canExport ? `<th class="selection-cell"><input type="checkbox" title="选择当前页" ${pageAllSelected ? "checked" : ""} onchange="toggleCurrentProductPage(this.checked)" /></th>` : ""}<th>图片</th><th>商品名称</th><th>规格</th><th>一级分类</th><th>二级分类</th><th>单位</th><th>销售价</th><th>状态</th><th>操作</th></tr></thead>
        <tbody>${pageData.items.map((p) => `
          <tr>
            ${canExport ? `<td class="selection-cell"><input type="checkbox" ${selected.has(p.id) ? "checked" : ""} onchange="toggleProductSelection(${jsArg(p.id)},this.checked)" /></td>` : ""}
            <td>${productThumbnail(p, "small")}</td>
            <td><div class="product-name-cell"><strong>${html(p.name)}</strong><span>${html(p.code || p.id)}</span></div></td>
            <td>${html(p.spec || "-")}</td>
            <td>${html(p.cat1 || "-")}</td>
            <td>${html(p.cat2 || "-")}</td>
            <td>${html(p.unit)}</td>
            <td class="num">${money(p.price)}</td>
            <td><span class="badge ${isProductActive(p) ? "success" : "danger"}">${html(p.status || "在售")}</span></td>
            <td class="product-actions-cell"><div class="row-actions">${productActions(p)}</div></td>
          </tr>
        `).join("")}</tbody>
      </table>
    </div>
    <div class="mobile-table-head product-mobile-head"><span>商品 / 规格</span><span>价格 / 状态</span><span>操作</span></div>
    <div class="product-mobile-list">
      ${pageData.items.map((p) => `
        <article class="product-mobile-item">
          ${canExport ? `<label class="product-mobile-select" title="选择商品"><input type="checkbox" ${selected.has(p.id) ? "checked" : ""} onchange="toggleProductSelection(${jsArg(p.id)},this.checked)" /></label>` : ""}
          ${productThumbnail(p, "small")}
          <div class="product-mobile-info">
            <strong>${html(p.name)}</strong>
            <span>${html(p.spec || "无规格")}</span>
            <small>${html(p.cat1 || "-")} / ${html(p.cat2 || "-")} · ${html(p.unit || "-")}</small>
          </div>
          <div class="product-mobile-side">
            <strong>${money(p.price)}</strong>
            <span class="badge ${isProductActive(p) ? "success" : "danger"}">${html(p.status || "在售")}</span>
          </div>
          <div class="row-actions product-actions-desktop">${productActions(p)}</div>
          <div class="mobile-row-actions product-actions-mobile">
            ${canManage ? `<button type="button" class="mobile-row-primary" onclick="openModal('product',${jsArg(p.id)})">编辑</button>` : `<button type="button" class="mobile-row-primary" onclick="openModal('productImage',${jsArg(p.id)})">查看</button>`}
            <details class="mobile-row-more"><summary aria-label="更多操作">•••</summary><div><button type="button" onclick="openModal('productImage',${jsArg(p.id)})">查看图片</button>${canManage ? `<button type="button" class="danger" onclick="deleteProduct(${jsArg(p.id)})">删除商品</button>` : ""}</div></details>
          </div>
        </article>
      `).join("")}
    </div>
    ${paginationControls("products", pageData.page, pageData.totalPages, pageData.total)}
  `;
}

function renderProductTableResults() {
  const container = document.getElementById("productTableResults");
  if (!container) return;
  const remote = state.remotePages.products;
  const list = remote ? remote.items : filteredProducts();
  const pageData = remote ? { items: remote.items, page: remote.page, pageSize: remote.pageSize, total: remote.total, totalPages: remote.totalPages, start: (remote.page - 1) * remote.pageSize } : paginateList(list, "products", EDIT_PAGE_SIZES.products);
  container.innerHTML = productTableResultsHtml(list, pageData);
}

function toggleProductSelection(productId, checked) {
  const selected = new Set(state.selectedProductIds || []);
  if (checked) selected.add(productId);else
  selected.delete(productId);
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

function downloadProductTemplate() {
  const anchor = document.createElement("a");
  anchor.href = "/api/products/template";
  anchor.download = "产品批量导入模板.xlsx";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

async function exportProducts(mode) {var _state$user10;
  if (((_state$user10 = state.user) === null || _state$user10 === void 0 ? void 0 : _state$user10.role) === "销售人员") return alert("销售人员不能导出商品表格");
  const ids = mode === "selected" ? state.selectedProductIds : [];
  if (mode === "selected" && !ids.length) {
    alert("请先勾选需要导出的商品。");
    return;
  }
  try {
    const response = await apiFetch("/api/products/export", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids })
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
    const response = await apiFetch("/api/products/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ file: await fileAsDataUrl(file) })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "批量导入失败");
    state.selectedProductIds = [];
    input.value = "";
    await loadProductsForRoute("products");
    render();
    showToast(`批量导入完成：新增 ${data.created} 个，更新 ${data.updated} 个`);
  } catch (error) {
    input.value = "";
    alert(error.message);
  }
}

function createProductResultsHtml(productList, pageData) {
  return `
    <div class="hint product-count-hint">共 ${pageData.total} 个商品，当前显示 ${pageData.items.length} 个</div>
    ${pageData.items.length ? `<div class="product-grid">${pageData.items.map(productCard).join("")}</div>` : `<div class="empty">没有匹配的商品，请尝试商品名称、规格、编码或别名。</div>`}
    ${paginationControls("createProducts", pageData.page, pageData.totalPages, pageData.total)}
  `;
}

function renderCreateProductResults() {
  const container = document.getElementById("createProductResults");
  if (!container) return;
  const remote = state.remotePages.createProducts;
  const productList = remote ? remote.items : filteredProducts().filter(isProductActive);
  const pageData = remote ? { items: remote.items, page: remote.page, pageSize: remote.pageSize, total: remote.total, totalPages: remote.totalPages, start: (remote.page - 1) * remote.pageSize } : paginateList(productList, "createProducts", EDIT_PAGE_SIZES.createProducts);
  container.innerHTML = createProductResultsHtml(productList, pageData);
}

function renderCreateOrder() {
  ensureSalesScope();
  const customerList = orderCustomerChoices();
  const customer = byId(customerList, state.selectedCustomerId) || null;
  ensureOrderDraft(customer);
  const remote = state.remotePages.createProducts;
  const productList = remote ? remote.items : filteredProducts().filter(isProductActive);
  const pageData = remote ? { items: remote.items, page: remote.page, pageSize: remote.pageSize, total: remote.total, totalPages: remote.totalPages, start: (remote.page - 1) * remote.pageSize } : paginateList(productList, "createProducts", EDIT_PAGE_SIZES.createProducts);
  const salespersonField = canChooseSalesperson() ?
  `<div class="field order-salesperson-field"><label>代下单销售人员</label><select class="select" onchange="setOrderSalesperson(this.value)">${activeSalesUsers().map((u) => `<option value="${html(u.id)}" ${u.id === state.salesUserId ? "selected" : ""}>${html(u.name)}</option>`).join("")}</select></div>` :
  "";
  return `
    <div class="card card-pad create-order-meta-card" style="margin-bottom:16px">
      <button type="button" class="create-order-summary" aria-expanded="${state.mobileOrderDetailsOpen}" onclick="toggleMobileOrderDetails()">
        <span><strong>${html((customer === null || customer === void 0 ? void 0 : customer.name) || "请选择客户")}</strong><small>${html(customer ? `${customer.phone || "未填写电话"} · ${state.orderAddress || "未填写地址"}` : "点击展开客户与配送信息")}</small></span>
        <b>${state.mobileOrderDetailsOpen ? "收起" : "展开"}⌄</b>
      </button>
      <div class="create-order-meta-details ${state.mobileOrderDetailsOpen ? "is-open" : ""}"><div class="form-grid create-order-meta-grid">
        <div class="field edit-customer-field"><label>选择客户 *</label><div class="edit-customer-combobox"><input id="createCustomerSearch" class="input" value="${html(state.createCustomerQuery)}" placeholder="${customerList.length ? "输入客户姓名或电话搜索" : "该销售人员暂无客户"}" autocomplete="off" role="combobox" onfocus="openCreateCustomerPicker();this.select()" onblur="closeCreateCustomerPicker()" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateCreateCustomerSearch(this)" oninput="updateCreateCustomerSearch(this)" /><div id="createCustomerResults" class="edit-customer-results hidden">${renderCreateCustomerResults()}</div></div></div>
        ${salespersonField}
        <div class="field address-history-field order-address-field"><label>送货地址</label><div class="address-history-combobox"><input id="orderAddressInput" class="input" value="${html(state.orderAddress)}" placeholder="输入新地址，或选择历史下单地址" autocomplete="off" onfocus="openAddressHistory('create')" onclick="openAddressHistory('create')" onblur="closeAddressHistory('create')" oninput="updateOrderDraftField('address',this.value)" />${addressHistoryMenuHtml((customer === null || customer === void 0 ? void 0 : customer.id) || "", "create")}</div></div>
        <div class="field order-phone-field"><label>收货人手机号 *</label><input id="orderPhoneInput" class="input" value="${html(state.orderPhone)}" oninput="updateOrderDraftField('phone',this.value)" /></div>
        <div class="field order-remark-field" style="grid-column:1/-1"><label>订单备注</label><textarea id="orderRemarkInput" class="textarea compact-textarea" placeholder="可填写配送说明、客户要求等" oninput="updateOrderDraftField('remark',this.value)">${html(state.orderRemark)}</textarea></div>
      </div></div>
    </div>
    <div class="product-layout create-product-layout">
      <div class="create-product-column">
        <div class="mobile-product-filters">
          <div class="toolbar filter-toolbar">
            <input id="orderProductSearchInput" class="input" placeholder="搜索商品名称、规格、编码、别名..." value="${html(state.productQuery)}" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false';updateProductQuery(this)" oninput="updateProductQuery(this)" />
            <button class="btn primary" onclick="openAiOrderModal()">AI 帮我开单</button>
            ${desktopCartButton()}
          </div>
          ${categoryTabs()}
          ${subcategoryTabs()}
        </div>
        <div id="createProductResults">${createProductResultsHtml(productList, pageData)}</div>
      </div>
    </div>
  `;
}

async function saveOrder() {var _data$learnedAliases;
  const customer = byId(orderCustomerChoices(), state.selectedCustomerId);
  if (!customer || !state.cart.length) {
    alert("请选择客户和商品。");
    return;
  }
  if (state.cart.some((item) => !isPositiveInteger(item.quantity))) {
    alert("商品数量必须为大于 0 的整数，请检查购物车后再结算。");
    return;
  }
  const invalidPriceItems = state.cart.filter((item) => !isValidCartPrice(item.price));
  if (invalidPriceItems.length) {
    alert("商品单价必须为 0 或正数，且最多保留两位小数，请检查购物车后再结算。");
    return;
  }
  const unavailableItems = state.cart.filter((item) => {
    const product = byId(products, item.productId);
    return !product || !isProductActive(product);
  });
  if (unavailableItems.length) {
    const names = unavailableItems.slice(0, 3).map((item) => cartItemDisplay(item).name).join("、");
    alert(`购物车中包含已停用或已不存在的商品（${names}${unavailableItems.length > 3 ? "等" : ""}），请先删除或更换后再结算。`);
    return;
  }
  const payload = {
    type: state.orderType,
    customerId: customer.id,
    salesUserId: canChooseSalesperson() ? state.salesUserId : state.user.id,
    amount: cartTotal(),
    phone: state.orderPhone.trim() || customer.phone || "",
    address: state.orderAddress.trim(),
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
        price: signedOrderPrice(product, item.price)
      };
    })
  };
  let response;
  let data;
  try {
    response = await apiFetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    data = await response.json();
  } catch (_) {
    alert("订单提交失败，请检查网络后重试。购物车内容已保留。");
    return;
  }
  if (!response.ok) {
    alert(`${data.error || "保存订单失败"}。购物车内容已保留。`);
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
  state.aiDraft = null;
  state.aiGroups = [];
  state.aiActiveGroupId = "";
  state.aiActiveResultKey = "";
  state.aiDraftDirty = false;
  state.aiSourceDirty = false;
  state.aiSourceEditorOpen = false;
  state.aiDraftCustomerId = "";
  state.aiDraftOrderType = "";
  state.selectedCustomerId = "";
  state.createCustomerQuery = "";
  state.createCustomerPickerOpen = false;
  resetOrderDraft(null);
  resetPage("orders");
  showToast((_data$learnedAliases = data.learnedAliases) !== null && _data$learnedAliases !== void 0 && _data$learnedAliases.length ? `订单已生成，并新增 ${data.learnedAliases.length} 个商品关键词` : "订单已生成");
  setRoute("orders");
}

function renderOrders() {
  const payFilter = state.orderPayStatus || "全部";
  const remote = state.remotePages.orders;
  const list = remote ? remote.items : visibleOrders();
  const pageData = remote ? { items: remote.items, page: remote.page, pageSize: remote.pageSize, total: remote.total, totalPages: remote.totalPages, start: (remote.page - 1) * remote.pageSize } : paginateList(list, "orders", EDIT_PAGE_SIZES.orders);
  return `
    <div class="mobile-page-tools"><input id="orderSearchInputMobile" class="input" placeholder="搜索订单号/客户名称/手机号" value="${html(state.orderQuery)}" oninput="updateOrderQuery(this)" /><button type="button" class="btn mobile-filter-button" onclick="toggleMobileFilter('orders')">筛选</button><button class="btn primary" onclick="state.orderType='sale';setRoute('create')">开单</button></div>
    <div class="mobile-filter-chips">${mobileFilterChip("状态", state.orderStatus || "全部", "updateOrderStatusFilter('全部')")}${mobileFilterChip("付款", payFilter, "updateOrderPayFilter('全部')")}${mobileFilterChip("销售", state.orderSalesFilter, "updateOrderSalesFilter('全部')")}</div>
    <div class="toolbar filter-toolbar order-filter-toolbar desktop-page-tools">
      <input id="orderSearchInput" class="input" placeholder="搜索订单号/客户名称/手机号" value="${html(state.orderQuery)}" oninput="updateOrderQuery(this)" />
      <div class="filter-field"><label>订单状态</label><select class="select compact-select" onchange="updateOrderStatusFilter(this.value)">${optionList(ORDER_STATUS_FILTERS, state.orderStatus || "全部")}</select></div>
      <div class="filter-field"><label>付款状态</label><select class="select compact-select" onchange="updateOrderPayFilter(this.value)">${optionList(PAY_STATUS_FILTERS, payFilter)}</select></div>
      ${canChooseSalesperson() ? `<div class="filter-field"><label>下单销售</label><select class="select compact-select" onchange="updateOrderSalesFilter(this.value)">${salesFilterOptions(state.orderSalesFilter)}</select></div>` : ""}
      <div class="spacer"></div>
      <button class="btn primary" onclick="state.orderType='sale';setRoute('create')">开单</button>
    </div>
    <div id="orderResultsPanel">${orderResultsHtml(pageData)}</div>
  `;
}

function orderResultsHtml(pageData) {
  return `<div class="mobile-table-head order-mobile-head"><span>订单 / 客户</span><span>金额 / 状态</span><span>操作</span></div>
    <div class="order-list">${pageData.items.length ? pageData.items.map(orderCard).join("") : `<div class="empty">没有符合条件的订单</div>`}</div>
    ${paginationControls("orders", pageData.page, pageData.totalPages, pageData.total)}`;
}

function renderOrderResults() {
  const container = document.getElementById("orderResultsPanel");
  if (!container) return;
  const remote = state.remotePages.orders;
  const list = remote ? remote.items : visibleOrders();
  const pageData = remote ? { items: remote.items, page: remote.page, pageSize: remote.pageSize, total: remote.total, totalPages: remote.totalPages, start: (remote.page - 1) * remote.pageSize } : paginateList(list, "orders", EDIT_PAGE_SIZES.orders);
  container.innerHTML = orderResultsHtml(pageData);
}

async function patchOrder(id, payload, successText) {
  const response = await apiFetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
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
  await loadOrders();
  render();
}

function paymentAmountModal(orderId) {
  const order = byId(orders, orderId);
  if (!order || isReturnOrder(order)) return "";
  const originalAmount = Number(order.amount || 0);
  const currentAmount = actualPaidAmount(order);
  return `
    <div class="modal-backdrop">
      <div class="modal payment-amount-modal" role="dialog" aria-modal="true" aria-labelledby="paymentAmountTitle">
        <div class="modal-head">
          <div>
            <h3 id="paymentAmountTitle">修改实际收款金额</h3>
            <div class="hint">订单 ${html(order.no || "")}</div>
          </div>
          <button type="button" class="icon-btn" aria-label="关闭" onclick="closeModal()">×</button>
        </div>
        <div class="modal-body payment-amount-body">
          <div class="payment-original-row">
            <span>商品合计金额</span>
            <strong>${money(originalAmount)}</strong>
          </div>
          <label class="field">
            <span>实际收款金额</span>
            <div class="payment-input-wrap">
              <span>¥</span>
              <input id="actualPaidAmountInput" class="input" type="number" min="0" step="0.01"
                value="${html(currentAmount === null ? originalAmount : currentAmount)}"
                inputmode="decimal" autocomplete="off" />
            </div>
          </label>
          <label class="field">
            <span>优惠或抹零原因</span>
            <input id="paymentAdjustmentReasonInput" class="input" maxlength="100"
              placeholder="金额不一致时必填，例如：客户优惠、抹零"
              value="${html(order.paymentAdjustmentReason || "")}" />
          </label>
          <p class="payment-amount-note">金额与商品合计一致时，将恢复显示原订单金额并清除调整原因。</p>
        </div>
        <div class="modal-foot">
          <button type="button" class="btn" onclick="closeModal()">取消</button>
          <button type="button" class="btn primary" onclick="saveActualPaymentAmount(${jsArg(order.id)})">保存金额</button>
        </div>
      </div>
    </div>
  `;
}

async function saveActualPaymentAmount(orderId) {
  const order = byId(orders, orderId);
  const amountInput = document.getElementById("actualPaidAmountInput");
  const reasonInput = document.getElementById("paymentAdjustmentReasonInput");
  if (!order || !amountInput) return;
  const amount = Number(amountInput.value);
  const reason = String((reasonInput === null || reasonInput === void 0 ? void 0 : reasonInput.value) || "").trim();
  const originalAmount = Number(order.amount || 0);
  if (!Number.isFinite(amount) || amount < 0 || Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-8) {
    alert("实际收款金额必须大于等于 0，且最多保留两位小数");
    amountInput.focus();
    return;
  }
  if (Math.round(amount * 100) !== Math.round(originalAmount * 100) && !reason) {
    alert("实际收款金额与订单金额不一致时，请填写优惠或抹零原因");
    reasonInput === null || reasonInput === void 0 || reasonInput.focus();
    return;
  }

  const response = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ actualPaidAmount: amount, paymentAdjustmentReason: reason })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    alert(data.error || "修改实际收款金额失败");
    return;
  }
  const index = orders.findIndex((item) => item.id === orderId);
  if (index >= 0) orders[index] = data.order;
  state.modal = null;
  showToast("实际收款金额已更新");
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
    price: Number(item.price !== undefined ? item.price : product.price || 0)
  };
}

async function loadProductDetail(productId) {
  const response = await latestApiFetch(`product-detail-${productId}`, `/api/products/${encodeURIComponent(productId)}`);
  if (!response) return;
  const data = await response.json();
  if (!response.ok || !data.product) return;
  mergeProductCache([data.product]);
  if (state.modal && state.modal.id === productId) render();
}

function openModal(type, id) {
  cancelMotionClose("modal");
  state.modal = { type, id };
  if (type === "editOrder") {
    const order = byId(orders, id);
    const customer = orderCustomerForDisplay(order);
    state.editOrderDraft = {
      orderId: id,
      customerId: (order === null || order === void 0 ? void 0 : order.customerId) || "",
      date: (order === null || order === void 0 ? void 0 : order.date) || "",
      phone: (order === null || order === void 0 ? void 0 : order.phone) || (customer === null || customer === void 0 ? void 0 : customer.phone) || "",
      address: (order === null || order === void 0 ? void 0 : order.address) || (customer === null || customer === void 0 ? void 0 : customer.address) || "",
      remark: (order === null || order === void 0 ? void 0 : order.remark) || "",
      items: ((order === null || order === void 0 ? void 0 : order.items) || []).map(orderLineSnapshot)
    };
    state.editProductPickerOpen = false;
    state.editProductQuery = "";
    state.editProductCategory = "全部";
    state.editProductSubcategory = "全部";
    state.editCustomerQuery = (customer === null || customer === void 0 ? void 0 : customer.name) || "";
    state.editCustomerPickerOpen = false;
  }
  render();
  if ((type === "product" || type === "productImage") && id) loadProductDetail(id);
  if (type === "customerOrders" && id) loadCustomerOrderHistory(id);
  if (type === "editOrder") {
    const order = byId(orders, id);
    loadCustomers({ forCreate: true, salesUserId: order === null || order === void 0 ? void 0 : order.salesUserId }).then(render).catch((error) => alert(error.message));
  }
}

function closeModal() {
  const closingModal = state.modal;
  closeWithMotion("modal", ".modal-backdrop", () => {
    if (state.modal !== closingModal) return;
    state.modal = null;
    state.editOrderDraft = null;
    state.editProductPickerOpen = false;
    state.editCustomerPickerOpen = false;
    render();
  });
}

function editOrderCustomerChoices() {var _state$editOrderDraft, _state$user11;
  const order = byId(orders, (_state$editOrderDraft = state.editOrderDraft) === null || _state$editOrderDraft === void 0 ? void 0 : _state$editOrderDraft.orderId);
  const salesUserId = isSalesRole() ? (_state$user11 = state.user) === null || _state$user11 === void 0 ? void 0 : _state$user11.id : order === null || order === void 0 ? void 0 : order.salesUserId;
  return visibleCustomers().filter((customer) => customer.ownerId === salesUserId);
}

function matchingEditCustomers() {
  const query = state.editCustomerQuery.trim().toLowerCase();
  return editOrderCustomerChoices().filter((customer) => !query || [customer.name, customer.contact, customer.phone].
  some((value) => String(value || "").toLowerCase().includes(query))).slice(0, 20);
}

function renderEditCustomerResults() {
  const matches = matchingEditCustomers();
  return matches.length ? matches.map((customer) => {var _state$editOrderDraft2;return `
    <button type="button" class="edit-customer-option ${customer.id === ((_state$editOrderDraft2 = state.editOrderDraft) === null || _state$editOrderDraft2 === void 0 ? void 0 : _state$editOrderDraft2.customerId) ? "selected" : ""}" onmousedown="event.preventDefault()" onclick="selectEditOrderCustomer(${jsArg(customer.id)})">
      <strong>${html(customer.name)}</strong><span>${html(customer.phone || "-")} · ${html(customer.address || "未填写地址")}</span>
    </button>`;}).join("") : `<div class="empty">没有匹配的客户</div>`;
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
  setTimeout(() => {var _document$getElementB11;
    state.editCustomerPickerOpen = false;
    (_document$getElementB11 = document.getElementById("editCustomerResults")) === null || _document$getElementB11 === void 0 || _document$getElementB11.classList.add("hidden");
  }, 120);
}

function updateEditCustomerSearch(input) {
  state.editCustomerQuery = input.value;
  state.editCustomerPickerOpen = true;
  if (input.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(refreshEditCustomerResults, 120);
}

function selectEditOrderCustomer(customerId) {var _document$getElementB12;
  const customer = byId(editOrderCustomerChoices(), customerId);
  if (!customer || !state.editOrderDraft) return;
  state.editOrderDraft.customerId = customer.id;
  state.editOrderDraft.phone = customer.phone || "";
  state.editOrderDraft.address = "";
  state.editCustomerQuery = customer.name || "";
  state.editCustomerPickerOpen = false;
  const input = document.getElementById("editCustomerSearch");
  const phone = document.getElementById("editOrderPhone");
  const address = document.getElementById("editOrderAddress");
  if (input) input.value = state.editCustomerQuery;
  if (phone) phone.value = state.editOrderDraft.phone;
  if (address) address.value = state.editOrderDraft.address;
  const history = document.getElementById("editOrderAddressHistory");
  if (history) history.outerHTML = addressHistoryMenuHtml(customer.id, "edit");
  (_document$getElementB12 = document.getElementById("editCustomerResults")) === null || _document$getElementB12 === void 0 || _document$getElementB12.classList.add("hidden");
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
  if (!state.editOrderDraft || state.editOrderDraft.orderId !== id) {var _byId3, _byId4;
    state.editOrderDraft = { orderId: id, customerId: order.customerId, date: order.date || "", phone: order.phone || ((_byId3 = byId(customers, order.customerId)) === null || _byId3 === void 0 ? void 0 : _byId3.phone) || "", address: order.address || "", remark: order.remark || "", items: (order.items || []).map(orderLineSnapshot) };
    state.editCustomerQuery = ((_byId4 = byId(customers, order.customerId)) === null || _byId4 === void 0 ? void 0 : _byId4.name) || "";
  }
  const draft = state.editOrderDraft;
  const draftTotal = draft.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);
  return `
    <div class="modal-backdrop">
      <div class="modal large edit-order-modal">
        <div class="modal-head"><h3>编辑订单</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="form-grid">
            <div class="field edit-customer-field"><label>客户</label><div class="edit-customer-combobox"><input id="editCustomerSearch" class="input" value="${html(state.editCustomerQuery)}" placeholder="输入客户名称、联系人或手机号" autocomplete="off" role="combobox" onfocus="openEditCustomerPicker();this.select()" onblur="closeEditCustomerPicker()" oninput="updateEditCustomerSearch(this)" /><div id="editCustomerResults" class="edit-customer-results hidden">${renderEditCustomerResults()}</div></div></div>
            <div class="field"><label>订单日期</label><input id="editOrderDate" class="input" value="${html(draft.date)}" oninput="updateEditOrderMeta('date',this.value)" /></div>
            <div class="field" style="grid-column:1/-1"><label>收货人手机号</label><input id="editOrderPhone" class="input" value="${html(draft.phone)}" oninput="updateEditOrderMeta('phone',this.value)" /></div>
            <div class="field address-history-field" style="grid-column:1/-1"><label>订单地址</label><div class="address-history-combobox"><input id="editOrderAddress" class="input" value="${html(draft.address)}" placeholder="输入新地址，或选择历史下单地址" autocomplete="off" onfocus="openAddressHistory('edit')" onclick="openAddressHistory('edit')" onblur="closeAddressHistory('edit')" oninput="updateEditOrderMeta('address',this.value)" />${addressHistoryMenuHtml(draft.customerId, "edit")}</div></div>
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

function updateEditOrderLine(index, key, value) {var _state$editOrderDraft3;
  const item = (_state$editOrderDraft3 = state.editOrderDraft) === null || _state$editOrderDraft3 === void 0 || (_state$editOrderDraft3 = _state$editOrderDraft3.items) === null || _state$editOrderDraft3 === void 0 ? void 0 : _state$editOrderDraft3[index];
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
  const currentScrollTop = scrollTop === null ? (modalBody === null || modalBody === void 0 ? void 0 : modalBody.scrollTop) || 0 : scrollTop;
  const section = document.querySelector(".edit-order-items");
  if (section) section.outerHTML = editOrderItemsHtml(state.editOrderDraft);
  const total = document.getElementById("editOrderTotal");
  if (total) total.textContent = money(state.editOrderDraft.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0));
  const nextBody = document.querySelector(".edit-order-modal .modal-body");
  if (nextBody) nextBody.scrollTop = currentScrollTop;
}

function toggleEditProductPicker() {
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  const scrollTop = (modalBody === null || modalBody === void 0 ? void 0 : modalBody.scrollTop) || 0;
  state.editProductPickerOpen = !state.editProductPickerOpen;
  const button = document.getElementById("editProductPickerToggle");
  const slot = document.getElementById("editProductPickerSlot");
  if (button) button.textContent = state.editProductPickerOpen ? "收起商品库" : "+ 添加商品";
  if (slot) slot.innerHTML = editProductPickerSlotHtml();
  if (modalBody) modalBody.scrollTop = scrollTop;
  if (state.editProductPickerOpen) {
    loadEditProductPicker();
    requestAnimationFrame(() => {var _document$getElementB13;
      const picker = document.querySelector(".edit-product-picker");
      picker === null || picker === void 0 || picker.scrollIntoView({ block: "start", behavior: "smooth" });
      (_document$getElementB13 = document.getElementById("editProductSearch")) === null || _document$getElementB13 === void 0 || _document$getElementB13.focus();
    });
  }
}

function renderEditProductPicker() {
  const query = state.editProductQuery.trim().toLowerCase();
  const category = state.editProductCategory || "全部";
  const categorySubcategories = category === "全部" ? [] : state.productCategories[category] || [];
  const subcategories = ["全部", ...categorySubcategories];
  const remote = state.remotePages.editProducts;
  const matches = remote ? remote.items : products.filter(isProductActive).filter((p) => {
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
  if (type === "category") {state.editProductCategory = value;state.editProductSubcategory = "全部";}
  if (type === "subcategory") state.editProductSubcategory = value;
  if ((input === null || input === void 0 ? void 0 : input.dataset.composing) === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => loadEditProductPicker(type === "query"), type === "query" ? 220 : 0);
}

async function loadEditProductPicker(restoreSearchFocus = false) {
  const response = await latestApiFetch("edit-products", `/api/products${queryString({
    page: 1,
    pageSize: 60,
    q: state.editProductQuery,
    category1: state.editProductCategory === "全部" ? "" : state.editProductCategory,
    category2: state.editProductSubcategory === "全部" ? "" : state.editProductSubcategory,
    status: "在售"
  })}`);
  if (!response) return;
  const data = await response.json();
  if (!response.ok) return alert(data.error || "商品库加载失败");
  state.remotePages.editProducts = data;
  mergeProductCache(data.items || []);
  refreshEditProductPicker(restoreSearchFocus);
}

function refreshEditProductPicker(restoreSearchFocus = false) {
  const picker = document.querySelector(".edit-product-picker");
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  if (!picker || !modalBody) return;
  const scrollTop = modalBody.scrollTop;
  if (restoreSearchFocus) {
    const template = document.createElement("template");
    template.innerHTML = renderEditProductPicker();
    const currentResults = picker.querySelector(".edit-product-results");
    const nextResults = template.content.querySelector(".edit-product-results");
    if (currentResults && nextResults) currentResults.replaceWith(nextResults);
  } else {
    picker.outerHTML = renderEditProductPicker();
  }
  modalBody.scrollTop = scrollTop;
}

function addEditOrderProduct(productId) {
  const product = byId(products, productId);
  if (!product || !state.editOrderDraft || state.editOrderDraft.items.some((item) => item.productId === productId)) return;
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  const scrollTop = (modalBody === null || modalBody === void 0 ? void 0 : modalBody.scrollTop) || 0;
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
  const scrollTop = (modalBody === null || modalBody === void 0 ? void 0 : modalBody.scrollTop) || 0;
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
  const scrollTop = (modalBody === null || modalBody === void 0 ? void 0 : modalBody.scrollTop) || 0;
  const [item] = state.editOrderDraft.items.splice(index, 1);
  state.editOrderDraft.items.splice(target, 0, item);
  refreshEditOrderItems(scrollTop);
  requestAnimationFrame(() => {var _document$querySelect;return (_document$querySelect = document.querySelector(`[data-edit-order-index="${target}"] .edit-order-drag-handle`)) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.focus();});
}

function handleEditOrderDragKey(event, index) {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
  event.preventDefault();
  moveEditOrderLine(index, event.key === "ArrowUp" ? -1 : 1);
}

function startEditOrderDrag(event) {var _event$currentTarget$, _event$currentTarget;
  if (!state.editOrderDraft || event.button > 0) return;
  const line = event.currentTarget.closest("[data-edit-order-line]");
  const list = line === null || line === void 0 ? void 0 : line.parentElement;
  const modalBody = document.querySelector(".edit-order-modal .modal-body");
  if (!line || !list || !modalBody) return;
  event.preventDefault();
  state.editOrderDrag = { line, list, modalBody, pointerId: event.pointerId };
  (_event$currentTarget$ = (_event$currentTarget = event.currentTarget).setPointerCapture) === null || _event$currentTarget$ === void 0 || _event$currentTarget$.call(_event$currentTarget, event.pointerId);
  line.classList.add("is-dragging");
  document.body.classList.add("is-edit-order-dragging");
  document.addEventListener("pointermove", moveEditOrderDrag);
  document.addEventListener("pointerup", finishEditOrderDrag, { once: true });
  document.addEventListener("pointercancel", finishEditOrderDrag, { once: true });
}

function moveEditOrderDrag(event) {var _document$elementFrom, _window$matchMedia, _window;
  const drag = state.editOrderDrag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  event.preventDefault();
  const bodyRect = drag.modalBody.getBoundingClientRect();
  if (event.clientY < bodyRect.top + 64) drag.modalBody.scrollTop -= 18;
  if (event.clientY > bodyRect.bottom - 64) drag.modalBody.scrollTop += 18;
  const target = (_document$elementFrom = document.elementFromPoint(event.clientX, event.clientY)) === null || _document$elementFrom === void 0 ? void 0 : _document$elementFrom.closest("[data-edit-order-line]");
  if (!target || target.parentElement !== drag.list || target === drag.line) return;
  const lines = [...drag.list.querySelectorAll("[data-edit-order-line]")];
  const from = lines.indexOf(drag.line);
  const to = lines.indexOf(target);
  if (from < 0 || to < 0 || from === to) return;
  const positions = new Map(lines.map((element) => [element, element.getBoundingClientRect().top]));
  const [item] = state.editOrderDraft.items.splice(from, 1);
  state.editOrderDraft.items.splice(to, 0, item);
  if (to > from) drag.list.insertBefore(drag.line, target.nextSibling);else
  drag.list.insertBefore(drag.line, target);
  if ((_window$matchMedia = (_window = window).matchMedia) !== null && _window$matchMedia !== void 0 && _window$matchMedia.call(_window, "(prefers-reduced-motion: reduce)").matches) return;
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
  if (!drag || event.pointerId !== undefined && event.pointerId !== drag.pointerId) return;
  const finalScrollTop = drag.modalBody.scrollTop;
  document.removeEventListener("pointermove", moveEditOrderDrag);
  document.removeEventListener("pointerup", finishEditOrderDrag);
  document.removeEventListener("pointercancel", finishEditOrderDrag);
  document.body.classList.remove("is-edit-order-dragging");
  state.editOrderDrag = null;
  refreshEditOrderItems(finalScrollTop);
}

async function saveOrderEdits(id) {var _state$editOrderDraft4, _state$editOrderDraft5, _document$getElementB16, _document$getElementB17, _document$getElementB18, _document$getElementB19;
  const items = (((_state$editOrderDraft4 = state.editOrderDraft) === null || _state$editOrderDraft4 === void 0 ? void 0 : _state$editOrderDraft4.items) || []).map((item, index) => {var _document$getElementB14, _document$getElementB15;return {
      productId: item.productId || "",
      name: item.name || "",
      spec: item.spec || "",
      unit: item.unit || "",
      quantity: Number(((_document$getElementB14 = document.getElementById(`editOrderItemQty${index}`)) === null || _document$getElementB14 === void 0 ? void 0 : _document$getElementB14.value) || 0),
      price: Number(((_document$getElementB15 = document.getElementById(`editOrderItemPrice${index}`)) === null || _document$getElementB15 === void 0 ? void 0 : _document$getElementB15.value) || 0)
    };}).filter((item) => item.name);
  const invalidIndex = items.findIndex((item) => !isPositiveInteger(item.quantity));
  if (invalidIndex >= 0) {
    const input = document.getElementById(`editOrderItemQty${invalidIndex}`);
    setQuantityInputValidity(input);
    input === null || input === void 0 || input.focus();
    input === null || input === void 0 || input.scrollIntoView({ block: "center", behavior: "smooth" });
    alert("商品数量必须为大于 0 的整数，请修正后再保存。");
    return;
  }
  const amount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const payload = {
    customerId: (_state$editOrderDraft5 = state.editOrderDraft) === null || _state$editOrderDraft5 === void 0 ? void 0 : _state$editOrderDraft5.customerId,
    date: (_document$getElementB16 = document.getElementById("editOrderDate")) === null || _document$getElementB16 === void 0 ? void 0 : _document$getElementB16.value.trim(),
    phone: (_document$getElementB17 = document.getElementById("editOrderPhone")) === null || _document$getElementB17 === void 0 ? void 0 : _document$getElementB17.value.trim(),
    address: (_document$getElementB18 = document.getElementById("editOrderAddress")) === null || _document$getElementB18 === void 0 ? void 0 : _document$getElementB18.value.trim(),
    remark: (_document$getElementB19 = document.getElementById("editOrderRemark")) === null || _document$getElementB19 === void 0 ? void 0 : _document$getElementB19.value.trim(),
    items,
    amount
  };
  const response = await apiFetch(`/api/orders/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
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

function isValidCartPrice(value) {
  const text = String(value).trim();
  const price = Number(text);
  return text !== "" && Number.isFinite(price) && price >= 0 && /^\d+(?:\.\d{1,2})?$/.test(text);
}

function cartItemDisplay(item) {
  const product = byId(products, item.productId);
  const snapshot = cartSnapshot(product, item);
  return {
    ...snapshot,
    product,
    available: Boolean(product && isProductActive(product)),
    missing: !product
  };
}

function renderKeepingCartScroll(callback) {var _document$getElementB20;
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  const cartScroll = ((_document$getElementB20 = document.getElementById("cartItemsScroller")) === null || _document$getElementB20 === void 0 ? void 0 : _document$getElementB20.scrollTop) || 0;
  callback();
  persistCart(state.orderType, true);
  render();
  requestAnimationFrame(() => {
    window.scrollTo(scrollX, scrollY);
    const scroller = document.getElementById("cartItemsScroller");
    if (scroller) scroller.scrollTop = cartScroll;
    pulseMotion(".cart-line-total, .mobile-cart-summary strong, .desktop-cart-trigger strong, .cart-drawer-checkout strong");
  });
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
    alert("商品数量必须为大于 0 的整数");
    renderKeepingCartScroll(() => {});
    return;
  }
  renderKeepingCartScroll(() => {
    line.quantity = Number(value);
  });
}

function setCartPrice(productId, value) {
  const line = cartItemForProduct(productId);
  if (!line) return;
  if (!isValidCartPrice(value)) {
    alert("商品单价必须为 0 或正数，且最多保留两位小数。");
    renderKeepingCartScroll(() => {});
    return;
  }
  renderKeepingCartScroll(() => {
    line.price = Math.round(Number(value) * 100) / 100;
  });
}

function addToCart(productId) {
  const product = byId(products, productId);
  if (!product || !isProductActive(product)) return;
  const line = cartItemForProduct(productId);
  if (line) {
    line.quantity = normalizeQuantity(line.quantity) + 1;
  } else {
    state.cart.push({ productId, quantity: 1, price: Number(product.price || 0), ...cartSnapshot(product) });
  }
  persistCart(state.orderType, true);
  render();
  pulseMotion(".product-card.selected, .mobile-cart-summary strong, .desktop-cart-trigger strong");
  showToast("已加入购物车");
}

function cartLine(item) {
  const details = cartItemDisplay(item);
  const p = details.product || { id: item.productId, name: details.name, spec: details.spec, unit: details.unit };
  const quantity = normalizeQuantity(item.quantity);
  const displayPrice = signedOrderPrice(p, item.price);
  const availability = details.missing ? "商品已不存在" : !details.available ? "商品已停用" : "";
  return `
    <div class="cart-line ${availability ? "cart-line-unavailable" : ""}" data-cart-product-id="${html(item.productId)}">
      <div class="cart-line-main">
        <strong>${html(details.name)}${details.spec ? ` <span>${html(details.spec)}</span>` : ""}</strong>
        <div class="product-spec">${html(details.unit || "未填写单位")}</div>
        ${availability ? `<div class="cart-unavailable-badge">${availability} · 请删除或更换</div>` : ""}
      </div>
      <div class="cart-line-delete">
        ${actionButton("从购物车删除", "delete", `removeCartItem(${JSON.stringify(item.productId)})`)}
      </div>
      <div class="cart-line-side">
        <label class="cart-price-field"><span>单价</span><span class="cart-price-input"><b>¥</b><input type="number" min="0" step="0.01" inputmode="decimal" value="${normalizedCartPrice(item.price)}" onchange="setCartPrice(${jsArg(item.productId)},this.value)" onkeydown="if(event.key==='Enter')this.blur()" /></span></label>
        <div class="cart-line-controls">
          <button type="button" onclick="changeQty(${jsArg(item.productId)}, -1)">-</button>
          <input class="qty-input" type="number" min="1" step="1" inputmode="numeric" value="${quantity}" onchange="setCartQuantity(${jsArg(item.productId)}, this.value)" onkeydown="if(event.key==='Enter')this.blur()" />
          <button type="button" onclick="changeQty(${jsArg(item.productId)}, 1)">+</button>
        </div>
        <strong class="cart-line-total">${money(quantity * displayPrice)}</strong>
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
  const line = Array.from(document.querySelectorAll(".cart-line")).find((element) => element.dataset.cartProductId === String(productId));
  if (line && !motionIsReduced()) {
    state.cart = state.cart.filter((item) => item.productId !== productId);
    persistCart(state.orderType, true);
    line.classList.add("motion-cart-remove");
    setTimeout(() => {
      renderKeepingCartScroll(() => {});
    }, 130);
    return;
  }
  renderKeepingCartScroll(() => {
    state.cart = state.cart.filter((item) => item.productId !== productId);
  });
}

async function saveProduct(id) {var _field, _cat2New$value, _field2, _field3, _field4, _field5, _field6, _field7, _field8, _field9, _field0;
  const field = (fieldId) => document.getElementById(fieldId);
  const imageFiles = Array.from(((_field = field("productImageFile")) === null || _field === void 0 ? void 0 : _field.files) || []);
  const existingImageCount = id ? productImageUrls(byId(products, id) || {}).length : 0;
  if (existingImageCount + imageFiles.length > 6) {
    alert(`每个商品最多保存 6 张图片，当前还可以上传 ${Math.max(0, 6 - existingImageCount)} 张。`);
    return;
  }
  const cat2Select = field("productCat2Select");
  const cat2New = field("productCat2New");
  let cat2 = (cat2Select === null || cat2Select === void 0 ? void 0 : cat2Select.value) || "";
  if (cat2 === "__new__") cat2 = (cat2New === null || cat2New === void 0 || (_cat2New$value = cat2New.value) === null || _cat2New$value === void 0 ? void 0 : _cat2New$value.trim()) || "";
  const payload = {
    code: ((_field2 = field("productCode")) === null || _field2 === void 0 || (_field2 = _field2.value) === null || _field2 === void 0 ? void 0 : _field2.trim()) || "",
    name: ((_field3 = field("productName")) === null || _field3 === void 0 || (_field3 = _field3.value) === null || _field3 === void 0 ? void 0 : _field3.trim()) || "",
    spec: ((_field4 = field("productSpec")) === null || _field4 === void 0 || (_field4 = _field4.value) === null || _field4 === void 0 ? void 0 : _field4.trim()) || "",
    cat1: ((_field5 = field("productCat1")) === null || _field5 === void 0 ? void 0 : _field5.value) || "辅助商品",
    cat2,
    unit: ((_field6 = field("productUnit")) === null || _field6 === void 0 || (_field6 = _field6.value) === null || _field6 === void 0 ? void 0 : _field6.trim()) || "",
    price: Number(((_field7 = field("productPrice")) === null || _field7 === void 0 ? void 0 : _field7.value) || 0),
    cost: Number(((_field8 = field("productCost")) === null || _field8 === void 0 ? void 0 : _field8.value) || 0),
    status: ((_field9 = field("productStatus")) === null || _field9 === void 0 ? void 0 : _field9.value) || "在售",
    aliases: (((_field0 = field("productAliases")) === null || _field0 === void 0 ? void 0 : _field0.value) || "").
    split(/[,，、\n]/).
    map((item) => item.trim()).
    filter(Boolean)
  };
  if (!payload.name || !payload.unit) {
    alert("商品名称和单位必填。");
    return;
  }
  try {
    const preparedImages = [];
    for (const imageFile of imageFiles) preparedImages.push(await prepareProductImage(imageFile));
    const response = await apiFetch(id ? `/api/products/${encodeURIComponent(id)}` : "/api/products", {
      method: id ? "PUT" : "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "保存商品失败");
    const savedId = data.product.id;
    let savedProduct = data.product;
    const imageErrors = [];
    for (let index = 0; index < preparedImages.length; index += 1) {
      try {
        savedProduct = await uploadProductImage(savedId, preparedImages[index]);
      } catch (error) {var _imageFiles$index;
        imageErrors.push(`${((_imageFiles$index = imageFiles[index]) === null || _imageFiles$index === void 0 ? void 0 : _imageFiles$index.name) || `第 ${index + 1} 张图片`}：${error.message || "上传失败"}`);
      }
    }
    if (id) {
      const index = products.findIndex((item) => item.id === id);
      if (index >= 0) products[index] = savedProduct;
    } else {
      products.unshift(savedProduct);
    }
    closeModal();
    if (imageErrors.length) alert(`商品信息已保存，但以下图片上传失败：\n${imageErrors.join("\n")}`);else
    showToast(preparedImages.length > 1 ? `商品信息及 ${preparedImages.length} 张图片已保存` : "商品信息已保存");
    if (state.route === "products") await loadProductsForRoute("products");
    render();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteProduct(id) {
  const product = byId(products, id);
  if (!product || !confirm(`确定删除“${product.name}”吗？历史订单不会受影响。`)) return;
  try {
    const response = await apiFetch(`/api/products/${encodeURIComponent(id)}`, { method: "DELETE" });
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
    await loadProductsForRoute("products");
    render();
  } catch (error) {
    alert(error.message);
  }
}

const COST_SUPPLIER_OPTIONS = ["许斌", "小郑", "帅小霞", "杨姐", "欧姐", "漆海军"];
const COST_DELIVERY_OPTIONS = ["许斌", "潘师", "李师", "老宛", "小郑", "杨姐"];
const COST_RECONCILIATION_OPTIONS = ["未对订单", "问题订单", "已对订单"];
const COST_UNASSIGNED_SUPPLIER = "__unassigned_supplier__";

function costDateInputValue(date) {
  const value = date instanceof Date ? date : new Date(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function costDatePresetRange(preset, referenceDate = new Date()) {
  const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  let from = new Date(today);
  let to = new Date(today);
  if (preset === "month") {
    from = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (preset === "previousMonth") {
    from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    to = new Date(today.getFullYear(), today.getMonth(), 0);
  } else if (preset === "last7") {
    from.setDate(from.getDate() - 6);
  } else if (preset === "last30") {
    from.setDate(from.getDate() - 29);
  }
  return {
    from: costDateInputValue(from),
    to: costDateInputValue(to)
  };
}

function normalizeCostOrderDate(value) {
  const match = String(value || "").trim().match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!match) return "";
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return "";
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function costOrderDateInRange(orderDate, from, to) {
  const normalized = normalizeCostOrderDate(orderDate);
  if (!normalized) return false;
  return (!from || normalized >= from) && (!to || normalized <= to);
}

function costOrderMatchesSuppliers(order, selectedSuppliers) {
  if (!selectedSuppliers.length) return true;
  const names = (order.costControl && order.costControl.suppliers || []).
  map((supplier) => String(supplier.name || "").trim()).
  filter(Boolean);
  return selectedSuppliers.some((supplier) => {
    if (supplier === COST_UNASSIGNED_SUPPLIER) return names.length === 0;
    return names.includes(supplier);
  });
}

function summarizeCostOrders(orders) {
  const summary = orders.reduce((result, order) => {var _order$costControl, _order$costControl2, _order$costControl3;
    const totals = calculateCostDraft(order);
    result.revenue += costNumber(order.effectiveAmount);
    result.cost += totals.totalCost;
    result.profit += totals.profit;
    if (!((_order$costControl = order.costControl) !== null && _order$costControl !== void 0 && (_order$costControl = _order$costControl.suppliers) !== null && _order$costControl !== void 0 && _order$costControl.length) || !((_order$costControl2 = order.costControl) !== null && _order$costControl2 !== void 0 && _order$costControl2.deliveryPerson) || (((_order$costControl3 = order.costControl) === null || _order$costControl3 === void 0 ? void 0 : _order$costControl3.reconciliationStatus) || "未对订单") === "未对订单") {
      result.incomplete += 1;
    }
    return result;
  }, { revenue: 0, cost: 0, profit: 0, incomplete: 0, grossMargin: null });
  summary.grossMargin = summary.revenue > 0 ?
  Math.round(summary.profit / summary.revenue * 10000) / 100 :
  null;
  return summary;
}

function cloneCostControl(source = {}) {
  return {
    suppliers: (source.suppliers || []).map((supplier) => ({ ...supplier })),
    deliveryPerson: source.deliveryPerson || "",
    transportCost: source.transportCost || 0,
    remark: source.remark || "",
    reconciliationStatus: source.reconciliationStatus || "未对订单"
  };
}

function costNumber(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number >= 0 ? number : 0;
}

function calculateCostDraft(order) {
  const control = cloneCostControl(order.costControl);
  const materialCost = (control.suppliers || []).reduce((sum, supplier) => {
    return sum + costNumber(supplier.materialCost);
  }, 0);
  const transportCost = costNumber(control.transportCost);
  const totalCost = Math.round((materialCost + transportCost) * 100) / 100;
  const actualAmount = costNumber(order.effectiveAmount);
  return {
    materialCost: Math.round(materialCost * 100) / 100,
    transportCost,
    totalCost,
    profit: Math.round((actualAmount - totalCost) * 100) / 100
  };
}

function costOrderById(orderId) {
  return state.costOrders.find((order) => order.id === orderId);
}

function refreshCostCard(orderId) {
  const order = costOrderById(orderId);
  const card = document.querySelector(`[data-cost-order="${orderId}"]`);
  if (!order || !card) return;
  const totals = calculateCostDraft(order);
  card.querySelectorAll("[data-cost-material]").forEach((node) => {node.textContent = money(totals.materialCost);});
  card.querySelectorAll("[data-cost-total]").forEach((node) => {node.textContent = money(totals.totalCost);});
  card.querySelectorAll("[data-cost-profit]").forEach((node) => {
    node.textContent = money(totals.profit);
    node.classList.toggle("is-negative", totals.profit < 0);
  });
}

function rerenderCostControl() {
  const scrollTop = window.scrollY;
  render();
  requestAnimationFrame(() => window.scrollTo(0, scrollTop));
}

function renderCostLiveResults() {
  const current = document.getElementById("costLiveResults");
  if (!current) return;
  const template = document.createElement("template");
  template.innerHTML = renderCostControl();
  const next = template.content.querySelector("#costLiveResults");
  if (next) current.replaceWith(next);
}

function toggleCostSupplier(orderId, name) {
  const order = costOrderById(orderId);
  if (!order) return;
  order.costControl = cloneCostControl(order.costControl);
  const index = order.costControl.suppliers.findIndex((supplier) => supplier.name === name);
  if (index >= 0) order.costControl.suppliers.splice(index, 1);else
  order.costControl.suppliers.push({ name, materialCost: 0 });
  rerenderCostControl();
}

function addCustomCostSupplier(orderId) {
  const order = costOrderById(orderId);
  const input = document.querySelector(`[data-cost-custom-supplier="${orderId}"]`);
  const name = input ? input.value.trim() : "";
  if (!order || !name) return;
  order.costControl = cloneCostControl(order.costControl);
  if (order.costControl.suppliers.some((supplier) => supplier.name === name)) {
    alert("该供应商已经添加");
    return;
  }
  order.costControl.suppliers.push({ name, materialCost: 0 });
  rerenderCostControl();
}

function updateSupplierCost(orderId, index, value) {
  const order = costOrderById(orderId);
  if (!order || !order.costControl.suppliers[index]) return;
  order.costControl.suppliers[index].materialCost = value;
  refreshCostCard(orderId);
}

function changeCostDelivery(orderId, value) {
  const order = costOrderById(orderId);
  if (!order) return;
  order.costControl = cloneCostControl(order.costControl);
  order.costControl.deliveryPerson = value === "__custom__" ? "" : value;
  order.costCustomDelivery = value === "__custom__";
  rerenderCostControl();
}

function updateCustomDelivery(orderId, value) {
  const order = costOrderById(orderId);
  if (!order) return;
  order.costControl.deliveryPerson = value;
}

function updateTransportCost(orderId, value) {
  const order = costOrderById(orderId);
  if (!order) return;
  order.costControl.transportCost = value;
  refreshCostCard(orderId);
}

function updateCostRemark(orderId, value) {
  const order = costOrderById(orderId);
  if (!order) return;
  order.costControl.remark = value;
}

function setCostReconciliationStatus(orderId, value) {
  if (!COST_RECONCILIATION_OPTIONS.includes(value)) return;
  const order = costOrderById(orderId);
  if (!order) return;
  order.costControl = cloneCostControl(order.costControl);
  order.costControl.reconciliationStatus = value;
  rerenderCostControl();
}

function toggleCostOrder(orderId) {
  state.costExpandedOrderId = state.costExpandedOrderId === orderId ? "" : orderId;
  rerenderCostControl();
}

function toggleCostSalesMenu() {
  state.costSalesMenuOpen = !state.costSalesMenuOpen;
  state.costSupplierMenuOpen = false;
  rerenderCostControl();
}

function closeCostSalesMenu() {
  if (!state.costSalesMenuOpen) return;
  state.costSalesMenuOpen = false;
  rerenderCostControl();
}

function toggleCostSalesperson(name) {
  const selected = new Set(state.costSalesFilters);
  if (selected.has(name)) selected.delete(name);else
  selected.add(name);
  state.costSalesFilters = Array.from(selected);
  rerenderCostControl();
  loadCostControl(true);
}

function clearCostSalespeople() {
  state.costSalesFilters = [];
  rerenderCostControl();
  loadCostControl(true);
}

function defaultCostSalesFilters() {
  const availableNames = new Set(state.costOrders.map((order) => order.salesName).filter(Boolean));
  return ["谢天天", "陈诚"].filter((name) => availableNames.has(name));
}

function toggleCostSupplierMenu() {
  state.costSupplierMenuOpen = !state.costSupplierMenuOpen;
  state.costSalesMenuOpen = false;
  rerenderCostControl();
}

function toggleCostSupplierFilter(name) {
  const selected = new Set(state.costSupplierFilters);
  if (selected.has(name)) selected.delete(name);else
  selected.add(name);
  state.costSupplierFilters = Array.from(selected);
  rerenderCostControl();
  loadCostControl(true);
}

function clearCostSupplierFilters() {
  state.costSupplierFilters = [];
  rerenderCostControl();
  loadCostControl(true);
}

function setCostDateFilter(field, value) {
  const normalized = value ? normalizeCostOrderDate(value) : "";
  if (field === "from") state.costDateFrom = normalized;
  if (field === "to") state.costDateTo = normalized;
  render();
  loadCostControl(true);
}

function setCostDatePreset(preset) {
  const range = costDatePresetRange(preset);
  state.costDateFrom = range.from;
  state.costDateTo = range.to;
  render();
  loadCostControl(true);
}

function costDatePresetActive(preset) {
  const range = costDatePresetRange(preset);
  return state.costDateFrom === range.from && state.costDateTo === range.to;
}

function toggleCostMobileFilters() {
  state.costMobileFiltersOpen = !state.costMobileFiltersOpen;
  rerenderCostControl();
}

function resetCostFilters() {
  const range = costDatePresetRange("month");
  state.costQuery = "";
  state.costStatusFilter = "全部";
  state.costReconcileFilter = "全部";
  state.costSalesFilters = defaultCostSalesFilters();
  state.costDateFrom = range.from;
  state.costDateTo = range.to;
  state.costSupplierFilters = [];
  state.costSalesMenuOpen = false;
  state.costSupplierMenuOpen = false;
  state.costExpandedOrderId = "";
  rerenderCostControl();
  loadCostControl(true);
}

function setCostReconcileFilter(value) {
  state.costReconcileFilter = value;
  render();
  loadCostControl(true);
}

async function loadCostControl(force = false) {
  if (!isAdmin() || state.costLoading && !force || state.costLoaded && !force) return;
  if (state.costDateFrom && state.costDateTo && state.costDateFrom > state.costDateTo) {
    if (state.route === "costs") renderCostLiveResults();
    return;
  }
  state.costLoading = true;
  state.costError = "";
  if (state.route === "costs" && !document.getElementById("costLiveResults")) render();
  try {
    const selectedSalesIds = state.costSalesFilters.map((name) => {var _salesUsers$find;return (_salesUsers$find = salesUsers.find((user) => user.name === name)) === null || _salesUsers$find === void 0 ? void 0 : _salesUsers$find.id;}).filter(Boolean);
    const selectedSuppliers = state.costSupplierFilters.map((name) => name === COST_UNASSIGNED_SUPPLIER ? "__EMPTY__" : name);
    const response = await latestApiFetch("cost-control", `/api/cost-control${queryString({
      q: state.costQuery,
      startDate: state.costDateFrom,
      endDate: state.costDateTo,
      suppliers: selectedSuppliers.join(","),
      salesUserIds: selectedSalesIds.join(","),
      status: state.costStatusFilter,
      reconciliationStatus: state.costReconcileFilter
    })}`);
    if (!response) return;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "成本数据加载失败");
    state.costOrders = (data.orders || []).map((order) => ({
      ...order,
      costControl: cloneCostControl(order.costControl)
    }));
    state.costSupplierOptions = data.suppliers || state.costSupplierOptions;
    if (!state.costSalesInitialized) {
      state.costSalesFilters = defaultCostSalesFilters();
      state.costSalesInitialized = true;
    }
    state.costLoaded = true;
  } catch (error) {
    state.costError = error.message || "成本数据加载失败";
  } finally {
    state.costLoading = false;
    if (state.route === "costs") {
      if (document.getElementById("costLiveResults")) renderCostLiveResults();else
      render();
    }
  }
}

async function saveCostControl(orderId) {
  const order = costOrderById(orderId);
  if (!order || state.costSavingId) return;
  state.costSavingId = orderId;
  rerenderCostControl();
  try {
    const response = await apiFetch(`/api/cost-control/${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(order.costControl)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "成本信息保存失败");
    const index = state.costOrders.findIndex((item) => item.id === orderId);
    state.costOrders[index] = {
      ...data.order,
      costControl: cloneCostControl(data.order.costControl)
    };
    showToast("成本信息已保存");
  } catch (error) {
    alert(error.message || "成本信息保存失败");
  } finally {
    state.costSavingId = "";
    if (state.route === "costs") rerenderCostControl();
  }
}

function setCostQuery(input) {
  state.costQuery = input.value;
  if (input.dataset.composing === "true") return;
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => loadCostControl(true), 220);
}

function setCostStatusFilter(value) {
  state.costStatusFilter = value;
  render();
  loadCostControl(true);
}

function renderCostControl() {
  if (!isAdmin()) return "";
  if (state.costLoading && !state.costLoaded) {
    return `<div class="card card-pad cost-empty">正在加载成本数据...</div>`;
  }
  if (state.costError && !state.costLoaded) {
    return `<div class="card card-pad cost-empty"><p>${html(state.costError)}</p><button class="btn primary" onclick="loadCostControl(true)">重新加载</button></div>`;
  }

  const query = state.costQuery.trim().toLowerCase();
  const salesNames = Array.from(new Set(state.costOrders.map((order) => order.salesName).filter(Boolean))).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const supplierNameSet = new Set();
  state.costOrders.forEach((order) => {var _order$costControl4;
    (((_order$costControl4 = order.costControl) === null || _order$costControl4 === void 0 ? void 0 : _order$costControl4.suppliers) || []).forEach((supplier) => {
      const name = String(supplier.name || "").trim();
      if (name) supplierNameSet.add(name);
    });
  });
  const supplierNames = Array.from(new Set([...(state.costSupplierOptions || []), ...supplierNameSet])).sort((a, b) => a.localeCompare(b, "zh-CN"));
  const dateError = state.costDateFrom && state.costDateTo && state.costDateFrom > state.costDateTo ?
  "开始日期不能晚于结束日期，请调整日期范围。" :
  "";
  const visibleOrders = dateError ? [] : state.costOrders.filter((order) => {var _order$costControl5;
    const matchesQuery = !query || [
    order.no,
    order.customerName,
    order.customerPhone,
    order.salesName,
    order.address].
    some((value) => String(value || "").toLowerCase().includes(query));
    const matchesStatus = state.costStatusFilter === "全部" || (
    state.costStatusFilter === "已完成" ? order.status === "已完成" : order.status !== "已完成");
    const matchesSales = !state.costSalesFilters.length || state.costSalesFilters.includes(order.salesName);
    const reconcileStatus = ((_order$costControl5 = order.costControl) === null || _order$costControl5 === void 0 ? void 0 : _order$costControl5.reconciliationStatus) || "未对订单";
    const matchesReconcile = state.costReconcileFilter === "全部" || reconcileStatus === state.costReconcileFilter;
    const matchesDate = costOrderDateInRange(order.date, state.costDateFrom, state.costDateTo);
    const matchesSupplier = costOrderMatchesSuppliers(order, state.costSupplierFilters);
    return matchesQuery && matchesStatus && matchesSales && matchesReconcile && matchesDate && matchesSupplier;
  });
  const summary = summarizeCostOrders(visibleOrders);
  const grossMarginText = summary.grossMargin === null ? "—" : `${summary.grossMargin}%`;
  const supplierFilterLabel = state.costSupplierFilters.length ?
  `已选 ${state.costSupplierFilters.length} 项` :
  "全部供应商";
  const mobileFilterLabel = `${state.costDateFrom || "不限"} 至 ${state.costDateTo || "不限"} · ${supplierFilterLabel}`;

  return `
    <section class="cost-filter-shell">
      <button type="button" class="cost-filter-toggle" aria-expanded="${state.costMobileFiltersOpen}" onclick="toggleCostMobileFilters()">
        <span><strong>筛选条件</strong><small>${html(mobileFilterLabel)}</small></span>
        <span class="cost-chevron">⌄</span>
      </button>
      <div class="cost-filter-content ${state.costMobileFiltersOpen ? "is-open" : ""}">
        <div class="cost-toolbar">
          <div class="cost-search-wrap">
            <input id="costSearchInput" class="input" value="${html(state.costQuery)}" placeholder="搜索订单号、客户、电话、销售或地址" oninput="setCostQuery(this)" />
          </div>
          <div class="cost-sales-filter">
            <button type="button" class="select cost-sales-trigger" onclick="toggleCostSalesMenu()">
              <span>${state.costSalesFilters.length ? `已选 ${state.costSalesFilters.length} 人` : "全部销售"}</span>
              <span class="cost-chevron">⌄</span>
            </button>
            ${state.costSalesMenuOpen ? `
              <div class="cost-sales-menu">
                <button type="button" class="cost-sales-all ${!state.costSalesFilters.length ? "selected" : ""}" onclick="clearCostSalespeople()">全部销售</button>
                ${salesNames.map((name) => `
                  <label class="cost-sales-option">
                    <input type="checkbox" ${state.costSalesFilters.includes(name) ? "checked" : ""} onchange="toggleCostSalesperson(${jsArg(name)})" />
                    <span>${html(name)}</span>
                  </label>
                `).join("")}
              </div>
            ` : ""}
          </div>
          <select class="select" aria-label="订单状态" onchange="setCostStatusFilter(this.value)">
            ${["全部", "进行中", "已完成"].map((status) => `<option value="${status}" ${state.costStatusFilter === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
          <select class="select" aria-label="对单状态" onchange="setCostReconcileFilter(this.value)">
            ${["全部", ...COST_RECONCILIATION_OPTIONS].map((status) => `<option value="${status}" ${state.costReconcileFilter === status ? "selected" : ""}>${status === "全部" ? "全部对单状态" : status}</option>`).join("")}
          </select>
          <button class="btn" onclick="loadCostControl(true)">刷新</button>
        </div>
        <div class="cost-advanced-filters">
          <div class="cost-date-range">
            <label><span>开始日期</span><input class="input" type="date" value="${html(state.costDateFrom)}" onchange="setCostDateFilter('from', this.value)" /></label>
            <i>至</i>
            <label><span>结束日期</span><input class="input" type="date" value="${html(state.costDateTo)}" onchange="setCostDateFilter('to', this.value)" /></label>
          </div>
          <div class="cost-date-presets" aria-label="快捷日期">
            ${[
  ["month", "本月"],
  ["previousMonth", "上月"],
  ["last7", "近7天"],
  ["last30", "近30天"]].
  map(([preset, label]) => `<button type="button" class="${costDatePresetActive(preset) ? "selected" : ""}" onclick="setCostDatePreset(${jsArg(preset)})">${label}</button>`).join("")}
          </div>
          <div class="cost-sales-filter cost-supplier-filter">
            <button type="button" class="select cost-sales-trigger" onclick="toggleCostSupplierMenu()">
              <span>${html(supplierFilterLabel)}</span>
              <span class="cost-chevron">⌄</span>
            </button>
            ${state.costSupplierMenuOpen ? `
              <div class="cost-sales-menu cost-supplier-menu">
                <button type="button" class="cost-sales-all ${!state.costSupplierFilters.length ? "selected" : ""}" onclick="clearCostSupplierFilters()">全部供应商</button>
                <label class="cost-sales-option">
                  <input type="checkbox" ${state.costSupplierFilters.includes(COST_UNASSIGNED_SUPPLIER) ? "checked" : ""} onchange="toggleCostSupplierFilter(${jsArg(COST_UNASSIGNED_SUPPLIER)})" />
                  <span>未填写供应商</span>
                </label>
                ${supplierNames.map((name) => `
                  <label class="cost-sales-option">
                    <input type="checkbox" ${state.costSupplierFilters.includes(name) ? "checked" : ""} onchange="toggleCostSupplierFilter(${jsArg(name)})" />
                    <span>${html(name)}</span>
                  </label>
                `).join("")}
              </div>
            ` : ""}
          </div>
          <button type="button" class="btn cost-reset-filter" onclick="resetCostFilters()">重置筛选</button>
        </div>
      </div>
    </section>
    <div id="costLiveResults">
    ${dateError ? `<div class="cost-inline-error">${html(dateError)}</div>` : ""}
    <div class="cost-summary-grid">
      <div class="cost-summary-item"><span>实际付款合计</span><strong>${dateError ? "—" : money(summary.revenue)}</strong></div>
      <div class="cost-summary-item"><span>总成本</span><strong>${dateError ? "—" : money(summary.cost)}</strong></div>
      <div class="cost-summary-item"><span>预计盈利</span><strong class="${summary.profit < 0 ? "is-negative" : ""}">${dateError ? "—" : money(summary.profit)}</strong></div>
      <div class="cost-summary-item"><span>整体毛利率</span><strong class="${summary.grossMargin !== null && summary.grossMargin < 0 ? "is-negative" : ""}">${dateError ? "—" : grossMarginText}</strong></div>
      <div class="cost-summary-item"><span>待完善订单</span><strong>${dateError ? "—" : summary.incomplete}</strong></div>
    </div>
    ${state.costError ? `<div class="cost-inline-error">${html(state.costError)}</div>` : ""}
    <div class="cost-order-list">
      ${dateError ? `<div class="card card-pad cost-empty">请先修正日期范围</div>` : visibleOrders.length ? visibleOrders.map(renderCostOrderCard).join("") : `<div class="card card-pad cost-empty">没有符合条件的订单</div>`}
    </div>
    </div>
  `;
}

function renderCostOrderCard(order) {
  const control = cloneCostControl(order.costControl);
  const totals = calculateCostDraft(order);
  const expanded = state.costExpandedOrderId === order.id;
  const customDelivery = order.costCustomDelivery ||
  control.deliveryPerson && !COST_DELIVERY_OPTIONS.includes(control.deliveryPerson);
  const supplierSummary = control.suppliers.length ?
  control.suppliers.map((supplier) => supplier.name).join("、") :
  "未填写供应商";
  return `
    <article class="cost-order-card ${expanded ? "is-expanded" : ""}" data-cost-order="${html(order.id)}">
      <div class="cost-order-head">
        <div class="cost-order-title">
          <strong>${html(order.no)}</strong>
          ${statusBadge(order.status)}
          <span class="cost-reconcile-badge ${costReconcileClass(control.reconciliationStatus)}">${html(control.reconciliationStatus)}</span>
        </div>
        <div class="cost-card-metrics">
          <span><small>实际付款</small><strong>${money(order.effectiveAmount)}</strong></span>
          <span><small>总成本</small><strong data-cost-total>${money(totals.totalCost)}</strong></span>
          <span><small>盈利</small><strong data-cost-profit class="${totals.profit < 0 ? "is-negative" : ""}">${money(totals.profit)}</strong></span>
        </div>
      </div>
      <div class="cost-order-meta">
        <span><b>销售</b>${html(order.salesName || "-")}</span>
        <span><b>客户</b>${html(order.customerName || "-")}</span>
        <span><b>电话</b>${html(order.customerPhone || "-")}</span>
        <span><b>日期</b>${html(order.date || "-")}</span>
      </div>
      <div class="cost-order-address"><b>地址：</b>${html(order.address || "-")}</div>
      <div class="cost-compact-summary">
        <span><b>供应商</b>${html(supplierSummary)}</span>
        <span><b>送货</b>${html(control.deliveryPerson || "未填写")}</span>
        <span><b>材料</b><i data-cost-material>${money(totals.materialCost)}</i></span>
        <span><b>运输</b>${money(totals.transportCost)}</span>
        ${control.remark ? `<span class="cost-summary-remark"><b>备注</b>${html(control.remark)}</span>` : ""}
        <button type="button" class="btn cost-expand-btn" aria-expanded="${expanded}" onclick="toggleCostOrder(${jsArg(order.id)})">
          <span>${expanded ? "收起" : "核算成本"}</span><span class="cost-expand-icon">⌄</span>
        </button>
      </div>
      ${expanded ? `<div class="cost-expanded-panel">
      <div class="cost-editor-grid">
        <section class="cost-editor-section">
          <div class="cost-section-heading"><div><strong>材料供应商</strong><span>可多选，每位供应商分别填写成本</span></div></div>
          <div class="cost-option-row">
            ${COST_SUPPLIER_OPTIONS.map((name) => {
    const selected = control.suppliers.some((supplier) => supplier.name === name);
    return `<button type="button" class="cost-option ${selected ? "selected" : ""}" onclick="toggleCostSupplier(${jsArg(order.id)}, ${jsArg(name)})">${html(name)}</button>`;
  }).join("")}
          </div>
          <div class="cost-custom-row">
            <input class="input" data-cost-custom-supplier="${html(order.id)}" placeholder="自行填写供应商" />
            <button type="button" class="btn" onclick="addCustomCostSupplier(${jsArg(order.id)})">添加</button>
          </div>
          <div class="cost-supplier-list">
            ${control.suppliers.length ? control.suppliers.map((supplier, index) => `
              <div class="cost-supplier-row">
                <span>${html(supplier.name)}</span>
                <label><span>材料成本</span><div class="cost-money-input"><i>¥</i><input type="number" min="0" step="0.01" value="${html(supplier.materialCost)}" oninput="updateSupplierCost(${jsArg(order.id)}, ${index}, this.value)" /></div></label>
                <button type="button" class="cost-remove" title="移除供应商" onclick="toggleCostSupplier(${jsArg(order.id)}, ${jsArg(supplier.name)})">×</button>
              </div>
            `).join("") : `<div class="cost-placeholder">暂未选择供应商</div>`}
          </div>
        </section>
        <section class="cost-editor-section">
          <div class="cost-section-heading"><div><strong>送货与运输</strong><span>选择一位送货负责人并填写运输成本</span></div></div>
          <label class="cost-field"><span>送货负责人</span>
            <select class="select" onchange="changeCostDelivery(${jsArg(order.id)}, this.value)">
              <option value="">请选择</option>
              ${COST_DELIVERY_OPTIONS.map((name) => `<option value="${name}" ${control.deliveryPerson === name ? "selected" : ""}>${name}</option>`).join("")}
              <option value="__custom__" ${customDelivery ? "selected" : ""}>自行填写</option>
            </select>
          </label>
          ${customDelivery ? `<label class="cost-field"><span>自定义送货人</span><input class="input" value="${html(control.deliveryPerson)}" placeholder="请输入姓名" oninput="updateCustomDelivery(${jsArg(order.id)}, this.value)" /></label>` : ""}
          <label class="cost-field"><span>运输成本</span><div class="cost-money-input"><i>¥</i><input type="number" min="0" step="0.01" value="${html(control.transportCost)}" oninput="updateTransportCost(${jsArg(order.id)}, this.value)" /></div></label>
        </section>
      </div>
      <div class="cost-reconcile-editor">
        <div>
          <strong>对单状态</strong>
          <span>核对订单、供应商和成本后更新状态</span>
        </div>
        <div class="cost-reconcile-options">
          ${COST_RECONCILIATION_OPTIONS.map((status) => `
            <button type="button" class="cost-reconcile-option ${costReconcileClass(status)} ${control.reconciliationStatus === status ? "selected" : ""}" onclick="setCostReconciliationStatus(${jsArg(order.id)}, ${jsArg(status)})">${html(status)}</button>
          `).join("")}
        </div>
        <label class="cost-remark-field">
          <span>成本备注</span>
          <textarea maxlength="500" placeholder="记录对单差异、供应商说明或其他情况" oninput="updateCostRemark(${jsArg(order.id)}, this.value)">${html(control.remark)}</textarea>
        </label>
      </div>
      <footer class="cost-order-footer">
        <div class="cost-totals">
          <span>材料成本 <b data-cost-material>${money(totals.materialCost)}</b></span>
          <span>总成本 <b data-cost-total>${money(totals.totalCost)}</b></span>
          <span class="cost-profit">盈利 <b data-cost-profit class="${totals.profit < 0 ? "is-negative" : ""}">${money(totals.profit)}</b></span>
        </div>
        <button type="button" class="btn primary" ${state.costSavingId === order.id ? "disabled" : ""} onclick="saveCostControl(${jsArg(order.id)})">${state.costSavingId === order.id ? "保存中..." : "保存成本"}</button>
      </footer>
      </div>` : ""}
    </article>
  `;
}

function costReconcileClass(status) {
  if (status === "问题订单") return "is-problem";
  if (status === "已对订单") return "is-checked";
  return "is-unchecked";
}

function openOrderRoute(type = "sale") {
  const nextType = type === "return" ? "return" : "sale";
  persistCart(state.orderType);
  state.orderType = nextType;
  restoreCart(nextType);
  state.route = state.orderType === "return" ? "returns" : "create";
  state.modal = null;
  state.mobileMoreOpen = false;
  state.mobileCartOpen = false;
  state.mobileFilterOpen = "";
  state.mobileOrderDetailsOpen = false;
  state.query = "";
  if (typeof resetPage === "function") resetPage("createProducts");
  ensureSalesScope();
  render();
  loadRouteData(state.route, true);
}

function setRoute(route) {
  if (["costs", "audit"].includes(route) && !isAdmin()) return;
  const previousType = state.orderType;
  persistCart(previousType);
  state.route = route;
  state.query = "";
  state.modal = null;
  state.mobileMoreOpen = false;
  state.mobileCartOpen = false;
  state.mobileFilterOpen = "";
  if (route === "create" || route === "returns") state.mobileOrderDetailsOpen = false;
  if (route === "returns") state.orderType = "return";
  if (route === "create") state.orderType = "sale";
  if (state.orderType !== previousType) restoreCart(state.orderType);
  ensureSalesScope();
  render();
  if (route === "costs") loadCostControl();else
  loadRouteData(route, true);
}

function handleRouteClick(route) {
  setRoute(route);
}

function handleOrderRouteClick(type) {
  openOrderRoute(type);
}

function navButton(route, label) {
  const activeClass = state.route === route ? "active" : "";
  return `<button type="button" class="${activeClass}" title="${html(label)}" aria-label="${html(label)}" onclick="handleRouteClick(${jsArg(route)})"><span class="nav-icon">${icon(route)}</span><span class="nav-label">${html(label)}</span></button>`;
}

function orderBadgeClass(status) {
  return orderStatusTone(status);
}

function orderActionButton(title, type, action, orderId) {
  return `<button type="button" class="icon-btn order-tool-button order-action-${html(action)}" title="${html(title)}" aria-label="${html(title)}" onclick="handleOrderAction(${jsArg(action)}, ${jsArg(orderId)})">${svgIcon(type)}</button>`;
}

function canCurrentUserDeleteOrder(order) {
  if (!order || !state.user) return false;
  if (isAdmin()) return true;
  return state.user.role === "销售人员" &&
  order.status === "待确认" &&
  order.salesUserId === state.user.id;
}

function syncOrderPopoverLayer(menu) {
  if (!menu || !menu.closest) return;
  const card = menu.closest(".order-card");
  if (!card) return;
  card.classList.toggle("has-open-popover", menu.hasAttribute("open"));
}

function closeOrderPopover(menu) {
  if (!menu) return;
  menu.removeAttribute("open");
  syncOrderPopoverLayer(menu);
}

function toggleOrderPopover(menu, event) {
  if (event) event.stopPropagation();
  if (!menu) return;
  const shouldOpen = !menu.hasAttribute("open");
  document.querySelectorAll(".order-popover-menu[open]").forEach((otherMenu) => {
    if (otherMenu !== menu) closeOrderPopover(otherMenu);
  });
  if (shouldOpen) menu.setAttribute("open", "");else
  menu.removeAttribute("open");
  syncOrderPopoverLayer(menu);
}

function orderMoreMenu(orderId) {
  const order = byId(orders, orderId);
  return `<div class="order-more-menu order-popover-menu">
    <button type="button" class="icon-btn order-tool-button order-more-trigger" title="更多操作" aria-label="更多操作" onpointerdown="toggleOrderPopover(this.parentElement,event)">${svgIcon("more")}</button>
    <div class="order-more-dropdown">
      <button type="button" onclick="repeatOrder(${jsArg(orderId)})"><span>${svgIcon("copy")}</span>再来一单</button>
      <button type="button" onclick="openModal('delivery',${jsArg(orderId)})"><span>${svgIcon("truck")}</span>开送货单</button>
      ${canCurrentUserDeleteOrder(order) ? `<button type="button" class="danger" onclick="deleteOrder(${jsArg(orderId)})"><span>${svgIcon("delete")}</span>删除订单</button>` : ""}
    </div>
  </div>`;
}

function orderStatusMenu(orderId, selected) {
  return `<details class="order-status-menu order-popover-menu" ontoggle="syncOrderPopoverLayer(this)">
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
  return `<details class="order-payment-menu order-popover-menu" ontoggle="syncOrderPopoverLayer(this)">
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
    return { productId: product.id, quantity: Number(item.quantity), price: Number(product.price || 0), ...cartSnapshot(product) };
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
  const order = byId(orders, orderId);
  if (!canCurrentUserDeleteOrder(order)) {var _state$user12;
    return alert(((_state$user12 = state.user) === null || _state$user12 === void 0 ? void 0 : _state$user12.role) === "销售人员" ? "销售人员只能删除自己名下的待确认订单" : "无权删除该订单");
  }
  const customer = orderCustomerForDisplay(order || {});
  if (!order || !confirm(`确定删除订单 ${order.no} 吗？\n客户：${customer.name || "-"}\n金额：${money(order.amount)}\n\n删除后订单将从业务页面和统计中隐藏。`)) return;
  const response = await apiFetch(`/api/orders/${encodeURIComponent(orderId)}`, { method: "DELETE" });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) return alert(data.error || "删除订单失败");
  orders = orders.filter((item) => item.id !== orderId);
  showToast("订单已删除");
  await loadOrders();
  render();
}

function orderCard(order) {
  const customer = orderCustomerForDisplay(order);
  const salesperson = byId(salesUsers, order.salesUserId) || {};
  const payStatus = normalizeClientPayStatus(order.payStatus);
  const status = order.status || "待确认";
  const address = orderAddressForDisplay(order, customer) || "-";
  const isReturn = order.type === "return" || String(order.no || "").startsWith("TH");
  const orderTypeLabel = isReturn ? "退货单" : "销售单";
  const currentActualAmount = actualPaidAmount(order);
  const displayedAmount = isReturn ? Number(order.amount || 0) : effectiveOrderAmount(order);
  const hasAdjustedAmount =
  !isReturn &&
  currentActualAmount !== null &&
  Math.round(currentActualAmount * 100) !== Math.round(Number(order.amount || 0) * 100);
  const amountMarkup = isReturn ?
  `<strong class="order-amount">${money(displayedAmount)}</strong>` :
  `<button
      type="button"
      class="order-amount order-amount-button${hasAdjustedAmount ? " adjusted" : ""}"
      title="修改实际收款金额"
      aria-label="修改订单 ${html(order.no)} 的实际收款金额"
      onclick="openModal('paymentAmount',${jsArg(order.id)})"
    >
      <strong>${money(displayedAmount)}</strong>
      ${hasAdjustedAmount ? `<span class="order-original-amount">${money(order.amount)}</span>` : ""}
    </button>`;
  return `
    <article class="order-card order-card-polished">
      <div class="order-card-accent"></div>
      <div class="order-card-body">
        <div class="order-mobile-heading">
          <h3>${html(order.no)}</h3>
          <span class="badge ${orderBadgeClass(status)}">${html(status)}</span>
          <span class="badge ${paymentStatusTone(payStatus)}">${html(payStatus)}</span>
        </div>
        <div class="order-mobile-summary">
          <div><span><b>客户</b>${html(customer.name || "-")}</span><span><b>日期</b>${html(order.date || "-")}</span></div>
          ${amountMarkup}
        </div>
        <div class="order-card-head">
          <div class="order-card-title-row">
            <h3>${html(order.no)}</h3>
            <span class="badge ${orderBadgeClass(status)}">${html(status)}</span>
            <span class="badge ${paymentStatusTone(payStatus)}">${html(payStatus)}</span>
          </div>
          ${amountMarkup}
        </div>
        <div class="order-card-meta order-card-meta-grid">
          <span><b>客户</b>${
  html(customer.name || "-")}</span>
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
  document.addEventListener("toggle", (event) => {
    const menu = event.target;
    if (menu && menu.matches && menu.matches("details.order-popover-menu")) syncOrderPopoverLayer(menu);
  }, true);
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".order-popover-menu[open]").forEach((menu) => {
      if (!menu.contains(event.target)) closeOrderPopover(menu);
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
  const quantityControl = selected ?
  `<div class="product-card-qty" title="已选数量">
        <button type="button" onclick="event.stopPropagation();changeQty(${jsArg(p.id)},-1)">-</button>
        <input class="qty-input" type="number" min="1" step="1" inputmode="numeric" value="${Number(selectedLine.quantity || 0)}" onclick="event.stopPropagation()" onchange="setCartQuantity(${jsArg(p.id)},this.value)" onkeydown="if(event.key==='Enter')this.blur()" />
        <button type="button" onclick="event.stopPropagation();changeQty(${jsArg(p.id)},1)">+</button>
      </div>` :
  active ?
  `<button class="icon-btn product-add-btn" title="加入购物车" onclick="addToCart(${jsArg(p.id)})">${svgIcon("plus")}</button>` :
  `<span class="badge danger">停用</span>`;
  return `
    <article class="product-card ${active ? "" : "disabled"} ${selected ? "selected" : ""}" data-product-id="${html(p.id)}">
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
  const aliases = Array.isArray(p.aliases) ? p.aliases.join("，") : p.aliases || "";
  const imageUrls = productImageUrls(p);
  return `
    <div class="modal-backdrop">
      <div class="modal side">
        <div class="modal-head"><h3>${id ? "编辑商品" : "新增商品"}</h3><button class="icon-btn" onclick="closeModal()">×</button></div>
        <div class="modal-body">
          <div class="product-image-editor">
            <div class="product-existing-images">
              ${imageUrls.length ? imageUrls.map((imageUrl, index) => `<div class="product-existing-image">
                <img src="${html(imageUrl)}" alt="${html(p.name || "商品图片")} ${index + 1}" />
                <button type="button" title="删除图片" onclick="deleteProductImage(this,${jsArg(id || "")},${jsArg(imageUrl)})">×</button>
              </div>`).join("") : `<div class="product-image-placeholder">暂无商品图片</div>`}
            </div>
            <div class="product-image-upload">
              <label class="btn" for="productImageFile">选择多张图片</label>
              <input id="productImageFile" data-product-id="${html(id || "")}" type="file" accept="image/*" multiple hidden onchange="previewProductImage(this)" />
              <div class="hint">每个商品最多 6 张；上传前会自动压缩，兼容手机拍摄的大图。现有 ${imageUrls.length} 张。</div>
              <div class="product-image-selection"></div>
            </div>
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

function assistantScopeText() {var _state$user13;
  if (isAdmin()) return "可查询全公司业务数据，成本与利润仅在管理员权限下显示";
  return ((_state$user13 = state.user) === null || _state$user13 === void 0 ? void 0 : _state$user13.role) === "销售人员" ?
  "只查询属于你的客户、订单和业绩数据" :
  "按当前账号权限查询业务数据";
}

function assistantWelcomeHtml() {
  const prompts = [
  "查询本月销售情况",
  "分析本月热销商品和客户",
  "解释乳胶漆施工的注意事项",
  "搜索最新建材行业政策"];

  return `
    <div class="xiaocai-welcome">
      <img src="./assets/xiaocai.png" alt="" />
      <div><strong>你好，我是小材</strong><p>我可以和你自然对话，也能结合权限内的业务数据与公开网络资料回答问题。</p></div>
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

function assistantSafeExternalUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch (_) {
    return "";
  }
}

function assistantInlineMarkdown(value) {
  const links = [];
  const withTokens = String(value || "").replace(/\[([^\]]{1,120})\]\((https?:\/\/[^)\s]+)\)/g, (_, label, url) => {
    const safeUrl = assistantSafeExternalUrl(url);
    if (!safeUrl) return label;
    const token = `ASSISTANTLINK${links.length}TOKEN`;
    links.push(`<a href="${html(safeUrl)}" target="_blank" rel="noopener noreferrer">${html(label)}</a>`);
    return token;
  });
  let output = html(withTokens).
  replace(/`([^`\n]+)`/g, "<code>$1</code>").
  replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
  links.forEach((link, index) => {
    output = output.replace(`ASSISTANTLINK${index}TOKEN`, link);
  });
  return output;
}

function assistantMarkdownHtml(value) {
  const lines = String(value || "").replace(/\r/g, "").split("\n");
  const output = [];
  let listType = "";
  let inCode = false;
  const codeLines = [];
  const closeList = () => {
    if (!listType) return;
    output.push(`</${listType}>`);
    listType = "";
  };
  lines.forEach((line) => {
    if (/^```/.test(line.trim())) {
      closeList();
      if (inCode) {
        output.push(`<pre><code>${html(codeLines.join("\n"))}</code></pre>`);
        codeLines.length = 0;
      }
      inCode = !inCode;
      return;
    }
    if (inCode) {
      codeLines.push(line);
      return;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      output.push(`<h${Math.min(4, heading[1].length + 2)}>${assistantInlineMarkdown(heading[2])}</h${Math.min(4, heading[1].length + 2)}>`);
      return;
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (bullet || ordered) {
      const nextType = ordered ? "ol" : "ul";
      if (listType !== nextType) {
        closeList();
        listType = nextType;
        output.push(`<${listType}>`);
      }
      output.push(`<li>${assistantInlineMarkdown((bullet || ordered)[1])}</li>`);
      return;
    }
    closeList();
    if (!line.trim()) {
      output.push('<div class="xiaocai-markdown-gap"></div>');
      return;
    }
    output.push(`<p>${assistantInlineMarkdown(line)}</p>`);
  });
  closeList();
  if (inCode) output.push(`<pre><code>${html(codeLines.join("\n"))}</code></pre>`);
  return output.join("");
}

function assistantSourcesHtml(sources) {
  const safeSources = (sources || []).map((source) => {
    const url = assistantSafeExternalUrl(source.url);
    if (!url) return "";
    return `<a href="${html(url)}" target="_blank" rel="noopener noreferrer"><strong>${html(source.title || source.source || "网页来源")}</strong><span>${html(source.source || "")}${source.publishedAt ? ` · ${html(source.publishedAt)}` : ""}</span></a>`;
  }).filter(Boolean);
  if (!safeSources.length) return "";
  return `<div class="xiaocai-sources"><b>公开网络来源</b>${safeSources.join("")}</div>`;
}

function assistantMessageHtml(message, index) {
  const isUser = message.role === "user";
  return `
    <div class="xiaocai-message ${isUser ? "is-user" : "is-assistant"}">
      ${isUser ? "" : `<img class="xiaocai-message-avatar" src="./assets/xiaocai.png" alt="小材" />`}
      <div class="xiaocai-message-content">
        <div class="xiaocai-bubble ${isUser ? "" : "xiaocai-markdown"}">${isUser ? html(message.content || "").replace(/\n/g, "<br />") : assistantMarkdownHtml(message.content || "")}</div>
        ${isUser ? "" : (message.blocks || []).map(assistantBlockHtml).join("")}
        ${isUser ? "" : assistantSourcesHtml(message.sources)}
        ${isUser ? "" : `<div class="xiaocai-message-actions">
          ${(message.links || []).map((link) => `<button type="button" onclick="openXiaocaiRoute(${jsArg(link.route)})">${html(link.label)}</button>`).join("")}
          ${(message.followUps || []).map((prompt) => `<button type="button" onclick="sendXiaocai(${jsArg(prompt)})">${html(prompt)}</button>`).join("")}
        </div>`}
      </div>
    </div>
  `;
}

function renderXiaocai() {
  if (!state.user || !state.assistantOpen) return "";
  return `
    <div class="xiaocai-assistant is-docked is-open">
        <section class="xiaocai-panel" aria-label="小材 AI 业务助手">
          <header class="xiaocai-head">
            <div class="xiaocai-identity"><img src="./assets/xiaocai.png" alt="" /><div><strong>小材</strong><span><i></i>AI 业务助手</span></div></div>
            <div class="xiaocai-head-actions">
              <button type="button" class="xiaocai-new-chat" title="开始新对话" onclick="newXiaocaiConversation()">新对话</button>
              <button type="button" class="icon-btn" title="清空聊天记录" aria-label="清空聊天记录" onclick="clearXiaocaiHistory()">${svgIcon("delete")}</button>
              <button type="button" class="icon-btn" title="收起小材" aria-label="收起小材" onclick="toggleXiaocai()">${svgIcon("close")}</button>
            </div>
          </header>
          <div id="xiaocaiMessages" class="xiaocai-messages">
            ${state.assistantMessages.length ? state.assistantMessages.map(assistantMessageHtml).join("") : assistantWelcomeHtml()}
            ${state.assistantLoading && !state.assistantMessages.some((item) => item.streaming && item.content) ? `<div class="xiaocai-message is-assistant"><img class="xiaocai-message-avatar" src="./assets/xiaocai.png" alt="" /><div class="xiaocai-thinking"><span></span><span></span><span></span><em id="xiaocaiStage">${html(state.assistantStage)}</em></div></div>` : ""}
            ${state.assistantError ? `<div class="xiaocai-error"><span>${html(state.assistantError)}</span><button type="button" onclick="retryXiaocai()">重试</button></div>` : ""}
          </div>
          <footer class="xiaocai-compose">
            <textarea id="xiaocaiInput" maxlength="2000" placeholder="问小材：可以聊通用知识，也可以查询系统数据或最新公开信息" oncompositionstart="this.dataset.composing='true'" oncompositionend="this.dataset.composing='false'" onkeydown="handleXiaocaiKey(event)"></textarea>
            <div><span>只读访问权限内数据 · 联网内容会显示来源</span>${state.assistantLoading ? `<button type="button" class="xiaocai-stop" onclick="stopXiaocai()">停止</button>` : `<button type="button" class="xiaocai-send" title="发送" aria-label="发送" onclick="sendXiaocai()">${svgIcon("arrowRight")}</button>`}</div>
          </footer>
        </section>
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
    const response = await apiFetch("/api/assistant/history");
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
  state.assistantOpen = !state.assistantOpen;
  render();
  if (state.assistantOpen) {
    loadXiaocaiHistory();
    scrollXiaocaiToBottom();
    requestAnimationFrame(() => {var _document$getElementB21;return (_document$getElementB21 = document.getElementById("xiaocaiInput")) === null || _document$getElementB21 === void 0 ? void 0 : _document$getElementB21.focus();});
  }
}

function openXiaocai() {
  state.mobileMoreOpen = false;
  state.mobileCartOpen = false;
  if (state.assistantOpen) return;
  state.assistantOpen = true;
  render();
  loadXiaocaiHistory();
  scrollXiaocaiToBottom();
  requestAnimationFrame(() => {var _document$getElementB22;return (_document$getElementB22 = document.getElementById("xiaocaiInput")) === null || _document$getElementB22 === void 0 ? void 0 : _document$getElementB22.focus();});
}

function handleXiaocaiKey(event) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.currentTarget.dataset.composing === "true") return;
  event.preventDefault();
  sendXiaocai();
}

function startAssistantStages() {
  clearInterval(assistantStageTimer);
  state.assistantStage = "正在理解问题";
}

function handleXiaocaiStreamEvent(eventName, payload, streamingMessage) {
  if (eventName === "stage") {
    state.assistantStage = String(payload.label || "正在处理");
    const stage = document.getElementById("xiaocaiStage");
    if (stage) stage.textContent = state.assistantStage;
    return;
  }
  if (eventName === "delta") {
    streamingMessage.content += String(payload.content || "");
    render();
    scrollXiaocaiToBottom();
    return;
  }
  if (eventName === "block") {
    streamingMessage.blocks.push(payload);
    render();
    scrollXiaocaiToBottom();
    return;
  }
  if (eventName === "sources") {
    streamingMessage.sources = Array.isArray(payload.items) ? payload.items : [];
    render();
    scrollXiaocaiToBottom();
    return;
  }
  if (eventName === "done" && payload.message) {
    Object.assign(streamingMessage, payload.message, { streaming: false });
    render();
    scrollXiaocaiToBottom();
    return;
  }
  if (eventName === "error") throw new Error(payload.message || "小材暂时无法回答");
}

function parseXiaocaiEventPacket(packet, streamingMessage) {
  const lines = String(packet || "").split(/\r?\n/);
  let eventName = "message";
  const dataLines = [];
  lines.forEach((line) => {
    if (line.startsWith("event:")) eventName = line.slice(6).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  });
  if (!dataLines.length) return;
  let payload;
  try {
    payload = JSON.parse(dataLines.join("\n"));
  } catch (_) {
    return;
  }
  handleXiaocaiStreamEvent(eventName, payload, streamingMessage);
}

async function sendXiaocai(prompt = "") {
  if (state.assistantLoading) return;
  const input = document.getElementById("xiaocaiInput");
  const message = String(prompt || (input === null || input === void 0 ? void 0 : input.value) || "").trim();
  if (!message) return;
  if (input) input.value = "";
  state.assistantLastQuestion = message;
  state.assistantError = "";
  state.assistantLoading = true;
  state.assistantMessages.push({ id: `local-${Date.now()}`, role: "user", content: message, createdAt: new Date().toISOString() });
  const streamingMessage = {
    id: `stream-${Date.now()}`,
    role: "assistant",
    content: "",
    blocks: [],
    sources: [],
    streaming: true,
    createdAt: new Date().toISOString()
  };
  state.assistantMessages.push(streamingMessage);
  render();
  scrollXiaocaiToBottom();
  startAssistantStages();
  assistantAbortController = new AbortController();
  try {
    const response = await apiFetch("/api/assistant/chat/stream", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ message }),
      signal: assistantAbortController.signal
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "小材暂时无法回答");
    }
    if (!response.body || !response.body.getReader) throw new Error("当前浏览器不支持流式对话");
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    while (true) {
      const result = await reader.read();
      buffer += decoder.decode(result.value || new Uint8Array(), { stream: !result.done });
      const packets = buffer.split(/\r?\n\r?\n/);
      buffer = packets.pop() || "";
      packets.forEach((packet) => parseXiaocaiEventPacket(packet, streamingMessage));
      if (result.done) break;
    }
    if (buffer.trim()) parseXiaocaiEventPacket(buffer, streamingMessage);
    streamingMessage.streaming = false;
    state.assistantLoaded = true;
  } catch (error) {
    streamingMessage.streaming = false;
    if (!streamingMessage.content && !(streamingMessage.blocks || []).length) {
      state.assistantMessages = state.assistantMessages.filter((item) => item !== streamingMessage);
    }
    state.assistantError = error.name === "AbortError" ? "已停止本次回答" : error.message;
  } finally {
    clearInterval(assistantStageTimer);
    assistantAbortController = null;
    state.assistantLoading = false;
    render();
    scrollXiaocaiToBottom();
  }
}

function stopXiaocai() {var _assistantAbortContro2;
  (_assistantAbortContro2 = assistantAbortController) === null || _assistantAbortContro2 === void 0 || _assistantAbortContro2.abort();
}

function retryXiaocai() {
  const question = state.assistantLastQuestion;
  const last = state.assistantMessages[state.assistantMessages.length - 1];
  if ((last === null || last === void 0 ? void 0 : last.role) === "assistant" && String(last.id || "").startsWith("stream-")) state.assistantMessages.pop();
  const previous = state.assistantMessages[state.assistantMessages.length - 1];
  if ((previous === null || previous === void 0 ? void 0 : previous.role) === "user" && previous.content === question) state.assistantMessages.pop();
  state.assistantError = "";
  sendXiaocai(question);
}

async function resetXiaocaiConversation(confirmMessage) {
  if (state.assistantLoading) return;
  if (confirmMessage && !confirm(confirmMessage)) return;
  try {
    const response = await apiFetch("/api/assistant/history", { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "新对话创建失败");
    state.assistantMessages = [];
    state.assistantError = "";
    state.assistantLastQuestion = "";
    state.assistantLoaded = true;
    render();
    requestAnimationFrame(() => {var _document$getElementB23;return (_document$getElementB23 = document.getElementById("xiaocaiInput")) === null || _document$getElementB23 === void 0 ? void 0 : _document$getElementB23.focus();});
  } catch (error) {
    state.assistantError = error.message;
    render();
  }
}

function newXiaocaiConversation() {
  resetXiaocaiConversation(state.assistantMessages.length ? "开始新对话后，当前对话内容将被清空。确定继续吗？" : "");
}

async function clearXiaocaiHistory() {
  resetXiaocaiConversation("确定清空当前账号最近 30 天的小材聊天记录吗？");
}

function openXiaocaiRoute(route) {
  if (!["dashboard", "customers", "products", "orders"].includes(route)) return;
  state.assistantOpen = false;
  setRoute(route);
}

function dashboardCustomerRowsHtml(rows) {
  return rows.length ? `<div class="dashboard-customer-table">
    <div class="dashboard-customer-row dashboard-customer-row-head"><span>客户</span><span>电话</span><span>销售人员</span><span>本月订单</span><span>本月金额</span><span>首次下单</span></div>
    ${rows.map((item) => `<div class="dashboard-customer-row">
      <strong>${html(item.name || "未知客户")}</strong><span>${html(item.phone || "-")}</span>
      <span>${html((item.salesNames || []).join("、") || "-")}</span><span>${item.orderCount || 0} 单</span>
      <span>${money(item.amount || 0)}</span><span>${html(item.firstOrderDate ? item.firstOrderDate.replace(/-/g, "/") : "-")}</span>
    </div>`).join("")}
  </div>` : `<div class="empty">暂无符合条件的客户</div>`;
}

function dashboardRemoteDetail(data) {
  const type = state.dashboardCustomerDetail;
  if (!type) return "";
  const rows = type === "new" ? data.newCustomers || [] : data.monthCustomers || [];
  const title = type === "new" ? "本月新开客户明细" : "本月下单客户明细";
  return `<section class="dashboard-customer-detail">
    <div class="dashboard-customer-detail-head"><strong>${title}</strong><button type="button" onclick="toggleDashboardCustomerDetail(${jsArg(type)})">收起</button></div>
    ${dashboardCustomerRowsHtml(rows)}
  </section>`;
}

function dashboardTrendHtml(trend) {
  const metric = state.dashboardTrendMetric === "orders" ? "orders" : "sales";
  const points = Array.isArray(trend) ? trend : [];
  const values = points.map((item) => Number(item[metric] || 0));
  const maximum = Math.max(1, ...values);
  const width = 640;
  const height = 168;
  const left = 24;
  const right = width - 24;
  const top = 18;
  const bottom = 132;
  const chartPoints = points.map((item, index) => {
    const x = points.length <= 1 ? left : left + (right - left) * index / (points.length - 1);
    const y = bottom - (bottom - top) * Number(item[metric] || 0) / maximum;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const labelStep = Math.max(1, Math.ceil(points.length / 6));
  const labels = points.map((item, index) => ({ item, index })).filter((entry) => entry.index % labelStep === 0 || entry.index === points.length - 1);
  const total = values.reduce((sum, value) => sum + value, 0);
  return `<section class="dashboard-trend-card" aria-label="本月经营趋势">
    <div class="dashboard-trend-head"><div><strong>经营趋势</strong><span>本月每日${metric === "sales" ? "销售额" : "订单数"}</span></div>
      <div class="dashboard-trend-tabs"><button type="button" class="${metric === "sales" ? "active" : ""}" onclick="setDashboardTrendMetric('sales')">销售额</button><button type="button" class="${metric === "orders" ? "active" : ""}" onclick="setDashboardTrendMetric('orders')">订单数</button></div>
    </div>
    <div class="dashboard-trend-total"><span>本月累计</span><strong>${metric === "sales" ? money(total) : `${total} 单`}</strong></div>
    <div class="dashboard-trend-chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="本月${metric === "sales" ? "销售额" : "订单数"}趋势图">
      <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" class="trend-axis"></line>
      <line x1="${left}" y1="${top + (bottom - top) / 2}" x2="${right}" y2="${top + (bottom - top) / 2}" class="trend-grid"></line>
      ${chartPoints ? `<polyline points="${chartPoints}" class="trend-line"></polyline>` : ""}
      ${points.map((item, index) => {
    const coordinate = chartPoints.split(" ")[index] || `${left},${bottom}`;
    const parts = coordinate.split(",");
    return Number(item[metric] || 0) ? `<circle cx="${parts[0]}" cy="${parts[1]}" r="3.5"><title>${html(item.label)}：${metric === "sales" ? money(item.sales) : `${item.orders} 单`}</title></circle>` : "";
  }).join("")}
      ${labels.map((entry) => {
    const x = points.length <= 1 ? left : left + (right - left) * entry.index / (points.length - 1);
    return `<text x="${x.toFixed(1)}" y="156" text-anchor="middle">${html(entry.item.label)}</text>`;
  }).join("")}
    </svg></div>
  </section>`;
}

function renderDashboardTrend() {
  const container = document.getElementById("dashboardTrendPanel");
  if (container) container.innerHTML = dashboardTrendHtml((state.dashboardData && state.dashboardData.trend) || []);
}

function setDashboardTrendMetric(metric) {
  state.dashboardTrendMetric = metric === "orders" ? "orders" : "sales";
  renderDashboardTrend();
}

function renderDashboardRemote() {
  const data = state.dashboardData;
  if (!data) return `<div class="card card-pad"><div class="empty">${html(state.dashboardError || (state.dashboardLoading ? "正在加载销售概览…" : "销售概览尚未加载"))}</div></div>`;
  const metrics = data.metrics || {};
  const generatedAt = new Date(data.generatedAt || Date.now());
  const counts = data.categoryCounts || {};
  return `<section class="dashboard-metrics">
    ${dashboardSalesFilterHtml()}
    <div class="dashboard-section-head"><strong>本月经营</strong><span>${generatedAt.getFullYear()} 年 ${generatedAt.getMonth() + 1} 月</span></div>
    <div class="dashboard-metric-grid month-metrics">
      ${dashboardMetric("本月销售额", money(metrics.monthSales || 0), "¥", "blue", "除待确认、已取消外，按实际订单金额汇总")}
      ${dashboardMetric("本月下单客户数", metrics.monthCustomerCount || 0, "客", "violet", "本月有效销售单客户去重 · 点击查看", "month")}
      ${dashboardMetric("本月新开客户数", metrics.monthNewCustomerCount || 0, "新", "orange", "首次有效下单发生在本月 · 点击查看", "new")}
      ${dashboardMetric("本月订单数量", metrics.monthOrderCount || 0, "单", "cyan", "除待确认和已取消外的全部订单")}
    </div>
    ${dashboardRemoteDetail(data)}
    <div class="dashboard-section-head today-head"><strong>今日动态</strong><span>${generatedAt.getMonth() + 1} 月 ${generatedAt.getDate()} 日</span></div>
    <div class="dashboard-metric-grid today-metrics">
      ${dashboardMetric("今日销售额", money(metrics.todaySales || 0), "¥", "green", "按今日有效订单实际金额汇总")}
      ${dashboardMetric("今日下单客户数", metrics.todayCustomerCount || 0, "客", "gold", "今日有效销售单客户去重")}
      ${dashboardMetric("今日订单数量", metrics.todayOrderCount || 0, "单", "red", "除待确认和已取消外的全部订单")}
    </div>
    <div id="dashboardTrendPanel">${dashboardTrendHtml(data.trend || [])}</div>
  </section>
  <div class="grid two-col" style="margin-top:16px">
    <div class="card card-pad"><h3>最近订单</h3><div class="order-list">${(data.recentOrders || []).map(orderCard).join("") || `<div class="empty">暂无订单</div>`}</div></div>
    <div class="card card-pad"><h3>高频建材分类</h3>${["水电", "木", "油", "瓦"].map((cat) => `<div class="summary-row"><span>${cat}</span><strong>${Number(counts[cat] || 0)} 件商品</strong></div>`).join("")}<button class="btn primary" style="width:100%;margin-top:14px" onclick="setRoute('create')">开始开单</button></div>
  </div>`;
}

function auditQuery() {var _state$remotePages$au;
  const page = ((_state$remotePages$au = state.remotePages.audit) === null || _state$remotePages$au === void 0 ? void 0 : _state$remotePages$au.page) || 1;
  return queryString({ ...state.auditFilters, page, pageSize: 30 });
}

async function loadAuditLogs(page) {
  if (!isAdmin()) return;
  if (page) state.remotePages.audit = { ...(state.remotePages.audit || {}), page };
  state.auditLoading = true;
  state.auditError = "";
  try {
    const response = await latestApiFetch("audit", `/api/audit-logs${auditQuery()}`);
    if (!response) return;
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "操作日志加载失败");
    state.auditItems = data.items || [];
    state.remotePages.audit = data;
  } catch (error) {
    state.auditError = error.message;
  } finally {
    state.auditLoading = false;
    if (state.route === "audit") renderAuditResults();
  }
}

function updateAuditFilter(key, value) {
  state.auditFilters[key] = value;
  state.remotePages.audit = { ...(state.remotePages.audit || {}), page: 1 };
  clearTimeout(inputRenderTimer);
  inputRenderTimer = setTimeout(() => loadAuditLogs(1), key === "keyword" ? 220 : 0);
}

function auditSummaryText(item) {
  const fields = (item.changedFields || []).join("、");
  return fields || item.message || "-";
}

function auditSummaryHtml(item) {
  const summary = auditSummaryText(item);
  if (!item.before && !item.after) return html(summary);
  return `<details class="audit-change-detail"><summary>${html(summary)}</summary><pre>修改前：${html(JSON.stringify(item.before || {}, null, 2))}\n修改后：${html(JSON.stringify(item.after || {}, null, 2))}</pre></details>`;
}

function auditResultsHtml() {
  const page = state.remotePages.audit || { page: 1, totalPages: 0, total: 0 };
  return `${state.auditError ? `<div class="card card-pad audit-error">${html(state.auditError)}</div>` : ""}
    <div class="card table-wrap audit-table"><table><thead><tr><th>时间</th><th>操作人员</th><th>操作</th><th>业务 / 编号</th><th>修改摘要</th><th>结果</th><th>请求编号</th></tr></thead><tbody>
      ${state.auditItems.map((item) => `<tr><td>${html(String(item.createdAt || "").replace("T", " ").slice(0, 19))}</td><td><strong>${html(item.actorName || "-")}</strong><small>${html(item.actorRole || "")}</small></td><td>${html(item.action || "-")}</td><td>${html(item.entityType || "-")}<small>${html(item.entityId || "")}</small></td><td>${auditSummaryHtml(item)}</td><td><span class="badge ${item.result === "成功" ? "success" : "danger"}">${html(item.result || "-")}</span></td><td><code>${html(item.requestId || "-")}</code></td></tr>`).join("") || `<tr><td colspan="7"><div class="empty">${state.auditLoading ? "正在加载…" : "暂无操作日志"}</div></td></tr>`}
    </tbody></table></div>
    <div class="audit-mobile-list">${state.auditItems.map((item) => `<article class="audit-mobile-item"><div class="audit-mobile-head"><strong>${html(item.action || "-")}</strong><span class="badge ${item.result === "成功" ? "success" : "danger"}">${html(item.result || "-")}</span></div><div class="audit-mobile-meta"><span>${html(String(item.createdAt || "").replace("T", " ").slice(0, 19))}</span><span>${html(item.actorName || "-")} · ${html(item.actorRole || "")}</span></div><div class="audit-mobile-entity"><b>${html(item.entityType || "-")}</b><span>${html(item.entityId || "")}</span></div><div class="audit-mobile-summary">${auditSummaryHtml(item)}</div><code>${html(item.requestId || "-")}</code></article>`).join("") || `<div class="empty">${state.auditLoading ? "正在加载…" : "暂无操作日志"}</div>`}</div>
    ${paginationControls("audit", page.page, page.totalPages, page.total)}`;
}

function renderAuditResults() {
  const container = document.getElementById("auditResultsPanel");
  if (!container) {
    if (state.route === "audit") render();
    return;
  }
  container.innerHTML = auditResultsHtml();
}

function renderAuditCenter() {
  return `<section class="audit-page">
    <div class="mobile-page-tools audit-mobile-tools"><input class="input" placeholder="关键词、编号或请求编号" value="${html(state.auditFilters.keyword)}" oninput="updateAuditFilter('keyword',this.value)" /><button type="button" class="btn mobile-filter-button" onclick="toggleMobileFilter('audit')">筛选</button><button type="button" class="btn" onclick="exportAuditLogs()">导出</button></div>
    <div class="mobile-filter-chips">${mobileFilterChip("开始", state.auditFilters.startDate, "updateAuditFilter('startDate','')")}${mobileFilterChip("结束", state.auditFilters.endDate, "updateAuditFilter('endDate','')")}${mobileFilterChip("业务", state.auditFilters.entityType, "updateAuditFilter('entityType','')")}${mobileFilterChip("结果", state.auditFilters.result, "updateAuditFilter('result','')")}</div>
    <div class="card card-pad audit-filter-card desktop-audit-filter">
      <div class="audit-filter-grid">
        <input class="input" type="date" value="${html(state.auditFilters.startDate)}" onchange="updateAuditFilter('startDate',this.value)" title="开始日期" />
        <input class="input" type="date" value="${html(state.auditFilters.endDate)}" onchange="updateAuditFilter('endDate',this.value)" title="结束日期" />
        <select class="select" onchange="updateAuditFilter('actorId',this.value)"><option value="">全部操作人员</option>${salesUsers.map((user) => `<option value="${html(user.id)}" ${state.auditFilters.actorId === user.id ? "selected" : ""}>${html(user.name)}</option>`).join("")}</select>
        <select class="select" onchange="updateAuditFilter('entityType',this.value)"><option value="">全部业务类型</option>${optionList(["账号", "客户", "商品", "订单", "成本", "人员", "操作日志", "批量数据"], state.auditFilters.entityType)}</select>
        <select class="select" onchange="updateAuditFilter('result',this.value)"><option value="">全部结果</option><option ${state.auditFilters.result === "成功" ? "selected" : ""}>成功</option><option ${state.auditFilters.result === "失败" ? "selected" : ""}>失败</option></select>
        <input class="input" placeholder="关键词、编号或请求编号" value="${html(state.auditFilters.keyword)}" oninput="updateAuditFilter('keyword',this.value)" />
        <button class="btn" onclick="exportAuditLogs()">导出 CSV</button>
      </div>
    </div>
    <div id="auditResultsPanel">${auditResultsHtml()}</div>
  </section>`;
}

async function exportAuditLogs() {
  try {
    const response = await apiFetch(`/api/audit-logs/export${queryString(state.auditFilters)}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "日志导出失败");
    }
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `操作日志-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  } catch (error) {
    alert(error.message);
  }
}

function bindCartPersistenceGuards() {
  if (window.__buildingSalesCartPersistenceBound) return;
  const saveCurrentCart = () => {
    if (state.user) persistCart(state.orderType, false);
  };
  window.addEventListener("pagehide", saveCurrentCart);
  window.addEventListener("beforeunload", saveCurrentCart);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveCurrentCart();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.modal) {
      event.preventDefault();
      closeModal();
    } else if (state.mobileCartOpen) {
      event.preventDefault();
      closeMobileCart();
    } else if (state.mobileFilterOpen) {
      event.preventDefault();
      closeMobileFilter();
    } else if (state.mobileMoreOpen) {
      event.preventDefault();
      closeMobileMore();
    } else if (state.assistantOpen) {
      event.preventDefault();
      toggleXiaocai();
    }
  });
  window.__buildingSalesCartPersistenceBound = true;
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
  toggleMobileOrderDetails,
  openCreateCustomerPicker,
  closeCreateCustomerPicker,
  updateCreateCustomerSearch,
  setOrderSalesperson,
  toggleDashboardSalesMenu,
  toggleDashboardSalesperson,
  clearDashboardSalespeople,
  toggleDashboardCustomerDetail,
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
  selectAiCandidateChoice,
  updateAiNavQuantity,
  setAiActiveGroup,
  setAiSourceEditorOpen,
  setAiAliasConsent,
  setAiResultActive,
  removeAiMatchedLine,
  openModal,
  closeModal,
  updateOrderStatus,
  updateOrderPayment,
  saveActualPaymentAmount,
  downloadOrderImage,
  downloadDeliveryImage,
  copyOrderText,
  exportOrderImage,
  login,
  logout,
  toggleLoginPassword,
  toggleMobileCart,
  closeMobileCart,
  setCartQuantity,
  setCartPrice,
  removeCartItem,
  saveOrder,
  toggleXiaocai,
  openXiaocai,
  sendXiaocai,
  stopXiaocai,
  retryXiaocai,
  clearXiaocaiHistory,
  openXiaocaiRoute,
  handleXiaocaiKey
});

bindGlobalClickHandlers();
bindTextCompositionGuards();
bindCartPersistenceGuards();
boot();
