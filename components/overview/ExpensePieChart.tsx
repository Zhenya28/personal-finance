"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EXPENSE_CATEGORY_COLORS, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";

interface ExpensePieData {
  category: string;
  amount: number;
}

export function ExpensePieChart({ data }: { data: ExpensePieData[] }) {
  const chartData = data.map((d) => ({
    name: EXPENSE_CATEGORY_LABELS[d.category] || d.category,
    value: d.amount,
    color: EXPENSE_CATEGORY_COLORS[d.category] || "#6b7280",
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Wydatki per kategoria</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Brak wydatków w tym miesiącu.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) =>
                  new Intl.NumberFormat("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                  }).format(Number(value))
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
