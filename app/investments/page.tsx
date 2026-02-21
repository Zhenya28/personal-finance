import { prisma } from "@/lib/prisma";
import { formatPLN, formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { InvestmentForm } from "@/components/investments/InvestmentForm";
import { InvestmentTable } from "@/components/investments/InvestmentTable";
import { PortfolioChart } from "@/components/investments/PortfolioChart";
import { fetchVWCEPrice } from "@/actions/investments";
import { Wallet, TrendingUp, TrendingDown, Calculator } from "lucide-react";

export const revalidate = 60;

export default async function InvestmentsPage() {
  const [investments, currentPrice] = await Promise.all([
    prisma.investment.findMany({ orderBy: { date: "desc" } }),
    fetchVWCEPrice(),
  ]);

  const totalUnits = investments.reduce((sum, inv) => sum + inv.units, 0);
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.units * inv.pricePerUnit + inv.commission,
    0
  );
  const currentValue = currentPrice ? totalUnits * currentPrice : totalInvested;
  const pnl = currentValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const avgPrice = totalUnits > 0 ? totalInvested / totalUnits : 0;

  // Build portfolio value over time chart
  const sortedInvestments = [...investments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let cumulativeUnits = 0;
  const chartData = sortedInvestments.map((inv) => {
    cumulativeUnits += inv.units;
    const priceAtTime = currentPrice || inv.pricePerUnit;
    return {
      date: formatDate(inv.date),
      value: cumulativeUnits * priceAtTime,
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Inwestycje</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Zainwestowano"
          value={formatPLN(totalInvested)}
          icon={Wallet}
          trend="neutral"
        />
        <MetricCard
          title="Aktualna wartość"
          value={formatPLN(currentValue)}
          subtitle={
            currentPrice
              ? `VWCE: ${formatPLN(currentPrice)}/szt`
              : "Brak danych z Yahoo Finance"
          }
          icon={TrendingUp}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="P&L"
          value={`${formatPLN(pnl)} (${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%)`}
          icon={pnl >= 0 ? TrendingUp : TrendingDown}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="Średnia cena (DCA)"
          value={formatPLN(avgPrice)}
          subtitle={`${totalUnits.toFixed(4)} jednostek`}
          icon={Calculator}
          trend="neutral"
        />
      </div>

      <InvestmentForm />
      <InvestmentTable data={investments} />
      <PortfolioChart data={chartData} />
    </div>
  );
}
