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
import { Pencil, Check, X, Search, SearchX } from "lucide-react";
import {
  formatPLN,
  formatDate,
  INCOME_CATEGORY_LABELS,
  getCategoryIcon,
} from "@/lib/utils";
import { deleteIncome, editIncome } from "@/actions/transactions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

interface Income {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

const categories = Object.entries(INCOME_CATEGORY_LABELS);

export function IncomeTable({ data }: { data: Income[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(
    () =>
      searchQuery
        ? data.filter(
            (i) =>
              (i.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
              i.amount.toString().includes(searchQuery)
          )
        : data,
    [data, searchQuery]
  );

  function clearSearch() {
    setSearchQuery("");
  }

  async function handleDelete(id: string) {
    const result = await deleteIncome(id);
    if (result.ok) toast.success("Usunieto przychod");
    else toast.error(result.error);
  }

  async function handleEdit(formData: FormData) {
    const result = await editIncome(formData);
    if (result.ok) {
      toast.success("Zaktualizowano przychod");
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
            title="Brak przychodow w tym miesiacu"
            description="Dodaj pierwszy przychod lub nacisnij i."
            className="py-16"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="ag-overline mb-3">Historia wpływów</p>
        <div className="flex items-center gap-2 pb-5">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full sm:w-48 pl-8 text-xs"
            />
          </div>
          {searchQuery && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} z {data.length}
            </span>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-7 w-7 text-muted-foreground/45" />}
            title="Brak wynikow"
            description="Nie znaleziono przychodow dla podanej frazy."
            action={
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Wyczysc wyszukiwanie
              </Button>
            }
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((income) =>
              editingId === income.id ? (
                <form
                  key={income.id}
                  action={handleEdit}
                  className="rounded-xl border border-white/[0.08] bg-black/15 px-4 py-4 space-y-2.5"
                >
                  <input type="hidden" name="id" value={income.id} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="amount"
                      type="number"
                      step="0.01"
                      defaultValue={income.amount}
                      className="h-8 text-sm"
                      placeholder="Kwota"
                      required
                    />
                    <Select name="category" defaultValue={income.category}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
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
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      name="description"
                      defaultValue={income.description || ""}
                      placeholder="Opis"
                      className="h-8 text-sm"
                    />
                    <Input
                      name="date"
                      type="date"
                      defaultValue={new Date(income.date).toISOString().split("T")[0]}
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
                  key={income.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]"
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className="ag-item-ico h-9 w-9 shrink-0 text-base">
                      {getCategoryIcon(income.category, "income")}
                    </div>
                    <div className="shrink-0">
                      <p className="text-[10px] sm:text-xs font-medium tabular-nums">
                        {formatDate(income.date)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 text-[10px] hidden sm:inline-flex">
                      {INCOME_CATEGORY_LABELS[income.category] || income.category}
                    </Badge>
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      {income.description || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <span className="text-xs sm:text-sm font-semibold tabular-nums text-emerald-400">
                      +{formatPLN(income.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingId(income.id)}
                      className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <ConfirmDeleteDialog onConfirm={() => handleDelete(income.id)} />
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
