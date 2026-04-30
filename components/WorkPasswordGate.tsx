"use client";

import { motion, useMotionTemplate, useSpring } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

const PASSWORD = "1234";

function DotPulse() {
  return (
    <span className="inline-flex items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-neutral-500/80 motion-safe:animate-bounce"
          style={{
            animationDelay: `${i * 0.14}s`,
            animationDuration: "0.55s",
          }}
        />
      ))}
    </span>
  );
}

function AnimatedReturnLink({
  className = "",
  href = "/#work",
  label = "Return to selected work",
}: {
  className?: string;
  href?: string;
  label?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      <Link
        href={href}
        className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-textSecondary transition-colors hover:text-textPrimary"
      >
        <motion.span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(0,0,0,0.08)] bg-white/80 text-textPrimary shadow-sm backdrop-blur-sm"
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          aria-hidden
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300 ease-out group-hover:-translate-x-0.5"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </motion.span>
        <span className="relative">
          {label}
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-textPrimary transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:w-full" />
        </span>
      </Link>
    </motion.div>
  );
}

function CursorGlowLayer({
  reduceMotion,
  children,
}: {
  reduceMotion: boolean;
  children: ReactNode;
}) {
  const mouseX = useSpring(50, { stiffness: reduceMotion ? 500 : 52, damping: reduceMotion ? 100 : 28 });
  const mouseY = useSpring(50, { stiffness: reduceMotion ? 500 : 52, damping: reduceMotion ? 100 : 28 });

  const background = useMotionTemplate`radial-gradient(42rem at ${mouseX}% ${mouseY}%, rgba(139, 126, 200, 0.16) 0%, rgba(253, 200, 170, 0.09) 32%, rgba(255, 255, 255, 0) 55%)`;

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  };

  const handlePointerLeave = () => {
    if (reduceMotion) return;
    mouseX.set(50);
    mouseY.set(42);
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#fafafa]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {!reduceMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{ background }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(40rem_50rem_at_50%_20%,rgba(139,126,200,0.08),transparent_60%)]"
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}

function safeDeckNext(raw: string | null): string {
  const next = (raw ?? "").trim();
  if (!next.startsWith("/work/ai-character/deck")) return "/work/ai-character/deck";
  if (next.startsWith("/work/ai-character/deck/enter")) return "/work/ai-character/deck";
  return next;
}

function ServerUnlockForm({
  action,
  workTitle,
  returnHref,
  returnLabel,
  reduceMotion,
}: {
  action: (formData: FormData) => Promise<void>;
  workTitle?: string;
  returnHref: string;
  returnLabel: string;
  reduceMotion: boolean;
}) {
  const searchParams = useSearchParams();
  const next = useMemo(() => safeDeckNext(searchParams.get("next")), [searchParams]);
  const error = searchParams.get("error") === "1";
  const fieldId = "gate-server-deck-unlock";

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-20 pb-28">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-textSecondary">Protected piece</p>
        {workTitle ? <p className="mt-2 font-mono text-xs text-textSecondary/90">{workTitle}</p> : null}
        <h1 className="mt-5 font-display text-3xl font-light leading-snug text-textPrimary md:text-[2rem]">
          This work is tucked away for now.
        </h1>

        <form action={action} className="mt-10" autoComplete="off">
          <input type="hidden" name="next" value={next} />
          <label htmlFor={fieldId} className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-textSecondary">
            Invite code
          </label>
          <input
            id={fieldId}
            type="password"
            name="password"
            inputMode="numeric"
            className="mt-3 w-full border-b border-neutral-300 bg-transparent py-2.5 font-mono text-sm tracking-widest text-textPrimary outline-none transition-colors placeholder:text-neutral-400/80 focus:border-textPrimary"
            placeholder="••••"
            aria-invalid={error}
            aria-describedby={error ? "gate-server-deck-err" : undefined}
          />
          {error ? (
            <p id="gate-server-deck-err" className="mt-3 text-sm leading-relaxed text-amber-800/90" role="alert">
              Not quite—please double-check the code you were given.
            </p>
          ) : null}

          <div className="mt-8">
            <motion.button
              type="submit"
              whileHover={reduceMotion ? undefined : { scale: 1.02 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              className="inline-flex min-h-[2.75rem] min-w-[9rem] items-center justify-center gap-2 rounded-full bg-textPrimary px-7 text-sm font-medium text-white shadow-md transition-opacity"
            >
              Step inside
            </motion.button>
          </div>
        </form>

        <AnimatedReturnLink href={returnHref} label={returnLabel} className="mt-12" />
      </motion.div>
    </div>
  );
}

function ServerUnlockGate({
  action,
  workTitle,
  returnHref,
  returnLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  workTitle?: string;
  returnHref: string;
  returnLabel: string;
}) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  return (
    <CursorGlowLayer reduceMotion={reduceMotion}>
      <Suspense
        fallback={
          <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pb-24 pt-20">
            <div className="flex flex-col items-center gap-5">
              <DotPulse />
              <span className="sr-only">Loading</span>
              <p className="max-w-xs text-center text-sm text-textSecondary">One moment while we peek at your session…</p>
            </div>
            <AnimatedReturnLink href={returnHref} label={returnLabel} />
          </div>
        }
      >
        <ServerUnlockForm
          action={action}
          workTitle={workTitle}
          returnHref={returnHref}
          returnLabel={returnLabel}
          reduceMotion={reduceMotion}
        />
      </Suspense>
    </CursorGlowLayer>
  );
}

export function WorkPasswordGate({
  storageKey,
  children,
  workTitle,
  returnHref = "/#work",
  returnLabel = "Return to selected work",
  serverUnlockAction,
}: {
  storageKey: string;
  children?: ReactNode;
  workTitle?: string;
  returnHref?: string;
  returnLabel?: string;
  /** Validates with a server action (e.g. httpOnly cookie) instead of sessionStorage. */
  serverUnlockAction?: (formData: FormData) => Promise<void>;
}) {
  if (serverUnlockAction) {
    return (
      <ServerUnlockGate
        action={serverUnlockAction}
        workTitle={workTitle}
        returnHref={returnHref}
        returnLabel={returnLabel}
      />
    );
  }

  const [phase, setPhase] = useState<"init" | "open" | "closed">("init");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const fn = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey) === "1") {
        setPhase("open");
      } else {
        setPhase("closed");
      }
    } catch {
      setPhase("closed");
    }
  }, [storageKey]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(false);
    setSubmitting(true);
    window.setTimeout(() => {
      if (value.trim() === PASSWORD) {
        try {
          sessionStorage.setItem(storageKey, "1");
        } catch {
          /* private mode */
        }
        setPhase("open");
      } else {
        setError(true);
      }
      setSubmitting(false);
    }, 650);
  };

  if (phase === "open") {
    return <>{children}</>;
  }

  return (
    <CursorGlowLayer reduceMotion={reduceMotion}>
      {phase === "init" ? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-10 px-6 pb-24 pt-20">
          <div className="flex flex-col items-center gap-5">
            <DotPulse />
            <span className="sr-only">Checking access</span>
            <p className="max-w-xs text-center text-sm text-textSecondary">
              One moment while we peek at your session…
            </p>
          </div>
          <AnimatedReturnLink href={returnHref} label={returnLabel} />
        </div>
      ) : (
        <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-20 pb-28">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-textSecondary">Protected piece</p>
            {workTitle ? (
              <p className="mt-2 font-mono text-xs text-textSecondary/90">{workTitle}</p>
            ) : null}
            <h1 className="mt-5 font-display text-3xl font-light leading-snug text-textPrimary md:text-[2rem]">
              This work is tucked away for now.
            </h1>

            <form onSubmit={handleSubmit} className="mt-10" autoComplete="off">
              <label
                htmlFor={`gate-${storageKey}`}
                className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-textSecondary"
              >
                Invite code
              </label>
              <input
                id={`gate-${storageKey}`}
                type="password"
                name="password"
                inputMode="numeric"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={submitting}
                className="mt-3 w-full border-b border-neutral-300 bg-transparent py-2.5 font-mono text-sm tracking-widest text-textPrimary outline-none transition-colors placeholder:text-neutral-400/80 focus:border-textPrimary disabled:opacity-50"
                placeholder="••••"
                aria-invalid={error}
                aria-describedby={error ? `gate-err-${storageKey}` : undefined}
              />
              {error ? (
                <p
                  id={`gate-err-${storageKey}`}
                  className="mt-3 text-sm leading-relaxed text-amber-800/90"
                  role="alert"
                >
                  Not quite—please double-check the code you were given.
                </p>
              ) : null}

              <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
                <motion.button
                  type="submit"
                  disabled={submitting || value.length === 0}
                  whileHover={reduceMotion ? undefined : { scale: 1.02 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                  className="inline-flex min-h-[2.75rem] min-w-[9rem] items-center justify-center gap-2 rounded-full bg-textPrimary px-7 text-sm font-medium text-white shadow-md transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {submitting ? (
                    <>
                      <DotPulse />
                      <span className="sr-only">Verifying</span>
                    </>
                  ) : (
                    "Step inside"
                  )}
                </motion.button>
                {submitting ? (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="sm:ml-auto"
                  >
                    <AnimatedReturnLink href={returnHref} label={returnLabel} />
                  </motion.div>
                ) : null}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </CursorGlowLayer>
  );
}
