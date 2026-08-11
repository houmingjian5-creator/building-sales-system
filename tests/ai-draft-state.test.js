const assert = require("assert");
const fs = require("fs");
const path = require("path");

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");

function functionSource(name, nextName) {
  const start = appSource.indexOf(`function ${name}`);
  const end = appSource.indexOf(`function ${nextName}`, start);
  assert(start >= 0 && end > start, `找不到函数 ${name}`);
  return appSource.slice(start, end);
}

const groupSwitchSource = functionSource("setAiActiveGroup", "setAiSourceEditorOpen");
assert(groupSwitchSource.includes("state.aiActiveGroupId = groupId"), "分类切换必须只更新当前分类");
assert(!groupSwitchSource.includes("state.aiDraft = null"), "分类切换不能清空 AI 草稿");

["addAiGroup", "removeAiGroup", "setAiGroupCategory", "setAiGroupSubcategory", "updateAiGroupText"].forEach((name, index, names) => {
  const nextName = names[index + 1] || "setAiActiveGroup";
  const source = functionSource(name, nextName);
  assert(!source.includes("state.aiDraft = null"), `${name} 不能在重新识别前清空 AI 草稿`);
});

const selectionSource = functionSource("selectAiCandidateChoice", "updateAiNavStatus");
assert(selectionSource.includes("persistAiDraftProductSelection"), "人工选择商品必须立即写入 AI 草稿");

const quantitySource = functionSource("updateAiNavQuantity", "setAiResultActive");
assert(quantitySource.includes("updateAiDraftQuantity"), "修改数量必须立即写入 AI 草稿");

const deleteSource = functionSource("removeAiMatchedLine", "renderAiNeedsQuantity");
assert(deleteSource.includes("entry.item.userDeleted = true"), "删除商品必须写入 AI 草稿");
assert(deleteSource.includes("render()"), "删除后必须从草稿重新渲染");

const draftItemsSource = functionSource("aiDraftItems", "aiStatusSummary");
assert(draftItemsSource.includes("if (item.userDeleted) return"), "重新渲染时必须保持人工删除结果");
assert(draftItemsSource.includes("item.selectedProductId"), "重新渲染时必须保持人工选择商品");

const applySource = functionSource("applyAiDraft", "saveOrder");
assert(applySource.includes("aiDraftItems(state.aiDraft)"), "填入开单页面必须以持久化 AI 草稿为准");
assert(!applySource.includes('document.querySelectorAll("[data-ai-matched-line]")'), "填入开单页面不能再依赖易丢失的临时 DOM 状态");

const analyzeSource = functionSource("analyzeAiOrder", "addDraftLine");
assert(analyzeSource.includes("state.aiDraftDirty"), "已有人工修改时重新识别必须检测草稿状态");
assert(analyzeSource.includes("重新识别会重新生成全部匹配结果"), "重新识别覆盖人工修改前必须明确确认");
assert(analyzeSource.includes("timeoutMs: 65000"), "AI 开单必须允许模型在普通接口超时后继续完成识别");
assert(!analyzeSource.includes("setTimeout(() => controller.abort()"), "AI 开单不能保留与统一请求层冲突的重复计时器");

const modalSource = functionSource("aiOrderModal", "renderAiDraft");
assert(modalSource.includes("setAiActiveGroup"), "分类标签必须使用不清空草稿的切换函数");
assert(modalSource.includes("state.aiSourceEditorOpen"), "查看分类原文时必须保持展开状态");
assert(modalSource.includes("productPrimaryCategories()"), "AI 开单一级分类必须使用完整产品分类目录");
assert(modalSource.includes("productSubcategoriesFor(activeGroup.cat1)"), "AI 开单二级分类不能只从当前商品分页生成");

const categorySource = functionSource("productPrimaryCategories", "productSubcategoriesFor");
const subcategorySource = functionSource("productSubcategoriesFor", "jsArg");
assert(categorySource.includes("state.productCategories"), "完整产品分类目录必须来自精简启动接口");
assert(subcategorySource.includes("catalogItems.concat(loadedItems)"), "分类目录应兼容当前已加载商品中的新分类");

const openSource = functionSource("openAiOrderModal", "addAiGroup");
assert(openSource.includes("if (!state.aiGroups.length || aiSessionChanged)"), "关闭后重新打开同一客户的 AI 开单必须恢复未保存草稿");
assert(openSource.includes("aiSessionChanged"), "切换客户或销售/退货类型时必须开启独立 AI 草稿");

console.log("AI draft state persistence tests passed");
