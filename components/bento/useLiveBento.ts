"use client";

import { type RefObject, useEffect } from "react";

/**
 * The live reflow, after the Live bento (tech/library/demos/live-bento.html):
 * point at a block and its column widens and its row grows on springs while
 * the rest of the board gives way, so the whole grid reflows around what the
 * visitor is looking at. The board's total width never changes. Desktop with
 * a mouse only; reduced motion keeps the board still.
 *
 * Markup: a column carries data-col, data-grow (how much wider it gets when
 * one of its blocks is pointed at) and data-floor (px it never gives below).
 * A block carries data-live: "grow" (its height is a weight that grows),
 * "fixed" (keeps its own height and only widens its column) or "hold"
 * (pointing at it changes nothing, so the nav never moves under the cursor).
 * data-press on a block eases its column's --press to that value while it is
 * pointed at. Gaps keep the last block's layout; leaving the board rests it.
 *
 * At rest the CSS layout is untouched: the board is measured when the pointer
 * first comes in, driven in px while anything moves, and handed back to CSS
 * once it has settled. A resize drops straight back to CSS.
 */

const STIFFNESS = 170;
const DAMPING = 24;
// a pointed-at block's height weight, against 1 for the others in its column
const ROW = 1.7;
// a column gives up at most this share of its width
const GIVE = 0.28;

type Spring = { v: number; vel: number; to: number };
type Col = { el: HTMLElement; rest: number; floor: number; grow: number; open: Spring; press: Spring };
type Cell = { el: HTMLElement; col: Col; rest: number; grows: boolean; press: number; open: Spring };

const spring = (to: number): Spring => ({ v: to, vel: 0, to });

export function useLiveBento(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const desktop = window.matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");

    let cols: Col[] = [];
    let cells: Cell[] = [];
    let measured = false;
    let hover: Cell | null = null;
    let raf = 0;
    let last = 0;

    const measure = () => {
      cols = Array.from(root.querySelectorAll<HTMLElement>("[data-col]")).map((el) => {
        const rest = el.getBoundingClientRect().width;
        const floor = Math.min(rest, Math.max(Number(el.dataset.floor || 0), rest * (1 - GIVE)));
        return { el, rest, floor, grow: Number(el.dataset.grow || 1.3), open: spring(0), press: spring(1) };
      });
      // a column can only widen by what the others can spare
      for (const c of cols) {
        const spare = cols.reduce((s, o) => (o === c ? s : s + o.rest - o.floor), 0);
        c.grow = 1 + Math.min(c.grow - 1, spare / Math.max(1, c.rest));
      }
      cells = [];
      for (const col of cols) {
        col.el.querySelectorAll<HTMLElement>("[data-live]").forEach((el) => {
          const mode = el.dataset.live;
          if (mode === "hold" || !el.offsetParent) return;
          cells.push({ el, col, rest: el.getBoundingClientRect().height, grows: mode === "grow", press: Number(el.dataset.press || 1), open: spring(0) });
        });
      }
      measured = true;
    };

    const apply = () => {
      // the open column takes its extra width from the others, in proportion
      // to what each can still spare, so the total stays put
      let extra = 0;
      let spare = 0;
      for (const c of cols) {
        extra += c.rest * (c.grow - 1) * c.open.v;
        spare += (c.rest - c.floor) * Math.max(0, 1 - c.open.v);
      }
      for (const c of cols) {
        const give = spare > 0 ? (extra * (c.rest - c.floor) * Math.max(0, 1 - c.open.v)) / spare : 0;
        const w = c.rest * (1 + (c.grow - 1) * c.open.v) - give;
        c.el.style.flex = `0 0 ${w.toFixed(2)}px`;
        c.el.style.maxWidth = "none";
        c.el.style.minWidth = "0";
        c.el.style.setProperty("--press", c.press.v.toFixed(4));
      }
      for (const k of cells) if (k.grows) k.el.style.flexGrow = (k.rest * (1 + (ROW - 1) * k.open.v)).toFixed(2);
    };

    const release = () => {
      for (const c of cols) {
        c.el.style.flex = "";
        c.el.style.maxWidth = "";
        c.el.style.minWidth = "";
        c.el.style.removeProperty("--press");
      }
      for (const k of cells) k.el.style.flexGrow = "";
      cols = [];
      cells = [];
      measured = false;
      hover = null;
    };

    const tick = (now: number) => {
      raf = 0;
      // wall-clock time in small steps, so a slow frame doesn't slow the springs
      const elapsed = Math.min(0.1, Math.max(0, (now - last) / 1000));
      const n = Math.max(1, Math.ceil(elapsed / 0.008));
      const dt = elapsed / n;
      last = now;
      let moving = false;
      const springs = [...cols.flatMap((c) => [c.open, c.press]), ...cells.map((k) => k.open)];
      for (const s of springs) {
        for (let i = 0; i < n; i++) {
          s.vel += ((s.to - s.v) * STIFFNESS - s.vel * DAMPING) * dt;
          s.v += s.vel * dt;
        }
        if (Math.abs(s.to - s.v) > 0.001 || Math.abs(s.vel) > 0.001) moving = true;
        else {
          s.v = s.to;
          s.vel = 0;
        }
      }
      apply();
      if (moving) raf = requestAnimationFrame(tick);
      else if (!hover) release();
    };

    const point = (cell: Cell | null) => {
      hover = cell;
      for (const c of cols) {
        c.open.to = cell && cell.col === c ? 1 : 0;
        c.press.to = cell && cell.col === c ? cell.press : 1;
      }
      for (const k of cells) k.open.to = k === cell && k.grows ? 1 : 0;
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !desktop.matches || calm.matches) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-live]");
      if (!el || el.dataset.live === "hold") return;
      if (!measured) measure();
      const cell = cells.find((k) => k.el === el) ?? null;
      if (cell && cell !== hover) point(cell);
    };
    const leave = () => {
      if (measured) point(null);
    };
    const reset = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (measured) release();
    };

    root.addEventListener("pointerover", over);
    root.addEventListener("pointerleave", leave);
    window.addEventListener("resize", reset);
    return () => {
      root.removeEventListener("pointerover", over);
      root.removeEventListener("pointerleave", leave);
      window.removeEventListener("resize", reset);
      reset();
    };
  }, [ref]);
}
