const { createBackup } = require("./backup-db");
const server = require("../server");

function migratePasswords() {
  const db = server.readDb();
  const legacyUsers = (db.users || []).filter((user) => !user.passwordHash && user.password);
  if (!legacyUsers.length) {
    console.log("No plaintext passwords need migration.");
    return 0;
  }
  const backup = createBackup();
  legacyUsers.forEach((user) => server.setUserPassword(user, user.password));
  server.writeDb(db);
  console.log(`Migrated ${legacyUsers.length} password(s) to scrypt hashes.`);
  console.log(`Pre-migration backup: ${backup.archivePath}`);
  return legacyUsers.length;
}

if (require.main === module) {
  try {
    migratePasswords();
  } catch (error) {
    console.error(`Password migration failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { migratePasswords };
