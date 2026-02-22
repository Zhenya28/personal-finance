"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Copy } from "lucide-react";
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

export function ExpenseTable({ data }: { data: Expense[] }) {
  async function handleDelete(id: string) {
    try {
      await deleteExpense(id);
      toast.success("Usunieto wydatek");
    } catch {
      toast.error("Wystapil blad");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateExpense(id);
      toast.success("Zduplikowano wydatek");
    } catch {
      toast.error("Wystapil blad");
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-1">Brak wydatkow w tym miesiacu</p>
          <p className="text-xs text-muted-foreground">
            Dodaj pierwszy wydatek lub nacisnij{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">e</kbd>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 px-0">
        <div className="space-y-0 divide-y divide-border">
          {data.map((expense) => (
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
