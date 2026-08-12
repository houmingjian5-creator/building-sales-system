const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const app = fs.readFileSync(path.join(root, "public", "app.js"), "utf8");
const styles = fs.readFileSync(path.join(root, "public", "styles.css"), "utf8");
const motion = fs.readFileSync(path.join(root, "public", "motion.css"), "utf8");

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
const documentModalSource = app.slice(app.indexOf("function documentModal"), app.indexOf("function userModal"));
assert(
  documentModalSource.includes("orderForDocument(id)") && documentModalSource.includes("if (!order)") && documentModalSource.includes("orderCustomerForDisplay(order)"),
  "Order details must render from the order customer snapshot even when the customer page has not been loaded."
);
assert(
  !documentModalSource.includes("byId(customers, order.customerId)"),
  "Order details must not depend on the lazily loaded global customer list."
);
const testOrder = {
  id: "order-lazy-customer",
  no: "ORD-LAZY-CUSTOMER",
  customerId: "customer-not-loaded",
  customerName: "订单快照客户",
  customerPhone: "13800000000",
  customerAddress: "订单快照地址",
  salesUserId: "sales-1",
  date: "2026/8/11",
  status: "待确认",
  amount: 100,
  items: []
};
const renderDocumentWithoutCustomers = new Function(
  "orderForDocument", "byId", "salesUsers", "orderCustomerForDisplay", "getDisplayRows", "html", "svgIcon", "money", "orderAddressForDisplay", "amountToChinese",
  `${documentModalSource}; return documentModal;`
)(
  (id) => id === testOrder.id ? testOrder : null,
  (list, id) => list.find((item) => item.id === id),
  [{ id: "sales-1", name: "测试销售", phone: "13900000000" }],
  (order) => ({ name: order.customerName, phone: order.customerPhone, address: order.customerAddress }),
  () => [],
  (value) => String(value == null ? "" : value),
  () => "<svg></svg>",
  (value) => `¥${Number(value || 0)}`,
  (order, customer) => order.address || customer.address || "",
  () => "壹佰元整"
);
assert(
  renderDocumentWithoutCustomers(testOrder.id).includes("订单快照客户"),
  "The order detail modal must open from order snapshot data before customers are loaded."
);

assert(
  app.includes("syncOrderPopoverLayer") && app.includes("has-open-popover"),
  "Opening an order popover must elevate its containing order card."
);
assert(
  styles.includes(".order-card.order-card-polished.has-open-popover") && styles.includes("z-index: 100"),
  "Open order popovers must render above following order cards."
);
assert(
  !motion.includes(".order-card:hover"),
  "Order cards must not rise when hovered."
);

console.log("Order document and modal regression tests passed");
