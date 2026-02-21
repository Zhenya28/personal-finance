import { prisma } from "@/lib/prisma";
import {
  formatPLN,
  getCurrentMonth,
  getLast6Months,
  getMonthLabel,
} from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { ScoreCard } from "@/components/overview/ScoreCard";
import { CashflowChart } from "@/components/overview/CashflowChart";
import { ExpensePieChart } from "@/components/overview/ExpensePieChart";
import { SmartInsights } from "@/components/overview/SmartInsights";
import { fetchVWCEPrice } from "@/actions/investments";
import {
  Wallet,
  LineChart,
  PiggyBank,
  Percent,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getOverviewData() {
  const currentMonth = getCurrentMonth();
  const [year, month] = currentMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const prevMonthStart = new Date(year, month - 2, 1);
  const prevMonthEnd = new Date(year, month - 1, 0, 23, 59, 59);

  // Fetch all data in parallel
  const incomeThisMonth = await prisma.income.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
  });
  const expensesThisMonth = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
  });
  const incomePrevMonth = await prisma.income.aggregate({
    _sum: { amount: true },
    where: { date: { gte: prevMonthStart, lte: prevMonthEnd } },
  });
  const investments: { id: string; ticker: string; units: number; pricePerUnit: number; commission: number; date: Date; createdAt: Date }[] = await prisma.investment.findMany();
  const savingsGoals: { id: string; name: string; targetAmount: number; currentAmount: number; deadline: Date | null; createdAt: Date }[] = await prisma.savingsGoal.findMany();
  const checkins = await prisma.dailyCheckin.findMany({ orderBy: { date: "desc" } });
  const foodThisMonthAgg = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      category: "FOOD",
      date: { gte: startOfMonth, lte: endOfMonth },
    },
  });
  const foodPrevMonthAgg = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: {
      category: "FOOD",
      date: { gte: prevMonthStart, lte: prevMonthEnd },
    },
  });
  const expensesByCategory = await prisma.expense.groupBy({
    by: ["category"],
    _sum: { amount: true },
    where: { date: { gte: startOfMonth, lte: endOfMonth } },
  });
  const budgetLimits = await prisma.budgetLimit.findMany({
    where: { month: currentMonth },
  });

  const totalIncome = incomeThisMonth._sum.amount || 0;
  const totalExpenses = expensesThisMonth._sum.amount || 0;
  const prevIncome = incomePrevMonth._sum.amount || 0;
  const netBalance = totalIncome - totalExpenses;

  const currentPrice = await fetchVWCEPrice();
  const totalUnits = investments.reduce((sum, inv) => sum + inv.units, 0);
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.units * inv.pricePerUnit + inv.commission,
    0
  );
  const portfolioValue = currentPrice
    ? totalUnits * currentPrice
    : totalInvested;

  const totalSavings = savingsGoals.reduce(
    (sum: number, g) => sum + g.currentAmount,
    0
  );
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const prevSavingsRate =
    prevIncome > 0 ? (totalSavings / prevIncome) * 100 : 0;

  const freeCash = totalIncome - totalExpenses;

  // Streak calculation
  let streak = 0;
  if (checkins.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(today);

    for (const checkin of checkins) {
      const cDate = new Date(checkin.date);
      cDate.setHours(0, 0, 0, 0);
      if (cDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Monthly score
  const withinBudget = budgetLimits.every((bl) => {
    const spent =
      expensesByCategory.find((e) => e.category === bl.category)?._sum
        .amount || 0;
    return spent <= bl.limitAmount;
  });
  const budgetPoints = budgetLimits.length > 0 && withinBudget ? 40 : 0;
  const savingsPoints = savingsRate > 20 ? 30 : 0;
  const investmentPoints = investments.some((inv) => {
    const invDate = new Date(inv.date);
    return invDate >= startOfMonth && invDate <= endOfMonth;
  })
    ? 30
    : 0;
  const monthlyScore = budgetPoints + savingsPoints + investmentPoints;

  // Cashflow chart data
  const last6 = getLast6Months();
  const cashflowData = await Promise.all(
    last6.map(async (m) => {
      const [y, mo] = m.split("-").map(Number);
      const start = new Date(y, mo - 1, 1);
      const end = new Date(y, mo, 0, 23, 59, 59);

      const inc = await prisma.income.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      });
      const exp = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      });

      return {
        month: getMonthLabel(m),
        income: inc._sum.amount || 0,
        expenses: exp._sum.amount || 0,
      };
    })
  );

  const pieData = expensesByCategory.map((e) => ({
    category: e.category,
    amount: e._sum.amount || 0,
  }));

  return {
    netBalance,
    portfolioValue,
    totalSavings,
    savingsRate,
    freeCash,
    streak,
    monthlyScore,
    budgetPoints,
    savingsPoints,
    investmentPoints,
    cashflowData,
    pieData,
    foodThisMonth: foodThisMonthAgg._sum.amount || 0,
    foodPrevMonth: foodPrevMonthAgg._sum.amount || 0,
    totalInvested,
    savingsRateLastMonth: prevSavingsRate,
  };
}

export default async function OverviewPage() {
  const data = await getOverviewData();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Saldo netto"
          value={formatPLN(data.netBalance)}
          icon={Wallet}
          trend={data.netBalance >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="Wartość portfolio"
          value={formatPLN(data.portfolioValue)}
          icon={LineChart}
          trend="neutral"
        />
        <MetricCard
          title="Łączne oszczędności"
          value={formatPLN(data.totalSavings)}
          icon={PiggyBank}
          trend="up"
        />
        <MetricCard
          title="Savings rate"
          value={`${data.savingsRate.toFixed(0)}%`}
          icon={Percent}
          trend={data.savingsRate >= 20 ? "up" : "down"}
        />
      </div>

      <ScoreCard
        freeCash={data.freeCash}
        streak={data.streak}
        monthlyScore={data.monthlyScore}
        budgetPoints={data.budgetPoints}
        savingsPoints={data.savingsPoints}
        investmentPoints={data.investmentPoints}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <CashflowChart data={data.cashflowData} />
        <ExpensePieChart data={data.pieData} />
      </div>

      <SmartInsights
        foodThisMonth={data.foodThisMonth}
        foodLastMonth={data.foodPrevMonth}
        portfolioValue={data.portfolioValue}
        portfolioInvested={data.totalInvested}
        savingsRateThisMonth={data.savingsRate}
        savingsRateLastMonth={data.savingsRateLastMonth}
      />
    </div>
  );
}
