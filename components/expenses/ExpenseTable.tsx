"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Pencil, Check, X, Search, Filter } from "lucide-react";
import { formatPLN, formatDate, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";
import { deleteExpense, duplicateExpense, editExpense } from "@/actions/transactions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

const ALL = "__ALL__";
const allCategories = Object.entries(EXPENSE_CATEGORY_LABELS);

export function ExpenseTable({ data }: { data: Expense[] }) {
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const uniqueCategories = [...new Set(data.map((e) => e.category))];

  const filtered = data
    .filter((e) => categoryFilter === ALL || e.category === categoryFilter)
    .filter(
      (e) =>
        !searchQuery ||
        (e.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.amount.toString().includes(searchQuery)
    );

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

  async function handleEdit(formData: FormData) {
    try {
      await editExpense(formData);
      toast.success("Zaktualizowano wydatek");
      setEditingId(null);
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
        <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Wszystkie kategorie</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {EXPENSE_CATEGORY_LABELS[cat] || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 pl-8 text-xs"
            />
          </div>
          {(searchQuery || categoryFilter !== ALL) && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} z {data.length}
              {" · "}
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatPLN(filtered.reduce((s, e) => s + e.amount, 0))}
              </span>
            </span>
          )}
        </div>

        <div className="space-y-0 divide-y divide-border">
          {filtered.map((expense) =>
            editingId === expense.id ? (
              <form
                key={expense.id}
                action={handleEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-muted/20"
              >
                <input type="hidden" name="id" value={expense.id} />
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={expense.amount}
                  className="h-7 w-24 text-sm"
                  required
                />
                <Select name="category" defaultValue={expense.category}>
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  name="description"
                  defaultValue={expense.description || ""}
                  placeholder="Opis"
                  className="h-7 flex-1 text-sm"
                />
                <Input
                  name="date"
                  type="date"
                  defaultValue={new Date(expense.date).toISOString().split("T")[0]}
                  className="h-7 w-32 text-sm"
                  required
                />
                <Button type="submit" size="icon" className="h-7 w-7 shrink-0">
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => setEditingId(null)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </form>
            ) : (
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
                    onClick={() => setEditingId(expense.id)}
                    className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(expense.id)}
                    className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <ConfirmDeleteDialog onConfirm={() => handleDelete(expense.id)} />
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
