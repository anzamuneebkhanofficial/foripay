import { NextResponse } from "next/server";
import { verifySessionToken } from "./lib/session";

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("paylock_session")?.value;
  const user = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  // 1. Guard Admin Routes (/admin and sub-paths)
  if (pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 2. Guard Merchant Dashboard Routes (/dashboard and sub-paths)
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 3. Auth Gateway Pages (/login, /register, etc.)
  // If user is ALREADY authenticated, redirect them directly to their authorized workspace
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (authRoutes.includes(pathname)) {
    if (user) {
      if (user.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // 4. Public Routes (/, /tracker, /checkout, /receipt, etc.)
  return NextResponse.next();
}

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
