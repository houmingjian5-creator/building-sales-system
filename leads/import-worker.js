"use strict";
// This process receives only the file, never application credentials or business DB.
function csv(source) {
  const rows = [], row = []; let value = "", quoted = false;
  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"') {
      if (quoted && source[i + 1] === '"') { value += '"'; i++; }
      else if (quoted || !value) quoted = !quoted;
      else throw new Error("CSV引号格式错误");
    } else if (!quoted && (ch === "," || ch === "\n" || ch === "\r")) {
      row.push(value); value = "";
      if (row.length > 60) throw new Error("最多60列");
      if (ch !== ",") { if (ch === "\r" && source[i + 1] === "\n") i++; rows.push(row.splice(0)); }
    } else value += ch;
    if (value.length > 4000 || rows.length > 5001) throw new Error("单次最多5000条，单元格最多4000字符");
  }
  if (quoted) throw new Error("CSV引号未闭合");
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}
function zipLimit(buffer) {
  // Inspect the central directory before expanding any XLSX ZIP entry.
  let end = -1;
  for (let i = buffer.length - 22; i >= Math.max(0, buffer.length - 65557); i--) {
    if (buffer.readUInt32LE(i) === 0x06054b50) { end = i; break; }
  }
  if (end < 0) throw new Error("无效Excel文件");
  const entries = buffer.readUInt16LE(end + 10); let offset = buffer.readUInt32LE(end + 16), total = 0;
  if (entries > 2000) throw new Error("Excel结构过于复杂");
  for (let i = 0; i < entries; i++) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error("不支持该Excel压缩格式");
    total += buffer.readUInt32LE(offset + 24);
    if (total > 20 * 1024 * 1024) throw new Error("Excel解压后过大，请拆分文件");
    offset += 46 + buffer.readUInt16LE(offset + 28) + buffer.readUInt16LE(offset + 30) + buffer.readUInt16LE(offset + 32);
  }
}
async function parse(input) {
  const buffer = Buffer.from(input.base64, "base64");
  if (buffer.length > 5 * 1024 * 1024) throw new Error("文件不能超过5MB");
  let rows, sheets = [];
  if (/\.csv$/i.test(input.filename)) {
    const Decoder = require("util").TextDecoder;
    const encoding = input.encoding === "gb18030" ? "gb18030" : "utf-8";
    rows = csv(new Decoder(encoding, { fatal: true }).decode(buffer).replace(/^\uFEFF/, ""));
  } else if (/\.xlsx$/i.test(input.filename)) {
    zipLimit(buffer);
    const workbook = await require("xlsx-populate").fromDataAsync(buffer);
    sheets = workbook.sheets().map(s => s.name());
    const sheet = workbook.sheet(input.sheet || 0);
    if (!sheet) throw new Error("工作表不存在");
    const range = sheet.usedRange();
    if (!range) throw new Error("工作表为空");
    if (range.endCell().rowNumber() > 5001 || range.endCell().columnNumber() > 60) throw new Error("单次最多5000条、60列");
    rows = range.value().map((r, ri) => r.map((v, ci) => range.cell(ri, ci).formula() ? "[公式单元格，请转换为文本]" : String(v == null ? "" : v)));
  } else throw new Error("仅支持.xlsx或.csv");
  if (rows.length < 2 || rows.length > 5001 || rows.some(r => r.length > 60 || r.some(v => String(v).length > 4000))) throw new Error("请提供1至5000条数据，最多60列");
  return { headers: rows[0].map(String), rows: rows.slice(1).map(r => r.map(v => String(v == null ? "" : v))), sheets };
}
if (require.main === module) process.on("message", async input => {
  try { process.send({ result: await parse(input) }, () => process.exit(0)); }
  catch (error) { process.send({ error: error.message }, () => process.exit(1)); }
});
module.exports = { csv, zipLimit, parse };
