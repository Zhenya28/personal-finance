"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  const units = parseFloat(formData.get("units") as string);
  const pricePerUnit = parseFloat(formData.get("pricePerUnit") as string);
  const commission = parseFloat(formData.get("commission") as string) || 0;
  const date = new Date(formData.get("date") as string);
  const ticker = (formData.get("ticker") as string) || "VWCE.DE";

  await prisma.investment.create({
    data: { ticker, units, pricePerUnit, commission, date },
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

export async function fetchVWCEPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://query1.finance.yahoo.com/v8/finance/chart/VWCE.DE?interval=1d&range=1d",
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const price =
      data?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
    return price;
  } catch {
    return null;
  }
}
