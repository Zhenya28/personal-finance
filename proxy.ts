import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE, AUTH_SECRET } from "@/lib/auth";

const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/_next",
  "/favicon.ico",
  "/manifest.json",
  "/icons",
];

const IS_DEV = process.env.NODE_ENV !== "production";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/antigravity")) {
    if (IS_DEV) return NextResponse.next();
    return new NextResponse("Not Found", { status: 404 });
  }

  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    await jwtVerify(token, AUTH_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
