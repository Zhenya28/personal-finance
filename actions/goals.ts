"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addSavingsGoal(formData: FormData) {
  const name = formData.get("name") as string;
  const targetAmount = parseFloat(formData.get("targetAmount") as string);
  const deadlineStr = formData.get("deadline") as string;
  const deadline = deadlineStr ? new Date(deadlineStr) : null;

  await prisma.savingsGoal.create({
    data: { name, targetAmount, deadline },
  });

  revalidatePath("/");
  revalidatePath("/goals");
}

export async function updateGoalAmount(formData: FormData) {
  const id = formData.get("id") as string;
  const amount = parseFloat(formData.get("amount") as string);

  await prisma.savingsGoal.update({
    where: { id },
    data: { currentAmount: { increment: amount } },
  });

  revalidatePath("/");
  revalidatePath("/goals");
}

export async function deleteGoal(id: string) {
  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/goals");
}
