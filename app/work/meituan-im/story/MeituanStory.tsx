"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode, useState } from "react";

import { Action } from "@/components/Action";
import { Reveal } from "@/components/Reveal";
import { EASE } from "@/lib/motion";

import { BLUEPRINT, COPY, EXPIRED_IDX, STATE_FLOWS, TXN } from "./copy";
import { CountUp, Embed, MT, Phone, Rich, Shot, Swimlane, plain } from "./visuals";

/**
 * The Meituan case study, page by page in the order of the presentation deck:
 * every deck slide is one spread here (eyebrow, one-line title, a sentence or
 * two, and the slide's picture), so each screen carries one idea. The hero
 * (the deck's cover) lives in page.tsx; this renders everything after it.
 */

export const STORY_TOC = [
  { id: "overview", label: "Overview" },
  { id: "broken-trust", label: "Broken Trust" },
  { id: "approach", label: "Approach" },
  { id: "interaction", label: "Interaction" },
  { id: "edge", label: "Edge Case" },
  { id: "us-rebuild", label: "US Rebuild" },
  { id: "results", label: "Results" },
  { id: "next", label: "Next" },
  { id: "prototype", label: "Prototype" },
] as const;

// ─── Page scaffolding ────────────────────────────────────────────────────────

const WRAP = "mx-auto w-full max-w-content px-6 md:px-[84px]";

function Eye({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`font-mono text-[11px] uppercase tracking-[0.16em] ${dark ? "text-white/50" : "text-textSecondary/80"}`}>{children}</p>;
}

function Title({ text, dark = false, size = "md" }: { text: string; dark?: boolean; size?: "md" | "lg" }) {
  const s = size === "lg" ? "text-[clamp(1.75rem,3.2vw,2.6rem)] leading-[1.3]" : "text-[clamp(1.55rem,2.5vw,2.15rem)] leading-[1.22]";
  return (
    <h2 className={`mt-5 font-display font-light tracking-[-0.02em] ${s} ${dark ? "text-white" : "text-textPrimary"}`}>
      <Rich text={text} dark={dark} />
    </h2>
  );
}

function Body({ text, dark = false, className = "" }: { text: string; dark?: boolean; className?: string }) {
  return (
    <p className={`mt-5 max-w-[34rem] text-[16px] leading-[1.75] ${dark ? "text-white/65" : "text-textSecondary"} ${className}`}>
      <Rich text={text} dark={dark} />
    </p>
  );
}

/** A side note set off by a rule on its left (the deck's call-out). */
function Note({ children }: { children: ReactNode }) {
  return <div className="mt-7 max-w-[34rem] border-l-2 border-textPrimary pl-5 text-[15px] leading-[1.8] text-textPrimary/80">{children}</div>;
}

/** One deck slide as a spread: text on the left, its picture on the right
 *  (stacked on small screens). Dark spreads run full-bleed. */
function Spread({
  id,
  eye,
  title,
  body,
  extras,
  media,
  mediaW = 420,
  dark = false,
  titleSize,
}: {
  id?: string;
  eye: string;
  title: string;
  body?: string;
  extras?: ReactNode;
  media?: ReactNode;
  mediaW?: number;
  dark?: boolean;
  titleSize?: "md" | "lg";
}) {
  return (
    <section
      id={id}
      data-surface={dark ? "dark" : undefined}
      className={`scroll-mt-0 ${dark ? "bg-[#0a0b0c]" : ""} flex items-center py-20 md:py-28 lg:min-h-[78vh]`}
    >
      <div className={WRAP}>
        <div
          className={media ? "grid items-center gap-12 lg:gap-16 lg:[grid-template-columns:minmax(0,1fr)_var(--mw)]" : ""}
          style={media ? ({ "--mw": `${mediaW}px` } as React.CSSProperties) : undefined}
        >
          <Reveal>
            <Eye dark={dark}>{plain(eye)}</Eye>
            <Title text={title} dark={dark} size={titleSize} />
            {body ? <Body text={body} dark={dark} /> : null}
            {extras}
          </Reveal>
          {media ? (
            <Reveal delay={0.1} className="min-w-0">
              {media}
            </Reveal>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const Tint = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-[14px] px-7 py-7 md:px-9 md:py-8 ${className}`} style={{ background: MT.tint }}>
    {children}
  </div>
);

const PanelLabel = ({ children }: { children: ReactNode }) => (
  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">{children}</p>
);

/** Shipped (Chinese) next to rebuilt (English): the deck's side-by-side pair. */
function Pair({ left, right }: { left: ReactNode; right: ReactNode }) {
  return <div className="grid grid-cols-2 gap-4 md:gap-6">{[left, right].map((n, i) => <div key={i} className="min-w-0">{n}</div>)}</div>;
}

// ─── Pages ───────────────────────────────────────────────────────────────────

function Context() {
  const c = COPY.context;
  const analogy = [
    { icon: "/assets/meituan-im/logos/uber-icon.png", name: "Uber", note: c.u },
    { icon: "/assets/meituan-im/logos/yelp-icon.png", name: "Yelp", note: c.y },
    { icon: "/assets/meituan-im/logos/taskrabbit-icon.png", name: "TaskRabbit", note: c.t },
  ];
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      extras={
        <div className="mt-10 max-w-[56rem]">
          <div className="grid gap-3 sm:grid-cols-3">
            {analogy.map((a) => (
              <Tint key={a.name} className="!px-6 !py-6">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={a.icon} alt="" aria-hidden className="h-[26px] w-[26px] shrink-0 rounded-[6px] object-contain" />
                  <p className="text-[16px] font-medium tracking-tight text-textPrimary">{a.name}</p>
                </div>
                <p className="mt-3 text-[14px] leading-relaxed text-textSecondary">{a.note}</p>
              </Tint>
            ))}
          </div>
          <Tint className="mt-3 flex flex-wrap items-center gap-x-14 gap-y-5 !py-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/meituan-im/meituan-logo.png" alt="Meituan" className="h-6 w-auto object-contain" />
            <div>
              <p className="font-display text-[2rem] font-light leading-none tabular-nums text-textPrimary">
                <CountUp to={770} suffix="M+" />
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">Annual users</p>
            </div>
            <div>
              <p className="font-display text-[2rem] font-light leading-none tabular-nums text-textPrimary">
                <CountUp to={14.5} format={(n) => n.toFixed(1)} suffix="M" />
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">Merchants</p>
            </div>
          </Tint>
        </div>
      }
    />
  );
}

function Role() {
  const c = COPY.role;
  return <Spread eye={c.eye} title={c.title} body={c.body} titleSize="lg" />;
}

function Voice() {
  const c = COPY.voice;
  return (
    <section id="broken-trust" data-surface="dark" className="relative flex items-center overflow-hidden bg-[#0a0b0c] py-24 md:py-32 lg:min-h-[78vh]">
      <span aria-hidden className="pointer-events-none absolute left-4 top-10 font-display text-[9rem] leading-none md:left-16 md:text-[12rem]" style={{ color: "rgba(255,209,0,0.14)" }}>
        &ldquo;
      </span>
      <div className={`${WRAP} relative`}>
        <Reveal>
          <Eye dark>{c.eye}</Eye>
          <div className="mt-8 max-w-[52rem] space-y-1 font-display text-[clamp(1.4rem,2.4vw,2rem)] font-light leading-[1.6] text-white/90">
            {[c.l1, c.l2, c.l3].map((l) => (
              <p key={l}>
                <Rich text={l} dark />
              </p>
            ))}
          </div>
          <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{c.src}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Broken() {
  const c = COPY.broken;
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={400}
      media={
        <Tint>
          <PanelLabel>{c.panel}</PanelLabel>
          <ol className="mt-4">
            {c.steps.split("\n").map((s, i) => (
              <li key={s} className="flex items-baseline gap-4 py-2.5">
                <span className="font-mono text-[10px] tabular-nums text-textSecondary/50">0{i + 1}</span>
                <span className="text-[15px] text-textSecondary">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.16em] text-textPrimary">{c.breakT}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-textSecondary/80">{c.breakN}</p>
        </Tint>
      }
    />
  );
}

function FirstTry() {
  const c = COPY.firsttry;
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      extras={
        <Note>
          <Rich text={c.insight} />
        </Note>
      }
      mediaW={400}
      media={
        <Tint className="!py-9">
          <PanelLabel>{c.revLabel}</PanelLabel>
          <p className="mt-5 text-[16px] tracking-[0.1em]" aria-label="1 out of 5 stars">
            <span style={{ color: MT.accent }}>★</span>
            <span className="text-black/15">★★★★</span>
          </p>
          <p className="mt-4 font-display text-[1.25rem] font-light leading-[1.6] text-textPrimary">{c.review}</p>
          <p className="mt-5 text-[13px] leading-relaxed text-textSecondary/80">{c.revNote}</p>
        </Tint>
      }
    />
  );
}

function OptionsAB() {
  const c = COPY.optionsAB;
  const options = [
    { tag: "Option A", t: c.aT, b: c.aB, p: c.aP },
    { tag: "Option B", t: c.bT, b: c.bB, p: c.bP },
  ];
  return (
    <Spread
      id="approach"
      eye={c.eye}
      title={c.title}
      extras={
        <div className="mt-10 grid max-w-[60rem] gap-10 md:grid-cols-2 md:gap-12">
          {options.map((o) => (
            <div key={o.tag}>
              <span className="rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-textSecondary" style={{ background: MT.tint }}>
                {o.tag}
              </span>
              <p className="mt-4 text-[17px] font-medium tracking-tight text-textPrimary">{plain(o.t)}</p>
              <p className="mt-3 text-[15px] leading-[1.75] text-textSecondary">
                <Rich text={o.b} />
              </p>
              <p className="mt-2 text-[14px] leading-[1.75] text-textSecondary/75">
                <Rich text={o.p} />
              </p>
            </div>
          ))}
        </div>
      }
    />
  );
}

function OptionC() {
  const c = COPY.optionC;
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      titleSize="lg"
      extras={
        <Note>
          <Rich text={c.note} />
        </Note>
      }
    />
  );
}

function Blueprint() {
  const c = COPY.blueprint;
  const steps = c.steps.split("\n");
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      extras={
        <ol className="mt-8 max-w-[26rem]">
          {steps.map((s, i) => (
            <li key={s} className="flex items-baseline gap-4 py-2">
              <span className="font-mono text-[10px] tabular-nums text-textPrimary">0{i + 1}</span>
              <span className="text-[16px] text-textPrimary">
                <Rich text={s} />
              </span>
              {i < steps.length - 1 ? (
                <span aria-hidden className="ml-auto text-[13px] text-black/25">
                  ➔
                </span>
              ) : null}
            </li>
          ))}
        </ol>
      }
      mediaW={620}
      media={
        <div className="rounded-[14px] bg-[#0a0b0c] p-6 md:p-7">
          <div className="mb-5 flex items-baseline justify-between">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Service blueprint</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">5 stages · 3 lanes</p>
          </div>
          <Swimlane heads={BLUEPRINT.stages} lanes={BLUEPRINT.lanes} flow={BLUEPRINT.flow} id="mt-bp-arrow" minW={520} />
        </div>
      }
    />
  );
}

function Txn() {
  const c = COPY.txn;
  return (
    <section data-surface="dark" className="flex items-center bg-[#0a0b0c] py-24 md:py-28 lg:min-h-[78vh]">
      <div className={WRAP}>
        <Reveal>
          <Eye dark>{c.eye}</Eye>
          <Title text={c.title} dark />
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <Swimlane heads={TXN.phases} lanes={TXN.lanes} flow={TXN.flow} id="mt-txn-arrow" minW={860} />
          <p className="mt-6 flex items-center gap-2 text-[12px] text-white/45">
            <span aria-hidden className="inline-block h-2 w-2 rounded-[3px]" style={{ background: MT.accent }} />
            {c.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

const SHIPPED = {
  diagnose: { src: "/assets/meituan-im/screen-07-diagnosis-start.jpg", natH: 9090, alt: "Diagnosis start, shipped Chinese version" },
  order: { src: "/assets/meituan-im/screen-11-diagnosis-product-rec.jpg", natH: 10032, alt: "Structured repair order, shipped Chinese version" },
  quoting: { src: "/assets/meituan-im/screen-02-live-quoting.jpg", natH: 5388, alt: "Live quoting, shipped Chinese version" },
};

function Diagnose() {
  const c = COPY.diagnose;
  return (
    <Spread
      id="interaction"
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={600}
      media={<Pair left={<Shot {...SHIPPED.diagnose} caption={c.capZh} />} right={<Phone flow="default" seek={13} caption={c.capEn} />} />}
    />
  );
}

function Order() {
  const c = COPY.order;
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={600}
      media={<Pair left={<Shot {...SHIPPED.order} still focus={0.86} caption={c.capZh} />} right={<Phone flow="default" caption={c.capEn} />} />}
    />
  );
}

function Quoting() {
  const c = COPY.quoting;
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={600}
      media={<Pair left={<Shot {...SHIPPED.quoting} caption={c.capZh} />} right={<Phone flow="default" seek={20} caption={c.capEn} />} />}
    />
  );
}

function Dialogflow() {
  const c = COPY.dialogflow;
  return <Spread eye={c.eye} title={c.title} body={c.body} media={<Phone flow="default" caption={c.cap} />} />;
}

function States() {
  const c = COPY.states;
  const chips = c.chips.split("\n");
  const [active, setActive] = useState(EXPIRED_IDX);
  const flow = STATE_FLOWS[active] ?? "default";
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      extras={
        <>
          <div className="mt-7 flex max-w-[34rem] flex-wrap gap-2" role="tablist" aria-label="Quote card states">
            {chips.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setActive(i)}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150"
                  style={on ? { background: MT.accent, color: MT.accentInk } : { background: MT.tint, color: "#545454" }}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <AnimatePresence initial={false}>
            {active === EXPIRED_IDX ? (
              <motion.div
                key="expired"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <Note>
                  <Rich text={c.expiredNote} />
                </Note>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      }
      media={<Phone key={flow} flow={flow} caption={`Live · ${chips[active]}`} />}
    />
  );
}

function Merchant() {
  const c = COPY.merchant;
  return (
    <section className="py-20 md:py-28">
      <div className={WRAP}>
        <Reveal>
          <Eye>{c.eye}</Eye>
          <Title text={c.title} />
          <Body text={c.body} className="!max-w-[44rem]" />
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <Embed src={`/assets/meituan-im/Revised%20Repair%20Flow.html#flow=merchant&rail=0`} title="Merchant quoting workbench, live prototype" natW={1110} natH={820} />
        </Reveal>
      </div>
    </section>
  );
}

function Selfserve() {
  const c = COPY.selfserve;
  return <Spread id="edge" eye={c.eye} title={c.title} body={c.body} media={<Phone flow="cat-litter" caption={c.cap} />} />;
}

function Redesign() {
  const c = COPY.redesign;
  return (
    <Spread
      id="us-rebuild"
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={600}
      media={
        <Pair
          left={<Embed src="/assets/meituan-im/interaction-flow-phone.html#flow=default&rail=0" title="Early prototype version" natW={480} natH={1010} maxH={560} caption={c.capA} />}
          right={<Phone flow="default" src="/assets/meituan-im/Repair%20Flow.html" caption={c.capB} />}
        />
      }
    />
  );
}

function AiAgent() {
  const c = COPY.aiagent;
  return <Spread eye={c.eye} title={c.title} body={c.body} media={<Phone flow="ai-agent" caption={c.cap} />} />;
}

function Ada1() {
  const c = COPY.ada1;
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={600}
      media={<Pair left={<Shot {...SHIPPED.diagnose} alt="Shipped version, dense" still focus={0.04} caption={c.capZh} />} right={<Phone flow="default" caption={c.capEn} />} />}
    />
  );
}

function Ada2() {
  const c = COPY.ada2;
  const specs = [
    { n: "44×44", unit: "pt", d: "Minimum touch target" },
    { n: "≥12", unit: "px", d: "Minimum type size" },
    { n: "100", unit: "%", d: "Cards readable by screen reader" },
  ];
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={400}
      media={
        <Tint className="space-y-8 !py-10">
          {specs.map((s) => (
            <div key={s.d}>
              <p className="font-display text-[2.6rem] font-light leading-none tracking-[-0.02em] text-textPrimary">
                {s.n}
                <span className="text-[0.45em] text-textSecondary/60"> {s.unit}</span>
              </p>
              <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">{s.d}</p>
            </div>
          ))}
        </Tint>
      }
    />
  );
}

function Ada3() {
  const c = COPY.ada3;
  const rows = [
    { k: "Dates", a: "2025-08-12", b: "08/12/2025" },
    { k: "Units & currency", a: "¥200 · 5 km", b: "$45-60 · 3.1 mi" },
    { k: "Copy tone", a: "师傅已接单", b: "A pro's on it" },
  ];
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={420}
      media={
        <Tint className="space-y-7 !py-9">
          {rows.map((r) => (
            <div key={r.k}>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">{r.k}</p>
              <p className="mt-2 flex items-center gap-3">
                <span className="text-[15px] text-textSecondary/50 line-through">{r.a}</span>
                <span aria-hidden className="text-[13px]" style={{ color: MT.accentInk }}>
                  ➔
                </span>
                <span className="text-[16px] font-medium text-textPrimary">{r.b}</span>
              </p>
            </div>
          ))}
        </Tint>
      }
    />
  );
}

function Tokens() {
  const c = COPY.tokens;
  return <Spread eye={c.eye} title={c.title} titleSize="lg" />;
}

function Impact() {
  const c = COPY.impact;
  const rows = [
    { cat: "Toilet repair", before: "9%", after: "11.7%", lift: "+30% relative" },
    { cat: "Drain clearing", before: "17%", after: "22%", lift: "+29.4% relative" },
  ];
  const stats = [
    { v: <CountUp to={1.3} format={(n) => n.toFixed(1)} suffix="×" />, d: c.s1, key: true },
    { v: <CountUp to={0.5} format={(n) => n.toFixed(1)} prefix="+" suffix="pp" />, d: c.s2 },
    { v: <CountUp to={2000} prefix="~" />, d: c.s3 },
    { v: <CountUp to={50} prefix="−" suffix="%" />, d: c.s4 },
  ];
  return (
    <section id="results" data-surface="dark" className="flex items-center bg-[#0a0b0c] py-24 md:py-28 lg:min-h-[78vh]">
      <div className={WRAP}>
        <Reveal>
          <Eye dark>{c.eye}</Eye>
          <Title text={c.title} dark />
        </Reveal>
        <Reveal delay={0.1} className="mt-10 max-w-[56rem]">
          <div className="overflow-x-auto rounded-[14px] bg-white/[0.05]">
            <div className="grid min-w-[30rem] grid-cols-4 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/50">
              {["Category", "Before", "After", "Lift"].map((h) => (
                <span key={h}>{h}</span>
              ))}
            </div>
            {rows.map((r) => (
              <div key={r.cat} className="grid min-w-[30rem] grid-cols-4 px-6 py-3 text-[15px] text-white">
                <span className="font-medium">{r.cat}</span>
                <span className="text-white/60">{r.before}</span>
                <span>{r.after}</span>
                <span style={{ color: MT.accent }}>{r.lift}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-1">
            {stats.map((s, i) => (
              <div key={i} className="flex items-baseline gap-5 py-2 md:gap-8">
                <p className="w-[7.5rem] shrink-0 text-right font-display text-[2rem] font-light leading-none tabular-nums" style={{ color: s.key ? MT.accent : "#fff" }}>
                  {s.v}
                </p>
                <p className="text-[15px] text-white/70">
                  <Rich text={s.d} dark />
                </p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[13px] text-white/45">{c.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Ai() {
  const c = COPY.ai;
  const pipe = c.pipe.split("\n");
  return (
    <Spread
      id="next"
      eye={c.eye}
      title={c.title}
      body={c.body}
      mediaW={400}
      media={
        <Tint className="!py-9">
          <PanelLabel>{c.pipeLabel}</PanelLabel>
          <ol className="mt-6">
            {pipe.map((p, i) => {
              const last = i === pipe.length - 1;
              return (
                <li key={p} className="relative pb-7 pl-7 last:pb-0">
                  {!last ? <span aria-hidden className="absolute left-[5px] top-4 w-px bg-black/20" style={{ height: "calc(100% - 8px)" }} /> : null}
                  <span
                    aria-hidden
                    className="absolute left-0 top-[6px] block h-[11px] w-[11px] rounded-full border-2"
                    style={{ background: last ? MT.accent : "#fff", borderColor: last ? MT.accent : "rgba(0,0,0,0.25)" }}
                  />
                  <p className="text-[15px] leading-relaxed text-textSecondary">{p}</p>
                </li>
              );
            })}
          </ol>
        </Tint>
      }
    />
  );
}

function Risk() {
  const c = COPY.risk;
  return (
    <Spread
      eye={c.eye}
      title={c.title}
      titleSize="lg"
      body={c.body}
      extras={
        <Note>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-textPrimary">{c.noteT}</p>
          <p className="mt-2">{c.noteB}</p>
        </Note>
      }
    />
  );
}

function Proto() {
  const c = COPY.proto;
  return (
    <section id="prototype" className="py-20 md:py-28">
      <div className={WRAP}>
        <Reveal>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <Eye>{c.eye}</Eye>
            <Action href="/work/meituan-im/prototype" variant="label" newTab>
              Open full page
            </Action>
          </div>
        </Reveal>
        <Reveal emphasis className="mt-6">
          <Embed src="/assets/meituan-im/Revised%20Repair%20Flow.html" title="Full interactive prototype" natW={1200} natH={1080} maxH={760} />
          <p className="mx-auto mt-5 max-w-[44rem] text-center text-[14px] leading-relaxed text-textSecondary">{c.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Closing() {
  const c = COPY.closing;
  return (
    <section className="py-24 md:py-32">
      <div className={WRAP}>
        <Reveal>
          <h2 className="max-w-[48rem] font-display text-[clamp(1.9rem,3.6vw,3rem)] font-light leading-[1.3] tracking-[-0.02em] text-textPrimary">
            <Rich text={c.title} />
          </h2>
          <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.16em] text-textSecondary/70">{c.credit}</p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Action href="/work/meituan-im/prototype" newTab>
              Try the prototype
            </Action>
            <Action href="/work/meituan-im/deck-story-en" variant="secondary">
              View Presentation Deck
            </Action>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ─── The story ───────────────────────────────────────────────────────────────

export function MeituanStory() {
  return (
    <>
      {/* Opening */}
      <Context />
      <Role />
      {/* Broken trust */}
      <Voice />
      <Broken />
      <FirstTry />
      {/* Approach */}
      <OptionsAB />
      <OptionC />
      <Blueprint />
      <Txn />
      {/* Interaction */}
      <Diagnose />
      <Order />
      <Quoting />
      <Dialogflow />
      <States />
      <Merchant />
      {/* Edge */}
      <Selfserve />
      {/* US rebuild */}
      <Redesign />
      <AiAgent />
      <Ada1 />
      <Ada2 />
      <Ada3 />
      <Tokens />
      {/* Results */}
      <Impact />
      {/* Next */}
      <Ai />
      <Risk />
      {/* Close */}
      <Proto />
      <Closing />
    </>
  );
}
