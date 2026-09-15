"use strict";

const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const alerts = [];
const context = vm.createContext({
  console: console, URLSearchParams: URLSearchParams, setTimeout: function () {},
  alert: function (message) { alerts.push(message); }, render: function () {},
  html: function (value) { return String(value == null ? "" : value); },
  document: { querySelectorAll: function () { return []; }, getElementById: function () { return null; } },
  state: { user: { id: "a" }, route: "leads", leadsCapability: { enabled: false } }
});
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "public", "leads.js"), "utf8"), context);

vm.runInContext("leadsState.selected=[]; leadSelect('a',true); leadSelect('b',true); leadSelect('a',false)", context);
assert.deepStrictEqual(Array.from(vm.runInContext("leadsState.selected", context)), ["b"]);

vm.runInContext("leadsState.selected=['old']; leadSelectPage({checked:true,dataset:{leadPageIds:'p1,p2'}})", context);
assert.deepStrictEqual(Array.from(vm.runInContext("leadsState.selected", context)), ["old", "p1", "p2"]);
vm.runInContext("leadSelectPage({checked:false,dataset:{leadPageIds:'p1,p2'}})", context);
assert.deepStrictEqual(Array.from(vm.runInContext("leadsState.selected", context)), ["old"], "unselect page keeps selections from other pages");

vm.runInContext("leadsState.selected=Array.from({length:90},(_,i)=>'x'+i)", context);
vm.runInContext("leadSelectPage({checked:true,dataset:{leadPageIds:Array.from({length:20},(_,i)=>'p'+i).join(',')}})", context);
assert.strictEqual(vm.runInContext("leadsState.selected.length", context), 90, "over-limit page select changes nothing");
assert(alerts.some(function (message) { return message.indexOf("超过100条") >= 0; }));

vm.runInContext("leadsState.selected=['cross-page']; leadPage(1)", context);
assert.deepStrictEqual(Array.from(vm.runInContext("leadsState.selected", context)), ["cross-page"], "ordinary paging preserves selection");
vm.runInContext("leadTaskPage('priority',1)", context);
assert.deepStrictEqual(Array.from(vm.runInContext("leadsState.selected", context)), ["cross-page"], "task group paging preserves selection");
vm.runInContext("jumpInput={value:'7'}; document.getElementById=id=>jumpInput; leadsState.page=1; leadPageJump(12)", context);
assert.strictEqual(vm.runInContext("leadsState.page", context), 7, "ordinary page jump accepts an arbitrary valid page");
vm.runInContext("jumpInput.value='3'; leadsState.taskPages.priority=1; leadTaskPageJump('priority',5)", context);
assert.strictEqual(vm.runInContext("leadsState.taskPages.priority", context), 3, "task tier page jump updates that tier only");
vm.runInContext("jumpInput.value='9'; leadsState.taskPages.priority=3; leadTaskPageJump('priority',5)", context);
assert.strictEqual(vm.runInContext("leadsState.taskPages.priority", context), 3, "out-of-range page jump changes nothing");
assert(alerts.some(function (message) { return message.indexOf("1至5") >= 0; }));
vm.runInContext("pageBox={dataset:{leadPageIds:'p1,p2'},checked:false,indeterminate:false}; rowBox={dataset:{leadId:'p1'},checked:false}; document.querySelectorAll=s=>s==='[data-lead-page-select]'?[pageBox]:s==='[data-lead-id]'?[rowBox]:[]; leadsState.selected=['p1']; leadSyncSelectionControls()", context);
assert.strictEqual(vm.runInContext("pageBox.indeterminate", context), true, "partially selected page has an indeterminate checkbox");
assert.strictEqual(vm.runInContext("rowBox.checked", context), true);
vm.runInContext("leadsState.selected=['kept']; leadSort('count_desc')", context);
assert.strictEqual(vm.runInContext("leadsState.selected.length", context), 0, "sort changes clear selection");
vm.runInContext("leadsState.selected=['kept']; leadOwnerFilter('b')", context);
assert.strictEqual(vm.runInContext("leadsState.selected.length", context), 0, "owner filter changes clear selection");
vm.runInContext("leadTab('mine')", context);
assert.strictEqual(vm.runInContext("leadsState.selected.length", context), 0, "tab changes clear selection");
const mineList = vm.runInContext("renderLeadMineList([{id:'mine-1',name:'王师傅',phone:'13800000001',tags:'工人',intent:'high',lastFollowupAt:'2026-09-14T00:00:00Z',lastFollowupContent:'确认明天下午送样',followupCount:3,createdAt:'2026-09-01T00:00:00Z'}])", context);
assert(mineList.includes("lead-list-mine") && mineList.includes("确认明天下午送样") && mineList.includes("3 次"));
const taskList = vm.runInContext("renderLeadTaskList([{id:'task-1',name:'陈经理',phone:'13900000001',reason:'最近有效订单距今26天，订单后尚未跟进',reasonShort:'订单后26天未跟进',tags:'装修公司负责人/工长',orderAmount:12860,orderCount:3,lastOrderAt:'2026/8/19',lastFollowupAt:null,lastFollowupContent:'',followupCount:0}],'priority')", context);
assert(taskList.includes("lead-list-tasks") && taskList.includes("订单后26天未跟进") && taskList.includes("¥12,860.00") && taskList.includes("暂无跟进内容"));
const jumpUi = vm.runInContext("renderLeadPageJump('lead-page-jump',2,51,20,'leadPageJump')", context);
assert(jumpUi.includes('max="3"') && jumpUi.includes("跳转"));

console.log("lead cross-page selection and 100-item limit tests passed");
