import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

export interface QuoteData {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  currency: string;
  name: string;
}

export interface HistoricalPoint {
  date: string;
  close: number;
}

export async function getQuote(ticker: string): Promise<QuoteData | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quote(ticker);
    if (!result || !result.regularMarketPrice) return null;

    return {
      price: result.regularMarketPrice,
      previousClose: result.regularMarketPreviousClose ?? result.regularMarketPrice,
      change: result.regularMarketChange ?? 0,
      changePercent: result.regularMarketChangePercent ?? 0,
      currency: result.currency ?? "EUR",
      name: result.shortName ?? result.longName ?? ticker,
    };
  } catch (e) {
    console.error(`Failed to fetch quote for ${ticker}:`, e);
    return null;
  }
}

export async function getEurPlnRate(): Promise<number | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quote("EURPLN=X");
    return result?.regularMarketPrice ?? null;
  } catch (e) {
    console.error("Failed to fetch EUR/PLN rate:", e);
    return null;
  }
}

export async function getFxRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = await yf.quote(`${from}${to}=X`);
    return result?.regularMarketPrice ?? null;
  } catch (e) {
    console.error(`Failed to fetch ${from}/${to} rate:`, e);
    return null;
  }
}

export async function getHistorical(
  ticker: string,
  period: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" = "1y"
): Promise<HistoricalPoint[]> {
  try {
    const now = new Date();
    const periodMonths: Record<string, number> = {
      "1mo": 1,
      "3mo": 3,
      "6mo": 6,
      "1y": 12,
      "2y": 24,
      "5y": 60,
    };
    const months = periodMonths[period] ?? 12;
    const from = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any[] = await yf.historical(ticker, {
      period1: from,
      period2: now,
      interval: period === "1mo" ? "1d" : period === "3mo" ? "1d" : "1wk",
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.map((row: any) => ({
      date: new Date(row.date).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
        year: period === "1mo" || period === "3mo" ? undefined : "2-digit",
      }),
      close: row.close ?? row.adjClose ?? 0,
    }));
  } catch (e) {
    console.error(`Failed to fetch historical for ${ticker}:`, e);
    return [];
  }
}
