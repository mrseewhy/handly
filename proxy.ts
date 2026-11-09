import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Route protection (Next 16 `proxy.ts`; `middleware.ts` is deprecated).
 *
 * This only checks that a session cookie exists — it is a cheap, non-blocking
 * gate to avoid rendering dashboards for anonymous visitors. Real authorization
 * always happens again in the DAL via `requireActor()` / `requireAdmin()`,
 * because a cookie can be forged and roles can change mid-session.
 */

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const AUTH_PAGES = ["/sign-in", "/sign-up", "/forgot-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !sessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Signed-in users do not need the auth pages.
  if (sessionCookie && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next internals, the auth API, and static assets.
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)",
  ],
};
