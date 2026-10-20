"use client";
/* eslint-disable @next/next/no-img-element */

/**
 * HomeV2 — a rebuild of the homepage around one sentence that holds both of
 * Yuan's worlds: her art and the AI she designs. Small objects sit inside the
 * sentence like words and grow out of it on hover (tap on touch). A quiet work
 * index follows, with one preview image trailing the pointer, and the page
 * ends on a curtain footer with her name set as the floor.
 *
 * Markup lives here; motion lives in ./mount.ts (framework-free, so the static
 * preview runs the exact same code). Styles are in ./home-v2.css, scoped under
 * .hv2. Built with the gallery-grade-web skill.
 */

import Link from "next/link";
import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { gloock } from "@/lib/fonts";
import { EMAIL, RESUME_HREF } from "@/lib/site";
import { mountHomeV2 } from "./mount";
import "./home-v2.css";

const IMG = "/assets/home-v2/";
const NAME = "Yuan Fang";

type Obj = { src: string; w: number; h: number; shape?: "round" | "tall"; rot: number; label: string; tag: string; position?: string };
type Tok = string | { obj: Obj } | { em: string } | { attach: string };

const PORTRAIT: Obj = { src: "obj-portrait.webp", w: 400, h: 400, shape: "round", rot: -4, label: "Portrait of Yuan Fang", tag: "Yuan Fang, product designer", position: "55% 40%" };
const PAINTING: Obj = { src: "obj-painting.webp", w: 504, h: 700, shape: "tall", rot: 3, label: "One of Yuan's acrylic paintings", tag: "Acrylic painting, transfer print" };
const O2_UI: Obj = { src: "obj-o2.webp", w: 695, h: 460, rot: -3, label: "O2 Tech AI showing its reasoning", tag: "O2 Tech AI, showing its reasoning" };

// "Ten years of painting taught me to see" leads into "people can see", so
// the three verbs that close the sentence carry the accent.
const SENTENCE: Tok[] = [
  "I'm", "Yuan", { obj: PORTRAIT }, { attach: "." },
  "Ten", "years", "of", "painting", { obj: PAINTING }, "taught", "me", "to", "see.",
  "Now", "I", "design", "AI", { obj: O2_UI }, "that", "people", "can",
  { em: "see," }, { em: "check," }, "and", { em: "steer." },
];

type Work = { name: string; line: string; when: string; href: string; img: string; w: number; h: number; external?: boolean };

// Meituan stays off the homepage, matching SHOW_MEITUAN in the bento home.
const WORK: Work[] = [
  { name: "O2 Tech AI", line: "Human-in-the-loop sourcing for electronics manufacturing", when: "Now", href: "/work/o2", img: "w-o2.webp", w: 1024, h: 640 },
  { name: "Liner", line: "AI-native co-research for 10M+ academic users", when: "2026", href: "/work/liner", img: "w-liner.webp", w: 1280, h: 800 },
  { name: "Alibaba Cloud", line: "Shipped Qwen Character's Interactive Showrooms MVP", when: "2025", href: "/work/ai-character", img: "w-alibaba.webp", w: 1280, h: 800 },
  { name: "TikTok", line: "Friends' shared videos as a Shared with You feed", when: "Self-initiated", href: "/work/tiktok", img: "w-tiktok.webp", w: 1280, h: 800 },
  { name: "StudioEngine", line: "A GenAI video app rebuilt as a four-stage creative workspace", when: "Case study", href: "/work/studio-engine", img: "w-studioengine.webp", w: 1280, h: 800 },
  { name: "Qbix Studio", line: "My design studio", when: "qbix.space ↗", href: "https://qbix.space", img: "w-qbix.webp", w: 1280, h: 800, external: true },
];

const JOURNEY: [string, string][] = [
  ["O2 Tech AI", "now"],
  ["Liner", "2026"],
  ["Alibaba Cloud", "2025"],
  ["Meituan", "2025"],
  ["University of Washington", "MS"],
  ["Pratt Institute", "BFA"],
];

const ELSEWHERE: [string, string][] = [
  ["LinkedIn", "https://linkedin.com/in/yuan-fang-66395725b"],
  ["GitHub", "https://github.com/nlt7z"],
  ["Qbix Studio", "https://qbix.space"],
];

function SentenceObject({ o }: { o: Obj }) {
  const cls = `hv2-obj${o.shape === "round" ? " is-round" : o.shape === "tall" ? " is-tall" : ""}`;
  return (
    <button type="button" className={cls} data-hv2-obj style={{ "--rot": `${o.rot}deg` } as CSSProperties} aria-expanded="false" aria-label={o.label}>
      <img src={IMG + o.src} alt="" width={o.w} height={o.h} style={o.position ? { objectPosition: o.position } : undefined} />
      <span className="hv2-tag">{o.tag}</span>
    </button>
  );
}

function renderToken(t: Tok): ReactNode {
  if (typeof t === "string") return <span className="hv2-wd">{t}</span>;
  if ("obj" in t) return <SentenceObject o={t.obj} />;
  if ("em" in t) return <em className="hv2-wd">{t.em}</em>;
  return <span className="hv2-wd">{t.attach}</span>;
}

function WorkLink({ item, children }: { item: Work; children: ReactNode }) {
  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <Link href={item.href}>{children}</Link>;
}

export function HomeV2() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current) return;
    return mountHomeV2(root.current);
  }, []);

  return (
    <div ref={root} className={`hv2 ${gloock.variable}`} data-hv2>
      <div className="hv2-main" data-hv2-main>
        <nav className="hv2-nav hv2-gut" data-hv2-nav aria-label="Main">
          <Link className="hv2-home" href="/" aria-current="page">
            Yuan Fang
          </Link>
          <ul>
            <li><Link href="/work">Work</Link></li>
            <li><Link href="/vibe-coding">Lab</Link></li>
            <li><a href={RESUME_HREF} target="_blank" rel="noopener noreferrer">Resume ↗</a></li>
          </ul>
        </nav>

        <section className="hv2-hero hv2-gut">
          <h1 className="hv2-sentence" data-hv2-sentence>
            {SENTENCE.map((t, i) => (
              <Fragment key={i}>
                {i > 0 && !(typeof t === "object" && "attach" in t) ? " " : null}
                {renderToken(t)}
              </Fragment>
            ))}
          </h1>
          <ul className="hv2-facts">
            <li>
              <strong>Now</strong> shaping O2 Tech AI&apos;s human-in-the-loop sourcing product. <Link href="/work/o2">Read the brief</Link>
            </li>
            <li>Foster City, CA</li>
            <li><a href="#hv2-contact">Say hello</a></li>
          </ul>
        </section>

        <section className="hv2-work hv2-gut" aria-labelledby="hv2-work-title">
          <h2 id="hv2-work-title">Selected work</h2>
          <ul className="hv2-rows" data-hv2-rows>
            {WORK.map((item) => (
              <li key={item.name} className="hv2-row" data-hv2-row data-img={IMG + item.img}>
                <WorkLink item={item}>
                  <span className="hv2-name">{item.name}</span>
                  <span className="hv2-line">{item.line}</span>
                  <span className="hv2-when">{item.when}</span>
                  <img className="hv2-thumb" src={IMG + item.img} alt="" loading="lazy" width={item.w} height={item.h} />
                </WorkLink>
              </li>
            ))}
          </ul>
          <Link className="hv2-all" href="/work">All work</Link>
        </section>
      </div>

      <div className="hv2-preview" data-hv2-preview aria-hidden="true">
        <img alt="" />
        <img alt="" />
      </div>

      <footer className="hv2-foot" data-hv2-foot id="hv2-contact">
        <div className="hv2-foot-top hv2-gut">
          <div>
            <h2>Have something in mind?</h2>
            <div className="hv2-mail">
              <span data-hv2-addr>{EMAIL}</span>
              <button type="button" data-hv2-copy>Copy address</button>
            </div>
          </div>
          <div>
            <h3>Pages</h3>
            <ul>
              <li><Link href="/work">Work</Link></li>
              <li><Link href="/vibe-coding">Lab</Link></li>
              <li><a href={RESUME_HREF} target="_blank" rel="noopener noreferrer">Resume ↗</a></li>
            </ul>
          </div>
          <div>
            <h3>Journey</h3>
            <ul>
              {JOURNEY.map(([org, when]) => (
                <li key={org}>
                  {org} <span>{when}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Elsewhere</h3>
            <ul>
              {ELSEWHERE.map(([label, href]) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="hv2-foot-meta hv2-gut">
          <span>
            Foster City, CA, <span data-hv2-time>local time</span>
          </span>
          <button type="button" data-hv2-top>Back to top</button>
        </div>
        <div className="hv2-floor hv2-gut" data-hv2-floor>
          <p>
            <span className="hv2-sr">{NAME}</span>
            {NAME.split(" ").map((word, wi) => (
              <Fragment key={word}>
                {wi > 0 ? " " : null}
                <span aria-hidden="true" style={{ display: "inline-block" }}>
                  {Array.from(word).map((ch, ci) => (
                    <span key={ci} className="c" style={{ display: "inline-block" }}>{ch}</span>
                  ))}
                </span>
              </Fragment>
            ))}
          </p>
        </div>
      </footer>
    </div>
  );
}
