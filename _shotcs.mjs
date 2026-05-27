import puppeteer from "puppeteer-core";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const OUT = "/tmp/shots";
import { mkdirSync } from "node:fs";
mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--hide-scrollbars"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

async function shoot(url, prefix) {
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
  await sleep(800);
  const h = await page.evaluate(() => document.body.scrollHeight);
  const vh = 900;
  const steps = Math.min(12, Math.ceil(h / vh));
  // First pass: scroll through to trigger inView animations.
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * vh);
    await sleep(450);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(600);
  // Second pass: capture each segment.
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * vh);
    await sleep(550);
    await page.screenshot({ path: `${OUT}/${prefix}-${String(i).padStart(2, "0")}.png` });
  }
  console.log(`${prefix}: captured ${steps} segments (pageH=${h})`);
}

await shoot("http://localhost:3000/work/studio-engine", "cs");
await shoot("http://localhost:3000/work/studio-engine/deck", "deck");
console.log("errors:", errors.length ? errors.slice(0, 6) : "none");
await browser.close();
