"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownUp, Check, Filter, Pencil, Search, SearchX, X } from "lucide-react";
import {
  formatPLN,
  formatDate,
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
  getCategoryIcon,
} from "@/lib/utils";
import {
  deleteIncome,
  deleteExpense,
  editExpense,
  editIncome,
} from "@/actions/transactions";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  category: string;
  description: string | null;
  type: "income" | "expense";
}

const ALL = "__ALL__";
const TYPE_ALL = "__TYPE_ALL__";

function getGroupLabel(date: Date): string {
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const today = new Date();
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const yesterdayDay = todayDay - 24 * 60 * 60 * 1000;

  if (txDay === todayDay) return "Dzisiaj";
  if (txDay === yesterdayDay) return "Wczoraj";
  return formatDate(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function TransactionList({ data }: { data: Transaction[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [typeFilter, setTypeFilter] = useState(
    () => searchParams.get("type") || TYPE_ALL
  );
  const [categoryFilter, setCategoryFilter] = useState(
    () => searchParams.get("cat") || ALL
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const updateUrl = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      updateUrl({
        type: typeFilter === TYPE_ALL ? null : typeFilter,
        cat: categoryFilter === ALL ? null : categoryFilter,
        q: searchQuery || null,
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [typeFilter, categoryFilter, searchQuery, updateUrl]);

  const allLabels = useMemo(
    () => ({ ...EXPENSE_CATEGORY_LABELS, ...INCOME_CATEGORY_LABELS }),
    []
  );
  const incomeCategoryOptions = useMemo(
    () => Object.entries(INCOME_CATEGORY_LABELS),
    []
  );
  const expenseCategoryOptions = useMemo(
    () => Object.entries(EXPENSE_CATEGORY_LABELS),
    []
  );

  const filtered = useMemo(
    () =>
      data
        .filter((t) => typeFilter === TYPE_ALL || t.type === typeFilter)
        .filter((t) => categoryFilter === ALL || t.category === categoryFilter)
        .filter((t) => {
          if (!searchQuery) return true;
          const q = searchQuery.toLowerCase();
          return (
            (t.description || "").toLowerCase().includes(q) ||
            (allLabels[t.category] || t.category).toLowerCase().includes(q) ||
            t.amount.toString().includes(q)
          );
        }),
    [allLabels, categoryFilter, data, searchQuery, typeFilter]
  );

  const grouped = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const label = getGroupLabel(tx.date);
      const bucket = groups.get(label) || [];
      bucket.push(tx);
      groups.set(label, bucket);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  const uniqueCategories = [...new Set(data.map((t) => t.category))];
  const hasActiveFilters =
    Boolean(searchQuery) || typeFilter !== TYPE_ALL || categoryFilter !== ALL;

  function resetFilters() {
    setTypeFilter(TYPE_ALL);
    setCategoryFilter(ALL);
    setSearchQuery("");
  }

  async function handleDelete(id: string, type: "income" | "expense") {
    const result =
      type === "income" ? await deleteIncome(id) : await deleteExpense(id);
    if (result.ok) toast.success("Usunieto transakcje");
    else toast.error(result.error);
  }

  async function handleEdit(formData: FormData) {
    const type = formData.get("type");
    const result =
      type === "income" ? await editIncome(formData) : await editExpense(formData);
    if (result.ok) {
      toast.success("Zaktualizowano transakcje");
      setEditingKey(null);
    } else {
      toast.error(result.error);
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent>
          <EmptyState
            icon={<ArrowDownUp className="h-7 w-7 text-muted-foreground/45" />}
            title="Brak transakcji"
            description="Dodaj transakcje recznie lub importuj plik CSV z banku"
            className="py-16"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-28 text-xs sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TYPE_ALL}>Wszystkie</SelectItem>
              <SelectItem value="income">Przychody</SelectItem>
              <SelectItem value="expense">Wydatki</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-8 w-36 text-xs sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Kategorie</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {allLabels[cat] || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Szukaj transakcji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-full pl-8 text-xs sm:w-52"
            />
          </div>

          {hasActiveFilters && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} z {data.length}
            </span>
          )}
        </div>

        {grouped.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-7 w-7 text-muted-foreground/45" />}
            title="Brak wynikow"
            description="Nie znaleziono transakcji dla wybranych filtrow."
            action={
              <Button variant="outline" size="sm" onClick={resetFilters}>
                Wyczysc filtry
              </Button>
            }
          />
        ) : (
          <div className="space-y-6">
            {grouped.map(([label, items]) => (
              <section key={label}>
                <p className="ag-overline mb-3">{label}</p>
                <div className="ag-card !p-0 overflow-hidden">
                  <div className="py-1.5">
                    {items.map((tx, idx) => {
                      const rowKey = `${tx.type}-${tx.id}`;
                      const icon = getCategoryIcon(tx.category, tx.type);
                      const categoryLabel = allLabels[tx.category] || tx.category;
                      const title = tx.description?.trim() || categoryLabel;
                      const meta = `${categoryLabel} • ${formatTime(tx.date)}`;
                      const categoryOptions =
                        tx.type === "income"
                          ? incomeCategoryOptions
                          : expenseCategoryOptions;
                      return (
                        <div
                          key={rowKey}
                          style={{
                            borderBottom:
                              idx === items.length - 1 ? "none" : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {editingKey === rowKey ? (
                            <form action={handleEdit} className="px-5 py-4 space-y-2.5">
                              <input type="hidden" name="id" value={tx.id} />
                              <input type="hidden" name="type" value={tx.type} />

                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  name="amount"
                                  type="number"
                                  step="0.01"
                                  defaultValue={tx.amount}
                                  className="h-8 text-sm"
                                  placeholder="Kwota"
                                  required
                                />
                                <Select name="category" defaultValue={tx.category}>
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {categoryOptions.map(([value, label]) => (
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
                                  defaultValue={tx.description || ""}
                                  placeholder="Opis"
                                  className="h-8 text-sm"
                                />
                                <Input
                                  name="date"
                                  type="date"
                                  defaultValue={new Date(tx.date).toISOString().split("T")[0]}
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
                                  onClick={() => setEditingKey(null)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </form>
                          ) : (
                            <article className="flex items-center justify-between gap-4 px-5 py-4">
                              <div className="ag-item-main min-w-0">
                                <div className="ag-item-ico">{icon}</div>
                                <div className="min-w-0">
                                  <p className="ag-item-name truncate">{title}</p>
                                  <p className="ag-item-meta truncate">{meta}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                <span
                                  className={`ag-amount ${tx.type === "income" ? "plus" : "minus"} font-mono`}
                                >
                                  {tx.type === "income" ? "+" : "-"}
                                  {formatPLN(tx.amount)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingKey(rowKey)}
                                  className="h-7 w-7 text-muted-foreground/40 hover:text-foreground"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <ConfirmDeleteDialog onConfirm={() => handleDelete(tx.id, tx.type)} />
                              </div>
                            </article>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
