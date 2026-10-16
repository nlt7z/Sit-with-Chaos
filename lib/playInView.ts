/**
 * Lazy-load a muted video when it scrolls into view, play it while visible,
 * pause it when it leaves. Returns the cleanup.
 *
 * The no-scroll homepage only reports visibility once, so a single refused
 * play() (an autoplay policy such as iPhone Low Power Mode, or a transient
 * state) used to leave the film on its poster for good. Now a refused play is
 * retried for a few seconds, and again on the visitor's first tap, click or
 * key press, which every browser accepts as permission to play.
 */
export function playInView(v: HTMLVideoElement, src: string, threshold = 0.2): () => void {
  let visible = false;
  let tries = 0;
  let retry = 0;
  const attempt = () => {
    if (!visible || !v.paused) return;
    v.play().catch(() => {
      if (visible && tries++ < 20) retry = window.setTimeout(attempt, 400);
    });
  };
  const nudge = () => {
    tries = 0;
    attempt();
  };
  const io = new IntersectionObserver(
    ([e]) => {
      visible = e.isIntersecting;
      clearTimeout(retry);
      if (visible) {
        if (!v.src) {
          v.src = src;
          v.load();
        }
        nudge();
      } else {
        v.pause();
      }
    },
    { threshold },
  );
  io.observe(v);
  document.addEventListener("pointerdown", nudge, { passive: true });
  document.addEventListener("keydown", nudge);
  return () => {
    io.disconnect();
    clearTimeout(retry);
    document.removeEventListener("pointerdown", nudge);
    document.removeEventListener("keydown", nudge);
  };
}
