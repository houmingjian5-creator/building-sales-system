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
assert(mobileMoreSource.includes('isAdmin() ? mobileMoreRouteButton("users"'), "人员管理必须继续受管理员权限控制");
assert(mobileMoreSource.includes('isAdmin() ? mobileMoreRouteButton("costs"'), "成本控制必须继续受管理员权限控制");

const mobileCartSource = appSource.slice(
  appSource.indexOf("function renderMobileCart"),
  appSource.indexOf("function toggleMobileCart")
);
assert(mobileCartSource.includes("state.cart.map(cartLine)"), "手机购物车必须复用现有购物车行");
assert(mobileCartSource.includes('onclick="saveOrder()"'), "手机购物车必须复用现有订单保存流程");
assert(mobileCartSource.includes("env(") === false, "安全区应由样式处理而不是写入业务脚本");

const finalCreateOrder = appSource.slice(
  appSource.lastIndexOf("function renderCreateOrder"),
  appSource.indexOf("async function saveOrder()", appSource.lastIndexOf("function renderCreateOrder"))
);
assert(finalCreateOrder.includes("mobile-product-filters"), "手机商品搜索和分类必须有独立的吸顶容器");
assert(finalCreateOrder.includes("create-product-layout"), "开单商品区必须提供手机布局挂载类");

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
assert(mobileStyles.includes("env(safe-area-inset-bottom)"), "手机底部控件必须兼容全面屏安全区");
assert(mobileStyles.includes(".modal-backdrop"), "手机弹层必须覆盖底部导航和结算条");
assert(mobileStyles.includes(".dashboard-metric-grid.month-metrics"), "手机概览指标必须单独优化");
assert(mobileStyles.includes("grid-template-columns: repeat(2"), "手机概览指标必须采用两列布局");
assert(mobileStyles.includes(".xiaocai-assistant.has-mobile-cart:not(.is-open)"), "小材入口必须避让手机购物车");
assert(mobileStyles.includes("height: 100dvh"), "手机 AI 对话和弹层必须使用动态视口高度");
assert(mobileStyles.includes(".order-icon-toolbar .order-action-edit"), "手机订单次要操作必须收进更多菜单");

console.log("Mobile sales workflow layout tests passed");
