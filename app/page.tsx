import { prisma } from "@/lib/prisma";
import {
  formatPLN,
  formatCurrency,
  getCurrentMonth,
  getLast6Months,
  getMonthLabel,
} from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { CashflowChart } from "@/components/overview/CashflowChart";
import { ExpensePieChart } from "@/components/overview/ExpensePieChart";
import { fetchVWCEData } from "@/actions/investments";
import { getFxRate } from "@/lib/yahoo";
import { Wallet, LineChart, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";

export const revalidate = 60;

async function getOverviewData() {
  const currentMonth = getCurrentMonth();
  const [year, month] = currentMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const last6 = getLast6Months();
  const oldestMonth = last6[0].split("-").map(Number);
  const sixMonthsAgo = new Date(oldestMonth[0], oldestMonth[1] - 1, 1);

  const [
    incomeThisMonth,
    expensesThisMonth,
    investments,
    savingsAccounts,
    vwceData,
    expensesByCategory,
    allIncomes6m,
    allExpenses6m,
  ] = await Promise.all([
    prisma.income.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.investment.findMany(),
    prisma.savingsAccount.findMany(),
    fetchVWCEData(),
    prisma.expense.groupBy({
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

  const totalIncome = incomeThisMonth._sum.amount || 0;
  const totalExpenses = expensesThisMonth._sum.amount || 0;
  const netBalance = totalIncome - totalExpenses;

  // Portfolio value
  const totalUnits = investments.reduce((sum, inv) => sum + inv.units, 0);
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.units * inv.pricePerUnit,
    0
  );
  const currentPricePln = vwceData ? vwceData.pricePln : null;
  const portfolioValue = currentPricePln
    ? totalUnits * currentPricePln
    : totalInvested;

  // Savings total in PLN
  const currencies = [...new Set(savingsAccounts.map((a) => a.currency))].filter(
    (c) => c !== "PLN"
  );
  const fxRates: Record<string, number> = { PLN: 1 };
  const rateResults = await Promise.all(
    currencies.map(async (c) => {
      const rate = await getFxRate(c, "PLN");
      return [c, rate ?? 1] as [string, number];
    })
  );
  for (const [c, r] of rateResults) {
    fxRates[c] = r;
  }
  const totalSavings = savingsAccounts.reduce((sum, acc) => {
    return sum + acc.balance * (fxRates[acc.currency] ?? 1);
  }, 0);

  // Cashflow chart
  const cashflowData = last6.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const start = new Date(y, mo - 1, 1);
    const end = new Date(y, mo, 0, 23, 59, 59);

    const incomeSum = allIncomes6m
      .filter((i) => i.date >= start && i.date <= end)
      .reduce((sum, i) => sum + i.amount, 0);
    const expenseSum = allExpenses6m
      .filter((e) => e.date >= start && e.date <= end)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      month: getMonthLabel(m),
      income: incomeSum,
      expenses: expenseSum,
    };
  });

  const pieData = expensesByCategory.map((e) => ({
    category: e.category,
    amount: e._sum.amount || 0,
  }));

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    portfolioValue,
    totalSavings,
    cashflowData,
    pieData,
  };
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Przychody"
          value={formatPLN(data.totalIncome)}
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Wydatki"
          value={formatPLN(data.totalExpenses)}
          icon={TrendingDown}
          trend="down"
        />
        <MetricCard
          title="Saldo netto"
          value={formatPLN(data.netBalance)}
          icon={Wallet}
          trend={data.netBalance >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="Oszczędności"
          value={formatCurrency(data.totalSavings, "PLN")}
          icon={PiggyBank}
          trend="up"
        />
        <MetricCard
          title="Portfolio VWCE"
          value={formatPLN(data.portfolioValue)}
          icon={LineChart}
          trend="neutral"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CashflowChart data={data.cashflowData} />
        <ExpensePieChart data={data.pieData} />
      </div>
    </div>
  );
}
