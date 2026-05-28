import { prisma } from "@/lib/prisma";
import { getCurrentMonth, formatPLN, isValidMonth } from "@/lib/utils";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { ExpensesDailyChart } from "@/components/expenses/ExpensesDailyChart";
import { MetricCard } from "@/components/overview/MetricCard";
import { ExpensePieChart } from "@/components/overview/ExpensePieChart";
import { TrendingDown, Receipt, ShoppingCart } from "lucide-react";
import { Suspense } from "react";
import { StaggerGrid } from "@/components/ui/motion-wrappers";

export const revalidate = 60;

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

  const dateFilter = { gte: startOfMonth, lte: endOfMonth };

  const [expenses, aggregates, categoryData] = await Promise.all([
    prisma.expense.findMany({
      where: { date: dateFilter },
      orderBy: { date: "desc" },
      select: { id: true, amount: true, category: true, description: true, date: true },
    }),

    prisma.expense.aggregate({
      where: { date: dateFilter },
      _sum: { amount: true },
      _count: true,
    }),

    prisma.expense.groupBy({
      by: ["category"],
      where: { date: dateFilter },
      _sum: { amount: true },
    }).then((rows) =>
      rows.map((r) => ({ category: r.category, amount: r._sum.amount ?? 0 }))
    ),
  ]);

  const totalThisMonth = aggregates._sum.amount ?? 0;
  const transactionCount = aggregates._count;
  const avgTransaction = transactionCount > 0 ? totalThisMonth / transactionCount : 0;

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

      <Suspense>
        <ExpenseForm />
      </Suspense>
      <ExpenseTable data={expenses} />
    </div>
  );
}
