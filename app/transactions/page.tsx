import { prisma } from "@/lib/prisma";
import {
  getCurrentMonth,
  formatPLN,
  isValidMonth,
} from "@/lib/utils";
import { TransactionList } from "@/components/transactions/TransactionList";
import { MetricCard } from "@/components/overview/MetricCard";
import { TransactionsFlowChart } from "@/components/transactions/TransactionsFlowChart";
import { TransactionsTypeDonut } from "@/components/transactions/TransactionsTypeDonut";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { StaggerGrid } from "@/components/ui/motion-wrappers";

export const revalidate = 0;

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function TransactionsPage({ searchParams }: Props) {
  const params = await searchParams;
  const selectedMonth = isValidMonth(params.month)
    ? params.month
    : getCurrentMonth();
  const [year, month] = selectedMonth.split("-").map(Number);
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.findMany({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
      orderBy: { date: "desc" },
    }),
  ]);

  const transactions = [
    ...incomes.map((i) => ({
      id: i.id,
      date: i.date,
      amount: i.amount,
      category: i.category,
      description: i.description,
      type: "income" as const,
    })),
    ...expenses.map((e) => ({
      id: e.id,
      date: e.date,
      amount: e.amount,
      category: e.category,
      description: e.description,
      type: "expense" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  const daysInMonth = endOfMonth.getDate();
  const dayRows = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const incomeByDay = new Map<number, number>();
  const expenseByDay = new Map<number, number>();

  for (const tx of incomes) {
    const day = tx.date.getDate();
    incomeByDay.set(day, (incomeByDay.get(day) || 0) + tx.amount);
  }
  for (const tx of expenses) {
    const day = tx.date.getDate();
    expenseByDay.set(day, (expenseByDay.get(day) || 0) + tx.amount);
  }

  const dailyFlowData = dayRows.map((day) => {
    const income = incomeByDay.get(day) || 0;
    const expense = expenseByDay.get(day) || 0;
    return {
      day: `${day}`,
      income,
      expense,
      net: income - expense,
    };
  });

  return (
    <div className="ag-page">
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Transakcje</h1>
      </div>

      <StaggerGrid className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Przychody"
          value={formatPLN(totalIncome)}
          icon={<TrendingUp />}
          trend="up"
        />
        <MetricCard
          title="Wydatki"
          value={formatPLN(totalExpenses)}
          icon={<TrendingDown />}
          trend="down"
        />
        <MetricCard
          title="Saldo"
          value={formatPLN(netBalance)}
          icon={<Wallet />}
          trend={netBalance >= 0 ? "up" : "down"}
        />
      </StaggerGrid>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <TransactionsFlowChart data={dailyFlowData} />
        <TransactionsTypeDonut
          incomeTotal={totalIncome}
          expenseTotal={totalExpenses}
          incomeCount={incomes.length}
          expenseCount={expenses.length}
        />
      </div>

      <TransactionList data={transactions} />
    </div>
  );
}
