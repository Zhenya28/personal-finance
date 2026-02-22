"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { formatPLN, formatDate, INCOME_CATEGORY_LABELS } from "@/lib/utils";
import { deleteIncome } from "@/actions/transactions";
import { toast } from "sonner";

interface Income {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

export function IncomeTable({ data }: { data: Income[] }) {
  async function handleDelete(id: string) {
    try {
      await deleteIncome(id);
      toast.success("Usunieto przychod");
    } catch {
      toast.error("Wystapil blad");
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-1">Brak przychodow w tym miesiacu</p>
          <p className="text-xs text-muted-foreground">
            Dodaj pierwszy przychod lub nacisnij{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">i</kbd>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 px-0">
        <div className="space-y-0 divide-y divide-border">
          {data.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  <p className="text-xs font-medium tabular-nums">
                    {formatDate(income.date)}
                  </p>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px]">
                  {INCOME_CATEGORY_LABELS[income.category] || income.category}
                </Badge>
                <span className="text-sm text-muted-foreground truncate">
                  {income.description || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                  +{formatPLN(income.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(income.id)}
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
