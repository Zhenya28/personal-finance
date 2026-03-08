"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatPLN, formatDate } from "@/lib/utils";
import { deleteInvestment } from "@/actions/investments";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

interface Investment {
  id: string;
  ticker: string;
  units: number;
  pricePerUnit: number;
  commission: number;
  date: Date;
}

export function InvestmentTable({ data }: { data: Investment[] }) {
  async function handleDelete(id: string) {
    try {
      await deleteInvestment(id);
      toast.success("Usunieto zakup");
    } catch {
      toast.error("Wystapil blad");
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-1">Brak zakupow inwestycyjnych</p>
          <p className="text-xs text-muted-foreground">
            Dodaj pierwszy zakup VWCE powyzej
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="px-0 pt-6">
        <div className="mb-4 px-5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Historia zakupow</p>
        </div>
        <div className="space-y-0 divide-y divide-border">
          {data.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="shrink-0">
                  <p className="text-xs font-medium tabular-nums">
                    {formatDate(inv.date)}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {inv.ticker}
                </span>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {inv.units.toFixed(4)} szt
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatPLN(inv.units * inv.pricePerUnit)}
                  </p>
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    {formatPLN(inv.pricePerUnit)}/szt
                  </p>
                </div>
                <ConfirmDeleteDialog onConfirm={() => handleDelete(inv.id)} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
