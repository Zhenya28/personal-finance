"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Repeat, Plus, Play, ChevronUp } from "lucide-react";
import { formatPLN, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";
import { addRecurring, deleteRecurring, toggleRecurring, applyRecurringTemplates } from "@/actions/recurring";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

interface RecurringExpense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  dayOfMonth: number;
  active: boolean;
}

const categories = Object.entries(EXPENSE_CATEGORY_LABELS);

export function RecurringExpenses({
  data,
  currentMonth,
}: {
  data: RecurringExpense[];
  currentMonth: string;
}) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAdd(formData: FormData) {
    startTransition(async () => {
      try {
        await addRecurring(formData);
        toast.success("Dodano szablon");
        setShowForm(false);
      } catch {
        toast.error("Wystapil blad");
      }
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteRecurring(id);
        toast.success("Usunieto szablon");
      } catch {
        toast.error("Wystapil blad");
      }
    });
  }

  async function handleToggle(id: string) {
    startTransition(async () => {
      try {
        await toggleRecurring(id);
      } catch {
        toast.error("Wystapil blad");
      }
    });
  }

  async function handleApply() {
    startTransition(async () => {
      try {
        const count = await applyRecurringTemplates(currentMonth);
        toast.success(`Zastosowano ${count} szablonow`);
      } catch {
        toast.error("Wystapil blad");
      }
    });
  }

  const activeCount = data.filter((t) => t.active).length;
  const totalMonthly = data
    .filter((t) => t.active)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <p className="ag-overline mb-3">Wydatki powtarzalne</p>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-orange-500/10">
              <Repeat className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Szablony cykliczne</h3>
              <p className="text-[11px] text-muted-foreground">
                {activeCount} aktywnych &middot; {formatPLN(totalMonthly)}/mies.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={handleApply}
                disabled={isPending}
              >
                <Play className="h-3.5 w-3.5" />
                Zastosuj
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              {showForm ? "Schowaj" : "Dodaj"}
            </Button>
          </div>
        </div>

        {showForm && (
          <form action={handleAdd} className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 items-end mb-5 p-4 rounded-xl bg-white/[0.03] border border-white/[0.1]">
            <div className="space-y-1.5">
              <Label className="text-xs">Kwota</Label>
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Kategoria</Label>
              <Select name="category" required>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Opis</Label>
              <Input
                name="description"
                placeholder="np. Netflix"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dzien</Label>
              <Input
                name="dayOfMonth"
                type="number"
                min="1"
                max="31"
                defaultValue="1"
                required
                className="h-8 text-sm"
              />
            </div>
            <Button type="submit" disabled={isPending} className="h-8 text-sm col-span-2 sm:col-span-1">
              Dodaj szablon
            </Button>
          </form>
        )}

        {data.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Brak szablonow cyklicznych. Dodaj pierwszy szablon powyzej.
          </p>
        ) : (
          <div className="space-y-2.5">
            {data.map((template) => (
              <div
                key={template.id}
                className={`flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 sm:px-6 py-2.5 transition-colors ${
                  template.active
                    ? "hover:border-white/[0.14] hover:bg-white/[0.04]"
                    : "opacity-50"
                }`}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className="text-xs font-medium tabular-nums text-muted-foreground w-6 sm:w-8 shrink-0">
                    {template.dayOfMonth}.
                  </span>
                  <Badge variant="secondary" className="shrink-0 text-[10px] hidden sm:inline-flex">
                    {EXPENSE_CATEGORY_LABELS[template.category] || template.category}
                  </Badge>
                  <span className="text-xs sm:text-sm text-muted-foreground truncate">
                    {template.description || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <span className="text-xs sm:text-sm font-semibold tabular-nums">
                    {formatPLN(template.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-7 px-2 text-[10px] font-medium ${
                      template.active
                        ? "text-emerald-600 hover:text-emerald-700"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    onClick={() => handleToggle(template.id)}
                    disabled={isPending}
                  >
                    {template.active ? "ON" : "OFF"}
                  </Button>
                  <ConfirmDeleteDialog
                    onConfirm={() => handleDelete(template.id)}
                    description="Na pewno chcesz usunac ten szablon cykliczny?"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
