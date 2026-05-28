"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { IncomeCategory, ExpenseCategory } from "@prisma/client";
import {
  buildTransactionSignature,
  getDateWindow,
  sanitizeTransactionDescription,
} from "@/lib/transaction-dedupe";
import { parseLocalDate } from "@/lib/utils";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/lib/validation";

interface ImportTransaction {
  date: string;
  amount: number;
  description: string;
  category: string;
  type: "income" | "expense";
}

export async function bulkImportTransactions(transactions: ImportTransaction[]) {
  const incomes = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");

  const preparedIncomes = incomes
    .map((t) => {
      const date = parseLocalDate(t.date) ?? new Date();
      const amount = Math.abs(Number(t.amount));
      if (!Number.isFinite(amount) || amount <= 0) return null;
      const category = (INCOME_CATEGORIES as readonly string[]).includes(t.category)
        ? (t.category as IncomeCategory)
        : ("INNE" as IncomeCategory);
      return {
        amount: Math.round(amount * 100) / 100,
        category,
        description: sanitizeTransactionDescription(t.description) || null,
        date,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const preparedExpenses = expenses
    .map((t) => {
      const date = parseLocalDate(t.date) ?? new Date();
      const amount = Math.abs(Number(t.amount));
      if (!Number.isFinite(amount) || amount <= 0) return null;
      const category = (EXPENSE_CATEGORIES as readonly string[]).includes(t.category)
        ? (t.category as ExpenseCategory)
        : ("OTHER" as ExpenseCategory);
      return {
        amount: Math.round(amount * 100) / 100,
        category,
        description: sanitizeTransactionDescription(t.description) || null,
        date,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const incomeWindow = getDateWindow(preparedIncomes.map((t) => t.date));
  const expenseWindow = getDateWindow(preparedExpenses.map((t) => t.date));

  const [existingIncomes, existingExpenses] = await Promise.all([
    incomeWindow
      ? prisma.income.findMany({
          where: { date: { gte: incomeWindow.min, lte: incomeWindow.max } },
          select: { amount: true, category: true, description: true, date: true },
        })
      : Promise.resolve([]),
    expenseWindow
      ? prisma.expense.findMany({
          where: { date: { gte: expenseWindow.min, lte: expenseWindow.max } },
          select: { amount: true, category: true, description: true, date: true },
        })
      : Promise.resolve([]),
  ]);

  const existingIncomeSignatures = new Set(
    existingIncomes.map((row) =>
      buildTransactionSignature({
        amount: row.amount,
        category: row.category,
        description: row.description,
        date: row.date,
      })
    )
  );
  const existingExpenseSignatures = new Set(
    existingExpenses.map((row) =>
      buildTransactionSignature({
        amount: row.amount,
        category: row.category,
        description: row.description,
        date: row.date,
      })
    )
  );

  const uniqueIncomes = preparedIncomes.filter((row) => {
    const signature = buildTransactionSignature({
      amount: row.amount,
      category: row.category,
      description: row.description,
      date: row.date,
    });
    if (existingIncomeSignatures.has(signature)) {
      return false;
    }
    existingIncomeSignatures.add(signature);
    return true;
  });

  const uniqueExpenses = preparedExpenses.filter((row) => {
    const signature = buildTransactionSignature({
      amount: row.amount,
      category: row.category,
      description: row.description,
      date: row.date,
    });
    if (existingExpenseSignatures.has(signature)) {
      return false;
    }
    existingExpenseSignatures.add(signature);
    return true;
  });

  if (uniqueIncomes.length > 0) {
    await prisma.income.createMany({
      data: uniqueIncomes.map((t) => ({
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      })),
    });
  }

  if (uniqueExpenses.length > 0) {
    await prisma.expense.createMany({
      data: uniqueExpenses.map((t) => ({
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: t.date,
      })),
    });
  }

  revalidatePath("/", "layout");

  return {
    imported: uniqueIncomes.length + uniqueExpenses.length,
    incomes: uniqueIncomes.length,
    expenses: uniqueExpenses.length,
    skipped: transactions.length - (uniqueIncomes.length + uniqueExpenses.length),
  };
}
