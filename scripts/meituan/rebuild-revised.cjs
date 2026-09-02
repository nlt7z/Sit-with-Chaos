#!/usr/bin/env node
// Pack the revised app source (scripts/meituan/revised-app.js) into a separate
// bundled `Revised Repair Flow.html`, using the original `Repair Flow.html` as
// the shell. Same mechanism as rebuild.cjs: only the app asset's `data` field
// changes, so every other manifest reference still resolves. The dev loop at
// /work/meituan-im/revised-repair-flow keeps working off the live source; this
// static file is what the deck and case study embed in production.
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const SHELL = path.join(__dirname, "../../public/assets/meituan-im/Repair Flow.html");
const OUT = path.join(__dirname, "../../public/assets/meituan-im/Revised Repair Flow.html");
const SRC = path.join(__dirname, "revised-app.js");
const APP_MARKER = "// Home Repair flow";

const html = fs.readFileSync(SHELL, "utf8");
const src = fs.readFileSync(SRC, "utf8");

const open = '<script type="__bundler/manifest">';
const i0 = html.indexOf(open);
if (i0 < 0) throw new Error("manifest script tag not found");
const i1 = html.indexOf("</script>", i0 + open.length);
const manifest = JSON.parse(html.slice(i0 + open.length, i1));

let appUuid = null;
for (const uuid of Object.keys(manifest)) {
  const e = manifest[uuid];
  if (!/javascript/i.test(e.mime)) continue;
  let buf = Buffer.from(e.data, "base64");
  if (e.compressed) buf = zlib.gunzipSync(buf);
  if (buf.toString("utf8", 0, 80).includes(APP_MARKER)) { appUuid = uuid; break; }
}
if (!appUuid) throw new Error("app asset not found in manifest");

const entry = manifest[appUuid];
const packed = entry.compressed
  ? zlib.gzipSync(Buffer.from(src, "utf8"), { level: 9 })
  : Buffer.from(src, "utf8");
entry.data = packed.toString("base64");

const out = html.slice(0, i0 + open.length) + JSON.stringify(manifest) + html.slice(i1);
fs.writeFileSync(OUT, out);

console.log(`rebuilt ${path.basename(OUT)}`);
console.log(`  app asset ${appUuid.slice(0, 8)} : ${src.length} src bytes -> ${packed.length} packed (${entry.compressed ? "gzip" : "raw"})`);
console.log(`  html size : ${out.length} bytes`);
