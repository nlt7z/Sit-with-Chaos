/**
 * Home v2 behaviour, framework-free. React renders the markup; this file only
 * adds motion and returns a cleanup function. The same code runs in the static
 * preview, so the two never drift apart.
 *
 * Structure follows the gallery-grade-web rules: one rAF clock per section,
 * springs for anything a hand touches, layout measured once and cached, a
 * complete page at rest, and a composed still for reduced motion.
 */

type Spring = {
  value: number; target: number; velocity: number;
  step(dt: number): number; settled(eps?: number): boolean; snap(v: number): void;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

function spring(initial: number, stiffness: number, damping: number): Spring {
  return {
    value: initial, target: initial, velocity: 0,
    step(dt) {
      const n = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        const f = -stiffness * (this.value - this.target) - damping * this.velocity;
        this.velocity += f * h;
        this.value += this.velocity * h;
      }
      return this.value;
    },
    settled(eps = 1e-3) { return Math.abs(this.value - this.target) < eps && Math.abs(this.velocity) < eps; },
    snap(v) { this.value = this.target = v; this.velocity = 0; },
  };
}

/** One rAF loop for one section; pauses off-screen and in hidden tabs. */
function clock(el: Element, tick: (dt: number) => void) {
  let raf = 0, last = 0, running = false, onScreen = true;
  const frame = (now: number) => {
    const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
    last = now;
    tick(dt);
    if (running) raf = requestAnimationFrame(frame);
  };
  const update = () => {
    const should = onScreen && !document.hidden;
    if (should && !running) { running = true; last = 0; raf = requestAnimationFrame(frame); }
    else if (!should && running) { running = false; cancelAnimationFrame(raf); }
  };
  const io = new IntersectionObserver((e) => { onScreen = e[0].isIntersecting; update(); });
  io.observe(el);
  document.addEventListener("visibilitychange", update);
  update();
  return () => { running = false; cancelAnimationFrame(raf); io.disconnect(); document.removeEventListener("visibilitychange", update); };
}

/** Split a line into per-letter spans, keeping one readable copy for screen readers. */
function splitChars(el: HTMLElement) {
  const text = (el.textContent || "").trim();
  el.textContent = "";
  const sr = document.createElement("span");
  sr.className = "hv2-sr";
  sr.textContent = text;
  el.append(sr);
  const chars: HTMLSpanElement[] = [];
  for (const part of text.split(/(\s+)/)) {
    if (!part) continue;
    if (/^\s+$/.test(part)) { el.append(document.createTextNode(" ")); continue; }
    const w = document.createElement("span");
    w.setAttribute("aria-hidden", "true");
    w.style.display = "inline-block";
    for (const ch of part) {
      const c = document.createElement("span");
      c.className = "c";
      c.style.display = "inline-block";
      c.textContent = ch;
      w.append(c);
      chars.push(c);
    }
    el.append(w);
  }
  return { chars, text };
}

/**
 * Splitting text into inline-block letters drops the font's kerning, so the
 * split word comes out wider and looser than the real one. Measure where each
 * letter sits in an unsplit copy, then nudge every split letter back to that
 * spot with an em margin (so it scales with the font size).
 */
function kernSplit(el: HTMLElement, chars: HTMLSpanElement[], text: string) {
  chars.forEach((c) => { c.style.marginLeft = ""; });
  const ruler = document.createElement("span");
  ruler.setAttribute("aria-hidden", "true");
  Object.assign(ruler.style, { position: "absolute", visibility: "hidden", whiteSpace: "pre", left: "0", top: "0" });
  ruler.textContent = text;
  el.append(ruler);
  const node = ruler.firstChild as Text;
  const range = document.createRange();
  const xs: number[] = [];
  for (let i = 0; i < text.length; i++) {
    if (/\s/.test(text[i])) continue;
    range.setStart(node, i);
    range.setEnd(node, i + 1);
    xs.push(range.getBoundingClientRect().left);
  }
  ruler.remove();
  const size = parseFloat(getComputedStyle(el).fontSize) || 100;
  // offsetLeft ignores transforms, so a letter mid-lean cannot skew this.
  const x0 = chars[0].offsetLeft;
  chars.forEach((c, i) => {
    if (i === 0) return;
    const want = xs[i] - xs[0];
    const have = c.offsetLeft - x0;
    if (Math.abs(want - have) > 0.05) c.style.marginLeft = `${(want - have) / size}em`;
  });
}

/** Fit a split line to a width by measuring the letters' layout boxes. */
function fitSplit(el: HTMLElement, chars: HTMLSpanElement[], text: string, width: number) {
  // Measure big (400px) so whole-pixel offsets add almost no error.
  el.style.fontSize = "400px";
  kernSplit(el, chars, text);
  const first = chars[0];
  const last = chars[chars.length - 1];
  const w = last.offsetLeft + last.offsetWidth - first.offsetLeft;
  const size = clamp((400 * width) / Math.max(w, 1), 24, 2000);
  el.style.fontSize = `${size}px`;
  return size;
}

export function mountHomeV2(root: HTMLElement): () => void {
  const cleanups: Array<() => void> = [];
  const on = <K extends keyof WindowEventMap>(t: Window, type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
    t.addEventListener(type, fn as EventListener, opts);
    cleanups.push(() => t.removeEventListener(type, fn as EventListener, opts));
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- sticky bar gets a ground once the page moves ---------- */
  const nav = root.querySelector<HTMLElement>("[data-hv2-nav]");
  if (nav) {
    const stick = () => nav.classList.toggle("is-stuck", window.scrollY > 8);
    stick();
    on(window, "scroll", stick, { passive: true });
  }

  /* ---------- the sentence: entrance, then objects on springs ---------- */
  const sentence = root.querySelector<HTMLElement>("[data-hv2-sentence]");
  const objs = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-hv2-obj]"));
  if (sentence && !reduced) {
    sentence.querySelectorAll<HTMLElement>(".hv2-wd").forEach((w, i) =>
      w.animate(
        [{ opacity: 0, transform: "translateY(.32em)" }, { opacity: 1, transform: "none" }],
        { duration: 760, delay: 80 + i * 32, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" },
      ),
    );
    objs.forEach((o, i) => {
      const rot = parseFloat(getComputedStyle(o).getPropertyValue("--rot")) || 0;
      o.animate(
        [{ transform: "rotate(-24deg) scale(0)" }, { transform: `rotate(${rot}deg) scale(1)` }],
        { duration: 680, delay: 520 + i * 160, easing: "cubic-bezier(.34,1.56,.64,1)", fill: "backwards" },
      );
    });
  }

  if (sentence && objs.length) {
    const ZOOM = 2.3;
    const state = objs.map((el) => {
      const rot = parseFloat(getComputedStyle(el).getPropertyValue("--rot")) || 0;
      const s = spring(1, 260, 17);
      const r = spring(rot, 200, 20);
      return { el, rot, s, r, open: false, tag: el.querySelector<HTMLElement>(".hv2-tag") };
    });
    const setOpen = (st: (typeof state)[number], open: boolean) => {
      st.open = open;
      st.el.classList.toggle("is-open", open);
      st.el.setAttribute("aria-expanded", String(open));
      st.s.target = open ? ZOOM : 1;
      st.r.target = open ? 0 : st.rot;
      st.el.style.zIndex = open ? "5" : "";
      if (reduced) { st.s.snap(st.s.target); st.r.snap(st.r.target); }
    };
    for (const st of state) {
      const enter = () => setOpen(st, true);
      const leave = () => setOpen(st, false);
      const tap = () => { const next = !st.open; state.forEach((o) => o !== st && o.open && setOpen(o, false)); setOpen(st, next); };
      if (canHover) {
        st.el.addEventListener("pointerenter", enter);
        st.el.addEventListener("pointerleave", leave);
        st.el.addEventListener("focus", enter);
        st.el.addEventListener("blur", leave);
        cleanups.push(() => { st.el.removeEventListener("pointerenter", enter); st.el.removeEventListener("pointerleave", leave); st.el.removeEventListener("focus", enter); st.el.removeEventListener("blur", leave); });
      } else {
        st.el.addEventListener("click", tap);
        cleanups.push(() => st.el.removeEventListener("click", tap));
      }
    }
    cleanups.push(clock(sentence, (dt) => {
      for (const st of state) {
        if (st.s.settled() && st.r.settled() && !st.open && st.el.style.transform === "") continue;
        st.s.step(dt); st.r.step(dt);
        const done = !st.open && st.s.settled(5e-4) && st.r.settled(5e-3);
        st.el.style.transform = done ? "" : `rotate(${st.r.value.toFixed(2)}deg) scale(${st.s.value.toFixed(3)})`;
        if (st.tag) st.tag.style.transform = `translateX(-50%) scale(${(1 / st.s.value).toFixed(3)})`;
      }
    }));
  }

  /* ---------- work index: one trailing preview, dim the rest ---------- */
  const rows = root.querySelector<HTMLElement>("[data-hv2-rows]");
  const preview = root.querySelector<HTMLElement>("[data-hv2-preview]");
  if (rows && preview && canHover && !reduced) {
    const layers = Array.from(preview.querySelectorAll<HTMLImageElement>("img"));
    const items = Array.from(rows.querySelectorAll<HTMLElement>("[data-hv2-row]"));
    let active = -1, front = 0, shown = false, opacity = 0, side = 1;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const target = { x: pos.x, y: pos.y };
    let lastX = pos.x;
    const scale = spring(0.7, 260, 24);
    const tilt = spring(0, 120, 16);
    // Warm the cache so the first hover shows its picture straight away.
    items.forEach((it) => { const i = new Image(); i.src = it.dataset.img || ""; });

    const show = (i: number) => {
      if (i === active) return;
      active = i;
      items.forEach((r, k) => r.classList.toggle("is-on", k === i));
      rows.classList.toggle("is-dim", i >= 0);
      if (i < 0) { shown = false; scale.target = 0.7; return; }
      shown = true; scale.target = 1;
      const back = 1 - front;
      layers[back].src = items[i].dataset.img || "";
      layers[back].style.opacity = "1";
      layers[back].style.zIndex = "2";
      layers[front].style.opacity = "0";
      layers[front].style.zIndex = "1";
      front = back;
    };
    on(window, "pointermove", (e) => { target.x = e.clientX; target.y = e.clientY; }, { passive: true });
    const over = (e: Event) => { const r = (e.target as Element).closest<HTMLElement>("[data-hv2-row]"); if (r) show(items.indexOf(r)); };
    const out = () => show(-1);
    rows.addEventListener("pointerover", over);
    rows.addEventListener("pointerleave", out);
    cleanups.push(() => { rows.removeEventListener("pointerover", over); rows.removeEventListener("pointerleave", out); });

    cleanups.push(clock(rows, (dt) => {
      if (!shown && opacity < 0.002) { preview.style.opacity = "0"; return; }
      pos.x = damp(pos.x, target.x, 9, dt);
      pos.y = damp(pos.y, target.y, 9, dt);
      const vx = (pos.x - lastX) / Math.max(dt, 1e-3);
      lastX = pos.x;
      tilt.target = clamp(vx * 0.01, -10, 10);
      tilt.step(dt); scale.step(dt);
      opacity = damp(opacity, shown ? 1 : 0, 12, dt);
      const w = preview.offsetWidth, h = preview.offsetHeight;
      // Sit beside the pointer, never on the title being read.
      side = damp(side, pos.x > innerWidth - w - 90 ? -1 : 1, 6, dt);
      const x = pos.x + side * (w / 2 + 32) - w / 2;
      const y = clamp(pos.y - h / 2, 12, innerHeight - h - 12);
      preview.style.opacity = opacity.toFixed(3);
      preview.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${tilt.value.toFixed(2)}deg) scale(${scale.value.toFixed(3)})`;
    }));
  }

  /* ---------- curtain footer and the floor name ---------- */
  const main = root.querySelector<HTMLElement>("[data-hv2-main]");
  const foot = root.querySelector<HTMLElement>("[data-hv2-foot]");
  const floor = root.querySelector<HTMLElement>("[data-hv2-floor]");
  const nameEl = floor?.querySelector<HTMLElement>("p");
  if (main && foot && floor && nameEl) {
    // React renders the letters already (so effects can run twice safely);
    // the static preview splits them here.
    let chars = Array.from(nameEl.querySelectorAll<HTMLSpanElement>(".c"));
    let text = nameEl.querySelector(".hv2-sr")?.textContent || "";
    if (!chars.length) ({ chars, text } = splitChars(nameEl));
    let centers: number[] = [];
    const layout = () => {
      const cs = getComputedStyle(floor);
      const inner = floor.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      const size = fitSplit(nameEl, chars, text, inner);
      nameEl.style.setProperty("--sink", `${size * 0.13}px`);
      floor.style.height = `${size * 0.84}px`;
      const fh = foot.offsetHeight;
      const curtain = fh < innerHeight * 0.95;
      root.classList.toggle("no-curtain", !curtain);
      main.style.marginBottom = curtain ? `${fh}px` : "0px";
      const fr = foot.getBoundingClientRect();
      centers = chars.map((c) => { const r = c.getBoundingClientRect(); return r.left + r.width / 2 - fr.left; });
    };
    layout();
    document.fonts?.ready.then(layout);
    on(window, "resize", layout);

    // Live local time in the footer, a small human detail.
    const clockEl = root.querySelector<HTMLElement>("[data-hv2-time]");
    if (clockEl) {
      const fmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });
      const tickTime = () => { clockEl.textContent = fmt.format(new Date()).toLowerCase(); };
      tickTime();
      const id = window.setInterval(tickTime, 20000);
      cleanups.push(() => clearInterval(id));
    }

    if (!reduced && canHover) {
      const springs = chars.map(() => spring(0, 180, 14));
      const p = { x: 0, inside: false };
      const move = (e: PointerEvent) => { p.x = e.clientX - foot.getBoundingClientRect().left; p.inside = true; };
      const leave = () => { p.inside = false; };
      foot.addEventListener("pointermove", move);
      foot.addEventListener("pointerleave", leave);
      cleanups.push(() => { foot.removeEventListener("pointermove", move); foot.removeEventListener("pointerleave", leave); });
      cleanups.push(clock(foot, (dt) => {
        const size = parseFloat(nameEl.style.fontSize) || 100;
        chars.forEach((c, i) => {
          const d = Math.abs(p.x - (centers[i] || 0));
          const k = p.inside ? Math.max(0, 1 - d / (size * 0.8)) : 0;
          springs[i].target = -k * k * size * 0.16;
          springs[i].step(dt);
          c.style.transform = Math.abs(springs[i].value) < 0.05 ? "" : `translateY(${springs[i].value.toFixed(2)}px)`;
        });
      }));
    }
  }

  /* ---------- copy address, back to top ---------- */
  const copy = root.querySelector<HTMLButtonElement>("[data-hv2-copy]");
  const addr = root.querySelector<HTMLElement>("[data-hv2-addr]");
  if (copy && addr) {
    const fn = async () => {
      try {
        await navigator.clipboard.writeText(addr.textContent || "");
        copy.textContent = "Copied";
      } catch {
        const range = document.createRange();
        range.selectNodeContents(addr);
        const sel = getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        copy.textContent = "Selected";
      }
      window.setTimeout(() => { copy.textContent = "Copy address"; }, 1800);
    };
    copy.addEventListener("click", fn);
    cleanups.push(() => copy.removeEventListener("click", fn));
  }
  const top = root.querySelector<HTMLButtonElement>("[data-hv2-top]");
  if (top) {
    const fn = () => window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    top.addEventListener("click", fn);
    cleanups.push(() => top.removeEventListener("click", fn));
  }

  return () => cleanups.forEach((f) => f());
}
