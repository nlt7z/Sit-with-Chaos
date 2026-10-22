"use client";

/**
 * Lab demo: the Work page as an index (gallery-grade-web recipes 03 + 07).
 *
 * - Titles are the interface. Hovering a row dims the others; one preview
 *   trails the pointer on a damped follow, tilts with horizontal speed and
 *   crossfades between two image layers. No per-row images in the DOM.
 * - Clicking grows that exact preview into the project view (a fixed frame
 *   animated between two rects with left/top/width/height, so the crop holds).
 *   The text arrives only after the picture lands; the project's own video
 *   then replaces the poster, so the enlarged view stays sharp.
 * - The page ends on a curtain footer: fixed underneath, uncovered as the page
 *   lifts away, with the name fitted edge to edge and sunk into the floor.
 *   Letters lean toward the pointer on springs.
 * Touch: no trailing preview; a tap grows the view from the row. Reduced
 * motion: no trailing preview, no lean, morphs become a short fade.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { Action } from "@/components/Action";
import { SideRail } from "@/components/bento/SideRail";
import { EMAIL, RESUME_HREF } from "@/lib/site";

type Work = {
  href: string;
  company: string;
  logo: string;
  line: string;
  intro?: string;
  role: string;
  year: string;
  poster: string;
  video?: string;
};

// Lines and intros are the site's own copy (WorkShowcase, the homepage, case study meta).
const WORK: Work[] = [
  {
    href: "/work/o2",
    company: "O2 Tech AI",
    logo: "/assets/logos/o2.svg",
    line: "Shaping O2 Tech AI's human-in-the-loop sourcing product",
    role: "Product design",
    year: "2026",
    poster: "/assets/lab/work-index/o2.jpg",
    video: "/assets/o2/o2-demo-sound.mp4",
  },
  {
    href: "/work/liner",
    company: "Liner",
    logo: "/assets/logos/liner.png",
    line: "Research + designed AI-native co-research for 10M+ academic users",
    intro: "Led end-to-end research and design for an AI-native collaborative research experience where people collect sources, discuss, and co-write together.",
    role: "User research · UI design",
    year: "2026",
    poster: "/assets/work/posters/liner.webp",
    video: "/assets/liner/liner-cover.mp4",
  },
  {
    href: "/work/tiktok",
    company: "TikTok",
    logo: "/assets/work/logos/tiktok.svg",
    line: "Redesigned how friends' shared videos surface in a Shared with You feed",
    intro: "Self-initiated product case study: turning the DM inbox of friend-shared videos into a scrollable Shared Feed with one-tap Smart Reactions and reply-value ranking.",
    role: "Product case study",
    year: "2026",
    poster: "/assets/work/posters/tiktok.webp",
    video: "/assets/TikTok/showcase.mp4",
  },
  {
    href: "/work/meituan-im",
    company: "Meituan",
    logo: "/assets/work/logos/meituan.png",
    line: "0→1 in-message quotation system on a 770M-user platform",
    intro: "Led the 0-to-1 design of an in-message quotation system on a platform with 770M+ annual transacting users and 14.5M active merchants.",
    role: "Product design",
    year: "2025",
    poster: "/assets/work/posters/meituan.webp",
    video: "/assets/meituan-im/meituan-present/meituan-present-1.mp4",
  },
  {
    href: "/work/ai-character",
    company: "Alibaba Cloud",
    logo: "/assets/logos/alibaba.svg",
    line: "Shipped Qwen Character's Interactive Showrooms MVP",
    intro: "0→1 MVP feature for Qwen Character LLM, serving millions of enterprise customers.",
    role: "Product design",
    year: "2025",
    poster: "/assets/work/posters/alibaba.webp",
    video: "/assets/ai-character/showroom-light-loop.mp4",
  },
  {
    href: "/work/studio-engine",
    company: "StudioEngine",
    logo: "/assets/work/logos/studioengine.png",
    line: "Rebuilt a GenAI video app into a 4-stage creative workspace",
    intro: "Restructured a Gen-2 web app from a single-step generator into a four-stage creative workspace creators actually iterate in.",
    role: "UX design · UX research",
    year: "2025",
    poster: "/assets/work/vp-genie.jpg",
  },
];

/* ---------- small motion kit (ported from the skill's motion-core.js) ---------- */
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
// frame-rate independent smoothing; lambda ~4 lazy, ~20 snappy
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));
type Spring = { value: number; target: number; velocity: number; step: (dt: number) => number };
function spring(initial: number, stiffness: number, damping: number): Spring {
  return {
    value: initial,
    target: initial,
    velocity: 0,
    step(dt) {
      const n = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / n;
      for (let i = 0; i < n; i++) {
        const force = -stiffness * (this.value - this.target) - damping * this.velocity;
        this.velocity += force * h;
        this.value += this.velocity * h;
      }
      return this.value;
    },
  };
}
type Rect = { left: number; top: number; width: number; height: number };
const toRect = (r: DOMRect): Rect => ({ left: r.left, top: r.top, width: r.width, height: r.height });
// grow a fixed element between two rects; left/top/width/height keeps an object-cover crop intact
function morphRect(el: HTMLElement, from: Rect, to: Rect, duration: number, reduced: boolean) {
  const f = (r: Rect) => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
  Object.assign(el.style, f(to));
  if (reduced) return el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180 }).finished;
  return el.animate([f(from), f(to)], { duration, easing: "cubic-bezier(.65,0,.35,1)" }).finished;
}
const canHover = () => typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** One rAF loop for a section: pauses when it is off screen or the tab is hidden. dt is clamped. */
function useClock(el: React.RefObject<HTMLElement | null>, tick: (dt: number) => void, enabled: boolean) {
  const tickRef = useRef(tick);
  tickRef.current = tick;
  useEffect(() => {
    const node = el.current;
    if (!enabled || !node) return;
    let raf = 0;
    let last = 0;
    let onScreen = true;
    let running = false;
    const frame = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 1 / 30) : 1 / 60;
      last = now;
      tickRef.current(dt);
      if (running) raf = requestAnimationFrame(frame);
    };
    const update = () => {
      const should = onScreen && !document.hidden;
      if (should && !running) {
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    };
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      update();
    });
    io.observe(node);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [el, enabled]);
}

/* ---------- the index ---------- */

function heroRect(): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const side = vw < 700 ? 16 : 56;
  const width = Math.min(vw - side * 2, 1120, ((vh * 0.56) * 16) / 9);
  return { left: (vw - width) / 2, top: Math.max(56, vh * 0.08), width, height: (width * 9) / 16 };
}

function WorkIndex() {
  const sectionRef = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const layerRefs = [useRef<HTMLImageElement>(null), useRef<HTMLImageElement>(null)];
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [hoverMode, setHoverMode] = useState(false);

  // trailing preview state, all mutable (read by the clock, never by React)
  const m = useRef({
    pos: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    lastX: 0,
    side: 1,
    opacity: 0,
    shown: false,
    front: 0,
    scale: spring(0.6, 260, 24),
    tilt: spring(0, 120, 16),
  });

  useEffect(() => {
    const ok = canHover() && !prefersReduced();
    setHoverMode(ok);
    const s = m.current;
    s.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    s.target = { ...s.pos };
    s.lastX = s.pos.x;
    if (!ok) return;
    const move = (e: PointerEvent) => {
      s.target.x = e.clientX;
      s.target.y = e.clientY;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  const show = useCallback((i: number) => {
    const s = m.current;
    setActive(i);
    if (i < 0) {
      s.shown = false;
      s.scale.target = 0.6;
      return;
    }
    s.shown = true;
    s.scale.target = 1;
    const back = 1 - s.front;
    const [b, f] = [layerRefs[back].current, layerRefs[s.front].current];
    if (b && f) {
      b.src = WORK[i].poster;
      b.style.opacity = "1";
      b.style.zIndex = "2";
      f.style.opacity = "0";
      f.style.zIndex = "1";
    }
    s.front = back;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useClock(
    sectionRef,
    (dt) => {
      const s = m.current;
      const el = previewRef.current;
      if (!el) return;
      s.pos.x = damp(s.pos.x, s.target.x, 9, dt);
      s.pos.y = damp(s.pos.y, s.target.y, 9, dt);
      const vx = (s.pos.x - s.lastX) / Math.max(dt, 1e-3);
      s.lastX = s.pos.x;
      s.tilt.target = clamp(vx * 0.01, -10, 10);
      s.tilt.step(dt);
      s.scale.step(dt);
      s.opacity = damp(s.opacity, s.shown ? 1 : 0, 12, dt);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      el.style.opacity = s.opacity.toFixed(3);
      // sit beside the pointer, not on it, so the hovered title stays readable
      s.side = damp(s.side, s.pos.x > window.innerWidth - w - 90 ? -1 : 1, 6, dt);
      const x = s.pos.x + s.side * (w / 2 + 32) - w / 2;
      const y = clamp(s.pos.y - h / 2, 12, window.innerHeight - h - 12);
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${s.tilt.value.toFixed(2)}deg) scale(${s.scale.value.toFixed(3)})`;
    },
    hoverMode,
  );

  /* ---- the project view, grown from the exact rect ---- */
  const frameRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<{ i: number; from: Rect; to: Rect } | null>(null);
  const [landed, setLanded] = useState(false);
  const [bgOn, setBgOn] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const open = (i: number) => {
    const row = rowRefs.current[i];
    if (!row) return;
    const s = m.current;
    const usePreview = hoverMode && s.opacity > 0.2 && previewRef.current;
    const from = toRect((usePreview ? previewRef.current! : row).getBoundingClientRect());
    setVideoReady(false);
    setLanded(false);
    setView({ i, from, to: heroRect() });
  };

  useLayoutEffect(() => {
    if (!view || !frameRef.current) return;
    if (previewRef.current) previewRef.current.style.visibility = "hidden";
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(() => setBgOn(true));
    let alive = true;
    morphRect(frameRef.current, view.from, view.to, 720, prefersReduced()).then(() => {
      if (!alive) return;
      setLanded(true);
      closeRef.current?.focus();
    });
    return () => {
      alive = false;
    };
  }, [view]);

  const close = useCallback(async () => {
    if (!view || !frameRef.current) return;
    setLanded(false);
    setBgOn(false);
    const s = m.current;
    const back =
      hoverMode && previewRef.current && s.opacity > 0.2
        ? toRect(previewRef.current.getBoundingClientRect())
        : toRect(rowRefs.current[view.i]!.getBoundingClientRect());
    await morphRect(frameRef.current, toRect(frameRef.current.getBoundingClientRect()), back.width ? back : view.from, 560, prefersReduced());
    document.documentElement.style.overflow = "";
    if (previewRef.current) previewRef.current.style.visibility = "";
    rowRefs.current[view.i]?.focus({ preventScroll: true });
    setView(null);
  }, [view, hoverMode]);

  useEffect(() => {
    if (!view) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view, close]);

  useEffect(() => () => void (document.documentElement.style.overflow = ""), []);

  const w = view ? WORK[view.i] : null;

  return (
    <section ref={sectionRef} className="relative px-6 pb-[18vh] pt-[16vh] md:pl-[124px] md:pr-14">
      <p className="text-[13px] font-medium tracking-[-0.005em] text-white/60">Selected work</p>
      <ul className="mt-8" onPointerLeave={() => hoverMode && show(-1)}>
        {WORK.map((p, i) => {
          const dim = active >= 0 && active !== i;
          return (
            <li key={p.href}>
              <button
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                type="button"
                onPointerEnter={() => hoverMode && show(i)}
                onClick={() => open(i)}
                className="grid w-full grid-cols-1 gap-x-10 gap-y-2 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/70 md:grid-cols-[minmax(0,1fr)_auto] md:items-baseline md:py-5"
              >
                <span
                  className={`font-display text-[clamp(2.6rem,7vw,6.6rem)] font-light leading-[0.98] tracking-[-0.03em] text-white transition-opacity duration-300 ${dim ? "opacity-25" : "opacity-100"}`}
                >
                  {p.company}
                </span>
                <span className={`text-[14px] leading-[1.5] text-white/50 transition-opacity duration-300 md:text-right ${dim ? "opacity-40" : "opacity-100"}`}>
                  <span className="md:block">{p.role}</span>
                  <span className="text-white/30 md:hidden"> · </span>
                  <span className="md:block">{p.year}</span>
                </span>
                <span className={`max-w-[60ch] text-[15px] leading-[1.5] text-white/55 transition-opacity duration-300 md:col-span-2 ${dim ? "opacity-30" : "opacity-100"}`}>
                  {p.line}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* the trailing preview: one element, two layers for crossfades */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-40 aspect-[16/10] w-[clamp(260px,26vw,440px)] overflow-hidden rounded-[14px] bg-[#1a1b1d] opacity-0 will-change-transform"
        style={{ display: hoverMode ? undefined : "none" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={layerRefs[0]} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={layerRefs[1]} alt="" className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300" />
      </div>

      {/* the project view */}
      {view && w ? (
        <div role="dialog" aria-modal="true" aria-label={w.company} className="fixed inset-0 z-[70]">
          <div
            className={`absolute inset-0 bg-[#0a0b0c] transition-opacity duration-500 ${bgOn ? "opacity-100" : "opacity-0"}`}
            onClick={close}
          />
          <div ref={frameRef} className="fixed overflow-hidden rounded-[22px] bg-[#1a1b1d]" style={{ left: view.from.left, top: view.from.top, width: view.from.width, height: view.from.height }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={w.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
            {landed && w.video ? (
              <video
                src={w.video}
                muted
                loop
                playsInline
                autoPlay
                onPlaying={() => setVideoReady(true)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoReady ? "opacity-100" : "opacity-0"}`}
              />
            ) : null}
          </div>
          <div
            className="absolute grid gap-3"
            style={{ left: view.to.left, top: view.to.top + view.to.height + 28, width: view.to.width }}
          >
            {[
              <p key="co" className="flex items-center gap-2.5 text-[13px] font-medium tracking-[-0.005em] text-white/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={w.logo} alt="" className="h-4 w-4 object-contain brightness-0 invert" />
                {w.company} · {w.role} · {w.year}
              </p>,
              <h2 key="h" className="max-w-[24ch] font-display text-[clamp(1.6rem,3vw,2.6rem)] font-light leading-[1.1] tracking-[-0.02em] text-white">
                {w.line}
              </h2>,
              w.intro ? (
                <p key="p" className="max-w-[62ch] text-[16px] leading-[1.6] text-white/60">
                  {w.intro}
                </p>
              ) : null,
              <div key="a" className="mt-2">
                <Action href={w.href} tone="dark">
                  Read the case study
                </Action>
              </div>,
            ]
              .filter(Boolean)
              .map((node, k) => (
                <div
                  key={k}
                  className="transition-[opacity,transform] duration-500"
                  style={{ opacity: landed ? 1 : 0, transform: landed ? "none" : "translateY(14px)", transitionDelay: landed ? `${k * 70}ms` : "0ms" }}
                >
                  {node}
                </div>
              ))}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="absolute right-5 top-5 rounded-full px-3 py-2 text-[14px] text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nltLime/70"
          >
            Close
          </button>
        </div>
      ) : null}
    </section>
  );
}

/* ---------- the curtain footer ---------- */

const NAME = "Yuan Fang";

function CurtainFooter({ mainRef }: { mainRef: React.RefObject<HTMLElement | null> }) {
  const footerRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLParagraphElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [copied, setCopied] = useState<"" | "copied" | "selected">("");
  const [lean, setLean] = useState(false);
  const sizeRef = useRef(100);
  const centers = useRef<number[]>([]);
  const springs = useRef(NAME.replace(/\s/g, "").split("").map(() => spring(0, 180, 14)));
  const ptr = useRef({ x: 0, inside: false });

  // fit the split name edge to edge: restore kerning from an unsplit ruler, measure, scale
  const layout = useCallback(() => {
    const name = nameRef.current;
    const wrap = wrapRef.current;
    const footer = footerRef.current;
    const main = mainRef.current;
    const chars = charRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!name || !wrap || !footer || !main || !chars.length) return;
    name.style.fontSize = "400px";
    chars.forEach((c) => (c.style.marginLeft = ""));
    const ruler = document.createElement("span");
    Object.assign(ruler.style, { position: "absolute", visibility: "hidden", whiteSpace: "pre", left: "0", top: "0" });
    ruler.textContent = NAME;
    name.append(ruler);
    const node = ruler.firstChild!;
    const range = document.createRange();
    const xs: number[] = [];
    for (let i = 0; i < NAME.length; i++) {
      if (/\s/.test(NAME[i])) continue;
      range.setStart(node, i);
      range.setEnd(node, i + 1);
      xs.push(range.getBoundingClientRect().left);
    }
    ruler.remove();
    const x0 = chars[0].offsetLeft;
    chars.forEach((c, i) => {
      if (i === 0) return;
      const want = xs[i] - xs[0];
      const have = c.offsetLeft - x0;
      if (Math.abs(want - have) > 0.05) c.style.marginLeft = `${(want - have) / 400}em`;
    });
    const a = chars[0];
    const b = chars[chars.length - 1];
    const width = b.offsetLeft + b.offsetWidth - a.offsetLeft;
    const cs = getComputedStyle(wrap);
    const inner = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const size = clamp((400 * inner) / Math.max(width, 1), 12, 4000);
    name.style.fontSize = `${size}px`;
    sizeRef.current = size;
    // sink the name so the floor cuts a sliver off the bottom of the letters:
    // find the real baseline (a zero-size inline-block sits on it) and end the
    // block just above it, whatever the font's metrics are
    const marker = document.createElement("span");
    Object.assign(marker.style, { display: "inline-block", width: "0", height: "0" });
    name.append(marker);
    const baseline = marker.getBoundingClientRect().top - name.getBoundingClientRect().top;
    marker.remove();
    wrap.style.height = `${Math.max(0, baseline - size * 0.03)}px`;
    // the curtain: wide screens only, and only while the footer fits the screen
    const fh = footer.offsetHeight;
    const curtain = window.innerWidth >= 768 && fh < window.innerHeight * 0.95;
    footer.style.position = curtain ? "fixed" : "relative";
    main.style.marginBottom = curtain ? `${fh}px` : "0px";
    const fr = footer.getBoundingClientRect();
    centers.current = chars.map((c) => {
      const r = c.getBoundingClientRect();
      return r.left + r.width / 2 - fr.left;
    });
  }, [mainRef]);

  useLayoutEffect(() => {
    layout();
    document.fonts?.ready.then(layout);
    window.addEventListener("resize", layout);
    setLean(canHover() && !prefersReduced());
    return () => window.removeEventListener("resize", layout);
  }, [layout]);

  useEffect(() => {
    const f = footerRef.current;
    if (!f || !lean) return;
    const move = (e: PointerEvent) => {
      ptr.current.x = e.clientX - f.getBoundingClientRect().left;
      ptr.current.inside = true;
    };
    const leave = () => (ptr.current.inside = false);
    f.addEventListener("pointermove", move);
    f.addEventListener("pointerleave", leave);
    return () => {
      f.removeEventListener("pointermove", move);
      f.removeEventListener("pointerleave", leave);
    };
  }, [lean]);

  useClock(
    footerRef,
    (dt) => {
      const size = sizeRef.current;
      charRefs.current.forEach((c, i) => {
        if (!c) return;
        const sp = springs.current[i];
        const d = Math.abs(ptr.current.x - (centers.current[i] || 0));
        const k = ptr.current.inside ? Math.max(0, 1 - d / (size * 0.8)) : 0;
        sp.target = -k * k * size * 0.18;
        sp.step(dt);
        c.style.transform = Math.abs(sp.value) < 0.05 ? "" : `translateY(${sp.value.toFixed(2)}px)`;
      });
    },
    lean,
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied("copied");
    } catch {
      const el = document.getElementById("wi-addr");
      if (el) {
        const r = document.createRange();
        r.selectNodeContents(el);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      }
      setCopied("selected");
    }
    window.setTimeout(() => setCopied(""), 1800);
  };

  let ci = 0;
  return (
    <footer ref={footerRef} className="fixed inset-x-0 bottom-0 z-0 overflow-hidden bg-nltLime text-[#0a0b0c]">
      <div className="grid gap-10 px-6 pb-6 pt-[clamp(40px,8vh,84px)] md:grid-cols-[1.4fr_1fr_1fr] md:pl-[124px] md:pr-14">
        <div>
          <p className="font-display text-[clamp(2rem,3.6vw,3rem)] font-light leading-[1.05] tracking-[-0.02em]">Say hello</p>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            <span id="wi-addr" className="select-all text-[18px]">
              {EMAIL}
            </span>
            <button type="button" onClick={copy} className="text-[15px] text-[#0a0b0c]/60 transition-colors hover:text-[#0a0b0c]">
              {copied === "copied" ? "Copied" : copied === "selected" ? "Selected, press copy" : "Copy address"}
            </button>
            <span aria-live="polite" className="sr-only">
              {copied === "copied" ? "Address copied" : ""}
            </span>
          </div>
        </div>
        <nav aria-label="Pages">
          <p className="text-[15px] font-medium text-[#0a0b0c]/55">Pages</p>
          <ul className="mt-3 grid gap-1.5 text-[16px]">
            <li><a className="hover:underline hover:underline-offset-4" href="/">Home</a></li>
            <li><a className="hover:underline hover:underline-offset-4" href="/work">Work</a></li>
            <li><a className="hover:underline hover:underline-offset-4" href="/vibe-coding">Lab</a></li>
          </ul>
        </nav>
        <nav aria-label="Elsewhere">
          <p className="text-[15px] font-medium text-[#0a0b0c]/55">Elsewhere</p>
          <ul className="mt-3 grid gap-1.5 text-[16px]">
            <li><a className="hover:underline hover:underline-offset-4" href="https://linkedin.com/in/yuan-fang-66395725b" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a></li>
            <li><a className="hover:underline hover:underline-offset-4" href="https://github.com/nlt7z" target="_blank" rel="noopener noreferrer">GitHub ↗</a></li>
            <li><a className="hover:underline hover:underline-offset-4" href={RESUME_HREF} target="_blank" rel="noopener noreferrer">Resume ↗</a></li>
          </ul>
        </nav>
      </div>
      <div className="flex flex-wrap justify-between gap-x-6 gap-y-2 px-6 text-[14px] text-[#0a0b0c]/60 md:pl-[124px] md:pr-14">
        <span>© 2026 Yuan Fang · NLT Studio</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" })} className="hover:text-[#0a0b0c]">
          Back to top
        </button>
      </div>
      <div ref={wrapRef} className="relative overflow-hidden px-6 md:pl-[124px] md:pr-14">
        <p ref={nameRef} className="m-0 whitespace-nowrap font-display font-light leading-none tracking-[-0.035em]" style={{ fontSize: "20vw" }}>
          <span className="sr-only">{NAME}</span>
          {NAME.split(/(\s+)/).map((part, pi) =>
            /^\s+$/.test(part) ? (
              " "
            ) : (
              <span key={pi} aria-hidden className="inline-block whitespace-nowrap">
                {part.split("").map((ch) => {
                  const idx = ci++;
                  return (
                    <span
                      key={idx}
                      ref={(el) => {
                        charRefs.current[idx] = el;
                      }}
                      className="inline-block will-change-transform"
                    >
                      {ch}
                    </span>
                  );
                })}
              </span>
            ),
          )}
        </p>
      </div>
    </footer>
  );
}

export function WorkIndexDemo() {
  const mainRef = useRef<HTMLElement>(null);
  return (
    <div className="bg-[#0a0b0c] text-white">
      <SideRail active="work" />
      <main ref={mainRef} className="relative z-[1] bg-[#0a0b0c]">
        <WorkIndex />
      </main>
      <CurtainFooter mainRef={mainRef} />
    </div>
  );
}
