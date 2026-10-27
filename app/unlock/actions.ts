"use server";

import { cookies } from "next/headers";

import { GATE_COOKIE, GATE_MAX_AGE, GATE_TOKEN, SITE_PASSWORD } from "@/lib/siteGate";

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
