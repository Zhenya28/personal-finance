import { prisma } from "@/lib/prisma";
import {
  ALL_MONTHS_VALUE,
  formatPLN,
  formatCurrency,
  getCurrentMonth,
  getLast6Months,
  getMonthLabel,
  isValidMonth,
} from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { IncomeOverviewCard } from "@/components/overview/IncomeOverviewCard";
import { NetWorthCard } from "@/components/overview/NetWorthCard";
import { CashflowChart } from "@/components/overview/CashflowChart";
import { ExpensePieChart } from "@/components/overview/ExpensePieChart";
import { fetchVWCEData } from "@/actions/investments";
import { getFxRate } from "@/lib/yahoo";
import { Wallet, TrendingDown, Radar, ShieldCheck } from "lucide-react";
import { StaggerGrid, FadeInSection } from "@/components/ui/motion-wrappers";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

async function getOverviewData(selectedMonth: string) {
  const isAllMonths = selectedMonth === ALL_MONTHS_VALUE;
  const monthForContext = isAllMonths ? getCurrentMonth() : selectedMonth;
  const [year, month] = monthForContext.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  // Previous month
  const prevMonthStart = new Date(year, month - 2, 1);
  const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);

  const last6 = getLast6Months();
  const oldestMonth = last6[0].split("-").map(Number);
  const sixMonthsAgo = new Date(oldestMonth[0], oldestMonth[1] - 1, 1);
  const currentWindow = isAllMonths
    ? undefined
    : { date: { gte: startOfMonth, lte: endOfMonth } };

  const [
    expensesThisMonth,
    prevExpensesAgg,
    prevIncomeAgg,
    investments,
    savingsAccounts,
    vwceData,
    expensesByCategory,
    incomesByCategory,
    allIncomes6m,
    allExpenses6m,
  ] = await Promise.all([
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: currentWindow,
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { date: { gte: prevMonthStart, lte: prevMonthEnd } },
    }),
    prisma.investment.findMany(),
    prisma.savingsAccount.findMany(),
    fetchVWCEData(),
    prisma.expense.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: currentWindow,
    }),
    prisma.income.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: currentWindow,
    }),
    prisma.income.findMany({
      where: { date: { gte: sixMonthsAgo, lte: endOfMonth } },
      select: { amount: true, date: true },
    }),
    prisma.expense.findMany({
      where: { date: { gte: sixMonthsAgo, lte: endOfMonth } },
      select: { amount: true, date: true },
    }),
  ]);

  const incomeBreakdown = { WYPLATA_1: 0, WYPLATA_2: 0, INNE: 0 };
  for (const entry of incomesByCategory) {
    const cat = entry.category as keyof typeof incomeBreakdown;
    if (cat in incomeBreakdown) {
      incomeBreakdown[cat] = entry._sum.amount || 0;
    }
  }
  const totalIncome = incomeBreakdown.WYPLATA_1 + incomeBreakdown.WYPLATA_2 + incomeBreakdown.INNE;
  const totalExpenses = expensesThisMonth._sum.amount || 0;
  const netBalance = totalIncome - totalExpenses;

  // Trends
  const prevExpenses = prevExpensesAgg._sum.amount || 0;
  const prevIncome = prevIncomeAgg._sum.amount || 0;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;
  const expenseTrendPct =
    isAllMonths || prevExpenses <= 0
      ? null
      : ((totalExpenses - prevExpenses) / prevExpenses) * 100;
  const incomeTrendPct =
    isAllMonths || prevIncome <= 0
      ? null
      : ((totalIncome - prevIncome) / prevIncome) * 100;

  // Portfolio
  const totalUnits = investments.reduce((sum, inv) => sum + inv.units, 0);
  const totalInvested = investments.reduce((sum, inv) => sum + inv.units * inv.pricePerUnit, 0);
  const currentPricePln = vwceData ? vwceData.pricePln : null;
  const portfolioValue = currentPricePln ? totalUnits * currentPricePln : totalInvested;

  // Savings total in PLN
  const currencies = [...new Set(savingsAccounts.map((a) => a.currency))].filter((c) => c !== "PLN");
  const fxRates: Record<string, number> = { PLN: 1 };
  const rateResults = await Promise.all(
    currencies.map(async (c) => {
      const rate = await getFxRate(c, "PLN");
      return [c, rate ?? 1] as [string, number];
    })
  );
  for (const [c, r] of rateResults) fxRates[c] = r;
  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance * (fxRates[acc.currency] ?? 1), 0);

  // Charts
  const incomeByMonth = new Map<string, number>();
  for (const item of allIncomes6m) {
    const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}`;
    incomeByMonth.set(monthKey, (incomeByMonth.get(monthKey) || 0) + item.amount);
  }

  const expenseByMonth = new Map<string, number>();
  for (const item of allExpenses6m) {
    const monthKey = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}`;
    expenseByMonth.set(monthKey, (expenseByMonth.get(monthKey) || 0) + item.amount);
  }

  const cashflowData = last6.map((m) => {
    return {
      month: getMonthLabel(m),
      income: incomeByMonth.get(m) || 0,
      expenses: expenseByMonth.get(m) || 0,
    };
  });

  const pieData = expensesByCategory.map((e) => ({
    category: e.category,
    amount: e._sum.amount || 0,
  }));

  return {
    totalIncome,
    incomeBreakdown,
    totalExpenses,
    netBalance,
    portfolioValue,
    totalSavings,
    savingsRate,
    expenseTrendPct,
    incomeTrendPct,
    cashflowData,
    pieData,
    monthLabel: isAllMonths ? "Wszystkie miesiace" : getMonthLabel(selectedMonth),
  };
}

function formatTrend(pct: number | null): string | undefined {
  if (pct === null) return undefined;
  const arrow = pct >= 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(pct).toFixed(0)}% vs poprzedni miesiąc`;
}

export default async function OverviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth =
    params.month === ALL_MONTHS_VALUE
      ? ALL_MONTHS_VALUE
      : isValidMonth(params.month)
        ? params.month
        : getCurrentMonth();
  const data = await getOverviewData(selectedMonth);
  const spendingRatio =
    data.totalIncome > 0 ? (data.totalExpenses / data.totalIncome) * 100 : 0;
  const savingsRatio = Math.max(0, Math.min(100, data.savingsRate));
  const liquidityBadge =
    data.netBalance >= 0
      ? "Finanse pod kontrola"
      : "Potrzebna stabilizacja";

  return (
    <div className="ag-page">
      <FadeInSection>
        <div className="ag-card">
          <div className="ag-inline-row mb-4">
            <p className="ag-overline">Dashboard finansowy</p>
          </div>

          <h2 className="text-[clamp(2rem,3.6vw,2.9rem)] font-semibold tracking-[-0.03em] text-white">
            Twoj finansowy pulpit
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">
            Ten widok laczy dochody, wydatki, oszczednosci i inwestycje w jednym miejscu, zebys
            szybciej reagowal na zmiany.
          </p>

          <div className="mt-5 grid w-full gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="ag-overline">Saldo netto</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                  <Wallet className="h-3.5 w-3.5 text-primary" />
                </div>
              </div>
              <p className="mt-2 font-mono text-3xl font-semibold tracking-[-0.02em] tabular-nums text-white">
                {formatPLN(data.netBalance)}
              </p>
              <p className="mt-1 text-[11px] text-white/55">{liquidityBadge}</p>
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="ag-overline">Wskaznik oszczedzania</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                </div>
              </div>
              <p className="mt-2 font-mono text-3xl font-semibold tracking-[-0.02em] tabular-nums text-white">
                {savingsRatio.toFixed(0)}%
              </p>
              <p className="mt-1 text-[11px] text-white/55">Poduszka finansowa</p>
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="ag-overline">Intensywnosc wydatkow</p>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff8f6b]/20">
                  <Radar className="h-3.5 w-3.5 text-[#ff8f6b]" />
                </div>
              </div>
              <p className="mt-2 font-mono text-3xl font-semibold tracking-[-0.02em] tabular-nums text-white">
                {spendingRatio.toFixed(0)}%
              </p>
              <p className="mt-1 text-[11px] text-white/55">Udzial kosztow</p>
            </div>
          </div>
        </div>
      </FadeInSection>

      <NetWorthCard
        totalSavings={data.totalSavings}
        portfolioValue={data.portfolioValue}
      />

      <StaggerGrid className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <IncomeOverviewCard
          total={data.totalIncome}
          wyplata1={data.incomeBreakdown.WYPLATA_1}
          wyplata2={data.incomeBreakdown.WYPLATA_2}
          inne={data.incomeBreakdown.INNE}
          trendPct={data.incomeTrendPct}
        />
        <MetricCard
          title="Wydatki"
          value={formatPLN(data.totalExpenses)}
          icon={<TrendingDown />}
          trend="down"
          subtitle={formatTrend(data.expenseTrendPct)}
        />
        <MetricCard
          title="Saldo netto"
          value={formatPLN(data.netBalance)}
          icon={<Wallet />}
          trend={data.netBalance >= 0 ? "up" : "down"}
          subtitle={`Wskaźnik oszczędzania: ${data.savingsRate.toFixed(0)}%`}
        />
        <MetricCard
          title="Oszczędności"
          value={formatCurrency(data.totalSavings, "PLN")}
          icon={<Wallet />}
          trend="neutral"
        />
      </StaggerGrid>

      <FadeInSection delay={0.24} className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <CashflowChart data={data.cashflowData} />
        <ExpensePieChart data={data.pieData} />
      </FadeInSection>

    </div>
  );
}
