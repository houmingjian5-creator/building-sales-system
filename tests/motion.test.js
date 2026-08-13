const assert = require("assert");
const fs = require("fs");
const path = require("path");

const appSource = fs.readFileSync(path.join(__dirname, "../public/app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(__dirname, "../public/index.html"), "utf8");
const motionSource = fs.readFileSync(path.join(__dirname, "../public/motion.css"), "utf8");
assert(motionSource.includes(".ai-modal .ai-group-editor") && motionSource.includes("transition: none !important"), "AI 分类窗口切换不能播放闪烁动效");

assert(indexSource.includes("motion.css?v="), "The final motion stylesheet must be loaded with a cache version");
assert(indexSource.indexOf("motion.css") > indexSource.indexOf("mobile-v2.css"), "Motion styles must load after layout styles");
assert(motionSource.includes("--motion-fast: 120ms"), "Fast interaction feedback must remain concise");
assert(motionSource.includes("--motion-slow: 220ms"), "Drawer motion must remain within the approved duration");
assert(motionSource.includes("prefers-reduced-motion: reduce"), "Reduced-motion users must be supported");
assert(motionSource.includes("transform") && motionSource.includes("opacity"), "Motion should use compositor-friendly properties");
assert(appSource.includes('lastRenderedRoute !== state.route'), "Page entry motion must only run on real route changes");
assert(appSource.includes('class="content ${routeChanged ? "motion-page-enter" : ""}"'), "The route-change marker must be applied to page content");
assert(appSource.includes('closeWithMotion("modal"'), "Modals must have an exit motion path");
assert(appSource.includes('closeWithMotion("mobileCart"'), "The cart drawer must have an exit motion path");
assert(appSource.includes('pulseMotion(".cart-line-total'), "Cart values must update immediately with short emphasis");

console.log("Motion interaction tests passed");
