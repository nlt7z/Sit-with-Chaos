"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

/**
 * On client navigation, align the main document to the start of the page.
 * When the URL has a hash, scrolls to that id instead of y=0.
 * A late pass runs without hash so late iframe focus (e.g. /vibe-coding embeds) does
 * not leave the parent window scrolled away from the top.
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const { hash } = window.location;
    if (hash.length > 1) {
      const id = decodeURIComponent(hash.slice(1));
      const go = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ block: "start" });
          return true;
        }
        return false;
      };
      if (go()) return;
      let n = 0;
      const t = window.setInterval(() => {
        n += 1;
        if (go() || n > 20) clearInterval(t);
      }, 32);
      return () => clearInterval(t);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  useEffect(() => {
    if (window.location.hash.length > 1) return;
    const t = window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }, 120);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
