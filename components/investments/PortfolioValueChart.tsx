"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface ValuePoint {
  date: string;
  value: number;
  invested: number;
}

export function PortfolioValueChart({ data }: { data: ValuePoint[] }) {
  if (data.length < 2) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-violet-500/10 shrink-0">
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm truncate">Portfolio vs zainwestowane</h3>
              <p className="text-xs text-muted-foreground">Porownanie w czasie</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs text-muted-foreground ml-10 sm:ml-0">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-violet-500 shrink-0" />
              Wartosc
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-gray-400 shrink-0" />
              Zainwestowane
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6b7280" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6b7280" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-border"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              className="text-[10px]"
              tickLine={false}
              axisLine={false}
              dy={8}
            />
            <YAxis
              className="text-[10px]"
              tickLine={false}
              axisLine={false}
              dx={-8}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                new Intl.NumberFormat("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                }).format(Number(value)),
                name === "value" ? "Wartosc" : "Zainwestowane",
              ]}
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#6b7280"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              fill="url(#colorInvested)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorValue)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
