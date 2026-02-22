import { prisma } from "@/lib/prisma";
import { SavingsSummary } from "@/components/savings/SavingsSummary";
import { SavingsForm } from "@/components/savings/SavingsForm";
import { SavingsAccountCard } from "@/components/savings/SavingsAccountCard";
import { getFxRate } from "@/lib/yahoo";
import { PiggyBank } from "lucide-react";

export const revalidate = 0;

async function getSavingsData() {
  const accounts = await prisma.savingsAccount.findMany({
    orderBy: { createdAt: "asc" },
  });

  const currencies = [...new Set(accounts.map((a) => a.currency))].filter(
    (c) => c !== "PLN"
  );

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
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center h-9 w-9 rounded-lg bg-amber-500/10">
            <PiggyBank className="h-5 w-5 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Oszczednosci</h2>
        </div>
        <p className="text-sm text-muted-foreground ml-12">
          Konta oszczednosciowe w roznych walutach
        </p>
      </div>

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
