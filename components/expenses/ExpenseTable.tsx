"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Copy, Filter } from "lucide-react";
import { formatPLN, formatDate, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";
import { deleteExpense, duplicateExpense } from "@/actions/transactions";
import { toast } from "sonner";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

const ALL = "__ALL__";

export function ExpenseTable({ data }: { data: Expense[] }) {
  const [categoryFilter, setCategoryFilter] = useState(ALL);

  const filtered =
    categoryFilter === ALL
      ? data
      : data.filter((e) => e.category === categoryFilter);

  const categories = [...new Set(data.map((e) => e.category))];

  async function handleDelete(id: string) {
    try {
      await deleteExpense(id);
      toast.success("Usunięto wydatek");
    } catch {
      toast.error("Wystąpił błąd");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateExpense(id);
      toast.success("Zduplikowano wydatek");
    } catch {
      toast.error("Wystąpił błąd");
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-1">Brak wydatków w tym miesiącu</p>
          <p className="text-xs text-muted-foreground">
            Dodaj pierwszy wydatek lub naciśnij{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">e</kbd>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 px-0">
        {/* Category filter */}
        <div className="flex items-center gap-2 px-5 pb-4">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Wszystkie kategorie</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {EXPENSE_CATEGORY_LABELS[cat] || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {categoryFilter !== ALL && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} z {data.length} · Suma:{" "}
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatPLN(filtered.reduce((s, e) => s + e.amount, 0))}
              </span>
            </span>
          )}
        </div>

        <div className="space-y-0 divide-y divide-border">
          {filtered.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  <p className="text-xs font-medium tabular-nums">
                    {formatDate(expense.date)}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {EXPENSE_CATEGORY_LABELS[expense.category] || expense.category}
                </Badge>
                <span className="text-sm text-muted-foreground truncate">
                  {expense.description || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold tabular-nums text-red-600 dark:text-red-400">
                  -{formatPLN(expense.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDuplicate(expense.id)}
                  className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(expense.id)}
                  className="h-7 w-7 text-muted-foreground/40 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
