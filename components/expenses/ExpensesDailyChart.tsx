"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { formatPLN } from "@/lib/utils";

interface DailyExpensePoint {
  day: string;
  amount: number;
}

export function ExpensesDailyChart({ data }: { data: DailyExpensePoint[] }) {
  const hasData = data.some((d) => d.amount > 0);

  return (
    <Card className="overflow-hidden border border-border">
      <CardContent className="pt-6">
        <div className="mb-6 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80">Tempo wydatkow</h3>
            <p className="text-sm font-medium text-foreground">Ile wydajesz kazdego dnia miesiaca</p>
          </div>
        </div>

        {!hasData ? (
          <div className="flex h-[250px] items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/50 text-xs text-muted-foreground">
            Brak danych do wizualizacji w tym miesiacu
          </div>
        ) : (
          <div className="h-[250px] w-full sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="expenseDailyFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff8f6b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff8f6b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px]"
                  dy={8}
                  minTickGap={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-[10px]"
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [formatPLN(Number(value ?? 0)), "Wydatki"]}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name="Wydatki"
                  stroke="#ff8f6b"
                  strokeWidth={2}
                  fill="url(#expenseDailyFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#ff8f6b", strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
