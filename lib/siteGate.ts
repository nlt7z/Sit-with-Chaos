/**
 * Site-wide password gate. proxy.ts sends every page request without the
 * cookie to /unlock; app/unlock/actions.ts sets the cookie once the code
 * matches. Server-only: never import this from a client component.
 *
 * Bump GATE_TOKEN whenever SITE_PASSWORD changes so old cookies stop working.
 */
export const SITE_PASSWORD = "1024";
export const GATE_COOKIE = "yf-site-pass";
export const GATE_TOKEN = "v1";
export const GATE_MAX_AGE = 60 * 60 * 24 * 30;

/** Where to land after unlocking: same-site paths only, never /unlock itself. */
export function safeNext(raw: string | null | undefined): string {
  const next = (raw ?? "").trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  if (next === "/unlock" || next.startsWith("/unlock?") || next.startsWith("/unlock/")) return "/";
  return next;
}
