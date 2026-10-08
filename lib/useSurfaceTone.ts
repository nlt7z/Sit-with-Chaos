"use client";

import { useEffect, useState } from "react";

export type Tone = "dark" | "light";
export type ToneSetting = Tone | "auto";

/**
 * Fixed chrome (the rails) sits over whatever scrolls beneath it. Mark dark
 * bands with `data-surface="dark"` (the case-study hero); with `"auto"` the
 * chrome is light-toned, and turns dark while one of those bands passes under
 * its probe line. `probe` is a viewport fraction: 0.5 for the side rails,
 * near 1 for the bottom pill nav.
 */
export function useSurfaceTone(setting: ToneSetting, probe = 0.5): Tone {
  const [tone, setTone] = useState<Tone>(setting === "auto" ? "light" : setting);

  useEffect(() => {
    if (setting !== "auto") {
      setTone(setting);
      return;
    }
    let raf = 0;
    const measure = () => {
      raf = 0;
      const y = window.innerHeight * probe;
      const dark = Array.from(document.querySelectorAll<HTMLElement>('[data-surface="dark"]')).some((el) => {
        const r = el.getBoundingClientRect();
        return r.top <= y && r.bottom >= y;
      });
      setTone(dark ? "dark" : "light");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [setting, probe]);

  return tone;
}
