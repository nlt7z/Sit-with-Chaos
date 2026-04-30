"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
] as const;

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const barTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const };

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0)",
          backdropFilter: scrolled ? "blur(20px)"          : "blur(0px)",
        }}
        transition={barTransition}
        className={`fixed inset-x-0 top-0 z-50 border-b ${
          scrolled ? "border-[rgba(0,0,0,0.08)]" : "border-transparent"
        }`}
      >
        <nav
          className="mx-auto flex max-w-content items-center justify-between px-6 py-4"
          aria-label="Main"
        >
          <Link
            href="/"
            className="font-mono text-sm font-medium tracking-tight text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
          >
            YF
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-6">
                {i > 0 && (
                  <span className="text-textSecondary/40 select-none" aria-hidden>
                    ·
                  </span>
                )}
                <a
                  href={link.href}
                  className="text-sm font-medium text-textSecondary transition-colors duration-500 ease-portfolio hover:text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  {link.label}
                </a>
              </span>
            ))}
            <span className="text-textSecondary/40 select-none" aria-hidden>
              ·
            </span>
            <Link
              href="/resume"
              className="text-sm font-medium text-textPrimary transition-opacity duration-500 ease-portfolio hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
            >
              Resume
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-textPrimary md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <div className="flex w-5 flex-col gap-1.5">
              <motion.span
                animate={open ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="h-0.5 w-full bg-textPrimary"
              />
              <motion.span
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                className="h-0.5 w-full bg-textPrimary"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="h-0.5 w-full bg-textPrimary"
              />
            </div>
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 md:hidden"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.div
              id="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.4,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="fixed bottom-0 right-0 top-0 z-50 w-[min(100%,20rem)] border-l border-[rgba(0,0,0,0.08)] bg-white/95 shadow-md backdrop-blur-xl md:hidden"
            >
              <div className="flex flex-col gap-6 px-8 pb-8 pt-24">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-lg font-medium text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                  >
                    {link.label}
                  </a>
                ))}
                <Link
                  href="/resume"
                  onClick={() => setOpen(false)}
                  className="text-lg font-medium text-textPrimary focus:outline-none focus-visible:ring-2 focus-visible:ring-textPrimary focus-visible:ring-offset-2"
                >
                  Resume
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
