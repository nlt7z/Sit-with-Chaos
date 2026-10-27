"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Action } from "@/components/Action";
import { EASE, REVEAL, STAGGER } from "@/lib/motion";

import { unlockSite } from "./actions";

const LENGTH = 4;

type State = "idle" | "checking" | "wrong" | "open";

/**
 * The password screen. One real <input> sits transparent over four cells, so
 * typing, paste, backspace and the phone keypad all behave natively; the cells
 * only draw what it holds. The fourth digit submits. A wrong code shakes the
 * row and clears it; the right one fills the cells lime, then a full load of
 * `next` (so the homepage intro still plays on arrival).
 */
export function UnlockGate({ next }: { next: string }) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const row = useAnimationControls();
  const reduced = !!useReducedMotion();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (value: string) => {
    setState("checking");
    const ok = await unlockSite(value).catch(() => false);
    if (ok) {
      setState("open");
      window.setTimeout(() => window.location.replace(next), reduced ? 0 : 420);
      return;
    }
    setState("wrong");
    if (!reduced) await row.start({ x: [0, -10, 9, -6, 4, 0], transition: { duration: 0.42, ease: "easeOut" } });
    setCode("");
    inputRef.current?.focus();
  };

  const onChange = (raw: string) => {
    if (state === "checking" || state === "open") return;
    const value = raw.replace(/\D/g, "").slice(0, LENGTH);
    setCode(value);
    if (state === "wrong" && value) setState("idle");
    if (value.length === LENGTH) void submit(value);
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (code.length === LENGTH && state !== "checking" && state !== "open") void submit(code);
  };

  const enter = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: REVEAL.y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: REVEAL.duration, ease: EASE, delay: i * STAGGER },
        };

  const busy = state === "checking" || state === "open";
  const caretAt = focused && !busy ? Math.min(code.length, LENGTH - 1) : -1;

  return (
    <main className="flex min-h-[100svh] flex-col items-center bg-[#0a0b0c] px-6 text-white">
      <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-24">
        <motion.div {...enter(0)} className="text-center">
          <p className="font-display text-[clamp(2.4rem,5vw,3.2rem)] font-light italic leading-[0.85] text-nltLime">yuan</p>
          <p className="mt-1 font-sans text-[clamp(1.4rem,2.8vw,1.85rem)] font-light uppercase tracking-[0.12em] text-nltLime/60">
            Fang
          </p>
        </motion.div>

        <motion.form {...enter(1)} onSubmit={onSubmit} className="mt-16 flex flex-col items-center" autoComplete="off">
          <label htmlFor="site-password" className="text-[13px] font-medium tracking-[-0.005em] text-white/60">
            Password
          </label>

          <motion.div animate={row} className="relative mt-4 flex gap-3">
            {Array.from({ length: LENGTH }, (_, i) => {
              const filled = i < code.length;
              return (
                <div
                  key={i}
                  aria-hidden
                  className={`flex h-16 w-14 items-center justify-center rounded-[14px] transition-[background-color,box-shadow] duration-150 ease-portfolio ${
                    state === "open"
                      ? "bg-nltLime"
                      : i === caretAt
                        ? "bg-white/[0.08] shadow-[inset_0_0_0_1px_rgba(210,255,0,0.7)]"
                        : "bg-white/[0.06]"
                  }`}
                >
                  {filled ? (
                    <span className={`h-2.5 w-2.5 rounded-full ${state === "open" ? "bg-[#0a0b0c]" : "bg-white"}`} />
                  ) : i === caretAt ? (
                    <motion.span
                      className="h-6 w-px bg-nltLime"
                      animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
                      transition={{ duration: 1.06, repeat: Infinity, times: [0, 0.5, 0.5, 1], ease: "linear" }}
                    />
                  ) : null}
                </div>
              );
            })}
            <input
              ref={inputRef}
              id="site-password"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={LENGTH}
              autoComplete="off"
              spellCheck={false}
              value={code}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              readOnly={busy}
              aria-invalid={state === "wrong"}
              aria-describedby="site-password-status"
              className="absolute inset-0 h-full w-full cursor-text bg-transparent text-[16px] text-transparent caret-transparent outline-none selection:bg-transparent"
            />
          </motion.div>

          <p id="site-password-status" role="status" className="mt-5 h-5 text-[13px] font-medium tracking-[-0.005em] text-white/60">
            {state === "wrong" ? "Wrong password" : ""}
          </p>
        </motion.form>
      </div>

      <motion.div {...enter(2)} className="pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Action href="mailto:fangyuanzero7@gmail.com" variant="label" tone="dark">
          Request access
        </Action>
      </motion.div>
    </main>
  );
}
