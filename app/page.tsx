import { prisma, sumByMonth } from "@/lib/prisma";
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
import { getFxRatesToPln } from "@/lib/yahoo";
import { Wallet, TrendingDown } from "lucide-react";
import { StaggerGrid, FadeInSection } from "@/components/ui/motion-wrappers";

export const revalidate = 60;

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

  const last6 = getLast6Months(isAllMonths ? undefined : selectedMonth);
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
    incomeMonthly,
    expenseMonthly,
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
    prisma.investment.findMany({
      select: { units: true, pricePerUnit: true },
    }),
    prisma.savingsAccount.findMany({
      select: { balance: true, currency: true },
    }),
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
    sumByMonth("Income", sixMonthsAgo, endOfMonth),
    sumByMonth("Expense", sixMonthsAgo, endOfMonth),
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
  const fxRates = await getFxRatesToPln(savingsAccounts.map((a) => a.currency));
  const totalSavings = savingsAccounts.reduce(
    (sum, acc) => sum + acc.balance * (fxRates[acc.currency] ?? 1),
    0
  );

  // Charts (sums grouped in SQL via sumByMonth)
  const incomeByMonth = new Map(incomeMonthly.map((r) => [r.month, r.total]));
  const expenseByMonth = new Map(expenseMonthly.map((r) => [r.month, r.total]));

  const cashflowData = last6.map((m) => ({
    month: getMonthLabel(m),
    income: incomeByMonth.get(m) || 0,
    expenses: expenseByMonth.get(m) || 0,
  }));

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

  return (
    <div className="ag-page">
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
          tone={
            data.expenseTrendPct === null
              ? "neutral"
              : data.expenseTrendPct <= 0
                ? "good"
                : "bad"
          }
          subtitle={formatTrend(data.expenseTrendPct)}
        />
        <MetricCard
          title="Saldo netto"
          value={formatPLN(data.netBalance)}
          icon={<Wallet />}
          tone={data.netBalance >= 0 ? "good" : "bad"}
          subtitle={`Wskaźnik oszczędzania: ${data.savingsRate.toFixed(0)}%`}
        />
        <MetricCard
          title="Oszczędności"
          value={formatCurrency(data.totalSavings, "PLN")}
          icon={<Wallet />}
          tone="neutral"
        />
      </StaggerGrid>

      <FadeInSection delay={0.24} className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <CashflowChart data={data.cashflowData} />
        <ExpensePieChart data={data.pieData} />
      </FadeInSection>

    </div>
  );
}
