import { prisma } from "@/lib/prisma";
import { getCurrentMonth } from "@/lib/utils";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { MonthFilter } from "@/components/income/MonthFilter";
import { Suspense } from "react";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function ExpensesPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = params.month || getCurrentMonth();
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
    orderBy: { date: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Wydatki</h2>
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      <div className="space-y-6">
        <ExpenseForm />
        <ExpenseTable data={expenses} />
      </div>
    </div>
  );
}
