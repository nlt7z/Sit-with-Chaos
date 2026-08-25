#!/usr/bin/env node
// Repack the O2 Confirm Parts prototype.
// Source of truth is confirm-parts.page.html (markup + embedded x-dc logic).
// This script JSON-encodes it back into the bundler template slot of the
// shipped file. Edit the page source, run this, never hand-edit the bundle.
//
//   node scripts/o2/rebuild.cjs

const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'confirm-parts.page.html');
const OUT = path.join(__dirname, '..', '..', 'public', 'assets', 'o2 design', 'O2 Confirm Parts.html');

const page = fs.readFileSync(SRC, 'utf8');
const bundle = fs.readFileSync(OUT, 'utf8');

// escape "</" so the encoded page cannot terminate the carrier script tag
const encoded = JSON.stringify(page).replace(/<\//g, '<\\u002F');

const re = /(<script type="__bundler\/template">)([\s\S]*?)(<\/script>)/;
if (!re.test(bundle)) { console.error('template slot not found'); process.exit(1); }
const next = bundle.replace(re, (_, a, __, c) => a + '\n' + encoded + '\n  ' + c);

fs.writeFileSync(OUT, next);

// round-trip check: decode what we just wrote and compare
const m = next.match(/<script type="__bundler\/template">\s*([\s\S]*?)\s*<\/script>/);
const back = JSON.parse(m[1]);
if (back !== page) { console.error('round-trip mismatch'); process.exit(1); }
console.log('rebuilt', path.relative(process.cwd(), OUT), '·', (next.length / 1024).toFixed(0) + 'KB · round-trip OK');
