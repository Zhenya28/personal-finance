"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { IncomeCategory, ExpenseCategory } from "@prisma/client";

interface ScannedTransaction {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export async function saveScannedIncomes(transactions: ScannedTransaction[]) {
  if (transactions.length === 0) return;

  await prisma.income.createMany({
    data: transactions.map((t) => ({
      amount: t.amount,
      category: t.category as IncomeCategory,
      description: t.description || null,
      date: new Date(t.date),
    })),
  });

  // Daily checkin
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.dailyCheckin.upsert({
    where: { date: today },
    update: {},
    create: { date: today },
  });

  revalidatePath("/");
  revalidatePath("/income");
}

export async function saveScannedExpenses(transactions: ScannedTransaction[]) {
  if (transactions.length === 0) return;

  await prisma.expense.createMany({
    data: transactions.map((t) => ({
      amount: t.amount,
      category: t.category as ExpenseCategory,
      description: t.description || null,
      date: new Date(t.date),
    })),
  });

  // Daily checkin
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.dailyCheckin.upsert({
    where: { date: today },
    update: {},
    create: { date: today },
  });

  revalidatePath("/");
  revalidatePath("/expenses");
}
