import { NextRequest, NextResponse } from "next/server";
import { getHistorical } from "@/lib/yahoo";
import { verifySession } from "@/lib/auth";

const VALID_PERIODS = ["1mo", "3mo", "6mo", "1y", "2y", "5y"] as const;
type Period = (typeof VALID_PERIODS)[number];

function isValidPeriod(value: string): value is Period {
  return (VALID_PERIODS as readonly string[]).includes(value);
}

export async function GET(request: NextRequest) {
  if (!(await verifySession())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const period = searchParams.get("period");
  const ticker = searchParams.get("ticker") || "VWCE.DE";

  if (!period || !isValidPeriod(period)) {
    return NextResponse.json(
      { error: "Nieprawidlowy parametr period. Dozwolone: " + VALID_PERIODS.join(", ") },
      { status: 400 }
    );
  }

  try {
    const data = await getHistorical(ticker, period);
    return NextResponse.json(data);
  } catch (e) {
    console.error(`API: Failed to fetch historical data for ${ticker} (${period}):`, e);
    return NextResponse.json(
      { error: "Nie udalo sie pobrac danych historycznych" },
      { status: 500 }
    );
  }
}
