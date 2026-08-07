const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "public", "styles.css"), "utf8");

assert(
  !/class="modal-backdrop"[^>]*onclick=/.test(app),
  "Modal backdrops must not close dialogs and discard unsaved work."
);
assert(
  /function resetOrderDraft[\s\S]*?state\.orderAddress = ""/.test(app),
  "Selecting a customer must start with a blank order address."
);
assert(
  app.includes("customerOrderAddresses") && app.includes("address-history-menu"),
  "Create and edit order forms must expose customer address history."
);
assert(
  app.includes('class="doc-remark"') && styles.includes(".doc-remark"),
  "Sales order documents must render the saved order remark."
);
assert(
  app.includes('销售电话：</strong>${html(') && app.includes('s.phone) || "-")}'),
  "Sales order documents must show the salesperson login phone in full."
);
assert(
  app.includes("drawWrappedText(ctx, remark"),
  "Image exports must render wrapped remarks."
);

console.log("Order document and modal regression tests passed");
