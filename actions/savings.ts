"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Currency } from "@prisma/client";

export async function addSavingsAccount(formData: FormData) {
  const name = formData.get("name") as string;
  const currency = (formData.get("currency") as Currency) || "PLN";
  const balance = parseFloat(formData.get("balance") as string) || 0;

  await prisma.savingsAccount.create({
    data: { name, currency, balance },
  });

  revalidatePath("/");
  revalidatePath("/savings");
}

export async function updateSavingsBalance(formData: FormData) {
  const id = formData.get("id") as string;
  const balance = parseFloat(formData.get("balance") as string) || 0;

  await prisma.savingsAccount.update({
    where: { id },
    data: { balance },
  });

  revalidatePath("/");
  revalidatePath("/savings");
}

export async function deleteSavingsAccount(id: string) {
  await prisma.savingsAccount.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/savings");
}
