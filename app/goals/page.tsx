import { prisma } from "@/lib/prisma";
import { getLast6Months } from "@/lib/utils";
import { GoalForm } from "@/components/goals/GoalForm";
import { GoalCard } from "@/components/goals/GoalCard";
import { EmergencyFund } from "@/components/goals/EmergencyFund";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const goals = await prisma.savingsGoal.findMany({
    orderBy: { createdAt: "desc" },
  });

  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  // Average monthly expenses (last 6 months)
  const last6 = getLast6Months();
  const monthlyExpenses = await Promise.all(
    last6.map(async (m) => {
      const [y, mo] = m.split("-").map(Number);
      const start = new Date(y, mo - 1, 1);
      const end = new Date(y, mo, 0, 23, 59, 59);
      const agg = await prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: start, lte: end } },
      });
      return agg._sum.amount || 0;
    })
  );

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
