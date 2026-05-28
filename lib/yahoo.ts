import YahooFinance from "yahoo-finance2";
import { unstable_cache } from "next/cache";
import type { Currency } from "@prisma/client";

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

interface YahooQuoteResponse {
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  currency?: string;
  shortName?: string;
  longName?: string;
}

interface YahooHistoricalRow {
  date: Date | string;
  close?: number;
  adjClose?: number;
}

// --- Raw (uncached) implementations ---

async function _getQuote(ticker: string): Promise<QuoteData | null> {
  try {
    const result = (await yf.quote(ticker)) as YahooQuoteResponse | null;
    if (!result || result.regularMarketPrice === undefined) return null;

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

async function _getEurPlnRate(): Promise<number | null> {
  try {
    const result = (await yf.quote("EURPLN=X")) as YahooQuoteResponse | null;
    return result?.regularMarketPrice ?? null;
  } catch (e) {
    console.error("Failed to fetch EUR/PLN rate:", e);
    return null;
  }
}

async function _getFxRate(from: string, to: string): Promise<number | null> {
  if (from === to) return 1;
  try {
    const result = (await yf.quote(`${from}${to}=X`)) as YahooQuoteResponse | null;
    return result?.regularMarketPrice ?? null;
  } catch (e) {
    console.error(`Failed to fetch ${from}/${to} rate:`, e);
    return null;
  }
}

async function _getHistorical(
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

    const result = (await yf.historical(ticker, {
      period1: from,
      period2: now,
      interval: period === "1mo" ? "1d" : period === "3mo" ? "1d" : "1wk",
    })) as YahooHistoricalRow[];

    return result.map((row) => ({
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

// --- Cached exports (120s server-side TTL) ---

export const getQuote = unstable_cache(_getQuote, ["yahoo-quote"], {
  revalidate: 120,
});

export const getEurPlnRate = unstable_cache(_getEurPlnRate, ["yahoo-eurpln"], {
  revalidate: 120,
});

export const getFxRate = unstable_cache(_getFxRate, ["yahoo-fxrate"], {
  revalidate: 120,
});

export const getHistorical = unstable_cache(_getHistorical, ["yahoo-historical"], {
  revalidate: 300,
});

/**
 * Returns a map { currency -> rate to PLN }. PLN -> 1, unknown -> 1.
 * Caller can pass a list of distinct currencies seen on the page.
 */
export async function getFxRatesToPln(
  currencies: Currency[] | string[]
): Promise<Record<string, number>> {
  const out: Record<string, number> = { PLN: 1 };
  const unique = [...new Set(currencies)].filter((c) => c !== "PLN");
  if (unique.length === 0) return out;

  const results = await Promise.all(
    unique.map(async (c) => {
      const rate = await getFxRate(String(c), "PLN");
      return [String(c), rate ?? 1] as const;
    })
  );
  for (const [code, rate] of results) out[code] = rate;
  return out;
}
