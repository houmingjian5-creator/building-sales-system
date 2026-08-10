const assert = require("assert");
const fs = require("fs");
const path = require("path");

const source = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");

function functionSource(name, nextName) {
  const start = source.indexOf(`function ${name}`);
  const next = nextName ? source.indexOf(`function ${nextName}`, start + 1) : -1;
  assert(start >= 0, `缺少函数 ${name}`);
  return source.slice(start, next > start ? next : start + 1800);
}

assert(!source.includes("function renderKeepingInput"), "输入时不能靠整页重绘后重新聚焦补救");
assert(!functionSource("showToast", "scheduleInputRender").includes("render();"), "提示消息消失时不能整页重绘打断输入");
assert(functionSource("updatePageQuery", "toggleLoginPassword").includes("renderCustomerResults"), "客户搜索只能局部更新结果");
assert(functionSource("updateProductQuery", "setProductCategory").includes("renderProductTableResults"), "产品搜索只能局部更新结果");
assert(functionSource("updateProductQuery", "setProductCategory").includes("renderCreateProductResults"), "开单商品搜索只能局部更新结果");
assert(functionSource("updateOrderQuery", "updateOrderSalesFilter").includes("renderOrderResults"), "订单搜索只能局部更新结果");
assert(functionSource("setCostQuery", "setCostStatusFilter").includes("loadCostControl"), "成本搜索必须使用防抖加载");
assert(source.includes('id="costLiveResults"'), "成本搜索结果必须有独立更新区域");
assert(source.includes('id="auditResultsPanel"'), "日志搜索结果必须有独立更新区域");
assert(functionSource("refreshEditProductPicker", "addEditOrderProduct").includes("currentResults.replaceWith"), "订单编辑商品搜索必须保留原输入框 DOM");
assert(source.includes("compositionstart") && source.includes("compositionend"), "动态搜索必须兼容中文输入法组词");

console.log("Stable input focus tests passed");
