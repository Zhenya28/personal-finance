import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  destroySession,
  rateLimitLogin,
  resetLoginAttempts,
  verifyPassword,
} from "@/lib/auth";

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limit = rateLimitLogin(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Zbyt wiele prob logowania. Sprobuj za ${limit.retryAfter}s.` },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: { password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Niepoprawne dane" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password || !verifyPassword(password)) {
    return NextResponse.json({ error: "Nieprawidlowe haslo" }, { status: 401 });
  }

  await createSession();
  resetLoginAttempts(ip);
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ success: true });
}
