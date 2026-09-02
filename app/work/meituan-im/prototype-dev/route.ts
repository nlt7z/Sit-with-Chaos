import { readFile } from "fs/promises";
import path from "path";
import zlib from "zlib";

// Repair Flow 原型的 dev 环路:每次请求把 scripts/meituan/app.js 的最新源码
// 实时注入正式 bundle 的外壳返回。改 app.js → 刷新即生效,无需跑 rebuild.cjs;
// 磁盘上的 Repair Flow.html 保持不动,确认满意后再 rebuild 固化。
// 支持与正式版相同的 hash 参数:#flow=…&rail=0&seek=…
export const dynamic = "force-dynamic";

const APP_MARKER = "// Home Repair flow";

export async function GET() {
  const root = process.cwd();
  const html = await readFile(
    path.join(root, "public/assets/meituan-im/Repair Flow.html"),
    "utf8",
  );
  const src = await readFile(path.join(root, "scripts/meituan/app.js"), "utf8");

  const open = '<script type="__bundler/manifest">';
  const i0 = html.indexOf(open);
  if (i0 < 0) return new Response("manifest not found", { status: 500 });
  const i1 = html.indexOf("</script>", i0 + open.length);
  const manifest = JSON.parse(html.slice(i0 + open.length, i1));

  let appUuid: string | null = null;
  for (const uuid of Object.keys(manifest)) {
    const e = manifest[uuid];
    if (!/javascript/i.test(e.mime)) continue;
    let buf = Buffer.from(e.data, "base64");
    if (e.compressed) buf = zlib.gunzipSync(buf);
    if (buf.toString("utf8", 0, 80).includes(APP_MARKER)) {
      appUuid = uuid;
      break;
    }
  }
  if (!appUuid) return new Response("app asset not found", { status: 500 });

  const entry = manifest[appUuid];
  entry.data = (
    entry.compressed
      ? zlib.gzipSync(Buffer.from(src, "utf8"), { level: 1 })
      : Buffer.from(src, "utf8")
  ).toString("base64");

  const out =
    html.slice(0, i0 + open.length) + JSON.stringify(manifest) + html.slice(i1);
  return new Response(out, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
