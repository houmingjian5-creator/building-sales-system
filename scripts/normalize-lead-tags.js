"use strict";
const fs = require("fs");
const path = require("path");
const D = require("../leads/domain");

function loadEnvironmentFile(filename) {
  const env = Object.assign({}, process.env);
  fs.readFileSync(filename, "utf8").split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || Object.prototype.hasOwnProperty.call(process.env, match[1])) return;
    let value = match[2];
    if ((value[0] === '"' && value[value.length - 1] === '"') || (value[0] === "'" && value[value.length - 1] === "'")) value = value.slice(1, -1);
    env[match[1]] = value;
  });
  return env;
}

async function run() {
  const marker = "--env-file=";
  const option = process.argv.slice(2).find(arg => arg.indexOf(marker) === 0);
  const env = option ? loadEnvironmentFile(path.resolve(option.slice(marker.length))) : process.env;
  const db = require("../leads/database")(env);
  try {
    const result = await db.query("UPDATE lead_resources SET tags='其他',version=version+1,updated_at=UTC_TIMESTAMP() WHERE TRIM(tags)<>'' AND tags NOT IN (?,?,?,?)", D.TAGS);
    console.log("外呼标签整理完成，调整资源数量：" + Number(result.affectedRows || 0));
  } finally { await db.close(); }
}

run().catch(error => { console.error(error.code || error.message); process.exitCode = 1; });
