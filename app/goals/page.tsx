import { prisma } from "@/lib/prisma";
import { getLast6Months } from "@/lib/utils";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalCard } from "@/components/goals/GoalCard";
import { EmergencyFund } from "@/components/goals/EmergencyFund";

export const revalidate = 60;

export default async function GoalsPage() {
  // Calculate the full date range for the last 6 months
  const last6 = getLast6Months();
  const oldestMonth = last6[0].split("-").map(Number);
  const sixMonthsAgo = new Date(oldestMonth[0], oldestMonth[1] - 1, 1);
  const now = new Date();

  // Fetch all data in parallel — 2 queries instead of 7
  const [goals, allExpenses6m] = await Promise.all([
    prisma.savingsGoal.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.expense.findMany({
      where: { date: { gte: sixMonthsAgo, lte: now } },
      select: { amount: true, date: true },
    }),
  ]);

  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Calculate average monthly expenses from already-fetched data (no extra queries)
  const monthlyExpenses = last6.map((m) => {
    const [y, mo] = m.split("-").map(Number);
    const start = new Date(y, mo - 1, 1);
    const end = new Date(y, mo, 0, 23, 59, 59);
    return allExpenses6m
      .filter((e) => e.date >= start && e.date <= end)
      .reduce((sum, e) => sum + e.amount, 0);
  });

  const nonZero = monthlyExpenses.filter((e) => e > 0);
  const avgMonthlyExpenses =
    nonZero.length > 0
      ? nonZero.reduce((sum, e) => sum + e, 0) / nonZero.length
      : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Cele i Oszczędności</h2>

      <GoalForm />

      <EmergencyFund
        totalSavings={totalSavings}
        avgMonthlyExpenses={avgMonthlyExpenses}
      />

      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground mb-2">Brak celów oszczędnościowych</p>
          <p className="text-sm text-muted-foreground">
            Dodaj pierwszy cel używając formularza powyżej
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
