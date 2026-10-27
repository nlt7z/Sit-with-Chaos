import { NextResponse, type NextRequest } from "next/server";

import { GATE_COOKIE, GATE_TOKEN, safeNext } from "@/lib/siteGate";

/**
 * The whole portfolio sits behind one password (lib/siteGate). Pages without
 * the cookie redirect to /unlock?next=<path>; static files, Next internals and
 * Vercel's own endpoints skip the proxy (see matcher), so link previews keep
 * their og image and embedded files keep loading.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const open = request.cookies.get(GATE_COOKIE)?.value === GATE_TOKEN;

  if (pathname === "/unlock") {
    if (!open) return NextResponse.next();
    return NextResponse.redirect(new URL(safeNext(request.nextUrl.searchParams.get("next")), request.url));
  }
  if (open) return NextResponse.next();

  const url = new URL("/unlock", request.url);
  if (pathname !== "/") url.searchParams.set("next", pathname + search);
  return NextResponse.redirect(url);
}

export const config = {
  // every path except Next internals, Vercel endpoints and anything with a file extension
  matcher: ["/((?!_next/|_vercel/|.*\\..*).*)"],
};
