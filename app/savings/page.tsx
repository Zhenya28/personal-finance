import { prisma } from "@/lib/prisma";
import { SavingsSummary } from "@/components/savings/SavingsSummary";
import { SavingsForm } from "@/components/savings/SavingsForm";
import { SavingsAccountCard } from "@/components/savings/SavingsAccountCard";
import { SavingsVisuals } from "@/components/savings/SavingsVisuals";
import { getFxRate } from "@/lib/yahoo";

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

  const currencyBuckets = new Map<string, number>();
  for (const acc of accounts) {
    const amountPln = acc.balance * (fxRates[acc.currency] ?? 1);
    currencyBuckets.set(acc.currency, (currencyBuckets.get(acc.currency) || 0) + amountPln);
  }
  const currencyData = Array.from(currencyBuckets.entries())
    .map(([currency, amountPln]) => ({ currency, amountPln }))
    .sort((a, b) => b.amountPln - a.amountPln);

  const accountData = accounts
    .map((acc) => ({
      name: acc.name.length > 14 ? `${acc.name.slice(0, 14)}...` : acc.name,
      currency: acc.currency,
      amountPln: acc.balance * (fxRates[acc.currency] ?? 1),
    }))
    .sort((a, b) => b.amountPln - a.amountPln);
  return (
    <div className="ag-page">
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Oszczednosci</h1>
      </div>

      <SavingsSummary accounts={accounts} fxRates={fxRates} />

      <SavingsVisuals currencyData={currencyData} accountData={accountData} />

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
