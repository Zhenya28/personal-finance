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
  Activity,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FadeInSection, StaggerGrid } from "@/components/ui/motion-wrappers";

export const revalidate = 60;

export default async function InvestmentsPage() {
  const investments = await prisma.investment.findMany({
    orderBy: { date: "desc" },
  });

  const [quote, eurPln, defaultHistory] =
    await Promise.all([
      getQuote("VWCE.DE"),
      getEurPlnRate(),
      getHistorical("VWCE.DE", "1y"),
    ]);

  const currentPriceEur = quote?.price ?? null;
  const eurPlnRate = eurPln ?? null;
  const currentPricePln =
    currentPriceEur && eurPlnRate ? currentPriceEur * eurPlnRate : null;

  const dayChange = quote?.change ?? 0;
  const dayChangePct = quote?.changePercent ?? 0;

  const totalUnits = investments.reduce((sum, inv) => sum + inv.units, 0);
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

  const sortedInvestments = [...investments].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const portfolioValueData: { date: string; value: number; invested: number }[] = [];
  let cumulativeUnits = 0;
  let cumulativeInvested = 0;
  for (const inv of sortedInvestments) {
    cumulativeUnits += inv.units;
    cumulativeInvested += inv.units * inv.pricePerUnit;
    const priceAtTime = currentPricePln || inv.pricePerUnit;
    portfolioValueData.push({
      date: formatDate(inv.date),
      value: Math.round(cumulativeUnits * priceAtTime * 100) / 100,
      invested: Math.round(cumulativeInvested * 100) / 100,
    });
  }

  if (currentPricePln && portfolioValueData.length > 0) {
    portfolioValueData.push({
      date: "Dzis",
      value: Math.round(totalUnits * currentPricePln * 100) / 100,
      invested: Math.round(totalInvested * 100) / 100,
    });
  }

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

  const initialData: { date: string; close: number }[] = defaultHistory;

  const headlinePrice =
    currentPriceEur !== null ? `${currentPriceEur.toFixed(2)} EUR` : "Brak danych";
  const headlineChange = `${dayChange >= 0 ? "+" : ""}${dayChange.toFixed(2)} EUR (${dayChangePct >= 0 ? "+" : ""}${dayChangePct.toFixed(2)}%)`;

  return (
    <div className="ag-page">
      <div className="ag-toolbar">
        <h1 className="ag-toolbar-title">Inwestycje</h1>
      </div>

      <FadeInSection>
        <div className="ag-card">
          <p className="ag-overline">Wartosc portfela</p>
          <h1 className="mt-2 font-mono text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.03em] text-white">
            {formatPLN(currentValue)}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`ag-kpi ${dayChange >= 0 ? "up" : "down"}`}>{headlineChange}</span>
            <span className="ag-kpi" style={{ color: "#6366F1", background: "rgba(99,102,241,.12)" }}>
              {pnlPct >= 0 ? "+" : ""}
              {pnlPct.toFixed(1)}% Total P&amp;L
            </span>
          </div>
          <p className="mt-3 text-xs text-white/55">
            VWCE Spot: {headlinePrice} · FX EUR/PLN: {eurPlnRate ? eurPlnRate.toFixed(4) : "Brak"}
          </p>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.08}>
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/[0.1] bg-white/[0.035] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/65">
                  Jednostki
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {totalUnits.toFixed(4)} szt
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.1] bg-white/[0.035] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/65">
                  P&L Total
                </p>
                <p
                  className={`mt-1 text-sm font-semibold tabular-nums ${
                    pnl >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatPLN(pnl)}
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.1] bg-white/[0.035] p-4">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground/65">
                  Momentum
                </p>
                <p className="mt-1 text-sm font-semibold tabular-nums">
                  {pnlPct >= 0 ? "+" : ""}
                  {pnlPct.toFixed(2)}%
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Activity className="h-3 w-3 text-primary" />
                  Trend portfela
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeInSection>

      <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Zainwestowano"
          value={formatPLN(totalInvested)}
          icon={<Wallet />}
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
          icon={<TrendingUp />}
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
          icon={pnl >= 0 ? <TrendingUp /> : <TrendingDown />}
          trend={pnl >= 0 ? "up" : "down"}
        />
        <MetricCard
          title="Srednia cena (DCA)"
          value={`${avgPricePln.toFixed(2)} PLN`}
          subtitle={`${totalUnits.toFixed(4)} jednostek`}
          icon={<Calculator />}
          trend="neutral"
        />
      </StaggerGrid>

      <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
        <FadeInSection delay={0.18}>
          <PortfolioChart initialData={initialData} ticker="VWCE.DE" />
        </FadeInSection>
        <FadeInSection delay={0.24}>
          <PortfolioValueChart data={portfolioValueData} />
        </FadeInSection>
      </div>

      {positions.length > 0 && currentPricePln && (
        <FadeInSection delay={0.3}>
          <Card className="overflow-hidden">
            <CardContent className="pt-6">
              <div className="mb-6 flex items-center gap-2.5">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-500/10">
                  <Wallet className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Pozycje</h3>
                  <p className="text-xs text-muted-foreground">{positions.length} zakupow</p>
                </div>
              </div>
              <div className="space-y-0 divide-y divide-border">
                {positions.map((pos) => (
                  <div
                    key={pos.id}
                    className="flex items-center justify-between gap-2 py-4"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium tabular-nums truncate">
                        {pos.units.toFixed(4)} szt &middot; {formatDate(pos.date)}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {pos.pricePerUnit.toFixed(2)} &rarr; {currentPricePln.toFixed(2)} PLN/szt
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-semibold tabular-nums">{formatPLN(pos.currentVal)}</p>
                      <span
                        className={`text-[10px] font-medium tabular-nums ${pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {pos.pnl >= 0 ? "+" : ""}{pos.pnlPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeInSection>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <FadeInSection delay={0.36}>
          <InvestmentForm />
        </FadeInSection>
        <FadeInSection delay={0.42}>
          <InvestmentTable data={investments} />
        </FadeInSection>
      </div>
    </div>
  );
}
