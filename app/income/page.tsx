import { prisma } from "@/lib/prisma";
import {
  formatPLN,
  getCurrentMonth,
  getLast6Months,
  getMonthLabel,
  isValidMonth,
} from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { IncomeForm } from "@/components/income/IncomeForm";
import { IncomeTable } from "@/components/income/IncomeTable";
import { IncomeChart } from "@/components/income/IncomeChart";
import { DollarSign, TrendingUp, Award } from "lucide-react";
import { Suspense } from "react";
import { StaggerGrid } from "@/components/ui/motion-wrappers";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function IncomePage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = isValidMonth(params.month)
    ? params.month
    : getCurrentMonth();
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const last6 = getLast6Months();
  const oldestMonth = last6[0].split("-").map(Number);
  const sixMonthsAgo = new Date(oldestMonth[0], oldestMonth[1] - 1, 1);

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

  const incomeByMonth = new Map<
    string,
    { total: number; WYPLATA_1: number; WYPLATA_2: number; INNE: number }
  >();
  for (const entry of allIncomes6m) {
    const monthKey = `${entry.date.getFullYear()}-${String(entry.date.getMonth() + 1).padStart(2, "0")}`;
    const bucket = incomeByMonth.get(monthKey) || {
      total: 0,
      WYPLATA_1: 0,
      WYPLATA_2: 0,
      INNE: 0,
    };

    bucket.total += entry.amount;
    if (entry.category === "WYPLATA_1") bucket.WYPLATA_1 += entry.amount;
    if (entry.category === "WYPLATA_2") bucket.WYPLATA_2 += entry.amount;
    if (entry.category === "INNE") bucket.INNE += entry.amount;

    incomeByMonth.set(monthKey, bucket);
  }

  const monthlyTotals = last6.map((m) => {
    const monthData = incomeByMonth.get(m);
    return { month: m, total: monthData?.total || 0 };
  });

  const nonZeroMonths = monthlyTotals.filter((m) => m.total > 0);
  const avgMonthly =
    nonZeroMonths.length > 0
      ? nonZeroMonths.reduce((sum, m) => sum + m.total, 0) /
        nonZeroMonths.length
      : 0;
  const bestMonth = monthlyTotals.reduce(
    (best, m) => (m.total > best.total ? m : best),
    monthlyTotals[0]
  );

  const chartData = last6.map((m) => {
    const monthData = incomeByMonth.get(m);
    return {
      month: getMonthLabel(m),
      WYPLATA_1: monthData?.WYPLATA_1 || 0,
      WYPLATA_2: monthData?.WYPLATA_2 || 0,
      INNE: monthData?.INNE || 0,
    };
  });

  return (
    <div className="ag-page">
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Przychody</h1>
      </div>

      <StaggerGrid className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Ten miesiac"
          value={formatPLN(totalThisMonth)}
          icon={<DollarSign />}
          trend="up"
        />
        <MetricCard
          title="Srednia miesieczna"
          value={formatPLN(avgMonthly)}
          icon={<TrendingUp />}
          trend="neutral"
        />
        <MetricCard
          title="Najlepszy miesiac"
          value={formatPLN(bestMonth.total)}
          subtitle={getMonthLabel(bestMonth.month)}
          icon={<Award />}
          trend="up"
        />
      </StaggerGrid>

      <Suspense>
        <IncomeForm />
      </Suspense>
      <IncomeTable data={incomes} />
      <IncomeChart data={chartData} />
    </div>
  );
}
