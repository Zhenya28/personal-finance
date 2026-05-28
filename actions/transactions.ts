"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import {
  buildTransactionSignature,
  sanitizeTransactionDescription,
} from "@/lib/transaction-dedupe";
import {
  parseAmount,
  parseExpenseCategory,
  parseIncomeCategory,
} from "@/lib/validation";
import { parseLocalDate } from "@/lib/utils";

export type ActionResult = { ok: true } | { ok: false; error: string };

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function addIncome(formData: FormData): Promise<ActionResult> {
  const amount = parseAmount(formData.get("amount"));
  const category = parseIncomeCategory(formData.get("category"));
  const description =
    sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = parseLocalDate(formData.get("date") as string);

  if (amount === null) return { ok: false, error: "Kwota musi byc dodatnia." };
  if (!category) return { ok: false, error: "Nieznana kategoria przychodu." };
  if (!date) return { ok: false, error: "Nieprawidlowa data." };

  try {
    const existing = await prisma.income.findMany({
      where: { date },
      select: { amount: true, category: true, description: true, date: true },
    });

    const signature = buildTransactionSignature({ amount, category, description, date });
    if (existing.some((row) => buildTransactionSignature(row) === signature)) {
      return { ok: false, error: "Taka transakcja juz istnieje." };
    }

    await prisma.income.create({ data: { amount, category, description, date } });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("addIncome:", error);
    return { ok: false, error: "Nie udalo sie dodac przychodu." };
  }
}

export async function editIncome(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id");
  const amount = parseAmount(formData.get("amount"));
  const category = parseIncomeCategory(formData.get("category"));
  const description =
    sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = parseLocalDate(formData.get("date") as string);

  if (typeof id !== "string" || !id) return { ok: false, error: "Brak identyfikatora." };
  if (amount === null) return { ok: false, error: "Kwota musi byc dodatnia." };
  if (!category) return { ok: false, error: "Nieznana kategoria przychodu." };
  if (!date) return { ok: false, error: "Nieprawidlowa data." };

  try {
    await prisma.income.update({
      where: { id },
      data: { amount, category, description, date },
    });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("editIncome:", error);
    return { ok: false, error: "Nie udalo sie zaktualizowac przychodu." };
  }
}

export async function addExpense(formData: FormData): Promise<ActionResult> {
  const amount = parseAmount(formData.get("amount"));
  const category = parseExpenseCategory(formData.get("category"));
  const description =
    sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = parseLocalDate(formData.get("date") as string);

  if (amount === null) return { ok: false, error: "Kwota musi byc dodatnia." };
  if (!category) return { ok: false, error: "Nieznana kategoria wydatku." };
  if (!date) return { ok: false, error: "Nieprawidlowa data." };

  try {
    const existing = await prisma.expense.findMany({
      where: { date },
      select: { amount: true, category: true, description: true, date: true },
    });

    const signature = buildTransactionSignature({ amount, category, description, date });
    if (existing.some((row) => buildTransactionSignature(row) === signature)) {
      return { ok: false, error: "Taka transakcja juz istnieje." };
    }

    await prisma.expense.create({ data: { amount, category, description, date } });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("addExpense:", error);
    return { ok: false, error: "Nie udalo sie dodac wydatku." };
  }
}

export async function editExpense(formData: FormData): Promise<ActionResult> {
  const id = formData.get("id");
  const amount = parseAmount(formData.get("amount"));
  const category = parseExpenseCategory(formData.get("category"));
  const description =
    sanitizeTransactionDescription(formData.get("description") as string) || null;
  const date = parseLocalDate(formData.get("date") as string);

  if (typeof id !== "string" || !id) return { ok: false, error: "Brak identyfikatora." };
  if (amount === null) return { ok: false, error: "Kwota musi byc dodatnia." };
  if (!category) return { ok: false, error: "Nieznana kategoria wydatku." };
  if (!date) return { ok: false, error: "Nieprawidlowa data." };

  try {
    await prisma.expense.update({
      where: { id },
      data: { amount, category, description, date },
    });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("editExpense:", error);
    return { ok: false, error: "Nie udalo sie zaktualizowac wydatku." };
  }
}

export async function duplicateExpense(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Brak identyfikatora." };
  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      select: { amount: true, category: true, description: true },
    });
    if (!expense) return { ok: false, error: "Wydatek nie istnieje." };

    await prisma.expense.create({
      data: {
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: new Date(),
      },
    });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("duplicateExpense:", error);
    return { ok: false, error: "Nie udalo sie zduplikowac wydatku." };
  }
}

export async function deleteIncome(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Brak identyfikatora." };
  try {
    await prisma.income.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("deleteIncome:", error);
    return { ok: false, error: "Nie udalo sie usunac przychodu." };
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Brak identyfikatora." };
  try {
    await prisma.expense.delete({ where: { id } });
    revalidateAll();
    return { ok: true };
  } catch (error) {
    console.error("deleteExpense:", error);
    return { ok: false, error: "Nie udalo sie usunac wydatku." };
  }
}
