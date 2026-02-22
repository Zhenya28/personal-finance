import { prisma } from "@/lib/prisma";
import { SavingsSummary } from "@/components/savings/SavingsSummary";
import { SavingsForm } from "@/components/savings/SavingsForm";
import { SavingsAccountCard } from "@/components/savings/SavingsAccountCard";
import { getFxRate } from "@/lib/yahoo";
import { PiggyBank } from "lucide-react";

export const revalidate = 60;

async function getSavingsData() {
  const accounts = await prisma.savingsAccount.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Get unique non-PLN currencies
  const currencies = [...new Set(accounts.map((a) => a.currency))].filter(
    (c) => c !== "PLN"
  );

  // Fetch FX rates in parallel
  const rateEntries = await Promise.all(
    currencies.map(async (c) => {
      const rate = await getFxRate(c, "PLN");
      return [c, rate ?? 1] as [string, number];
    })
  );

  const fxRates: Record<string, number> = { PLN: 1 };
  for (const [c, r] of rateEntries) {
    fxRates[c] = r;
  }

  return { accounts, fxRates };
}

export default async function SavingsPage() {
  const { accounts, fxRates } = await getSavingsData();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <PiggyBank className="h-6 w-6" />
        Oszczędności
      </h2>

      <SavingsSummary accounts={accounts} fxRates={fxRates} />

      <SavingsForm />

      {accounts.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => (
            <SavingsAccountCard
              key={account.id}
              id={account.id}
              name={account.name}
              currency={account.currency}
              balance={account.balance}
            />
          ))}
        </div>
      )}
    </div>
  );
}
