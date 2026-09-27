"use client";

/**
 * HalftoneGlobe — the homepage location block. A dot-matrix Earth on a 2D
 * canvas: every land dot is sized by a fixed key light, so the sphere reads as
 * a halftone print with real volume. Arcs carry comets from the places on the
 * journey (Seoul, Hangzhou, Beijing, Seattle, New York) to Foster City; each
 * arrival sends a lime ripple across the land around the pin and deepens its
 * glow a little, which then relaxes back.
 *
 *   • drag to spin (with inertia), arrow keys when focused; after a few idle
 *     seconds it eases back to the home view so the pin stays the subject
 *   • the pointer nudges the key light, so the halftone shading follows you
 *   • reduced motion: one static frame with full arcs; drag still redraws
 *   • the loop pauses while the card is offscreen or the tab is hidden
 */

import { useEffect, useRef, useState } from "react";

import { LAND_MASK_B64, LAND_POINTS } from "./globeLand";

const DEG = Math.PI / 180;
const HOME = { lat: 37.5585, lon: -122.2711 }; // Foster City, CA
const VIEW = { lat: 27, lon: -128 }; // resting camera: North America right, Pacific left
const ORIGINS = [
  { lat: 37.5665, lon: 126.978 }, // Seoul · Liner
  { lat: 30.2741, lon: 120.1551 }, // Hangzhou · Alibaba Cloud
  { lat: 39.9042, lon: 116.4074 }, // Beijing · Meituan
  { lat: 47.6553, lon: -122.3035 }, // Seattle · UW
  { lat: 40.6914, lon: -73.9632 }, // Brooklyn · Pratt
];

const PERIOD = 6.2; // s between launches on one arc
const TRAVEL = 2.7; // s a comet spends in flight
const IDLE_RETURN = 3.2; // s of no input before the camera eases home
const ARC_STEPS = 72;

type V3 = [number, number, number];

const toV = (lat: number, lon: number): V3 => {
  const la = lat * DEG;
  const lo = lon * DEG;
  return [Math.cos(la) * Math.sin(lo), Math.sin(la), Math.cos(la) * Math.cos(lo)];
};

/* Static geometry, built once per module. */
function buildGeometry() {
  const bin = atob(LAND_MASK_B64);
  const N = LAND_POINTS;
  const GA = Math.PI * (3 - Math.sqrt(5));
  const land: number[] = [];
  const ocean: number[] = [];
  const home = toV(HOME.lat, HOME.lon);
  const heatDist: number[] = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - ((i + 0.5) * 2) / N;
    const r = Math.sqrt(1 - y * y);
    const phi = i * GA;
    // same Fibonacci order the mask was baked with; axes swapped into this
    // file's (east = +x, north = +y, lon 0 = +z) convention
    const x = Math.sin(phi) * r;
    const z = Math.cos(phi) * r;
    const isLand = (bin.charCodeAt(i >> 3) >> (i & 7)) & 1;
    if (isLand) {
      land.push(x, y, z);
      heatDist.push(Math.acos(Math.min(1, x * home[0] + y * home[1] + z * home[2])));
    } else if (i % 3 === 0) {
      ocean.push(x, y, z);
    }
  }

  // Great-circle arcs lifted off the surface; longer hops fly higher.
  const arcs = ORIGINS.map((o) => {
    const a = toV(o.lat, o.lon);
    const w = Math.acos(a[0] * home[0] + a[1] * home[1] + a[2] * home[2]);
    const lift = 0.05 + 0.34 * (w / Math.PI);
    const pts = new Float32Array((ARC_STEPS + 1) * 3);
    for (let s = 0; s <= ARC_STEPS; s++) {
      const t = s / ARC_STEPS;
      const k0 = Math.sin((1 - t) * w) / Math.sin(w);
      const k1 = Math.sin(t * w) / Math.sin(w);
      const h = 1 + lift * Math.sin(Math.PI * t);
      pts[s * 3] = (a[0] * k0 + home[0] * k1) * h;
      pts[s * 3 + 1] = (a[1] * k0 + home[1] * k1) * h;
      pts[s * 3 + 2] = (a[2] * k0 + home[2] * k1) * h;
    }
    return { origin: a, pts };
  });

  return {
    land: new Float32Array(land),
    heatDist: new Float32Array(heatDist),
    ocean: new Float32Array(ocean),
    arcs,
    home,
  };
}

let GEO: ReturnType<typeof buildGeometry> | null = null;

// 5 heat levels, from paper-white ink to full lime
const HEAT_RGB = [
  [226, 230, 220],
  [220, 238, 170],
  [214, 246, 110],
  [211, 252, 50],
  [210, 255, 0],
];
const ALPHAS = [0.55, 0.78, 0.96];

const pacificTime = () =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date());

export function HalftoneGlobe({ reduced }: { reduced: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(pacificTime());
    tick();
    const id = setInterval(tick, 20_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const label = labelRef.current;
    if (!wrap || !canvas || !label) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!GEO) GEO = buildGeometry();
    const geo = GEO;

    let W = 0;
    let H = 0;
    let R = 0;
    let cx = 0;
    let cy = 0;
    let dpr = 1;

    const view = { lat: VIEW.lat, lon: VIEW.lon };
    const vel = { lat: 0, lon: 0 };
    const light: V3 = [-0.38, 0.42, 0.82];
    const lightTarget: V3 = [-0.38, 0.42, 0.82];
    let dragging = false;
    let lastInput = -1e9;
    let last = { x: 0, y: 0, t: 0 };
    let glow = 0.25;
    const pulses: number[] = [];
    const prevProgress = ORIGINS.map(() => 0);

    const nLand = geo.land.length / 3;
    const nOcean = geo.ocean.length / 3;
    const sx = new Float32Array(nLand);
    const sy = new Float32Array(nLand);
    const sr = new Float32Array(nLand);
    const bucket = new Int8Array(nLand);

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      R = Math.min(W * 0.44, H * 0.44);
      cx = W * 0.5;
      cy = H * 0.52;
    };

    // world → view space for the current camera
    let cl = 1;
    let sl = 0;
    let cp = 1;
    let sp = 0;
    const setCamera = () => {
      const l0 = view.lon * DEG;
      const p0 = view.lat * DEG;
      cl = Math.cos(l0);
      sl = Math.sin(l0);
      cp = Math.cos(p0);
      sp = Math.sin(p0);
    };
    const project = (x: number, y: number, z: number, out: V3) => {
      const x1 = x * cl - z * sl;
      const z1 = x * sl + z * cl;
      out[0] = x1;
      out[1] = y * cp - z1 * sp;
      out[2] = y * sp + z1 * cp;
    };

    const tmp: V3 = [0, 0, 0];
    const arcXY = new Float32Array((ARC_STEPS + 1) * 2);
    const arcVis = new Uint8Array(ARC_STEPS + 1);

    const draw = (now: number) => {
      const t = now / 1000;
      setCamera();
      for (let k = 0; k < 3; k++) light[k] += (lightTarget[k] - light[k]) * 0.08;
      const ll = Math.hypot(light[0], light[1], light[2]);
      const Lx = light[0] / ll;
      const Ly = light[1] / ll;
      const Lz = light[2] / ll;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      // atmosphere + body
      const atm = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.22);
      atm.addColorStop(0, `rgba(210,255,0,${0.05 + glow * 0.04})`);
      atm.addColorStop(1, "rgba(210,255,0,0)");
      ctx.fillStyle = atm;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.22, 0, Math.PI * 2);
      ctx.fill();
      const body = ctx.createRadialGradient(cx + Lx * R * 0.45, cy - Ly * R * 0.45, R * 0.05, cx, cy, R);
      body.addColorStop(0, "rgba(255,255,255,0.075)");
      body.addColorStop(0.7, "rgba(255,255,255,0.02)");
      body.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fill();

      const spacing = 0.0264 * R;

      // ocean — a faint, finer dot screen that shows the sphere's volume
      ctx.fillStyle = "rgba(226,230,220,0.16)";
      ctx.beginPath();
      for (let i = 0; i < nOcean; i++) {
        project(geo.ocean[i * 3], geo.ocean[i * 3 + 1], geo.ocean[i * 3 + 2], tmp);
        if (tmp[2] <= 0) continue;
        const shade = Math.max(0, tmp[0] * Lx + tmp[1] * Ly + tmp[2] * Lz);
        const r = spacing * (0.08 + 0.14 * shade) * (0.5 + 0.5 * tmp[2]);
        const px = cx + tmp[0] * R;
        const py = cy - tmp[1] * R;
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, Math.PI * 2);
      }
      ctx.fill();

      // pulses → heat
      while (pulses.length && t - pulses[0] > 2.2) pulses.shift();
      glow = Math.max(0.2, glow - 0.035 / 60);

      // land — halftone: dot radius carries the light
      let visible = 0;
      for (let i = 0; i < nLand; i++) {
        project(geo.land[i * 3], geo.land[i * 3 + 1], geo.land[i * 3 + 2], tmp);
        if (tmp[2] <= 0) {
          bucket[i] = -1;
          continue;
        }
        const lambert = Math.max(0, tmp[0] * Lx + tmp[1] * Ly + tmp[2] * Lz);
        const shade = 0.34 + 0.66 * lambert;
        sx[i] = cx + tmp[0] * R;
        sy[i] = cy - tmp[1] * R;
        sr[i] = spacing * (0.1 + 0.38 * shade) * (0.6 + 0.4 * tmp[2]);
        const d = geo.heatDist[i];
        let heat = glow * Math.exp(-(d * d) / (0.13 * 0.13));
        for (let p = 0; p < pulses.length; p++) {
          const age = t - pulses[p];
          const front = age * 0.36;
          const amp = 0.85 * Math.exp(-age * 1.6);
          const off = (d - front) / 0.045;
          heat += amp * Math.exp(-off * off);
        }
        const hl = Math.min(4, Math.floor(Math.min(1, heat) * 4.99));
        const al = shade > 0.78 ? 2 : shade > 0.55 ? 1 : 0;
        bucket[i] = hl * 3 + al;
        visible++;
      }
      if (visible) {
        for (let b = 0; b < 15; b++) {
          const rgb = HEAT_RGB[Math.floor(b / 3)];
          ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${ALPHAS[b % 3]})`;
          ctx.beginPath();
          let any = false;
          for (let i = 0; i < nLand; i++) {
            if (bucket[i] !== b) continue;
            any = true;
            ctx.moveTo(sx[i] + sr[i], sy[i]);
            ctx.arc(sx[i], sy[i], sr[i], 0, Math.PI * 2);
          }
          if (any) ctx.fill();
        }
      }

      // arcs + comets
      ctx.lineCap = "round";
      geo.arcs.forEach((arc, ai) => {
        for (let s = 0; s <= ARC_STEPS; s++) {
          project(arc.pts[s * 3], arc.pts[s * 3 + 1], arc.pts[s * 3 + 2], tmp);
          arcXY[s * 2] = cx + tmp[0] * R;
          arcXY[s * 2 + 1] = cy - tmp[1] * R;
          // hidden only when behind the sphere AND inside its disc
          arcVis[s] = tmp[2] > 0 || tmp[0] * tmp[0] + tmp[1] * tmp[1] > 1 ? 1 : 0;
        }
        // faint rail
        ctx.strokeStyle = "rgba(210,255,0,0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let s = 1; s <= ARC_STEPS; s++) {
          if (!arcVis[s] || !arcVis[s - 1]) continue;
          ctx.moveTo(arcXY[s * 2 - 2], arcXY[s * 2 - 1]);
          ctx.lineTo(arcXY[s * 2], arcXY[s * 2 + 1]);
        }
        ctx.stroke();

        // origin dot
        project(arc.origin[0], arc.origin[1], arc.origin[2], tmp);
        if (tmp[2] > 0) {
          ctx.fillStyle = "rgba(210,255,0,0.85)";
          ctx.beginPath();
          ctx.arc(cx + tmp[0] * R, cy - tmp[1] * R, 1.9, 0, Math.PI * 2);
          ctx.fill();
        }

        if (reduced) return;
        const phase = (t + ai * (PERIOD / ORIGINS.length)) % PERIOD;
        const p = phase / TRAVEL;
        if (prevProgress[ai] < 1 && p >= 1 && prevProgress[ai] > 0.5) {
          pulses.push(t);
          glow = Math.min(1, glow + 0.16);
        }
        prevProgress[ai] = p;
        if (p > 1) return;
        const ease = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        const head = ease * ARC_STEPS;
        const tail = Math.max(0, head - ARC_STEPS * 0.26);
        const s0 = Math.floor(tail);
        const s1 = Math.min(ARC_STEPS, Math.ceil(head));
        for (let s = s0 + 1; s <= s1; s++) {
          if (!arcVis[s] || !arcVis[s - 1]) continue;
          const f = (s - tail) / Math.max(1, head - tail);
          ctx.strokeStyle = `rgba(210,255,0,${Math.min(1, f) * 0.95})`;
          ctx.lineWidth = 0.6 + 1.6 * f;
          ctx.beginPath();
          ctx.moveTo(arcXY[s * 2 - 2], arcXY[s * 2 - 1]);
          ctx.lineTo(arcXY[s * 2], arcXY[s * 2 + 1]);
          ctx.stroke();
        }
        const hs = Math.min(ARC_STEPS, Math.round(head));
        if (arcVis[hs]) {
          const hx = arcXY[hs * 2];
          const hy = arcXY[hs * 2 + 1];
          const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, 9);
          g.addColorStop(0, "rgba(210,255,0,0.55)");
          g.addColorStop(1, "rgba(210,255,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(hx, hy, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#f4ffd0";
          ctx.beginPath();
          ctx.arc(hx, hy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // pin — glow that deepens with arrivals, ripple rings, core
      project(geo.home[0], geo.home[1], geo.home[2], tmp);
      const facing = tmp[2];
      const px = cx + tmp[0] * R;
      const py = cy - tmp[1] * R;
      // the label sits right of the pin unless that would run off the card
      const lw = label.offsetWidth;
      const side = px + 30 + lw > W - 6 ? -1 : 1;
      if (facing > 0) {
        const gr = 14 + 12 * glow;
        const g = ctx.createRadialGradient(px, py, 0, px, py, gr);
        g.addColorStop(0, `rgba(210,255,0,${0.35 + 0.35 * glow})`);
        g.addColorStop(1, "rgba(210,255,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, gr, 0, Math.PI * 2);
        ctx.fill();
        for (const p0 of pulses) {
          const age = t - p0;
          if (age > 1.6) continue;
          ctx.strokeStyle = `rgba(210,255,0,${0.7 * (1 - age / 1.6)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(px, py, 4 + 26 * (age / 1.6), 0, Math.PI * 2);
          ctx.stroke();
        }
        // leader line up to the label (mirrored when the label flips left)
        ctx.strokeStyle = "rgba(255,255,255,0.55)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 16 * side, py - 22);
        ctx.lineTo(px + 26 * side, py - 22);
        ctx.stroke();
        ctx.fillStyle = "#d2ff00";
        ctx.beginPath();
        ctx.arc(px, py, 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a0b0c";
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      label.style.transform = `translate(${side > 0 ? px + 30 : Math.max(8, px - 30 - lw)}px, ${py - 22}px) translateY(-50%)`;
      label.style.opacity = String(Math.max(0, Math.min(1, (facing - 0.12) / 0.2)));
    };

    // camera integration: drag inertia, then an eased return home with a sway
    const step = (now: number, dt: number) => {
      if (dragging) return;
      const idle = now / 1000 - lastInput > IDLE_RETURN;
      if (Math.abs(vel.lon) > 0.001 || Math.abs(vel.lat) > 0.001) {
        view.lon += vel.lon * dt;
        view.lat = Math.max(-65, Math.min(75, view.lat + vel.lat * dt));
        const f = Math.pow(0.06, dt);
        vel.lon *= f;
        vel.lat *= f;
      }
      if (idle) {
        const sway = reduced ? 0 : Math.sin(now / 4200) * 7;
        const target = VIEW.lon + sway;
        const d = ((target - view.lon + 540) % 360) - 180;
        const k = 1 - Math.pow(0.25, dt);
        view.lon += d * k;
        view.lat += (VIEW.lat - view.lat) * k;
      }
    };

    let raf = 0;
    let running = false;
    let prevNow = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - prevNow) / 1000);
      prevNow = now;
      step(now, dt);
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduced) return;
      running = true;
      prevNow = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const redraw = () => {
      if (!running) draw(performance.now());
    };

    resize();
    redraw();
    const ro = new ResizeObserver(() => {
      resize();
      redraw();
    });
    ro.observe(wrap);

    let inView = false;
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        if (inView && !document.hidden) start();
        else stop();
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);
    const onVis = () => {
      if (document.hidden) stop();
      else if (inView) start();
    };
    document.addEventListener("visibilitychange", onVis);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      vel.lon = 0;
      vel.lat = 0;
      last = { x: e.clientX, y: e.clientY, t: performance.now() };
      lastInput = last.t / 1000;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      lightTarget[0] = -0.2 + nx * 0.6;
      lightTarget[1] = 0.32 - ny * 0.6;
      if (!dragging) {
        redraw();
        return;
      }
      const now = performance.now();
      const dx = e.clientX - last.x;
      const dy = e.clientY - last.y;
      const dLon = -(dx / R) / DEG;
      const dLat = dy / R / DEG;
      view.lon += dLon;
      view.lat = Math.max(-65, Math.min(75, view.lat + dLat));
      const dt = Math.max(0.008, (now - last.t) / 1000);
      vel.lon = dLon / dt;
      vel.lat = dLat / dt;
      last = { x: e.clientX, y: e.clientY, t: now };
      lastInput = now / 1000;
      redraw();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (performance.now() - last.t > 80) {
        vel.lon = 0;
        vel.lat = 0;
      }
      lastInput = performance.now() / 1000;
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = "grab";
      if (reduced) {
        vel.lon = 0;
        vel.lat = 0;
      }
    };
    const onLeave = () => {
      lightTarget[0] = -0.38;
      lightTarget[1] = 0.42;
    };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) return;
      e.preventDefault();
      if (k === "ArrowLeft") view.lon -= 12;
      if (k === "ArrowRight") view.lon += 12;
      if (k === "ArrowUp") view.lat = Math.min(75, view.lat + 8);
      if (k === "ArrowDown") view.lat = Math.max(-65, view.lat - 8);
      lastInput = performance.now() / 1000;
      redraw();
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("keydown", onKey);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("keydown", onKey);
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas
        ref={canvasRef}
        tabIndex={0}
        role="img"
        aria-label="Globe with a pin on Foster City, California, and arcs from Seoul, Hangzhou, Beijing, Seattle and New York. Drag or use the arrow keys to spin it."
        className="absolute inset-0 h-full w-full cursor-grab rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-nltLime/60"
        style={{ touchAction: "pan-y" }}
      />
      {/* pin label — positioned every frame from the projected pin */}
      <div
        ref={labelRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-lg bg-[#0a0b0c]/70 px-2.5 py-1.5 leading-tight backdrop-blur-[3px]"
        style={{ opacity: 0 }}
      >
        <p className="text-[13px] font-medium text-white">Foster City, CA</p>
        <p className="mt-0.5 font-mono text-[11px] tracking-[0.08em] text-white/70">{time ?? " "}</p>
      </div>
    </div>
  );
}
