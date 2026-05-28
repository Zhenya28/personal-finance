import { prisma } from "@/lib/prisma";
import { SavingsSummary } from "@/components/savings/SavingsSummary";
import { SavingsForm } from "@/components/savings/SavingsForm";
import { SavingsAccountCard } from "@/components/savings/SavingsAccountCard";
import { SavingsVisuals } from "@/components/savings/SavingsVisuals";
import { SavingsTransactionForm } from "@/components/savings/SavingsTransactionForm";
import { SavingsTransactionTable } from "@/components/savings/SavingsTransactionTable";
import { getFxRatesToPln } from "@/lib/yahoo";

export const revalidate = 60;

async function getSavingsData() {
  const [accounts, transactions] = await Promise.all([
    prisma.savingsAccount.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, balance: true, currency: true, createdAt: true },
    }),
    prisma.savingsTransaction.findMany({
      orderBy: { date: "desc" },
      take: 50,
      select: {
        id: true,
        type: true,
        amount: true,
        description: true,
        date: true,
        account: { select: { name: true, currency: true } },
      },
    }),
  ]);

  const fxRates = await getFxRatesToPln(accounts.map((a) => a.currency));

  return { accounts, transactions, fxRates };
}

export default async function SavingsPage() {
  const { accounts, transactions, fxRates } = await getSavingsData();

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

      {accounts.length === 0 ? <SavingsForm /> : null}

      <SavingsSummary accounts={accounts} fxRates={fxRates} />

      <SavingsVisuals currencyData={currencyData} accountData={accountData} />

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

      <SavingsTransactionForm accounts={accounts.map((a) => ({ id: a.id, name: a.name, currency: a.currency }))} />

      <SavingsTransactionTable data={transactions} />

      {accounts.length > 0 ? <SavingsForm /> : null}
    </div>
  );
}
