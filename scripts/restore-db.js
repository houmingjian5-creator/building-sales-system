const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const zlib = require("zlib");
const { createBackup } = require("./backup-db");
const server = require("../server");

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

function restoreDatabase(archiveArgument) {
  if (!archiveArgument) throw new Error("Usage: node scripts/restore-db.js --from <backup.json.gz>");
  const archivePath = path.resolve(archiveArgument);
  if (!fs.existsSync(archivePath)) throw new Error(`Backup not found: ${archivePath}`);
  const compressed = fs.readFileSync(archivePath);
  const checksumPath = `${archivePath}.sha256`;
  if (fs.existsSync(checksumPath)) {
    const expected = fs.readFileSync(checksumPath, "utf8").trim().split(/\s+/)[0];
    const actual = crypto.createHash("sha256").update(compressed).digest("hex");
    if (expected !== actual) throw new Error("Backup checksum verification failed");
  }
  const restored = JSON.parse(zlib.gunzipSync(compressed).toString("utf8"));
  const safetyBackup = createBackup();
  server.writeDb(restored);
  console.log(`Database restored from: ${archivePath}`);
  console.log(`Pre-restore safety backup: ${safetyBackup.archivePath}`);
}

if (require.main === module) {
  try {
    restoreDatabase(argument("--from"));
  } catch (error) {
    console.error(`Database restore failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { restoreDatabase };
