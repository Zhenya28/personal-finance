"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ExpenseCategory } from "@prisma/client";

export async function addRecurring(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as ExpenseCategory;
  const description = (formData.get("description") as string) || null;
  const dayOfMonth = parseInt(formData.get("dayOfMonth") as string) || 1;

  await prisma.recurringExpense.create({
    data: { amount, category, description, dayOfMonth },
  });

  revalidatePath("/expenses", "layout");
}

export async function deleteRecurring(id: string) {
  await prisma.recurringExpense.delete({ where: { id } });
  revalidatePath("/expenses", "layout");
}

export async function toggleRecurring(id: string) {
  const current = await prisma.recurringExpense.findUnique({ where: { id } });
  if (!current) return;

  await prisma.recurringExpense.update({
    where: { id },
    data: { active: !current.active },
  });

  revalidatePath("/expenses", "layout");
}

export async function applyRecurringTemplates(monthStr: string) {
  const [year, month] = monthStr.split("-").map(Number);

  const templates = await prisma.recurringExpense.findMany({
    where: { active: true },
  });

  if (templates.length === 0) return 0;

  const created = await prisma.expense.createMany({
    data: templates.map((t) => ({
      amount: t.amount,
      category: t.category,
      description: t.description,
      date: new Date(year, month - 1, Math.min(t.dayOfMonth, new Date(year, month, 0).getDate())),
    })),
  });

  revalidatePath("/", "layout");
  revalidatePath("/expenses", "layout");

  return created.count;
}
