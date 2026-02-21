"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ExpenseCategory } from "@prisma/client";

export async function setBudgetLimit(formData: FormData) {
  const category = formData.get("category") as ExpenseCategory;
  const limitAmount = parseFloat(formData.get("limitAmount") as string);
  const month = formData.get("month") as string;

  await prisma.budgetLimit.upsert({
    where: { category_month: { category, month } },
    update: { limitAmount },
    create: { category, limitAmount, month },
  });

  revalidatePath("/expenses");
}

export async function updateHourlyRate(formData: FormData) {
  const hourlyRate = parseFloat(formData.get("hourlyRate") as string);

  await prisma.settings.upsert({
    where: { id: "default" },
    update: { hourlyRate },
    create: { id: "default", hourlyRate },
  });

  revalidatePath("/expenses");
}
