"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTransition } from "react";
import { deleteSavingsAccount } from "@/actions/savings";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

const CURRENCY_CONFIG: Record<string, { bg: string; text: string; symbol: string }> = {
  PLN: { bg: "bg-emerald-500/10", text: "text-emerald-500", symbol: "zl" },
  USD: { bg: "bg-blue-500/10", text: "text-blue-500", symbol: "$" },
  EUR: { bg: "bg-amber-500/10", text: "text-amber-500", symbol: "€" },
  GBP: { bg: "bg-violet-500/10", text: "text-violet-500", symbol: "£" },
  CHF: { bg: "bg-red-500/10", text: "text-red-500", symbol: "CHF" },
};

interface SavingsAccountCardProps {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

export function SavingsAccountCard({ id, name, currency, balance }: SavingsAccountCardProps) {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.PLN;
  const [, startTransition] = useTransition();

  const formatted = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteSavingsAccount(id);
      if (result.ok) toast.success("Konto usuniete");
      else toast.error(result.error);
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bg}`}>
              <span className={`text-sm font-bold ${config.text}`}>{config.symbol}</span>
            </div>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">{currency}</p>
            </div>
          </div>
          <ConfirmDeleteDialog
            onConfirm={handleDelete}
            description="Na pewno chcesz usunac to konto? Wszystkie transakcje zostana usuniete."
          />
        </div>
        <p className="mt-3 text-xl sm:text-2xl font-bold tracking-tight tabular-nums">
          {formatted} <span className="text-base font-medium text-muted-foreground">{config.symbol}</span>
        </p>
      </CardContent>
    </Card>
  );
}
