"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { IncomeCategory, ExpenseCategory } from "@prisma/client";

async function updateDailyCheckin() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyCheckin.upsert({
    where: { date: today },
    update: {},
    create: { date: today },
  });
}

export async function addIncome(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as IncomeCategory;
  const description = (formData.get("description") as string) || null;
  const date = new Date(formData.get("date") as string);

  await prisma.income.create({
    data: { amount, category, description, date },
  });

  await updateDailyCheckin();
  revalidatePath("/");
  revalidatePath("/income");
}

export async function addExpense(formData: FormData) {
  const amount = parseFloat(formData.get("amount") as string);
  const category = formData.get("category") as ExpenseCategory;
  const description = (formData.get("description") as string) || null;
  const date = new Date(formData.get("date") as string);

  await prisma.expense.create({
    data: { amount, category, description, date },
  });

  await updateDailyCheckin();
  revalidatePath("/");
  revalidatePath("/expenses");
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

  await updateDailyCheckin();
  revalidatePath("/");
  revalidatePath("/expenses");
}

export async function deleteIncome(id: string) {
  await prisma.income.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/income");
}

export async function deleteExpense(id: string) {
  await prisma.expense.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/expenses");
}
