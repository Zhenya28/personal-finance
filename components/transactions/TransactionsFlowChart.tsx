"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { formatPLN } from "@/lib/utils";

interface DailyFlowPoint {
  day: string;
  income: number;
  expense: number;
  net: number;
}

interface ChartPoint extends DailyFlowPoint {
  expenseAbs: number;
}

interface FlowTooltipPayloadItem {
  dataKey?: string;
  value?: number;
}

export function TransactionsFlowChart({ data }: { data: DailyFlowPoint[] }) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);
  const chartData = data.map<ChartPoint>((point) => ({
    ...point,
    expenseAbs: Math.abs(point.expense),
  }));

  const maxFlow = Math.max(
    1,
    ...chartData.map((point) =>
      Math.max(Math.abs(point.income), Math.abs(point.expenseAbs))
    )
  );
  const flowAxisLimit = Math.ceil(maxFlow * 1.15);

  const formatAxisTick = (value: number) => {
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${Math.round(value)}`;
  };

  return (
    <Card className="overflow-hidden border border-border">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Przeplyw dzienny</h3>
            <p className="text-xs text-muted-foreground">
              Turkus to przychod, pomarancz to wydatek. Kazdy dzien osobno.
            </p>
          </div>
        </div>

        {!hasData ? (
          <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground">
            Brak danych do wizualizacji w tym miesiacu
          </div>
        ) : (
          <div className="h-[260px] w-full sm:h-[290px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 10, left: -12, bottom: 4 }} barCategoryGap={8}>
                <defs>
                  <linearGradient id="txIncomeBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22E7D4" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#15BFAF" stopOpacity={0.7} />
                  </linearGradient>
                  <linearGradient id="txExpenseBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFA57F" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#FF7E59" stopOpacity={0.72} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 5"
                  vertical={false}
                  stroke="rgba(180, 194, 227, 0.18)"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px]"
                  dy={8}
                  minTickGap={10}
                />
                <YAxis
                  yAxisId="left"
                  domain={[0, flowAxisLimit]}
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px]"
                  tickFormatter={formatAxisTick}
                />
                <Tooltip
                  cursor={{ fill: "rgba(98, 117, 255, 0.08)" }}
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;

                    const items = payload as FlowTooltipPayloadItem[];
                    const income = Number(items.find((item) => item.dataKey === "income")?.value ?? 0);
                    const expense = Number(items.find((item) => item.dataKey === "expenseAbs")?.value ?? 0);
                    const dailyNet = income - expense;

                    return (
                      <div className="rounded-xl border border-white/15 bg-[#0f1a33]/95 px-3 py-2.5 text-xs shadow-[0_10px_24px_rgba(3,10,24,0.5)] backdrop-blur-md">
                        <p className="mb-2 text-[11px] font-semibold text-white/80">Dzien {label}</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-5">
                            <span className="text-white/70">Przychod</span>
                            <span className="font-semibold text-[#1CE6D3]">{formatPLN(income)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-5">
                            <span className="text-white/70">Wydatek</span>
                            <span className="font-semibold text-[#FF946E]">{formatPLN(expense)}</span>
                          </div>
                          <div className="h-px bg-white/10" />
                          <div className="flex items-center justify-between gap-5">
                            <span className="text-white/70">Saldo dnia</span>
                            <span
                              className={`font-semibold ${
                                dailyNet >= 0 ? "text-[#1CE6D3]" : "text-[#FF946E]"
                              }`}
                            >
                              {formatPLN(dailyNet)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="income"
                  name="Przychod"
                  fill="url(#txIncomeBar)"
                  barSize={8}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="expenseAbs"
                  name="Wydatek"
                  fill="url(#txExpenseBar)"
                  barSize={8}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {hasData ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 text-white/85">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1CE6D3]" />
              Przychod
            </span>
            <span className="inline-flex items-center gap-1.5 text-white/85">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF946E]" />
              Wydatek
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
