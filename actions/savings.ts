"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { parseAmount, parseCurrency } from "@/lib/validation";
import { parseLocalDate } from "@/lib/utils";
import type { ActionResult } from "./transactions";

function revalidateSavings() {
  revalidatePath("/", "layout");
}

export async function addSavingsAccount(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const currency = parseCurrency(formData.get("currency")) ?? "PLN";
  const initialBalanceRaw = formData.get("balance");
  const initialBalance = initialBalanceRaw ? parseAmount(initialBalanceRaw) ?? 0 : 0;

  if (!name) return { ok: false, error: "Nazwa konta jest wymagana." };

  try {
    await prisma.$transaction(async (tx) => {
      const account = await tx.savingsAccount.create({
        data: { name, currency, balance: initialBalance },
      });

      if (initialBalance > 0) {
        await tx.savingsTransaction.create({
          data: {
            accountId: account.id,
            type: "DEPOSIT",
            amount: initialBalance,
            description: "Saldo poczatkowe",
            date: new Date(),
          },
        });
      }
    });

    revalidateSavings();
    return { ok: true };
  } catch (error) {
    console.error("addSavingsAccount:", error);
    return { ok: false, error: "Nie udalo sie dodac konta." };
  }
}

export async function addSavingsTransaction(formData: FormData): Promise<ActionResult> {
  const accountId = formData.get("accountId");
  const rawType = formData.get("type");
  const amount = parseAmount(formData.get("amount"));
  const date = parseLocalDate(formData.get("date") as string);
  const description = String(formData.get("description") ?? "").trim();

  if (typeof accountId !== "string" || !accountId) {
    return { ok: false, error: "Brak konta." };
  }
  if (rawType !== "DEPOSIT" && rawType !== "WITHDRAWAL") {
    return { ok: false, error: "Nieznany typ transakcji." };
  }
  if (amount === null) return { ok: false, error: "Kwota musi byc dodatnia." };
  if (!date) return { ok: false, error: "Nieprawidlowa data." };

  const delta = rawType === "DEPOSIT" ? amount : -amount;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.savingsTransaction.create({
        data: { accountId, type: rawType, amount, description, date },
      });

      await tx.savingsAccount.update({
        where: { id: accountId },
        data: { balance: { increment: delta } },
      });
    });

    revalidateSavings();
    return { ok: true };
  } catch (error) {
    console.error("addSavingsTransaction:", error);
    return { ok: false, error: "Nie udalo sie dodac transakcji." };
  }
}

export async function deleteSavingsTransaction(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Brak identyfikatora." };
  try {
    const record = await prisma.savingsTransaction.findUnique({
      where: { id },
      select: { accountId: true, type: true, amount: true },
    });

    if (!record) return { ok: false, error: "Transakcja nie istnieje." };

    const delta = record.type === "DEPOSIT" ? -record.amount : record.amount;

    await prisma.$transaction(async (tx) => {
      await tx.savingsTransaction.delete({ where: { id } });
      await tx.savingsAccount.update({
        where: { id: record.accountId },
        data: { balance: { increment: delta } },
      });
    });

    revalidateSavings();
    return { ok: true };
  } catch (error) {
    console.error("deleteSavingsTransaction:", error);
    return { ok: false, error: "Nie udalo sie usunac transakcji." };
  }
}

export async function deleteSavingsAccount(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "Brak identyfikatora." };
  try {
    await prisma.savingsAccount.delete({ where: { id } });
    revalidateSavings();
    return { ok: true };
  } catch (error) {
    console.error("deleteSavingsAccount:", error);
    return { ok: false, error: "Nie udalo sie usunac konta." };
  }
}
