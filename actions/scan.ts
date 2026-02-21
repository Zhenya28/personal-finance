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

const VALID_INCOME = ["WYPLATA_1", "WYPLATA_2", "INNE"];
const VALID_EXPENSE = ["ZAKUPY", "RESTAURACJE", "TRANSPORT", "SUBSCRIPTIONS", "MIESZKANIE", "FUN", "OTHER"];

export async function saveScannedIncomes(transactions: ScannedTransaction[]) {
  if (transactions.length === 0) return;

  try {
    await prisma.income.createMany({
      data: transactions.map((t) => {
        const cat = (t.category || "").toUpperCase();
        const category = VALID_INCOME.includes(cat) ? cat : "INNE";
        
        return {
          amount: Number(t.amount) || 0,
          category: category as IncomeCategory,
          description: t.description || null,
          date: new Date(t.date || new Date()),
        };
      }),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyCheckin.upsert({
      where: { date: today },
      update: {},
      create: { date: today },
    });

    revalidatePath("/");
    revalidatePath("/income");
  } catch (error) {
    console.error("Error saving scanned incomes:", error);
    throw new Error("Nie udało się zapisać przychodów.");
  }
}

export async function saveScannedExpenses(transactions: ScannedTransaction[]) {
  if (transactions.length === 0) return;

  try {
    await prisma.expense.createMany({
      data: transactions.map((t) => {
        const cat = (t.category || "").toUpperCase();
        const category = VALID_EXPENSE.includes(cat) ? cat : "OTHER";

        return {
          amount: Number(t.amount) || 0,
          category: category as ExpenseCategory,
          description: t.description || null,
          date: new Date(t.date || new Date()),
        };
      }),
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyCheckin.upsert({
      where: { date: today },
      update: {},
      create: { date: today },
    });

    revalidatePath("/");
    revalidatePath("/expenses");
  } catch (error) {
    console.error("Error saving scanned expenses:", error);
    throw new Error("Nie udało się zapisać wydatków.");
  }
}
