"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import { EASE } from "@/lib/motion";

/**
 * Visual building blocks for the Meituan case study pages: the same pictures
 * the presentation deck uses (live prototype phones, auto-scrolling shipped
 * screens, the service blueprint, the transaction swimlane), rebuilt to be
 * responsive instead of living on a fixed 1280×720 canvas.
 */

export const MT = {
  accent: "#FFD100",
  accentInk: "#3D2E00",
  tint: "#F6F6F6",
} as const;

const PROTO = "/assets/meituan-im/Revised%20Repair%20Flow.html";

// ─── Text ────────────────────────────────────────────────────────────────────

/** ==highlight==, **emphasis**, \n line breaks. */
export function Rich({ text, dark = false }: { text: string; dark?: boolean }) {
  return (
    <>
      {text.split("\n").map((line, li) => (
        <Fragment key={li}>
          {li > 0 ? <br /> : null}
          {line.split(/(==[^=]+==|\*\*[^*]+\*\*)/g).map((seg, i) =>
            seg.startsWith("==") ? (
              <span
                key={i}
                className="rounded-[3px] px-[0.2em] [-webkit-box-decoration-break:clone] [box-decoration-break:clone]"
                style={{ background: MT.accent, color: MT.accentInk }}
              >
                {seg.slice(2, -2)}
              </span>
            ) : seg.startsWith("**") ? (
              <span key={i} className={dark ? "text-white" : "text-textPrimary"}>
                {seg.slice(2, -2)}
              </span>
            ) : (
              <Fragment key={i}>{seg}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </>
  );
}

export const plain = (t: string) => t.replace(/==|\*\*/g, "");

export function Caption({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className={`mt-4 flex items-center justify-center gap-2 text-[13px] font-medium tracking-[-0.005em] ${dark ? "text-white/60" : "text-textSecondary"}`}>
      <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: MT.accent }} />
      {children}
    </p>
  );
}

// ─── Mounting heavy embeds only near the viewport ────────────────────────────

/** True while the element is within `margin` of the viewport. Embeds mount on
 *  approach and unmount once well out of view, so a long page never holds more
 *  than a couple of live prototypes in memory. */
function useNear<T extends Element>(margin = "300px 0px") {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return { ref, near };
}

/** Width of an element, for fitting fixed-size canvases into fluid columns. */
function useWidth<T extends Element>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, w };
}

// ─── Live prototype phone ────────────────────────────────────────────────────

// The prototype canvas is 480×1000 with the phone body at 24,70 (432×924,
// 56px corners); showing only that box keeps the canvas margin off the page.
const BEZEL = { canvasW: 480, canvasH: 1000, x: 24, y: 70, w: 432, h: 924, r: 56 };
export const PHONE_ASPECT = BEZEL.w / BEZEL.h;

/** A live scene of the prototype, deep-linked by flow (and step). Fits the
 *  column width, capped at `maxH`. */
export function Phone({
  flow = "default",
  seek = 1,
  src = PROTO,
  caption,
  maxH = 560,
}: {
  flow?: string;
  seek?: number;
  src?: string;
  caption?: string;
  maxH?: number;
}) {
  const { ref: wrapRef, w } = useWidth<HTMLDivElement>();
  const { ref: nearRef, near } = useNear<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const s = w ? Math.min(maxH / BEZEL.h, w / BEZEL.w) : 0;
  useEffect(() => {
    if (!near) setLoaded(false);
  }, [near]);
  return (
    <figure ref={wrapRef} className="flex w-full flex-col items-center">
      <div
        ref={nearRef}
        className="relative overflow-hidden bg-[#F6F6F6]"
        style={{ width: BEZEL.w * s, height: BEZEL.h * s, borderRadius: BEZEL.r * s }}
      >
        {near && s > 0 ? (
          <iframe
            src={`${src}#flow=${flow}&rail=0&seek=${seek}`}
            title={caption ?? `${flow} prototype scene`}
            onLoad={() => window.setTimeout(() => setLoaded(true), 420)}
            className="absolute border-0 transition-opacity duration-500"
            style={{
              left: -BEZEL.x * s,
              top: -BEZEL.y * s,
              width: BEZEL.canvasW,
              height: BEZEL.canvasH,
              transform: `scale(${s})`,
              transformOrigin: "top left",
              opacity: loaded ? 1 : 0,
            }}
          />
        ) : null}
        {!loaded ? (
          <span aria-hidden className="absolute inset-0 grid place-items-center text-[13px] font-medium tracking-[-0.005em] text-textSecondary">
            Loading prototype
          </span>
        ) : null}
      </div>
      {caption ? <Caption>{caption}</Caption> : null}
    </figure>
  );
}

// ─── Shipped screen (a long capture) ─────────────────────────────────────────

/** The whole shipped interface, never cropped: it scrolls slowly inside a
 *  phone-sized window while on screen, or holds still at `focus` (0-1). */
export function Shot({
  src,
  alt,
  natH,
  natW = 2250,
  still = false,
  focus = 0.5,
  caption,
  maxH = 560,
}: {
  src: string;
  alt: string;
  natH: number;
  natW?: number;
  still?: boolean;
  focus?: number;
  caption?: string;
  maxH?: number;
}) {
  const reduced = useReducedMotion();
  const { ref: wrapRef, w } = useWidth<HTMLDivElement>();
  const boxRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boxRef, { margin: "0px" });
  const boxH = w ? Math.min(maxH, w / PHONE_ASPECT) : 0;
  const boxW = boxH * PHONE_ASPECT;
  const imgH = boxW * (natH / natW);
  const dist = Math.max(0, imgH - boxH);
  const stillY = -Math.min(dist, Math.max(0, imgH * focus - boxH / 2));
  const loop = !still && !reduced && inView && dist > 0;
  return (
    <figure ref={wrapRef} className="flex w-full flex-col items-center">
      <div ref={boxRef} className="overflow-hidden rounded-[14px] bg-[#F6F6F6]" style={{ width: boxW, height: boxH }}>
        {boxW > 0 ? (
          <motion.img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            style={{ width: boxW, height: imgH, display: "block" }}
            initial={false}
            animate={loop ? { y: [0, -dist, 0] } : { y: still ? stillY : 0 }}
            transition={loop ? { duration: Math.max(24, (dist / 42) * 2), times: [0, 0.5, 1], repeat: Infinity, ease: "linear", delay: 0.8 } : { duration: 0 }}
          />
        ) : null}
      </div>
      {caption ? <Caption>{caption}</Caption> : null}
    </figure>
  );
}

// ─── A fixed-size HTML canvas, scaled to its column ──────────────────────────

export function Embed({
  src,
  title,
  natW,
  natH,
  maxH,
  caption,
}: {
  src: string;
  title: string;
  natW: number;
  natH: number;
  maxH?: number;
  caption?: string;
}) {
  const { ref: wrapRef, w } = useWidth<HTMLDivElement>();
  const { ref: nearRef, near } = useNear<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const s = w ? Math.min(w / natW, maxH ? maxH / natH : Infinity) : 0;
  useEffect(() => {
    if (!near) setLoaded(false);
  }, [near]);
  return (
    <figure ref={wrapRef} className="flex w-full flex-col items-center">
      <div ref={nearRef} className="relative overflow-hidden rounded-[14px] bg-[#F6F6F6]" style={{ width: natW * s, height: natH * s }}>
        {near && s > 0 ? (
          <iframe
            src={src}
            title={title}
            onLoad={() => window.setTimeout(() => setLoaded(true), 420)}
            className="absolute left-0 top-0 border-0 transition-opacity duration-500"
            style={{ width: natW, height: natH, transform: `scale(${s})`, transformOrigin: "top left", opacity: loaded ? 1 : 0 }}
          />
        ) : null}
        {!loaded ? (
          <span aria-hidden className="absolute inset-0 grid place-items-center text-[13px] font-medium tracking-[-0.005em] text-textSecondary">
            Loading prototype
          </span>
        ) : null}
      </div>
      {caption ? <Caption>{caption}</Caption> : null}
    </figure>
  );
}

// ─── Count-up (starts when on screen) ────────────────────────────────────────

export function CountUp({ to, format = (n) => String(Math.round(n)), prefix = "", suffix = "" }: { to: number; format?: (n: number) => string; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (!inView || reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1100);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduced, to]);
  return (
    <span ref={ref}>
      {prefix}
      {format(v)}
      {suffix}
    </span>
  );
}

// ─── Swimlane diagrams ───────────────────────────────────────────────────────

type Lane = { name: string; cells: readonly string[]; decision?: number };

/** Lanes of cards with hand-off arrows drawn in the gutters, in `flow` order. */
export function Swimlane({
  heads,
  lanes,
  flow,
  id,
  minW = 640,
}: {
  heads: readonly string[];
  lanes: readonly Lane[];
  flow: [number, number][];
  id: string;
  minW?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cells = useRef<Record<string, HTMLElement | null>>({});
  const [paths, setPaths] = useState<{ w: number; h: number; d: string[] } | null>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-15% 0px" });

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const measure = () => {
      const box = (p: [number, number]) => {
        const el = cells.current[`${p[0]}-${p[1]}`];
        return el
          ? { l: el.offsetLeft, r: el.offsetLeft + el.offsetWidth, t: el.offsetTop, b: el.offsetTop + el.offsetHeight, cy: el.offsetTop + el.offsetHeight / 2 }
          : null;
      };
      const d: string[] = [];
      for (let i = 0; i < flow.length - 1; i++) {
        const a = box(flow[i]);
        const b = box(flow[i + 1]);
        if (!a || !b) continue;
        if (flow[i][1] === flow[i + 1][1] && Math.abs(flow[i][0] - flow[i + 1][0]) === 1) {
          // neighbouring lanes, same column: straight down (or up) from card to
          // card through the space between the lanes
          const x = (a.l + a.r) / 2;
          d.push(b.t > a.t ? `M ${x} ${a.b} L ${x} ${b.t - 2}` : `M ${x} ${a.t} L ${x} ${b.b + 2}`);
        } else if (flow[i][1] === flow[i + 1][1]) {
          // same column, skipping a lane: go round through the gutter on the
          // right, so the line never crosses the card in between
          const gx = Math.max(a.r, b.r) + 10;
          d.push(`M ${a.r} ${a.cy} L ${gx} ${a.cy} L ${gx} ${b.cy} L ${b.r + 2} ${b.cy}`);
        } else {
          // next column: the vertical sits in the gap between the columns
          const mx = (a.r + b.l) / 2;
          d.push(`M ${a.r} ${a.cy} L ${mx} ${a.cy} L ${mx} ${b.cy} L ${b.l - 2} ${b.cy}`);
        }
      }
      setPaths({ w: wrap.offsetWidth, h: wrap.offsetHeight, d });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [flow]);

  const cols = heads.length;
  return (
    <div className="overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* right padding keeps a lane-skipping arrow (drawn in the gutter past
          the last column) inside the scroll area */}
      <div className="pr-5" style={{ minWidth: minW }}>
        <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {heads.map((h, i) => (
            <p key={h} className="flex items-baseline gap-1.5">
              <span className="text-[12px] font-medium tabular-nums" style={{ color: MT.accent }}>
                0{i + 1}
              </span>
              <span className="text-[12px] font-medium tracking-tight text-white">{h}</span>
            </p>
          ))}
        </div>
        <div ref={wrapRef} className="relative">
          {lanes.map((lane, li) => (
            <div key={lane.name} className="mt-6">
              <p className="mb-2.5 text-[13px] font-medium tracking-[-0.005em] text-white/60">{lane.name}</p>
              <div className="grid gap-5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
                {lane.cells.map((cell, ci) => {
                  const decision = lane.decision === ci;
                  return (
                    <div
                      key={ci}
                      ref={(el) => {
                        cells.current[`${li}-${ci}`] = el;
                      }}
                      className="flex min-h-[76px] items-start rounded-[10px] px-3 py-2.5"
                      style={{ background: cell === "" ? "rgba(255,255,255,0.03)" : decision ? MT.accent : "#1D1D1D" }}
                    >
                      {cell ? (
                        <p className="text-[12px] font-light leading-[1.5] tracking-tight" style={{ color: decision ? MT.accentInk : "rgba(255,255,255,0.86)" }}>
                          {cell}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {paths ? (
            <motion.svg
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 overflow-visible"
              width={paths.w}
              height={paths.h}
              viewBox={`0 0 ${paths.w} ${paths.h}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: inView ? 1 : 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
            >
              <defs>
                <marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" markerUnits="strokeWidth" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill={MT.accent} />
                </marker>
              </defs>
              {paths.d.map((d, i) => (
                <path key={i} d={d} fill="none" stroke={MT.accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" markerEnd={`url(#${id})`} />
              ))}
            </motion.svg>
          ) : null}
        </div>
      </div>
    </div>
  );
}
