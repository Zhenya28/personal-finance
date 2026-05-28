"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useState, useTransition, useRef } from "react";
import { addSavingsTransaction } from "@/actions/savings";
import { toast } from "sonner";

interface Account {
  id: string;
  name: string;
  currency: string;
}

export function SavingsTransactionForm({ accounts }: { accounts: Account[] }) {
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"DEPOSIT" | "WITHDRAWAL">("DEPOSIT");
  const formRef = useRef<HTMLFormElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = (formData: FormData) => {
    formData.set("type", type);
    startTransition(async () => {
      const result = await addSavingsTransaction(formData);
      if (result.ok) {
        toast.success(type === "DEPOSIT" ? "Wplata dodana" : "Wyplata dodana");
        formRef.current?.reset();
      } else {
        toast.error(result.error);
      }
    });
  };

  if (accounts.length === 0) return null;

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-500/10">
            {type === "DEPOSIT" ? (
              <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
            ) : (
              <ArrowUpFromLine className="h-4 w-4 text-rose-500" />
            )}
          </div>
          <h3 className="font-semibold text-sm">Dodaj transakcje</h3>
        </div>
        <form ref={formRef} action={handleSubmit} className="grid items-end gap-3.5 sm:grid-cols-6">
          <div className="space-y-1.5">
            <Label className="text-xs">Konto</Label>
            <Select name="accountId" defaultValue={accounts[0].id}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Typ</Label>
            <div className="flex h-9 rounded-md border border-input overflow-hidden">
              <button
                type="button"
                className={`flex-1 text-xs font-medium transition-colors ${
                  type === "DEPOSIT"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "hover:bg-muted"
                }`}
                onClick={() => setType("DEPOSIT")}
              >
                Wplata
              </button>
              <button
                type="button"
                className={`flex-1 text-xs font-medium transition-colors border-l border-input ${
                  type === "WITHDRAWAL"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "hover:bg-muted"
                }`}
                onClick={() => setType("WITHDRAWAL")}
              >
                Wyplata
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Kwota</Label>
            <Input name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data</Label>
            <Input name="date" type="date" defaultValue={today} required className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Opis</Label>
            <Input name="description" placeholder="opcjonalnie" className="h-9" />
          </div>
          <Button type="submit" disabled={isPending} className="h-9">
            {isPending ? "Dodaje..." : "Dodaj"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
