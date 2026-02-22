import { prisma } from "@/lib/prisma";
import { getCurrentMonth, formatPLN } from "@/lib/utils";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { MonthFilter } from "@/components/income/MonthFilter";
import { MetricCard } from "@/components/overview/MetricCard";
import { TrendingDown, Receipt, ShoppingCart } from "lucide-react";
import { Suspense } from "react";

export const revalidate = 0;

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

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = expenses.length;
  const avgTransaction = transactionCount > 0 ? totalThisMonth / transactionCount : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-red-500/10">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Wydatki</h2>
          </div>
          <p className="text-sm text-muted-foreground ml-12">
            Sledz wydatki i kontroluj budzet
          </p>
        </div>
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Suma wydatkow"
          value={formatPLN(totalThisMonth)}
          icon={TrendingDown}
          trend="down"
        />
        <MetricCard
          title="Transakcje"
          value={transactionCount.toString()}
          icon={Receipt}
          trend="neutral"
        />
        <MetricCard
          title="Srednia transakcja"
          value={formatPLN(avgTransaction)}
          icon={ShoppingCart}
          trend="neutral"
        />
      </div>

      <Suspense>
        <ExpenseForm />
      </Suspense>
      <ExpenseTable data={expenses} />
    </div>
  );
}
