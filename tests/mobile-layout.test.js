const assert = require("assert");
const fs = require("fs");
const path = require("path");

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
const stylesSource = fs.readFileSync(path.join(__dirname, "../public/styles.css"), "utf8");

const renderShellSource = appSource.slice(
  appSource.indexOf("function render()"),
  appSource.indexOf("function renderLogin", appSource.indexOf("function render()"))
);
assert(renderShellSource.includes("renderMobileNavigation()"), "登录后页面必须渲染手机底部导航");
assert(renderShellSource.includes("renderMobileMoreSheet()"), "登录后页面必须渲染手机更多功能抽屉");
assert(renderShellSource.includes("renderMobileCart()"), "登录后页面必须渲染手机购物车入口");
assert(renderShellSource.includes("has-mobile-cart"), "开单页面必须标记手机购物车占位状态");
assert(renderShellSource.includes("route-${html(state.route)}"), "页面外壳必须提供路由类以隔离各手机页面布局");

const mobileNavigationSource = appSource.slice(
  appSource.indexOf("function renderMobileNavigation"),
  appSource.indexOf("function mobileMoreRouteButton")
);
["dashboard", "customers", "create", "orders"].forEach((route) => {
  assert(mobileNavigationSource.includes(`mobilePrimaryRouteButton("${route}"`), `手机主导航必须包含 ${route}`);
});
assert(mobileNavigationSource.includes("toggleMobileMore()"), "手机主导航必须包含更多入口");

const mobileMoreSource = appSource.slice(
  appSource.indexOf("function renderMobileMoreSheet"),
  appSource.indexOf("function toggleMobileMore")
);
assert(mobileMoreSource.includes('mobileMoreRouteButton("products"'), "更多抽屉必须包含产品管理");
assert(mobileMoreSource.includes('mobileMoreRouteButton("returns"'), "更多抽屉必须包含退货开单");
assert(mobileMoreSource.includes('class="mobile-assistant-entry"'), "更多抽屉必须包含固定的小材入口");
assert(mobileMoreSource.includes('isAdmin() ? mobileMoreRouteButton("users"'), "人员管理必须继续受管理员权限控制");
assert(mobileMoreSource.includes('isAdmin() ? mobileMoreRouteButton("costs"'), "成本控制必须继续受管理员权限控制");

const mobileCartSource = appSource.slice(
  appSource.indexOf("function renderMobileCart"),
  appSource.indexOf("function toggleMobileCart")
);
assert(mobileCartSource.includes("state.cart.map(cartLine)"), "手机购物车必须复用现有购物车行");
assert(mobileCartSource.includes('onclick="saveOrder()"'), "手机购物车必须复用现有订单保存流程");
assert(mobileCartSource.includes('class="cart-drawer'), "电脑和手机必须复用同一购物车抽屉");
assert(mobileCartSource.includes("env(") === false, "安全区应由样式处理而不是写入业务脚本");

const finalCreateOrder = appSource.slice(
  appSource.lastIndexOf("function renderCreateOrder"),
  appSource.indexOf("async function saveOrder()", appSource.lastIndexOf("function renderCreateOrder"))
);
assert(finalCreateOrder.includes("mobile-product-filters"), "手机商品搜索和分类必须有独立的吸顶容器");
assert(finalCreateOrder.includes("create-product-layout"), "开单商品区必须提供手机布局挂载类");
assert(finalCreateOrder.includes("create-order-meta-card"), "开单资料区必须提供紧凑手机布局挂载类");
assert(finalCreateOrder.includes("create-order-summary"), "手机开单客户和配送信息必须提供可展开摘要");
assert(finalCreateOrder.includes("desktopCartButton()"), "电脑商品搜索栏必须包含购物车按钮");
assert(!finalCreateOrder.includes('<aside class="card card-pad cart">'), "电脑端不得继续显示常驻右侧购物车");

const finalSetRoute = appSource.slice(
  appSource.lastIndexOf("function setRoute"),
  appSource.indexOf("function handleRouteClick", appSource.lastIndexOf("function setRoute"))
);
assert(finalSetRoute.includes("state.mobileMoreOpen = false"), "切换页面时必须关闭更多抽屉");
assert(finalSetRoute.includes("state.mobileCartOpen = false"), "切换页面时必须关闭购物车抽屉");

const mobileStyles = stylesSource.slice(stylesSource.indexOf("/* Mobile sales workflow */"));
assert(mobileStyles.includes("@media (max-width: 720px)"), "手机布局断点必须统一为 720px");
assert(mobileStyles.includes("grid-template-columns: repeat(5"), "手机底部导航必须固定为五个入口");
assert(mobileStyles.includes(".mobile-cart-bar"), "手机端必须提供固定购物车结算条");
assert(stylesSource.includes("Shared cart drawer and resilient product cards"), "电脑端必须提供右侧购物车抽屉和响应式商品卡片");
assert(stylesSource.includes("width: min(520px"), "电脑购物车抽屉宽度必须约为 520px");
assert(stylesSource.includes("max-width: 1179px"), "中等宽度窗口必须在控件拥挤前切换单列商品卡");
assert(mobileStyles.includes("env(safe-area-inset-bottom)"), "手机底部控件必须兼容全面屏安全区");
assert(mobileStyles.includes(".modal-backdrop"), "手机弹层必须覆盖底部导航和结算条");
assert(mobileStyles.includes(".dashboard-metric-grid.month-metrics"), "手机概览指标必须单独优化");
assert(mobileStyles.includes("grid-template-columns: repeat(2"), "手机概览指标必须采用两列布局");
assert(renderShellSource.includes('class="side-assistant-entry'), "电脑侧栏必须包含固定的小材入口");
assert(appSource.includes('if (!state.user || !state.assistantOpen) return "";'), "小材关闭时不得渲染悬浮入口");
assert(!appSource.includes('class="xiaocai-launcher"'), "电脑和手机端不得继续渲染悬浮小材按钮");
assert(mobileStyles.includes("height: 100dvh"), "手机 AI 对话和弹层必须使用动态视口高度");
assert(mobileStyles.includes(".order-icon-toolbar .order-action-edit"), "手机订单次要操作必须收进更多菜单");
assert(mobileStyles.includes(".product-card > :nth-child(2)"), "手机商品文字区域必须允许收缩，不能把加购按钮挤出屏幕");
assert(mobileStyles.includes(".product-card .product-thumb-button.catalog"), "手机商品缩略图尺寸必须与卡片网格列一致");
assert(appSource.includes('<td class="product-actions-cell"><div class="row-actions">'), "商品表格操作按钮必须包在正常表格单元格内，避免手机端错行");
assert(appSource.includes('class="product-mobile-list"'), "产品管理必须提供不依赖横向表格的手机商品列表");
assert(mobileStyles.includes("Mobile table-card hybrid layout (option D)"), "手机端必须采用已确认的 D 版表卡混合布局");
assert(mobileStyles.includes(".create-product-column .product-card-qty"), "D 版已选商品数量控件必须固定在商品行右侧");
assert(mobileStyles.includes(".route-products .product-table"), "手机产品管理必须隐藏桌面宽表格");
assert(mobileStyles.includes(".product-mobile-item"), "手机产品管理必须渲染紧凑商品卡片");
assert(mobileStyles.includes(".create-product-layout,"), "开单商品列必须限制手机端宽度，避免分类标签撑宽页面");
assert(mobileStyles.includes(".mobile-product-filters .subcategory-panel-head"), "手机二级分类必须移除占高的大标题面板");
assert(appSource.includes('class="user-mobile-list"'), "人员管理必须提供手机表卡列表");
assert(mobileStyles.includes(".route-costs .cost-summary-grid"), "成本控制五项指标必须提供手机紧凑布局");

console.log("Mobile sales workflow layout tests passed");
