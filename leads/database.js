"use strict";
const fs = require("fs");
const D = require("./domain");
module.exports = function database(env) {
  let pool;
  function getPool() {
    if (!pool) {
      if (!env.LEADS_MYSQL_HOST || !env.LEADS_MYSQL_DATABASE || !env.LEADS_MYSQL_USER || !env.LEADS_MYSQL_PASSWORD) D.fail(503, "外呼数据库尚未配置");
      let mysql;
      try { mysql = require("mysql2/promise"); } catch (_) { D.fail(503, "请按部署说明安装兼容的 MySQL 驱动"); }
      const ssl = env.LEADS_MYSQL_CA ? { ca: fs.readFileSync(env.LEADS_MYSQL_CA), rejectUnauthorized: true } : undefined;
      if (!ssl && env.LEADS_ALLOW_PRIVATE_PLAINTEXT !== "1") D.fail(503, "请配置数据库 TLS，或明确确认可信私网连接");
      pool = mysql.createPool({ host: env.LEADS_MYSQL_HOST, port: Number(env.LEADS_MYSQL_PORT || 3306),
        database: env.LEADS_MYSQL_DATABASE, user: env.LEADS_MYSQL_USER, password: env.LEADS_MYSQL_PASSWORD,
        ssl, connectionLimit: 4, waitForConnections: true, queueLimit: 20, connectTimeout: 5000,
        timezone: "Z", charset: "utf8mb4", multipleStatements: false, supportBigNumbers: true, bigNumberStrings: true });
    }
    return pool;
  }
  async function query(sql, args, connection) { const result = await (connection || getPool()).execute(sql, args || []); return result[0]; }
  async function transaction(task, options) {
    const connection = await getPool().getConnection();
    try {
      await connection.beginTransaction();
      // A short module-wide gate serializes ownership/capacity changes (<=10 users).
      // It never shares the legacy JSON queue or holds a lock during file parsing.
      const settings = await query("SELECT * FROM lead_settings WHERE id=1 FOR UPDATE", [], connection);
      if (!settings.length) D.fail(503, "外呼数据库尚未初始化");
      if (!(options && options.setup) && !settings[0].ready) D.fail(503, "请先完成现有客户关联检查与迁移");
      if (!(options && options.recovery)) {
        const pending = await query("SELECT id FROM lead_customer_operations WHERE status='pending' LIMIT 1", [], connection);
        if (pending.length) D.fail(503, "客户同步待恢复，请管理员执行恢复步骤");
      }
      const result = await task(connection);
      await connection.commit();
      return result;
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
  }
  return { query, transaction, close: async function () { if (pool) await pool.end(); } };
};
