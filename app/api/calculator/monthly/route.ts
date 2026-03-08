import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const MONTH_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function parseNonNegativeNumber(value: unknown): number | null {
  const parsed = parseNumber(value);
  if (parsed === null || parsed < 0) return null;
  return parsed;
}

function parseNonNegativeInt(value: unknown): number | null {
  const parsed = parseNumber(value);
  if (parsed === null || parsed < 0 || !Number.isInteger(parsed)) return null;
  return parsed;
}

function normalizeMonth(month: string | null): string | null {
  if (!month) return null;
  const trimmed = month.trim();
  return MONTH_REGEX.test(trimmed) ? trimmed : null;
}

function isMissingTableError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021"
  );
}

export async function GET(request: NextRequest) {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const month = normalizeMonth(request.nextUrl.searchParams.get("month"));
  if (!month) {
    return NextResponse.json(
      { error: "Nieprawidlowy miesiac. Uzyj formatu YYYY-MM." },
      { status: 400 }
    );
  }

  let record = null;
  try {
    record = await prisma.calculatorMonthlyResult.findUnique({
      where: { month },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        { error: "Brak tabeli zapisu miesiecznego. Uruchom migracje Prisma." },
        { status: 503 }
      );
    }
    throw error;
  }

  return NextResponse.json({ record });
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Niepoprawny JSON w zadaniu zapisu." },
      { status: 400 }
    );
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json(
      { error: "Brak danych do zapisu." },
      { status: 400 }
    );
  }

  const body = payload as Record<string, unknown>;
  const month = normalizeMonth(typeof body.month === "string" ? body.month : null);
  if (!month) {
    return NextResponse.json(
      { error: "Nieprawidlowy miesiac. Uzyj formatu YYYY-MM." },
      { status: 400 }
    );
  }

  const hoursP1 = parseNonNegativeNumber(body.hoursP1);
  const hoursP2 = parseNonNegativeNumber(body.hoursP2);
  const totalKm = parseNonNegativeNumber(body.totalKm);
  const weekdayOrders = parseNonNegativeInt(body.weekdayOrders);
  const weekendOrders = parseNonNegativeInt(body.weekendOrders);
  const tips = parseNonNegativeNumber(body.tips);
  const payoutPeriod1 = parseNonNegativeNumber(body.payoutPeriod1);
  const payoutPeriod2 = parseNonNegativeNumber(body.payoutPeriod2);
  const total = parseNonNegativeNumber(body.total);

  if (
    hoursP1 === null ||
    hoursP2 === null ||
    totalKm === null ||
    weekdayOrders === null ||
    weekendOrders === null ||
    tips === null ||
    payoutPeriod1 === null ||
    payoutPeriod2 === null ||
    total === null
  ) {
    return NextResponse.json(
      { error: "Dane liczbowe sa niepoprawne." },
      { status: 400 }
    );
  }

  const finalize = Boolean(body.finalize);

  let existing: { isFinalized: boolean } | null = null;
  try {
    existing = await prisma.calculatorMonthlyResult.findUnique({
      where: { month },
      select: { isFinalized: true },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        { error: "Brak tabeli zapisu miesiecznego. Uruchom migracje Prisma." },
        { status: 503 }
      );
    }
    throw error;
  }

  if (existing?.isFinalized) {
    return NextResponse.json(
      {
        error:
          "Ten miesiac jest juz zamkniety. Nie mozna go nadpisac po finalizacji.",
      },
      { status: 409 }
    );
  }

  let record;
  try {
    record = await prisma.calculatorMonthlyResult.upsert({
      where: { month },
      create: {
        month,
        hoursP1,
        hoursP2,
        totalKm,
        weekdayOrders,
        weekendOrders,
        tips,
        payoutPeriod1,
        payoutPeriod2,
        total,
        isFinalized: finalize,
        finalizedAt: finalize ? new Date() : null,
      },
      update: {
        hoursP1,
        hoursP2,
        totalKm,
        weekdayOrders,
        weekendOrders,
        tips,
        payoutPeriod1,
        payoutPeriod2,
        total,
        isFinalized: finalize,
        finalizedAt: finalize ? new Date() : null,
      },
    });
  } catch (error) {
    if (isMissingTableError(error)) {
      return NextResponse.json(
        { error: "Brak tabeli zapisu miesiecznego. Uruchom migracje Prisma." },
        { status: 503 }
      );
    }
    throw error;
  }

  return NextResponse.json({ record });
}
