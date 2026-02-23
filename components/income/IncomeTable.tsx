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
import { Pencil, Check, X, Search } from "lucide-react";
import { formatPLN, formatDate, INCOME_CATEGORY_LABELS } from "@/lib/utils";
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

  const filtered = searchQuery
    ? data.filter(
        (i) =>
          (i.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.amount.toString().includes(searchQuery)
      )
    : data;

  async function handleDelete(id: string) {
    try {
      await deleteIncome(id);
      toast.success("Usunieto przychod");
    } catch {
      toast.error("Wystapil blad");
    }
  }

  async function handleEdit(formData: FormData) {
    try {
      await editIncome(formData);
      toast.success("Zaktualizowano przychod");
      setEditingId(null);
    } catch {
      toast.error("Wystapil blad");
    }
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground mb-1">Brak przychodow w tym miesiacu</p>
          <p className="text-xs text-muted-foreground">
            Dodaj pierwszy przychod lub nacisnij{" "}
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">i</kbd>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-5 px-0">
        <div className="flex items-center gap-2 px-5 pb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-48 pl-8 text-xs"
            />
          </div>
          {searchQuery && (
            <span className="text-xs text-muted-foreground">
              {filtered.length} z {data.length}
            </span>
          )}
        </div>

        <div className="space-y-0 divide-y divide-border">
          {filtered.map((income) =>
            editingId === income.id ? (
              <form
                key={income.id}
                action={handleEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-muted/20"
              >
                <input type="hidden" name="id" value={income.id} />
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={income.amount}
                  className="h-7 w-24 text-sm"
                  required
                />
                <Select name="category" defaultValue={income.category}>
                  <SelectTrigger className="h-7 w-28 text-xs">
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
                <Input
                  name="description"
                  defaultValue={income.description || ""}
                  placeholder="Opis"
                  className="h-7 flex-1 text-sm"
                />
                <Input
                  name="date"
                  type="date"
                  defaultValue={new Date(income.date).toISOString().split("T")[0]}
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
                key={income.id}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">
                    <p className="text-xs font-medium tabular-nums">
                      {formatDate(income.date)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {INCOME_CATEGORY_LABELS[income.category] || income.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground truncate">
                    {income.description || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
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
      </CardContent>
    </Card>
  );
}
