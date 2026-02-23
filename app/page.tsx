import { prisma } from "@/lib/prisma";
import {
  formatPLN,
  formatCurrency,
  getCurrentMonth,
  getLast6Months,
  getMonthLabel,
} from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { IncomeOverviewCard } from "@/components/overview/IncomeOverviewCard";
import { NetWorthCard } from "@/components/overview/NetWorthCard";
import { CashflowChart } from "@/components/overview/CashflowChart";
import { ExpensePieChart } from "@/components/overview/ExpensePieChart";
import { fetchVWCEData } from "@/actions/investments";
import { getFxRate } from "@/lib/yahoo";
import {
  Wallet,
  TrendingDown,
  LayoutDashboard,
} from "lucide-react";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

async function getOverviewData(selectedMonth: string) {
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  // Previous month
  const prevMonthStart = new Date(year, month - 2, 1);
  const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);

  const last6 = getLast6Months();
  const oldestMonth = last6[0].split("-").map(Number);
  const sixMonthsAgo = new Date(oldestMonth[0], oldestMonth[1] - 1, 1);

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
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
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
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.income.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
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
  const expenseTrendPct = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses * 100) : null;
  const incomeTrendPct = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome * 100) : null;

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
  const cashflowData = last6.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const start = new Date(y, mo - 1, 1);
    const end = new Date(y, mo, 0, 23, 59, 59);
    const incomeSum = allIncomes6m.filter((i) => i.date >= start && i.date <= end).reduce((sum, i) => sum + i.amount, 0);
    const expenseSum = allExpenses6m.filter((e) => e.date >= start && e.date <= end).reduce((sum, e) => sum + e.amount, 0);
    return { month: getMonthLabel(m), income: incomeSum, expenses: expenseSum };
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
    monthLabel: getMonthLabel(selectedMonth),
  };
}

function formatTrend(pct: number | null): string | undefined {
  if (pct === null) return undefined;
  const arrow = pct >= 0 ? "↑" : "↓";
  return `${arrow} ${Math.abs(pct).toFixed(0)}% vs poprzedni miesiąc`;
}

export default async function OverviewPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = params.month || getCurrentMonth();
  const data = await getOverviewData(selectedMonth);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-primary/10">
            <LayoutDashboard className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
            <p className="text-sm text-muted-foreground capitalize">
              {data.monthLabel}
            </p>
          </div>
        </div>
      </div>

      <NetWorthCard
        totalSavings={data.totalSavings}
        portfolioValue={data.portfolioValue}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          icon={TrendingDown}
          trend="down"
          subtitle={formatTrend(data.expenseTrendPct)}
        />
        <MetricCard
          title="Saldo netto"
          value={formatPLN(data.netBalance)}
          icon={Wallet}
          trend={data.netBalance >= 0 ? "up" : "down"}
          subtitle={`Wskaźnik oszczędzania: ${data.savingsRate.toFixed(0)}%`}
        />
        <MetricCard
          title="Oszczędności"
          value={formatCurrency(data.totalSavings, "PLN")}
          icon={Wallet}
          trend="neutral"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CashflowChart data={data.cashflowData} />
        <ExpensePieChart data={data.pieData} />
      </div>
    </div>
  );
}
