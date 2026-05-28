"use client";

import { useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDollarSign, PieChart as PieChartIcon } from "lucide-react";
import { formatPLN } from "@/lib/utils";

interface CurrencyAllocationPoint {
  currency: string;
  amountPln: number;
}

interface AccountAllocationPoint {
  name: string;
  amountPln: number;
  currency: string;
}

const PALETTE = ["#16dbcc", "#4c78ff", "#ff8f6b", "#a78bfa", "#22c55e", "#f59e0b"];

export function SavingsVisuals({
  currencyData,
  accountData,
}: {
  currencyData: CurrencyAllocationPoint[];
  accountData: AccountAllocationPoint[];
}) {
  const total = useMemo(
    () => currencyData.reduce((sum, d) => sum + d.amountPln, 0),
    [currencyData]
  );
  const hasData = total > 0;

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="overflow-hidden border border-border">
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <PieChartIcon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Alokacja walutowa</h3>
              <p className="text-xs text-muted-foreground">Udzial walut w calych oszczednosciach</p>
            </div>
          </div>

          {!hasData ? (
            <div className="flex h-[250px] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground">
              Brak danych do wizualizacji
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
              <div className="mx-auto h-[180px] w-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currencyData}
                      dataKey="amountPln"
                      nameKey="currency"
                      innerRadius={52}
                      outerRadius={80}
                      paddingAngle={4}
                      strokeWidth={0}
                    >
                      {currencyData.map((_, idx) => (
                        <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                      formatter={(value, _name, item) => [
                        `${formatPLN(Number(value ?? 0))} (${(total > 0 ? (Number(value ?? 0) / total) * 100 : 0).toFixed(0)}%)`,
                        String(item.payload.currency),
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {currencyData.map((entry, idx) => {
                  const pct = total > 0 ? (entry.amountPln / total) * 100 : 0;
                  return (
                    <div key={entry.currency} className="rounded-2xl border border-border/70 bg-white/[0.04] px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: PALETTE[idx % PALETTE.length] }}
                          />
                          <span className="text-sm font-medium text-foreground">{entry.currency}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                        {formatPLN(entry.amountPln)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border border-border">
        <CardContent className="pt-6">
          <div className="mb-6 flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <CircleDollarSign className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Ranking kont (PLN)</h3>
              <p className="text-xs text-muted-foreground">Wartosc kazdego konta po przeliczeniu na PLN</p>
            </div>
          </div>

          {!hasData ? (
            <div className="flex h-[250px] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground">
              Brak danych do wizualizacji
            </div>
          ) : (
            <div className="h-[250px] w-full sm:h-[290px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accountData} layout="vertical" margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    className="text-[10px]"
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={88}
                    axisLine={false}
                    tickLine={false}
                    className="text-[10px]"
                  />
                  <Tooltip
                    cursor={{ fill: "var(--accent)" }}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(value, _name, item) => [formatPLN(Number(value ?? 0)), `${String(item.payload.name)} (${String(item.payload.currency)})`]}
                  />
                  <Bar dataKey="amountPln" radius={[0, 12, 12, 0]}>
                    {accountData.map((_, idx) => (
                      <Cell key={idx} fill={PALETTE[idx % PALETTE.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
