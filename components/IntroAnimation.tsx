"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "yf-intro-played-v1";

// Critical above-the-fold homepage media. The intro doubles as a real
// preloader: it holds the reveal until these are decoded into the browser
// cache, so the hero never flashes white waiting on its lime backdrop and the
// first work cards never pop in unloaded. Order is roughly by visual priority.
const CRITICAL_ASSETS: readonly { src: string; kind: "image" | "video" }[] = [
  { src: "/assets/hero-decor.png", kind: "image" },
  { src: "/assets/ai-character/figma-h264.mp4", kind: "video" },
  { src: "/assets/work/meituan.mp4", kind: "video" },
  { src: "/assets/work/vp-genie.jpg", kind: "image" },
  { src: "/assets/liner/liner.jpg", kind: "image" },
];

const BAR_DELAY = 120;
// The intro waits on real loading, but inside a window: never shorter than
// MIN_PLAY (so the beat is felt even on a warm cache), never longer than
// MAX_PLAY (so a slow asset can't strand the visitor behind a black veil).
const MIN_PLAY = 950;
const MAX_PLAY = 6000;
// Exit beat. The overlay fades over FADE_MS; the repaint nudges fire *after*
// the fade (hero visible); DONE_AT must sit past the last nudge or the effect
// cleanup would clear the nudges before they run — the bug this file once had.
const FADE_MS = 240;
const NUDGE_1 = 280;
const NUDGE_2 = 440;
const DONE_AT = 560;

type Phase = "idle" | "playing" | "exit";

export function IntroAnimation() {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [loaded, setLoaded] = useState(0);
  const [percent, setPercent] = useState(0);

  // Kept in a ref so the rAF bar driver can read live progress without
  // re-subscribing (and restarting the easing) each time an asset settles.
  const loadedRef = useRef(0);
  const startRef = useRef(0);

  const total = CRITICAL_ASSETS.length;
  const ready = loaded >= total;

  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  // Decide whether to play (data-intro is set pre-paint by the inline script
  // in app/layout.tsx — only present on the first session visit to `/`). The
  // pathname check is belt-and-braces: even if the flag survives a client nav
  // we still only ever play on the homepage.
  useEffect(() => {
    if (pathname !== "/") return;
    const root = document.documentElement;
    if (root.dataset.intro !== "pending") return;

    if (reduced) {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      delete root.dataset.intro;
      return;
    }

    // Must live in an effect: phase has to render "idle" on the server and the
    // first client render (or hydration mismatches), then flip only after we
    // read the pre-paint data-intro flag from the DOM. There is no render-time
    // equivalent, so the set-state-in-effect here is intentional.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhase("playing");
  }, [reduced, pathname]);

  // Preload the critical homepage media. Errors count as "settled" so a 404
  // (or a blocked request) can never wedge the gate below.
  useEffect(() => {
    if (phase !== "playing") return;
    let cancelled = false;
    const settle = () => {
      if (!cancelled) setLoaded((n) => n + 1);
    };
    const cleanups: (() => void)[] = [];

    for (const { src, kind } of CRITICAL_ASSETS) {
      if (kind === "image") {
        const img = new Image();
        img.onload = settle;
        img.onerror = settle;
        img.src = src;
        cleanups.push(() => {
          img.onload = null;
          img.onerror = null;
        });
      } else {
        const v = document.createElement("video");
        v.muted = true;
        v.preload = "auto";
        v.addEventListener("loadeddata", settle, { once: true });
        v.addEventListener("error", settle, { once: true });
        v.src = src;
        v.load();
        cleanups.push(() => {
          v.removeEventListener("loadeddata", settle);
          v.removeEventListener("error", settle);
          // Let the detached element release its buffer.
          v.removeAttribute("src");
          v.load();
        });
      }
    }

    return () => {
      cancelled = true;
      cleanups.forEach((c) => c());
    };
  }, [phase]);

  // Scroll lock + the pre-paint veil. Restored when we leave "playing" (i.e.
  // the moment the exit begins), so the page is scrollable as the hero is
  // revealed and the black veil drops in sync with the overlay fade.
  useEffect(() => {
    if (phase !== "playing") return;
    startRef.current = performance.now();

    // Only treat a non-"hidden" prior value as restorable — a re-mount (HMR,
    // StrictMode double-run) would otherwise capture our own lock and write it
    // back forever, leaving the page unscrollable.
    const prior = document.body.style.overflow;
    const prevOverflow = prior === "hidden" ? "" : prior;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
      delete document.documentElement.dataset.intro;
    };
  }, [phase]);

  // The gate: leave "playing" once the assets are in (respecting MIN_PLAY), or
  // when MAX_PLAY runs out — whichever comes first. Re-runs as each asset
  // settles, so the timer always reflects the latest readiness.
  useEffect(() => {
    if (phase !== "playing") return;
    const elapsed = performance.now() - startRef.current;
    const wait = ready
      ? Math.max(0, MIN_PLAY - elapsed)
      : Math.max(0, MAX_PLAY - elapsed);
    const t = window.setTimeout(() => setPhase("exit"), wait);
    return () => clearTimeout(t);
  }, [phase, ready]);

  // Reveal beat: exit → idle, plus a repaint nudge. The hero's composited
  // layers (the masked lime backdrop, the transform-animated headline) sit on
  // their own GPU layers while the fixed overlay covers them; some browsers
  // leave those layers un-painted once the overlay fades, showing a blank
  // hero until the first scroll. A tiny instant scroll reproduces that scroll
  // and forces a clean recomposite. The nudges fire after the fade and before
  // DONE_AT, so the unmount no longer cancels them.
  useEffect(() => {
    if (phase !== "exit") return;

    const nudge = () => {
      const html = document.documentElement;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      const y = window.scrollY;
      window.scrollTo(0, y + 2);
      window.scrollTo(0, y);
      html.style.scrollBehavior = prevBehavior;
    };
    const nudge1 = setTimeout(nudge, NUDGE_1);
    const nudge2 = setTimeout(nudge, NUDGE_2);

    const doneTimer = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {}
      document.body.style.overflow = "";
      setPhase("idle");
    }, DONE_AT);

    return () => {
      clearTimeout(nudge1);
      clearTimeout(nudge2);
      clearTimeout(doneTimer);
    };
  }, [phase]);

  // Drive the percentage + bar fill. Eases a shown value toward the larger of
  // real load progress and a gentle time floor, so the bar reflects loading
  // but never looks stuck while a big asset streams in. Snaps to 100 on ready.
  useEffect(() => {
    if (phase !== "playing") return;
    const start = performance.now();
    let raf = 0;
    let shown = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      const assetFrac = loadedRef.current / total;
      const timeFloor = Math.min(0.9, Math.max(0, (elapsed - BAR_DELAY) / 1500));
      const target = loadedRef.current >= total ? 1 : Math.max(assetFrac, timeFloor);
      shown += (target - shown) * 0.14;
      if (target - shown < 0.004) shown = target;
      setPercent(Math.round(shown * 100));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, total]);

  if (phase === "idle") return null;

  return (
    <motion.div
      aria-hidden
      // pointer-events-none: the overlay is pure decoration and the page
      // underneath has its own scroll-lock while playing — leaving it
      // pointer-active means a stale mount (HMR, fade interrupted) silently
      // eats every click on the page.
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[#07080A]"
      initial={{ opacity: 1 }}
      animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: FADE_MS / 1000, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Subtle grid texture for "system" feel */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 80%)",
        }}
      />

      <div className="pointer-events-none relative flex flex-col items-center">
        {/* Keycap + lime halo */}
        <div className="relative flex h-[180px] w-[180px] items-center justify-center md:h-[200px] md:w-[200px]">
          {/* Outer halo */}
          <motion.div
            className="absolute inset-0 -m-20 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(184,229,50,0.35) 0%, rgba(184,229,50,0.08) 38%, transparent 68%)",
              filter: "blur(18px)",
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              phase === "exit"
                ? { opacity: 0, scale: 0.9 }
                : { opacity: 1, scale: 1 }
            }
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Breath ring */}
          <motion.div
            className="absolute h-[160px] w-[160px] rounded-full border border-nltLime/20 md:h-[180px] md:w-[180px]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={
              phase === "exit"
                ? { opacity: 0, scale: 1.1 }
                : { opacity: 1, scale: [0.95, 1.04, 0.98] }
            }
            transition={{
              duration: phase === "exit" ? 0.3 : 1.6,
              ease: "easeInOut",
              times: phase === "exit" ? undefined : [0, 0.55, 1],
              repeat: phase === "exit" ? 0 : Infinity,
            }}
          />

          {/* Keycap */}
          <motion.img
            src="/assets/logo.png"
            alt=""
            draggable={false}
            fetchPriority="high"
            decoding="async"
            className="relative z-10 select-none drop-shadow-[0_8px_24px_rgba(184,229,50,0.25)]"
            style={{ width: 132 }}
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={
              phase === "exit"
                ? { opacity: 0, y: -8, scale: 1.06 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Progress bar + caption */}
        <motion.div
          className="relative z-10 mt-10 flex w-[220px] flex-col items-stretch md:mt-12 md:w-[280px]"
          initial={{ opacity: 0, y: 8 }}
          animate={
            phase === "exit"
              ? { opacity: 0 }
              : { opacity: 1, y: 0 }
          }
          transition={{ duration: 0.4, delay: 0.18, ease: "easeOut" }}
        >
          {/* Track */}
          <div className="relative h-[2px] w-full overflow-hidden rounded-full bg-white/[0.08]">
            {/* Fill — width tracks real load progress */}
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-nltLime/60 via-nltLime to-nltLime"
              style={{
                width: `${percent}%`,
                boxShadow: "0 0 14px rgba(184,229,50,0.6)",
                transition: "width 90ms linear",
              }}
            />
          </div>

          {/* Status row */}
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
            <span>{ready ? "Ready" : "Loading"}</span>
            <span className="tabular-nums text-nltLime/90">
              {String(Math.min(percent, 100)).padStart(3, "0")}
            </span>
          </div>
        </motion.div>

        {/* Brand mark */}
        <motion.p
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.36em] text-white/25 md:-bottom-28"
          initial={{ opacity: 0 }}
          animate={phase === "exit" ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.45, delay: 0.5, ease: "linear" }}
        >
          Yuan Fang &nbsp;·&nbsp; Portfolio &nbsp;·&nbsp; 2026
        </motion.p>
      </div>
    </motion.div>
  );
}
