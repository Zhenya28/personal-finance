import { SignJWT, jwtVerify } from "jose";
import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const secretString = process.env.AUTH_SECRET;
if (!secretString && process.env.NODE_ENV === "production") {
  throw new Error("AUTH_SECRET environment variable is required in production");
}

export const AUTH_COOKIE = "finance-session";
export const AUTH_SECRET = new TextEncoder().encode(
  secretString || "finance-dashboard-dev-secret"
);

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const ROLLING_REFRESH_THRESHOLD_SECONDS = 60 * 60 * 24 * 7; // 7 days

async function signSession(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(AUTH_SECRET);
}

function cookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  };
}

export async function createSession() {
  const token = await signSession();
  (await cookies()).set(AUTH_COOKIE, token, cookieOptions());
}

export async function verifySession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, AUTH_SECRET);

    // Rolling refresh: if less than threshold remains, mint a new token.
    if (typeof payload.exp === "number") {
      const remaining = payload.exp - Math.floor(Date.now() / 1000);
      if (remaining < ROLLING_REFRESH_THRESHOLD_SECONDS) {
        const fresh = await signSession();
        cookieStore.set(AUTH_COOKIE, fresh, cookieOptions());
      }
    }
    return true;
  } catch {
    return false;
  }
}

export async function destroySession() {
  (await cookies()).delete(AUTH_COOKIE);
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.AUTH_PASSWORD;
  if (!expected) return false;

  const hashA = createHash("sha256").update(password).digest();
  const hashB = createHash("sha256").update(expected).digest();
  return timingSafeEqual(hashA, hashB);
}

// --- Lightweight in-memory rate limiter for /api/auth ---

interface Bucket {
  count: number;
  resetAt: number;
}
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 10;

export function rateLimitLogin(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  bucket.count += 1;
  if (bucket.count > MAX_ATTEMPTS) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { allowed: true, retryAfter: 0 };
}

export function resetLoginAttempts(ip: string) {
  buckets.delete(ip);
}
