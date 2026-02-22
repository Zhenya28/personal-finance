"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ValuePoint {
  date: string;
  value: number;
  invested: number;
}

export function PortfolioValueChart({ data }: { data: ValuePoint[] }) {
  if (data.length < 2) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Wartość portfolio vs zainwestowane
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
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
              className="text-xs"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              className="text-xs"
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                new Intl.NumberFormat("pl-PL", {
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(v)
              }
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "13px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                new Intl.NumberFormat("pl-PL", {
                  style: "currency",
                  currency: "PLN",
                }).format(Number(value)),
                name === "value" ? "Wartość" : "Zainwestowane",
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
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
