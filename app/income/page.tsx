import { prisma } from "@/lib/prisma";
import {
  formatPLN,
  getCurrentMonth,
  getLast6Months,
  getMonthLabel,
} from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { IncomeForm } from "@/components/income/IncomeForm";
import { IncomeTable } from "@/components/income/IncomeTable";
import { IncomeChart } from "@/components/income/IncomeChart";
import { MonthFilter } from "@/components/income/MonthFilter";
import { DollarSign, TrendingUp, Award } from "lucide-react";
import { Suspense } from "react";

export const revalidate = 60;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function IncomePage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = params.month || getCurrentMonth();
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  // Calculate the full date range for the last 6 months
  const last6 = getLast6Months();
  const oldestMonth = last6[0].split("-").map(Number);
  const sixMonthsAgo = new Date(oldestMonth[0], oldestMonth[1] - 1, 1);

  // Fetch ALL data in parallel — 2 queries instead of 12+
  const [incomes, allIncomes6m] = await Promise.all([
    prisma.income.findMany({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { date: "desc" },
    }),
    prisma.income.findMany({
      where: { date: { gte: sixMonthsAgo, lte: endOfMonth } },
      select: { amount: true, date: true, category: true },
    }),
  ]);

  const totalThisMonth = incomes.reduce((sum, i) => sum + i.amount, 0);

  // Calculate monthly totals from already-fetched data (no extra queries)
  const monthlyTotals = last6.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const start = new Date(y, mo - 1, 1);
    const end = new Date(y, mo, 0, 23, 59, 59);
    const total = allIncomes6m
      .filter((i) => i.date >= start && i.date <= end)
      .reduce((sum, i) => sum + i.amount, 0);
    return { month: m, total };
  });

  const nonZeroMonths = monthlyTotals.filter((m) => m.total > 0);
  const avgMonthly =
    nonZeroMonths.length > 0
      ? nonZeroMonths.reduce((sum, m) => sum + m.total, 0) / nonZeroMonths.length
      : 0;
  const bestMonth = monthlyTotals.reduce(
    (best, m) => (m.total > best.total ? m : best),
    monthlyTotals[0]
  );

  // Chart data — computed from already-fetched records (no extra queries)
  const chartData = last6.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const start = new Date(y, mo - 1, 1);
    const end = new Date(y, mo, 0, 23, 59, 59);
    const monthRecords = allIncomes6m.filter(
      (i) => i.date >= start && i.date <= end
    );

    return {
      month: getMonthLabel(m),
      WYPLATA_1: monthRecords
        .filter((i) => i.category === "WYPLATA_1")
        .reduce((sum, i) => sum + i.amount, 0),
      WYPLATA_2: monthRecords
        .filter((i) => i.category === "WYPLATA_2")
        .reduce((sum, i) => sum + i.amount, 0),
      INNE: monthRecords
        .filter((i) => i.category === "INNE")
        .reduce((sum, i) => sum + i.amount, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Przychody</h2>
        <Suspense>
          <MonthFilter />
        </Suspense>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Suma tego miesiąca"
          value={formatPLN(totalThisMonth)}
          icon={DollarSign}
          trend="up"
        />
        <MetricCard
          title="Średnia miesięczna"
          value={formatPLN(avgMonthly)}
          icon={TrendingUp}
          trend="neutral"
        />
        <MetricCard
          title="Najlepszy miesiąc"
          value={formatPLN(bestMonth.total)}
          subtitle={getMonthLabel(bestMonth.month)}
          icon={Award}
          trend="up"
        />
      </div>

      <IncomeForm />
      <IncomeTable data={incomes} />
      <IncomeChart data={chartData} />
    </div>
  );
}
