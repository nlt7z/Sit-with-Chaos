import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const visited = request.cookies.get("portfolio-entry");
    if (!visited) {
      const response = NextResponse.redirect(new URL("/vending", request.url));
      // Session cookie — clears when browser closes, so new visits always start at vending
      response.cookies.set("portfolio-entry", "1", { path: "/" });
      return response;
    }
  }
}

export const config = {
  matcher: ["/"],
};
