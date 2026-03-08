import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

export async function GET() {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [incomes, expenses, investments, savingsAccounts] = await Promise.all([
    prisma.income.findMany({ orderBy: { date: "desc" } }),
    prisma.expense.findMany({ orderBy: { date: "desc" } }),
    prisma.investment.findMany({ orderBy: { date: "desc" } }),
    prisma.savingsAccount.findMany(),
  ]);

  let recurringExpenses: unknown[] = [];
  try {
    recurringExpenses = await prisma.recurringExpense.findMany();
  } catch {
    // table might not exist
  }

  let categoryRules: unknown[] = [];
  try {
    categoryRules = await prisma.categoryRule.findMany();
  } catch {
    // table might not exist
  }

  const data = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    incomes,
    expenses,
    investments,
    savingsAccounts,
    recurringExpenses,
    categoryRules,
  };

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="finance-backup-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
