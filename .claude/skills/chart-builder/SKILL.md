---
name: chart-builder
description: Build a Recharts chart component for the finance dashboard. Creates AreaCharts, BarCharts, PieCharts with gradient fills, responsive containers, and the project's visual style. Use when adding new data visualizations.
argument-hint: "[chart-type] [data-description]"
---

# Chart Builder — Finance Dashboard

Build chart components using Recharts with the project's visual patterns.

## Tech Stack
- `recharts` v3 — AreaChart, BarChart, PieChart, LineChart
- Components wrap in Card with gradient accent bar
- Responsive via `ResponsiveContainer`
- Custom tooltips with `formatPLN`

## Chart Patterns

### Area Chart with Gradient Fill
```tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatPLN } from "@/lib/utils";
import { Icon } from "lucide-react";

export function MyChart({ data }: { data: ChartData[] }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-{color}-500 to-{lighter}-400" />
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-{color}-500/10">
            <Icon className="h-4 w-4 text-{color}-500" />
          </div>
          <h3 className="font-semibold text-sm">Tytul wykresu</h3>
        </div>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                formatter={(value: number) => [formatPLN(value), "Wartosc"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                fill="url(#gradientFill)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Bar Chart (Cashflow Style)
- Two series: income (emerald) + expenses (red)
- Rounded bars: `radius={[4, 4, 0, 0]}`
- Legend below chart

### Pie Chart (Category Breakdown)
- Use `EXPENSE_CATEGORY_COLORS` from `lib/utils.ts`
- Custom label with percentage
- Centered total value

## Existing Charts
- `CashflowChart` — BarChart with income/expense bars (6 months)
- `ExpensePieChart` — PieChart by expense category
- `PortfolioChart` — AreaChart showing portfolio P&L over time
- `PortfolioValueChart` — AreaChart showing portfolio total value

## Style Rules
1. Always wrap in Card with gradient accent bar
2. Include icon badge + title header
3. Chart height: `h-[250px]` standard, `h-[300px]` for full-width
4. Tooltip uses card background with border
5. Axis ticks: `fontSize: 12`
6. Grid: `strokeDasharray="3 3"` with `opacity-30`
7. Use gradient fills (linearGradient in defs)
8. Colors from the design system color language
9. Format monetary values with `formatPLN()`
10. Polish labels

Chart to build: $ARGUMENTS
