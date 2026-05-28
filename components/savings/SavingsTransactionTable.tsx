"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";
import { deleteSavingsTransaction } from "@/actions/savings";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  description: string;
  date: Date;
  account: {
    name: string;
    currency: string;
  };
}

export function SavingsTransactionTable({ data }: { data: Transaction[] }) {
  async function handleDelete(id: string) {
    const result = await deleteSavingsTransaction(id);
    if (result.ok) toast.success("Transakcje usunieto");
    else toast.error(result.error);
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-1">Brak transakcji</p>
          <p className="text-xs text-muted-foreground">
            Dodaj pierwsza wplate lub wyplate powyzej
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="px-0 pt-6">
        <div className="mb-4 px-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Historia transakcji</p>
        </div>
        <div className="space-y-0 divide-y divide-border">
          {data.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${
                  tx.type === "DEPOSIT" ? "bg-emerald-500/10" : "bg-rose-500/10"
                }`}>
                  {tx.type === "DEPOSIT" ? (
                    <ArrowDownToLine className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <ArrowUpFromLine className="h-3.5 w-3.5 text-rose-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium tabular-nums">{formatDate(tx.date)}</p>
                    <span className="text-xs text-muted-foreground">{tx.account.name}</span>
                  </div>
                  {tx.description && (
                    <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <p className={`text-sm font-semibold tabular-nums ${
                  tx.type === "DEPOSIT" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                }`}>
                  {tx.type === "DEPOSIT" ? "+" : "-"}{formatCurrency(tx.amount, tx.account.currency)}
                </p>
                <ConfirmDeleteDialog onConfirm={() => handleDelete(tx.id)} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
