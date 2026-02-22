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
import { Plus } from "lucide-react";
import { useTransition, useRef } from "react";
import { addSavingsAccount } from "@/actions/savings";
import { toast } from "sonner";

const CURRENCIES = [
  { value: "PLN", label: "PLN – Zloty" },
  { value: "USD", label: "USD – Dolar" },
  { value: "EUR", label: "EUR – Euro" },
  { value: "GBP", label: "GBP – Funt" },
  { value: "CHF", label: "CHF – Frank" },
];

export function SavingsForm() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await addSavingsAccount(formData);
      toast.success("Konto dodane");
      formRef.current?.reset();
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10">
            <Plus className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="font-semibold text-sm">Dodaj konto</h3>
        </div>
        <form ref={formRef} action={handleSubmit} className="grid gap-3 sm:grid-cols-4 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs">Nazwa</Label>
            <Input name="name" placeholder="np. Konto ING" required className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Waluta</Label>
            <Select name="currency" defaultValue="PLN">
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Saldo</Label>
            <Input name="balance" type="number" step="0.01" defaultValue="0" required className="h-9" />
          </div>
          <Button type="submit" disabled={isPending} className="h-9">
            {isPending ? "Dodaje..." : "Dodaj"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
