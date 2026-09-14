"use strict";

const assert = require("assert"), fs = require("fs"), path = require("path"), vm = require("vm");
const alerts = [];
const context = vm.createContext({
  console: console, URLSearchParams: URLSearchParams, setTimeout: function () {},
  alert: function (message) { alerts.push(message); }, render: function () {},
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
vm.runInContext("pageBox={dataset:{leadPageIds:'p1,p2'},checked:false,indeterminate:false}; rowBox={dataset:{leadId:'p1'},checked:false}; document.querySelectorAll=s=>s==='[data-lead-page-select]'?[pageBox]:s==='[data-lead-id]'?[rowBox]:[]; leadsState.selected=['p1']; leadSyncSelectionControls()", context);
assert.strictEqual(vm.runInContext("pageBox.indeterminate", context), true, "partially selected page has an indeterminate checkbox");
assert.strictEqual(vm.runInContext("rowBox.checked", context), true);
vm.runInContext("leadsState.selected=['kept']; leadSort('count_desc')", context);
assert.strictEqual(vm.runInContext("leadsState.selected.length", context), 0, "sort changes clear selection");
vm.runInContext("leadsState.selected=['kept']; leadOwnerFilter('b')", context);
assert.strictEqual(vm.runInContext("leadsState.selected.length", context), 0, "owner filter changes clear selection");
vm.runInContext("leadTab('mine')", context);
assert.strictEqual(vm.runInContext("leadsState.selected.length", context), 0, "tab changes clear selection");

console.log("lead cross-page selection and 100-item limit tests passed");
