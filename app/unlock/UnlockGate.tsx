"use client";

import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { actionClass } from "@/components/Action";
import { FlowStrand } from "@/components/FlowStrand";
import { SplitTextChars } from "@/components/SplitBtn";
import { EASE, REVEAL, STAGGER } from "@/lib/motion";

import { requestAccess, unlockSite } from "./actions";

const LENGTH = 4;

// opaque (white 6% / 8% over #0a0b0c) so the flow behind never runs under the text
const FIELD =
  "w-full rounded-[14px] bg-[#191a1b] px-4 text-[16px] text-white outline-none transition-[background-color,box-shadow] duration-150 ease-portfolio placeholder:text-white/35 focus:bg-[#1e1f20] focus:shadow-[inset_0_0_0_1px_rgba(210,255,0,0.7)] md:text-[15px]";

// small text keeps a soft halo of the page colour, so the strand passing behind never cuts through it
const HALO = "[text-shadow:0_0_6px_#0a0b0c,0_0_14px_#0a0b0c,0_0_24px_#0a0b0c]";

const NOTE = `text-[13px] font-medium tracking-[-0.005em] text-white/60 ${HALO}`;

type State = "idle" | "checking" | "wrong" | "open";

/**
 * The password screen. One real <input> sits transparent over four cells, so
 * typing, paste, backspace and the phone keypad all behave natively; the cells
 * only draw what it holds. The fourth digit submits. A wrong code shakes the
 * row and clears it; the right one fills the cells lime, then a full load of
 * `next` (so the homepage intro still plays on arrival). Below, "Request
 * access" opens a short note that is emailed to Yuan.
 */
export function UnlockGate({ next }: { next: string }) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [focused, setFocused] = useState(false);
  const [ask, setAsk] = useState<"closed" | "open" | "sent">("closed");
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

  const swap = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 },
        transition: { duration: 0.35, ease: EASE },
      };

  const busy = state === "checking" || state === "open";
  const caretAt = focused && !busy ? Math.min(code.length, LENGTH - 1) : -1;

  return (
    <main className="relative min-h-[100svh] bg-[#0a0b0c] text-white">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        {...(reduced ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.6, ease: EASE } })}
      >
        <FlowStrand className="h-full w-full" />
      </motion.div>

      {/* top-anchored (not centred) so the note opening below never moves the code */}
      <div className="relative flex min-h-[100svh] flex-col items-center px-6 pb-16 pt-[clamp(6rem,30svh,17rem)]">
        <motion.div {...enter(0)} className="text-center">
          <p className="font-display text-[clamp(2.4rem,5vw,3.2rem)] font-light italic leading-[0.85] text-nltLime">yuan</p>
          <p className="mt-1 font-sans text-[clamp(1.4rem,2.8vw,1.85rem)] font-light uppercase tracking-[0.12em] text-nltLime/60">
            Fang
          </p>
        </motion.div>

        <motion.form {...enter(1)} onSubmit={onSubmit} className="mt-16 flex flex-col items-center" autoComplete="off">
          <label htmlFor="site-password" className={NOTE}>
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
                        ? "bg-[#1e1f20] shadow-[inset_0_0_0_1px_rgba(210,255,0,0.7)]"
                        : "bg-[#191a1b]"
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

          <p id="site-password-status" role="status" className={`mt-5 h-5 ${NOTE}`}>
            {state === "wrong" ? "Wrong password" : ""}
          </p>
        </motion.form>

        <motion.div {...enter(2)} className="mt-8 flex flex-col items-center">
          <AnimatePresence mode="wait" initial={false}>
            {ask === "closed" ? (
              <motion.button key="ask" {...swap} type="button" onClick={() => setAsk("open")} className={`${actionClass("label", "dark")} ${HALO}`}>
                Request access
              </motion.button>
            ) : ask === "sent" ? (
              <motion.p key="sent" {...swap} role="status" className={NOTE}>
                Message sent
              </motion.p>
            ) : (
              <motion.div key="form" {...swap}>
                <RequestForm next={next} onSent={() => setAsk("sent")} onCancel={() => setAsk("closed")} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}

function RequestForm({ next, onSent, onCancel }: { next: string; onSent: () => void; onCancel: () => void }) {
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contact.trim() || state === "sending") return;
    setState("sending");
    const ok = await requestAccess({ contact, message, next, trap }).catch(() => false);
    if (ok) onSent();
    else setState("error");
  };

  return (
    <form onSubmit={send} className="relative flex w-[min(20rem,calc(100vw-3rem))] flex-col gap-3">
      <label htmlFor="ask-contact" className="sr-only">
        Your email or LinkedIn
      </label>
      <input
        id="ask-contact"
        autoFocus
        required
        maxLength={200}
        autoComplete="email"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Your email or LinkedIn"
        className={`${FIELD} h-12`}
      />
      <label htmlFor="ask-message" className="sr-only">
        Message
      </label>
      <textarea
        id="ask-message"
        rows={3}
        maxLength={2000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message (optional)"
        className={`${FIELD} resize-none py-3`}
      />
      {/* honeypot: hidden from people, filled in by form bots */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={trap}
        onChange={(e) => setTrap(e.target.value)}
        className="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
      />

      <div className="mt-2 flex items-center justify-between">
        <button type="button" onClick={onCancel} className={`${actionClass("label", "dark")} ${HALO}`}>
          Cancel
        </button>
        <button
          type="submit"
          disabled={!contact.trim() || state === "sending"}
          className={`${actionClass("primary", "dark")} disabled:pointer-events-none disabled:opacity-40`}
        >
          <span className="sr-only">Send</span>
          <span aria-hidden className="flex select-none items-center leading-[1.1]">
            <SplitTextChars text={state === "sending" ? "Sending" : "Send"} />
          </span>
        </button>
      </div>

      <p role="alert" className={`h-5 text-center ${NOTE}`}>
        {state === "error" ? "Couldn't send. Try again." : ""}
      </p>
    </form>
  );
}
