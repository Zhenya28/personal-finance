import { prisma } from "@/lib/prisma";
import { getCurrentMonth, formatPLN, isValidMonth } from "@/lib/utils";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { RecurringExpenses } from "@/components/expenses/RecurringExpenses";
import { ExpensesDailyChart } from "@/components/expenses/ExpensesDailyChart";
import { MetricCard } from "@/components/overview/MetricCard";
import { ExpensePieChart } from "@/components/overview/ExpensePieChart";
import { TrendingDown, Receipt, ShoppingCart } from "lucide-react";
import { Suspense } from "react";
import { StaggerGrid } from "@/components/ui/motion-wrappers";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function ExpensesPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = isValidMonth(params.month)
    ? params.month
    : getCurrentMonth();
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
    orderBy: { date: "desc" },
  });

  // RecurringExpense table might not exist yet if DB hasn't been pushed
  let recurringTemplates: { id: string; amount: number; category: string; description: string | null; dayOfMonth: number; active: boolean }[] = [];
  try {
    recurringTemplates = await prisma.recurringExpense.findMany({
      orderBy: { dayOfMonth: "asc" },
    });
  } catch {
    // Table doesn't exist yet — silently continue
  }

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const transactionCount = expenses.length;
  const avgTransaction = transactionCount > 0 ? totalThisMonth / transactionCount : 0;

  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) || 0) + e.amount);
  }
  const categoryData = Array.from(byCategory.entries()).map(([category, amount]) => ({
    category,
    amount,
  }));

  const daysInMonth = endOfMonth.getDate();
  const dayRows = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const byDay = new Map<number, number>();
  for (const e of expenses) {
    const day = e.date.getDate();
    byDay.set(day, (byDay.get(day) || 0) + e.amount);
  }
  const dailyData = dayRows.map((day) => ({
    day: `${day}`,
    amount: byDay.get(day) || 0,
  }));

  return (
    <div className="ag-page">
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Wydatki</h1>
      </div>

      <StaggerGrid className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Suma wydatków"
          value={formatPLN(totalThisMonth)}
          icon={<TrendingDown />}
          trend="down"
        />
        <MetricCard
          title="Transakcje"
          value={transactionCount.toString()}
          icon={<Receipt />}
          trend="neutral"
        />
        <MetricCard
          title="Średnia transakcja"
          value={formatPLN(avgTransaction)}
          icon={<ShoppingCart />}
          trend="neutral"
        />
      </StaggerGrid>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <ExpensesDailyChart data={dailyData} />
        <ExpensePieChart data={categoryData} />
      </div>

      <RecurringExpenses data={recurringTemplates} currentMonth={selectedMonth} />

      <Suspense>
        <ExpenseForm />
      </Suspense>
      <ExpenseTable data={expenses} />
    </div>
  );
}
