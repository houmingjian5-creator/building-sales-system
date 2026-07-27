const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const childProcess = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DB_PATH = path.join(ROOT, "data", "db.json");
const BACKUP_DIR = path.join(ROOT, "data", "backups");

function timestamp(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "-",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function pruneBackups(retentionDays) {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  fs.readdirSync(BACKUP_DIR).forEach((name) => {
    if (!/^db-\d{8}-\d{6}\.json\.gz(?:\.sha256)?$/.test(name)) return;
    const filePath = path.join(BACKUP_DIR, name);
    if (fs.statSync(filePath).mtimeMs < cutoff) fs.unlinkSync(filePath);
  });
}

function uploadToOss(archivePath, checksumPath) {
  const target = String(process.env.OSS_BACKUP_URI || "").replace(/\/+$/, "");
  if (!target) return;
  if (!/^oss:\/\/[^/]+(?:\/.*)?$/.test(target)) {
    throw new Error("OSS_BACKUP_URI must use the oss://bucket/path format");
  }
  const executable = process.env.OSSUTIL_BIN || "ossutil";
  [archivePath, checksumPath].forEach((filePath) => {
    const result = childProcess.spawnSync(executable, [
      "cp",
      "-f",
      filePath,
      `${target}/${path.basename(filePath)}`,
    ], { stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`OSS upload failed with exit code ${result.status}`);
  });
}

function createBackup() {
  const raw = fs.readFileSync(DB_PATH);
  JSON.parse(raw.toString("utf8"));
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const archivePath = path.join(BACKUP_DIR, `db-${timestamp(new Date())}.json.gz`);
  const compressed = zlib.gzipSync(raw, { level: 9 });
  fs.writeFileSync(archivePath, compressed, { mode: 0o600 });
  const checksum = crypto.createHash("sha256").update(compressed).digest("hex");
  const checksumPath = `${archivePath}.sha256`;
  fs.writeFileSync(checksumPath, `${checksum}  ${path.basename(archivePath)}\n`, { mode: 0o600 });
  const retentionDays = Math.max(1, Number(process.env.BACKUP_RETENTION_DAYS || 30));
  pruneBackups(retentionDays);
  uploadToOss(archivePath, checksumPath);
  return { archivePath, checksumPath, checksum };
}

if (require.main === module) {
  try {
    const result = createBackup();
    console.log(`Database backup created: ${result.archivePath}`);
    console.log(`SHA256: ${result.checksum}`);
  } catch (error) {
    console.error(`Database backup failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { createBackup };
