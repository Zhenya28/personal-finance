import { prisma } from "@/lib/prisma";
import { getCurrentMonth, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseTable } from "@/components/expenses/ExpenseTable";
import { BudgetProgress } from "@/components/expenses/BudgetProgress";
import { ExpenseBudgetChart } from "@/components/expenses/ExpenseBudgetChart";
import { HourlyRateSettings } from "@/components/expenses/HourlyRateSettings";
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

  // Fetch ALL data in parallel
  const [expenses, budgetLimits, expensesByCategory, settings] =
    await Promise.all([
      prisma.expense.findMany({
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
        orderBy: { date: "desc" },
      }),
      prisma.budgetLimit.findMany({
        where: { month: selectedMonth },
      }),
      prisma.expense.groupBy({
        by: ["category"],
        _sum: { amount: true },
        where: { date: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.settings.findUnique({
        where: { id: "default" },
      }),
    ]);

  const hourlyRate = settings?.hourlyRate || 0;

  // Budget data for progress bars
  const allCategories = Object.keys(EXPENSE_CATEGORY_LABELS);
  const budgetData = allCategories.map((cat) => {
    const spent =
      expensesByCategory.find((e) => e.category === cat)?._sum.amount || 0;
    const limit =
      budgetLimits.find((bl) => bl.category === cat)?.limitAmount || null;
    return { category: cat, spent, limit };
  });

  // Chart data (only categories with limits)
  const chartData = budgetData
    .filter((d) => d.limit !== null)
    .map((d) => ({
      category: EXPENSE_CATEGORY_LABELS[d.category] || d.category,
      spent: d.spent,
      limit: d.limit!,
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Wydatki</h2>
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ExpenseForm />
          <ExpenseTable data={expenses} hourlyRate={hourlyRate} />
        </div>
        <div className="space-y-6">
          <BudgetProgress data={budgetData} month={selectedMonth} />
          <HourlyRateSettings currentRate={hourlyRate} />
        </div>
      </div>

      {chartData.length > 0 && <ExpenseBudgetChart data={chartData} />}
    </div>
  );
}
