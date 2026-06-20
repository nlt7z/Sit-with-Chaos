// Builds a self-contained HTML export of the Astro Showroom prototype.
//
// It transpiles the real React/TSX component (no rewrite) into an ES module and
// loads it in a standalone page via CDN React + framer-motion + Tailwind Play.
// The only local asset (the Tao Baibai avatar) is inlined as a base64 data URI.
//
//   node scripts/build-astro-html.mjs   ->   public/astro-showroom.html
//
// Pinned to the versions installed in this repo so behaviour matches the app.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(root, "app/work/ai-character/prototype-astro/AstroShowroomPrototypeClient.tsx");
const AVATAR = path.join(root, "public/assets/ai-character/taobaibai-avatar.png");
const OUT = path.join(root, "public/astro-showroom.html");

const VERSIONS = { react: "18.3.1", reactDom: "18.3.1", framerMotion: "12.38.0" };

let code = fs.readFileSync(SRC, "utf8");

// ── Strip Next-only bits, stub the next/font fonts, inline the avatar ──────────
const avatarDataUri =
  "data:image/png;base64," + fs.readFileSync(AVATAR).toString("base64");

code = code.replace(/^\s*"use client";\s*\n/, "");
code = code.replace(/^import \{ Cormorant_Garamond, Inter \} from "next\/font\/google";\s*\n/m, "");
code = code.replace(/const displayFont = Inter\([^)]*\);/, 'const displayFont = { className: "font-display" };');
code = code.replace(/const serifFont\s*=\s*Cormorant_Garamond\([^)]*\);/, 'const serifFont = { className: "font-serif" };');
code = code.replace(/const uiFont\s*=\s*Inter\([^)]*\);/, 'const uiFont = { className: "font-ui" };');
code = code.replace(/export default function AstroShowroomPrototypeClient/, "function AstroShowroomPrototypeClient");
code = code.split('src="/assets/ai-character/taobaibai-avatar.png"').join("src={AVATAR_SRC}");

const sanityChecks = [
  ['next/font import removed', !/next\/font/.test(code)],
  ['displayFont stubbed', /className: "font-display"/.test(code)],
  ['serifFont stubbed', /className: "font-serif"/.test(code)],
  ['uiFont stubbed', /className: "font-ui"/.test(code)],
  ['default export converted', /^function AstroShowroomPrototypeClient/m.test(code)],
  ['avatar refs replaced', !/taobaibai-avatar\.png/.test(code)],
];
for (const [label, ok] of sanityChecks) {
  if (!ok) throw new Error(`Transform failed: ${label}`);
}

const header =
  'import React from "react";\n' +
  'import { createRoot } from "react-dom/client";\n' +
  `const AVATAR_SRC = ${JSON.stringify(avatarDataUri)};\n\n`;

const footer =
  '\n\ncreateRoot(document.getElementById("root"))' +
  ".render(<AstroShowroomPrototypeClient embed={true} />);\n";

const module = ts.transpileModule(header + code + footer, {
  compilerOptions: {
    jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  },
}).outputText;

// ── Assemble the standalone page ──────────────────────────────────────────────
const importMap = {
  imports: {
    react: `https://esm.sh/react@${VERSIONS.react}`,
    "react-dom": `https://esm.sh/react-dom@${VERSIONS.reactDom}`,
    "react-dom/client": `https://esm.sh/react-dom@${VERSIONS.reactDom}/client`,
    "react/jsx-runtime": `https://esm.sh/react@${VERSIONS.react}/jsx-runtime`,
    "framer-motion": `https://esm.sh/framer-motion@${VERSIONS.framerMotion}?external=react,react-dom`,
  },
};

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Astro Showroom — Tao Baibai</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
<style>
  html, body { height: 100%; margin: 0; }
  body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #fdfaf5; }
  #root { height: 100%; }
  .font-display, .font-ui { font-family: 'Inter', system-ui, -apple-system, sans-serif; }
  .font-serif { font-family: 'Cormorant Garamond', Georgia, serif; }
</style>
<script type="importmap">
${JSON.stringify(importMap, null, 2)}
<\/script>
</head>
<body>
<div id="root"></div>
<script type="module">
${module}
<\/script>
</body>
</html>
`;

fs.writeFileSync(OUT, html);
console.log(`Wrote ${path.relative(root, OUT)} (${(html.length / 1024).toFixed(0)} KB)`);
