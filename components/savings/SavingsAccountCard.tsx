"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { useState, useTransition } from "react";
import { updateSavingsBalance, deleteSavingsAccount } from "@/actions/savings";
import { toast } from "sonner";

const CURRENCY_CONFIG: Record<string, { color: string; symbol: string; flag: string }> = {
  PLN: { color: "from-green-500 to-emerald-600", symbol: "zł", flag: "🇵🇱" },
  USD: { color: "from-blue-500 to-indigo-600", symbol: "$", flag: "🇺🇸" },
  EUR: { color: "from-yellow-500 to-amber-600", symbol: "€", flag: "🇪🇺" },
  GBP: { color: "from-purple-500 to-violet-600", symbol: "£", flag: "🇬🇧" },
  CHF: { color: "from-red-500 to-rose-600", symbol: "CHF", flag: "🇨🇭" },
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
    if (!confirm("Usunąć to konto oszczędnościowe?")) return;
    startTransition(async () => {
      await deleteSavingsAccount(id);
      toast.success("Konto usunięte");
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-1.5 bg-gradient-to-r ${config.color}`} />
      <CardContent className="pt-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${config.color} text-white text-lg`}>
              {config.flag}
            </div>
            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-muted-foreground">{currency}</p>
            </div>
          </div>
          <div className="flex gap-1">
            {!editing && (
              <>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing(true); setNewBalance(balance.toString()); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={handleDelete} disabled={isPending}>
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
          <p className="mt-3 text-2xl font-bold tracking-tight">
            {formatted} <span className="text-base font-medium text-muted-foreground">{config.symbol}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}
