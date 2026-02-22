"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useState, useTransition } from "react";
import { updateSavingsBalance, deleteSavingsAccount } from "@/actions/savings";
import { toast } from "sonner";

const CURRENCY_CONFIG: Record<string, { gradient: string; bg: string; text: string; symbol: string }> = {
  PLN: { gradient: "from-emerald-500 to-green-400", bg: "bg-emerald-500/10", text: "text-emerald-500", symbol: "zl" },
  USD: { gradient: "from-blue-500 to-indigo-400", bg: "bg-blue-500/10", text: "text-blue-500", symbol: "$" },
  EUR: { gradient: "from-amber-500 to-yellow-400", bg: "bg-amber-500/10", text: "text-amber-500", symbol: "€" },
  GBP: { gradient: "from-violet-500 to-purple-400", bg: "bg-violet-500/10", text: "text-violet-500", symbol: "£" },
  CHF: { gradient: "from-red-500 to-rose-400", bg: "bg-red-500/10", text: "text-red-500", symbol: "CHF" },
};

interface SavingsAccountCardProps {
  id: string;
  name: string;
  currency: string;
  balance: number;
}

export function SavingsAccountCard({ id, name, currency, balance }: SavingsAccountCardProps) {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.PLN;
  const [editing, setEditing] = useState(false);
  const [newBalance, setNewBalance] = useState(balance.toString());
  const [isPending, startTransition] = useTransition();

  const formatted = new Intl.NumberFormat("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("balance", newBalance);
    startTransition(async () => {
      await updateSavingsBalance(formData);
      toast.success("Saldo zaktualizowane");
      setEditing(false);
    });
  };

  const handleDelete = () => {
    if (!confirm("Usunac to konto oszczednosciowe?")) return;
    startTransition(async () => {
      await deleteSavingsAccount(id);
      toast.success("Konto usuniete");
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />
      <CardContent className="pt-4">
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
          <div className="flex gap-1">
            {!editing && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/40 hover:text-foreground" onClick={() => { setEditing(true); setNewBalance(balance.toString()); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/40 hover:text-destructive" onClick={handleDelete} disabled={isPending}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>

        {editing ? (
          <div className="mt-3 flex items-center gap-2">
            <Input
              type="number"
              step="0.01"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              className="h-8 text-sm"
              autoFocus
            />
            <Button size="icon" className="h-8 w-8" onClick={handleSave} disabled={isPending}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditing(false)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-2xl font-bold tracking-tight tabular-nums">
            {formatted} <span className="text-base font-medium text-muted-foreground">{config.symbol}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
