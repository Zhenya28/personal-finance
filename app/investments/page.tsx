import { prisma } from "@/lib/prisma";
import { formatPLN, formatDate } from "@/lib/utils";
import { MetricCard } from "@/components/overview/MetricCard";
import { InvestmentForm } from "@/components/investments/InvestmentForm";
import { InvestmentTable } from "@/components/investments/InvestmentTable";
import { PortfolioChart } from "@/components/investments/PortfolioChart";
import { PortfolioValueChart } from "@/components/investments/PortfolioValueChart";
import { getQuote, getHistorical, getEurPlnRate } from "@/lib/yahoo";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calculator,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300; // refresh every 5 minutes

export default async function InvestmentsPage() {
  const investments = await prisma.investment.findMany({
    orderBy: { date: "desc" },
  });

  // Fetch live quote + EUR/PLN + historical data in parallel
  const [quote, eurPln, hist1mo, hist3mo, hist6mo, hist1y, hist2y, hist5y] =
    await Promise.all([
      getQuote("VWCE.DE"),
      getEurPlnRate(),
      getHistorical("VWCE.DE", "1mo"),
      getHistorical("VWCE.DE", "3mo"),
      getHistorical("VWCE.DE", "6mo"),
      getHistorical("VWCE.DE", "1y"),
      getHistorical("VWCE.DE", "2y"),
      getHistorical("VWCE.DE", "5y"),
    ]);

  const currentPriceEur = quote?.price ?? null;
  const eurPlnRate = eurPln ?? null;
  // Current price of 1 VWCE unit in PLN
  const currentPricePln =
    currentPriceEur && eurPlnRate ? currentPriceEur * eurPlnRate : null;

  const dayChange = quote?.change ?? 0;
  const dayChangePct = quote?.changePercent ?? 0;

  const totalUnits = investments.reduce((sum, inv) => sum + inv.units, 0);
  // pricePerUnit is stored in PLN, so totalInvested is in PLN
  const totalInvested = investments.reduce(
    (sum, inv) => sum + inv.units * inv.pricePerUnit,
    0
  );
  const currentValue = currentPricePln
    ? totalUnits * currentPricePln
    : totalInvested;
  const pnl = currentValue - totalInvested;
  const pnlPct = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
  const avgPricePln = totalUnits > 0 ? totalInvested / totalUnits : 0;

  // Build portfolio value over time (per-purchase cumulative)
  const sortedInvestments = [...investments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let cumulativeUnits = 0;
  let cumulativeInvested = 0;
  const portfolioValueData = sortedInvestments.map((inv) => {
    cumulativeUnits += inv.units;
    cumulativeInvested += inv.units * inv.pricePerUnit;
    const priceAtTime = currentPricePln || inv.pricePerUnit;
    return {
      date: formatDate(inv.date),
      value: Math.round(cumulativeUnits * priceAtTime * 100) / 100,
      invested: Math.round(cumulativeInvested * 100) / 100,
    };
  });

  // Add current point
  if (currentPricePln && portfolioValueData.length > 0) {
    portfolioValueData.push({
      date: "Dzis",
      value: Math.round(totalUnits * currentPricePln * 100) / 100,
      invested: Math.round(totalInvested * 100) / 100,
    });
  }

  // Per-purchase P&L (like XTB positions view) — all in PLN
  const positions = investments.map((inv) => {
    const currentVal = currentPricePln
      ? inv.units * currentPricePln
      : inv.units * inv.pricePerUnit;
    const costBasis = inv.units * inv.pricePerUnit;
    const positionPnl = currentVal - costBasis;
    const positionPnlPct = costBasis > 0 ? (positionPnl / costBasis) * 100 : 0;
    return {
      ...inv,
      currentVal,
      costBasis,
      pnl: positionPnl,
      pnlPct: positionPnlPct,
    };
  });

  const dataByPeriod: Record<string, { date: string; close: number }[]> = {
    "1mo": hist1mo,
    "3mo": hist3mo,
    "6mo": hist6mo,
    "1y": hist1y,
    "2y": hist2y,
    "5y": hist5y,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Inwestycje</h2>
        {quote && eurPlnRate && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{quote.name}</p>
            <p className="text-xs text-muted-foreground">
              EUR/PLN: {eurPlnRate.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Zainwestowano"
          value={formatPLN(totalInvested)}
          icon={Wallet}
          trend="neutral"
        />
        <MetricCard
          title="Aktualna wartosc"
          value={formatPLN(currentValue)}
          subtitle={
            currentPriceEur && currentPricePln
              ? `VWCE: ${currentPriceEur.toFixed(2)} EUR (${currentPricePln.toFixed(2)} PLN)`
              : "Brak danych"
          }
          icon={TrendingUp}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="P&L"
          value={`${formatPLN(pnl)} (${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%)`}
          subtitle={
            currentPriceEur
              ? `Dzis: ${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(2)} EUR (${dayChangePct >= 0 ? "+" : ""}${dayChangePct.toFixed(2)}%)`
              : undefined
          }
          icon={pnl >= 0 ? TrendingUp : TrendingDown}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="Srednia cena (DCA)"
          value={`${avgPricePln.toFixed(2)} PLN`}
          subtitle={`${totalUnits.toFixed(4)} jednostek`}
          icon={Calculator}
          trend="neutral"
        />
      </div>

      {/* ETF Price chart */}
      <PortfolioChart dataByPeriod={dataByPeriod} ticker="VWCE.DE" />

      {/* Portfolio value vs invested chart */}
      <PortfolioValueChart data={portfolioValueData} />

      {/* Positions table (XTB-style) */}
      {positions.length > 0 && currentPricePln && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pozycje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positions.map((pos) => (
                <div
                  key={pos.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {pos.units.toFixed(4)} szt &middot;{" "}
                      {formatDate(pos.date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Kupno: {pos.pricePerUnit.toFixed(2)} PLN/szt &middot;
                      Teraz: {currentPricePln.toFixed(2)} PLN/szt
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatPLN(pos.currentVal)}</p>
                    <Badge
                      variant={pos.pnl >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {pos.pnl >= 0 ? "+" : ""}
                      {formatPLN(pos.pnl)} ({pos.pnl >= 0 ? "+" : ""}
                      {pos.pnlPct.toFixed(1)}%)
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <InvestmentForm />
      <InvestmentTable data={investments} />
    </div>
  );
}
