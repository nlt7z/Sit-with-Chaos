#!/usr/bin/env node
// Re-pack the edited app source (scripts/meituan/app.js) back into the bundled
// `Repair Flow.html`. The bundle stores each asset as gzip+base64 inside the
// `__bundler/manifest` <script> tag; the template references assets by UUID and
// the loader swaps UUID -> blob URL at runtime. We only touch the app asset's
// `data` field, keeping its UUID/mime so every template reference still resolves.
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const HTML = path.join(__dirname, "../../public/assets/meituan-im/Repair Flow.html");
const SRC = path.join(__dirname, "app.js");
// the app asset is the one whose source begins with this marker comment
const APP_MARKER = "// Home Repair flow";

const html = fs.readFileSync(HTML, "utf8");
const src = fs.readFileSync(SRC, "utf8");

const open = '<script type="__bundler/manifest">';
const i0 = html.indexOf(open);
if (i0 < 0) throw new Error("manifest script tag not found");
const i1 = html.indexOf("</script>", i0 + open.length);
const jsonStr = html.slice(i0 + open.length, i1);
const manifest = JSON.parse(jsonStr);

// locate the app asset by decoding each js asset and matching the marker
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

const newJson = JSON.stringify(manifest);
const out = html.slice(0, i0 + open.length) + newJson + html.slice(i1);
fs.writeFileSync(HTML, out);

console.log(`rebuilt ${path.basename(HTML)}`);
console.log(`  app asset ${appUuid.slice(0, 8)} : ${src.length} src bytes -> ${packed.length} packed (${entry.compressed ? "gzip" : "raw"})`);
console.log(`  html size : ${out.length} bytes`);
