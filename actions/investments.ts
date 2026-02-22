"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getQuote, getEurPlnRate } from "@/lib/yahoo";

async function updateDailyCheckin() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyCheckin.upsert({
    where: { date: today },
    update: {},
    create: { date: today },
  });
}

export async function addInvestment(formData: FormData) {
  const amountPln = parseFloat(formData.get("amount") as string);
  const date = new Date(formData.get("date") as string);
  const ticker = (formData.get("ticker") as string) || "VWCE.DE";

  const [quote, eurPln] = await Promise.all([
    getQuote(ticker),
    getEurPlnRate(),
  ]);

  if (!quote || !quote.price) {
    throw new Error("Nie udało się pobrać aktualnego kursu VWCE");
  }
  if (!eurPln) {
    throw new Error("Nie udało się pobrać kursu EUR/PLN");
  }

  // pricePerUnit in PLN = VWCE EUR price * EUR/PLN rate
  const pricePerUnit = quote.price * eurPln;
  const units = amountPln / pricePerUnit;

  await prisma.investment.create({
    data: { ticker, units, pricePerUnit, commission: 0, date },
  });

  await updateDailyCheckin();
  revalidatePath("/");
  revalidatePath("/investments");
}

export async function deleteInvestment(id: string) {
  await prisma.investment.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/investments");
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
