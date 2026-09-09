"use strict";
// Run the existing suite against a temporary copy. Never load server.js from the
// working repository: module initialization may prune runtime session/audit files.
const fs = require("fs"), os = require("os"), path = require("path"), cp = require("child_process");
const root = path.resolve(__dirname, "..");
const temp = fs.mkdtempSync(path.join(os.tmpdir(), "building-sales-check-"));
function copy(source, target) {
  if (fs.statSync(source).isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    fs.readdirSync(source).forEach(name => copy(path.join(source, name), path.join(target, name)));
  } else fs.copyFileSync(source, target);
}
try {
  ["server.js", "public", "tests", "leads"].forEach(name => copy(path.join(root, name), path.join(temp, name)));
  fs.mkdirSync(path.join(temp, "data"));
  // Existing AI catalog tests depend on the working product catalog. The source
  // is copied byte-for-byte; no customer or order values are printed by this runner.
  fs.copyFileSync(path.join(root, "data", "db.json"), path.join(temp, "data", "db.json"));
  const env = Object.assign({}, process.env, { NODE_PATH: path.join(root, "node_modules"), LEADS_ENABLED: "0", LEADS_ACTIVE: "0",
    RUNTIME_SESSION_PATH: path.join(temp, "data", "sessions.json"), AUDIT_LOG_DIR: path.join(temp, "data", "audit") });
  const suites = fs.readdirSync(path.join(temp, "tests")).filter(name => /\.test\.js$/.test(name));
  for (const suite of suites) {
    const run = cp.spawnSync(process.execPath, [path.join(temp, "tests", suite)], { cwd: temp, env, stdio: "inherit" });
    if (run.error) throw run.error;
    if (run.status !== 0) { process.exitCode = run.status || 1; break; }
  }
} finally {
  const resolved = path.resolve(temp), base = path.resolve(os.tmpdir()) + path.sep;
  if (!resolved.startsWith(base) || !path.basename(resolved).startsWith("building-sales-check-")) throw new Error("Unsafe test cleanup path");
  if (fs.rmSync) fs.rmSync(resolved, { recursive: true, force: true });
  else fs.rmdirSync(resolved, { recursive: true });
}
