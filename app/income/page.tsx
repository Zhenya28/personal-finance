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

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function IncomePage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = params.month || getCurrentMonth();
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const incomes = await prisma.income.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
    orderBy: { date: "desc" },
  });

  const totalThisMonth = incomes.reduce((sum, i) => sum + i.amount, 0);

  // Average monthly income (last 6 months)
  const last6 = getLast6Months();
  const monthlyTotals = await Promise.all(
    last6.map(async (m) => {
      const [y, mo] = m.split("-").map(Number);
      const start = new Date(y, mo - 1, 1);
      const end = new Date(y, mo, 0, 23, 59, 59);
      const agg = await prisma.income.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      });
      return { month: m, total: agg._sum.amount || 0 };
    })
  );

  const nonZeroMonths = monthlyTotals.filter((m) => m.total > 0);
  const avgMonthly =
    nonZeroMonths.length > 0
      ? nonZeroMonths.reduce((sum, m) => sum + m.total, 0) / nonZeroMonths.length
      : 0;
  const bestMonth = monthlyTotals.reduce(
    (best, m) => (m.total > best.total ? m : best),
    monthlyTotals[0]
  );

  // Chart data - income per category per month
  const chartData = await Promise.all(
    last6.map(async (m) => {
      const [y, mo] = m.split("-").map(Number);
      const start = new Date(y, mo - 1, 1);
      const end = new Date(y, mo, 0, 23, 59, 59);

      const grouped = await prisma.income.groupBy({
        by: ["category"],
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      });

      return {
        month: getMonthLabel(m),
        BASE: grouped.find((g) => g.category === "BASE")?._sum.amount || 0,
        TIPS: grouped.find((g) => g.category === "TIPS")?._sum.amount || 0,
        BONUS: grouped.find((g) => g.category === "BONUS")?._sum.amount || 0,
      };
    })
  );

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
