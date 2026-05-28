"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getQuote, getEurPlnRate } from "@/lib/yahoo";
import { parseAmount } from "@/lib/validation";
import { parseLocalDate } from "@/lib/utils";
import type { ActionResult } from "./transactions";

function revalidateInvestments() {
  revalidatePath("/", "layout");
}

export async function addInvestment(formData: FormData): Promise<ActionResult> {
  const amountPln = parseAmount(formData.get("amount"));
  const date = parseLocalDate(formData.get("date") as string);
  const tickerRaw = formData.get("ticker");
  const ticker = typeof tickerRaw === "string" && tickerRaw.trim() ? tickerRaw.trim() : "VWCE.DE";
  const manualPrice = parseAmount(formData.get("pricePerUnit"));

  if (amountPln === null) return { ok: false, error: "Kwota musi byc dodatnia." };
  if (!date) return { ok: false, error: "Nieprawidlowa data." };

  let pricePerUnit: number;
  if (manualPrice !== null) {
    pricePerUnit = manualPrice;
  } else {
    const [quote, eurPln] = await Promise.all([getQuote(ticker), getEurPlnRate()]);
    if (!quote?.price) {
      return { ok: false, error: "Nie udalo sie pobrac aktualnego kursu. Podaj cene recznie." };
    }
    if (!eurPln) {
      return { ok: false, error: "Nie udalo sie pobrac kursu EUR/PLN. Podaj cene recznie." };
    }
    pricePerUnit = quote.price * eurPln;
  }

  if (pricePerUnit <= 0) {
    return { ok: false, error: "Cena za jednostke musi byc dodatnia." };
  }

  const units = amountPln / pricePerUnit;

  try {
    await prisma.investment.create({
      data: { ticker, units, pricePerUnit, date },
    });
    revalidateInvestments();
    return { ok: true };
  } catch (error) {
    console.error("addInvestment:", error);
    return { ok: false, error: "Nie udalo sie zapisac inwestycji." };
  }
}

export async function deleteInvestment(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Brak identyfikatora." };
  try {
    await prisma.investment.delete({ where: { id } });
    revalidateInvestments();
    return { ok: true };
  } catch (error) {
    console.error("deleteInvestment:", error);
    return { ok: false, error: "Nie udalo sie usunac inwestycji." };
  }
}

export async function fetchVWCEData(): Promise<{
  priceEur: number;
  eurPln: number;
  pricePln: number;
} | null> {
  const [quote, eurPln] = await Promise.all([
    getQuote("VWCE.DE"),
    getEurPlnRate(),
  ]);
  if (!quote?.price || !eurPln) return null;
  return {
    priceEur: quote.price,
    eurPln,
    pricePln: quote.price * eurPln,
  };
}
