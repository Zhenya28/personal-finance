"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { IncomeCategory, ExpenseCategory } from "@prisma/client";
import {
  buildTransactionSignature,
  sanitizeTransactionDescription,
} from "@/lib/transaction-dedupe";

export async function addIncome(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as IncomeCategory;
  const description = sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = new Date(formData.get("date") as string);

  const existing = await prisma.income.findMany({
    where: { date },
    select: { amount: true, category: true, description: true, date: true },
  });

  const signature = buildTransactionSignature({ amount, category, description, date });
  const hasDuplicate = existing.some(
    (row) =>
      buildTransactionSignature({
        amount: row.amount,
        category: row.category,
        description: row.description,
        date: row.date,
      }) === signature
  );

  if (hasDuplicate) {
    return;
  }

  await prisma.income.create({
    data: { amount, category, description, date },
  });

  revalidatePath("/", "layout");
  revalidatePath("/income", "layout");
  revalidatePath("/transactions", "layout");
}

export async function editIncome(formData: FormData) {
  const id = formData.get("id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as IncomeCategory;
  const description = sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = new Date(formData.get("date") as string);

  await prisma.income.update({
    where: { id },
    data: { amount, category, description, date },
  });

  revalidatePath("/", "layout");
  revalidatePath("/income", "layout");
  revalidatePath("/transactions", "layout");
}

export async function addExpense(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as ExpenseCategory;
  const description = sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = new Date(formData.get("date") as string);

  const existing = await prisma.expense.findMany({
    where: { date },
    select: { amount: true, category: true, description: true, date: true },
  });

  const signature = buildTransactionSignature({ amount, category, description, date });
  const hasDuplicate = existing.some(
    (row) =>
      buildTransactionSignature({
        amount: row.amount,
        category: row.category,
        description: row.description,
        date: row.date,
      }) === signature
  );

  if (hasDuplicate) {
    return;
  }

  await prisma.expense.create({
    data: { amount, category, description, date },
  });

  revalidatePath("/", "layout");
  revalidatePath("/expenses", "layout");
  revalidatePath("/transactions", "layout");
}

export async function editExpense(formData: FormData) {
  const id = formData.get("id") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as ExpenseCategory;
  const description = sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = new Date(formData.get("date") as string);

  await prisma.expense.update({
    where: { id },
    data: { amount, category, description, date },
  });

  revalidatePath("/", "layout");
  revalidatePath("/expenses", "layout");
  revalidatePath("/transactions", "layout");
}

export async function duplicateExpense(id: string) {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return;

  await prisma.expense.create({
    data: {
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: new Date(),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/expenses", "layout");
  revalidatePath("/transactions", "layout");
}

export async function deleteIncome(id: string) {
  await prisma.income.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/income", "layout");
  revalidatePath("/transactions", "layout");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/expenses", "layout");
  revalidatePath("/transactions", "layout");
}
