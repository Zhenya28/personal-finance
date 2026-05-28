"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Check, X, Search, Filter, SearchX } from "lucide-react";
import {
  formatPLN,
  formatDate,
  EXPENSE_CATEGORY_LABELS,
  getCategoryIcon,
} from "@/lib/utils";
import { deleteExpense, editExpense } from "@/actions/transactions";
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

  const uniqueCategories = useMemo(
    () => [...new Set(data.map((e) => e.category))],
    [data]
  );

  const hasActiveFilters = Boolean(searchQuery) || categoryFilter !== ALL;

  const filtered = useMemo(
    () =>
      data
        .filter((e) => categoryFilter === ALL || e.category === categoryFilter)
        .filter(
          (e) =>
            !searchQuery ||
            (e.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.amount.toString().includes(searchQuery)
        ),
    [data, categoryFilter, searchQuery]
  );

  function resetFilters() {
    setCategoryFilter(ALL);
    setSearchQuery("");
  }

  async function handleDelete(id: string) {
    const result = await deleteExpense(id);
    if (result.ok) toast.success("Usunieto wydatek");
    else toast.error(result.error);
  }

  async function handleEdit(formData: FormData) {
    const result = await editExpense(formData);
    if (result.ok) {
      toast.success("Zaktualizowano wydatek");
      setEditingId(null);
    } else {
      toast.error(result.error);
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            title="Brak wydatkow w tym miesiacu"
            description="Dodaj pierwszy wydatek lub nacisnij e."
            className="py-16"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="ag-overline mb-3">Szczegolowa lista</p>
        <div className="flex items-center gap-2 pb-5 flex-wrap">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-36 sm:w-44 h-8 text-xs">
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
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full sm:w-48 pl-8 text-xs"
            />
          </div>
          {hasActiveFilters && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} z {data.length}
              {" · "}
              <span className="font-semibold text-red-400">
                {formatPLN(filtered.reduce((s, e) => s + e.amount, 0))}
              </span>
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-7 w-7 text-muted-foreground/45" />}
            title="Brak wynikow"
            description="Nie znaleziono wydatkow dla wybranych filtrow i wyszukiwania."
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Wyczysc filtry
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((expense) =>
              editingId === expense.id ? (
                <form
                  key={expense.id}
                  action={handleEdit}
                  className="rounded-xl border border-white/[0.08] bg-black/15 px-4 py-4 space-y-2.5"
                >
                  <input type="hidden" name="id" value={expense.id} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="amount"
                      type="number"
                      step="0.01"
                      defaultValue={expense.amount}
                      className="h-8 text-sm"
                      placeholder="Kwota"
                      required
                    />
                    <Select name="category" defaultValue={expense.category}>
                      <SelectTrigger className="h-8 text-xs">
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
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="description"
                      defaultValue={expense.description || ""}
                      placeholder="Opis"
                      className="h-8 text-sm"
                    />
                    <Input
                      name="date"
                      type="date"
                      defaultValue={new Date(expense.date).toISOString().split("T")[0]}
                      className="h-8 text-sm"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="h-8 flex-1">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Zapisz
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </form>
              ) : (
                <div
                  key={expense.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="ag-item-ico h-9 w-9 shrink-0 text-base">
                      {getCategoryIcon(expense.category, "expense")}
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] sm:text-xs font-medium tabular-nums">
                        {formatDate(expense.date)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] hidden sm:inline-flex">
                      {EXPENSE_CATEGORY_LABELS[expense.category] || expense.category}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      {expense.description || "\u2014"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-semibold tabular-nums text-red-400">
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
                    <ConfirmDeleteDialog onConfirm={() => handleDelete(expense.id)} />
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
