"use server";

import { createHash } from "node:crypto";

import { cookies } from "next/headers";
import { Resend } from "resend";

import { GATE_COOKIE, GATE_MAX_AGE, GATE_TOKEN, SITE_PASSWORD } from "@/lib/siteGate";

const OWNER_EMAIL = "fangyuanzero7@gmail.com";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks the code on the server and, on a match, sets the gate cookie. */
export async function unlockSite(code: string): Promise<boolean> {
  if (code.trim() !== SITE_PASSWORD) return false;
  (await cookies()).set(GATE_COOKIE, GATE_TOKEN, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: GATE_MAX_AGE,
  });
  return true;
}

/**
 * "Request access": mails the visitor's note to Yuan through Resend (Vercel
 * Marketplace; RESEND_API_KEY and RESEND_EMAIL_DOMAIN come from the
 * integration). An email contact becomes the reply-to, so a reply goes
 * straight back. `trap` is a hidden field only bots fill in.
 */
export async function requestAccess(input: {
  contact: string;
  message: string;
  next: string;
  trap: string;
}): Promise<boolean> {
  if (input.trap) return true;
  const contact = input.contact.replace(/\s+/g, " ").trim().slice(0, 200);
  const message = input.message.trim().slice(0, 2000);
  const apiKey = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_EMAIL_DOMAIN;
  if (!contact || !apiKey || !domain) return false;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send(
    {
      from: `Portfolio <access@${domain}>`,
      to: [OWNER_EMAIL],
      ...(EMAIL_RE.test(contact) ? { replyTo: contact } : {}),
      subject: `Access request from ${contact}`,
      text: [
        "Someone asked for the portfolio password.",
        "",
        `Contact: ${contact}`,
        `Message: ${message || "(none)"}`,
        `Page: https://www.nltstudio7.space${input.next}`,
      ].join("\n"),
    },
    // a double-click or retry of the same note sends one email
    { idempotencyKey: `access-request/${createHash("sha256").update(`${contact}\n${message}`).digest("hex")}` },
  );
  if (error) {
    console.error("requestAccess failed:", error.message);
    return false;
  }
  return true;
}
