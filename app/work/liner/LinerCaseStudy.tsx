"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const easePremium = [0.25, 0.1, 0.25, 1] as const;

function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px -8% 0px" }}
      transition={{ duration: 0.85, delay, ease: easePremium }}
    >
      {children}
    </motion.div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-black/[0.06] py-24 md:py-32 lg:py-36">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-textSecondary/75">{eyebrow}</p>
        <h2 className="mt-5 max-w-4xl font-display text-[1.85rem] font-light leading-[1.08] tracking-tight text-textPrimary md:text-[2.4rem] md:leading-[1.06] lg:text-[2.75rem]">
          {title}
        </h2>
        <div className="mt-12 space-y-10 text-[16px] leading-[1.75] text-textSecondary [&>p]:max-w-[40rem]">
          {children}
        </div>
      </div>
    </section>
  );
}

/** Scales an iframe at its natural design size down to fit narrow viewports,
 *  preserving its layout above the breakpoint. Same pattern used elsewhere in
 *  the portfolio for embedded prototypes. */
function ScaledPrototypeFrame({
  src,
  title,
  naturalWidth = 1440,
  naturalHeight = 900,
}: {
  src: string;
  title: string;
  naturalWidth?: number;
  naturalHeight?: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(() => {
    if (typeof window === "undefined") return 1;
    const guess = Math.min(window.innerWidth - 32, naturalWidth) / naturalWidth;
    return Math.max(0.1, Math.min(1, guess));
  });

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setScale(Math.min(1, w / naturalWidth));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [naturalWidth]);

  return (
    <div className="mx-auto w-full" style={{ maxWidth: naturalWidth }}>
      <div
        ref={wrapperRef}
        className="relative w-full overflow-hidden rounded-2xl ring-1 ring-black/[0.06] shadow-[0_36px_72px_-36px_rgba(0,0,0,0.18)]"
        style={{ aspectRatio: `${naturalWidth} / ${naturalHeight}` }}
      >
        <iframe
          src={src}
          title={title}
          loading="lazy"
          style={{
            width: naturalWidth,
            height: naturalHeight,
            border: 0,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          className="absolute left-0 top-0 block bg-white"
        />
      </div>
    </div>
  );
}

export default function LinerCaseStudy() {
  return (
    <>
      <Nav />
      <div className="relative min-h-screen bg-white">
        <article className="relative z-[1] mx-auto max-w-content bg-white px-6 pb-40 pt-32 text-left md:px-12 md:pb-56 md:pt-40 lg:pl-20 lg:pr-14 lg:pb-64 lg:pt-44">
          <main className="relative">
            {/* HERO — placeholder copy; full narrative to follow. */}
            <header id="overview" className="scroll-mt-28 pb-20 md:pb-28">
              <FadeIn>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-textSecondary/85">
                  Liner AI · Capstone
                </p>
                <h1 className="mt-8 max-w-[22ch] font-display text-[2.4rem] font-light leading-[1.05] tracking-tight text-textPrimary sm:max-w-4xl md:text-[3.4rem] md:leading-[1.04] lg:text-[4rem]">
                  Research-driven AI collaboration workflow
                </h1>
                <p className="mt-6 max-w-xl text-[16px] leading-[1.6] text-textSecondary">
                  Product video and interactive prototype from the UW HCDE × Liner AI capstone.
                  Full case study is in progress.
                </p>

                <dl className="mt-14 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-black/[0.08] pt-7 sm:grid-cols-3 sm:gap-y-0">
                  {[
                    { label: "Timeline", value: "2026 · in progress" },
                    { label: "Role", value: "Product Designer" },
                    { label: "Partner", value: "Liner AI · UW HCDE" },
                  ].map(({ label, value }) => (
                    <div key={label} className="min-w-0 border-l border-black/[0.1] pl-3">
                      <dt className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-textSecondary/50">
                        {label}
                      </dt>
                      <dd className="mt-2 font-sans text-[13px] leading-snug text-textSecondary/80">{value}</dd>
                    </div>
                  ))}
                </dl>
              </FadeIn>
            </header>

            {/* PRODUCT VIDEO */}
            <Section id="video" eyebrow="Product Video" title="The product, end to end.">
              <FadeIn className="mt-2">
                <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-black/[0.08] shadow-[0_28px_60px_-30px_rgba(0,0,0,0.28)]">
                  <video
                    className="block h-auto w-full"
                    src="/assets/liner/liner-product-video.mp4"
                    controls
                    playsInline
                    preload="metadata"
                    poster="/assets/liner/liner-present.png"
                  />
                </div>
              </FadeIn>
            </Section>

            {/* INTERACTIVE PROTOTYPE */}
            <Section id="prototype" eyebrow="Interactive Prototype" title="Try the editor.">
              <FadeIn>
                <ScaledPrototypeFrame
                  src="/assets/liner/Liner-AI-Capstone-Prototype-Jen.html"
                  title="Liner AI capstone — interactive editor prototype"
                />
                <p className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-textSecondary/75">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-nltLime" />
                  Built with Claude Code + Figma MCP
                </p>
              </FadeIn>
            </Section>

            {/* PROCESS */}
            <Section id="process" eyebrow="Process" title="Coming soon.">
              <FadeIn>
                <p className="text-[16px] leading-[1.7] text-textSecondary/85">
                  Research, synthesis, and design rationale to follow.
                </p>
              </FadeIn>
            </Section>
          </main>
        </article>
      </div>
      <Footer />
    </>
  );
}
