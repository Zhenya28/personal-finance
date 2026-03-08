"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Plus } from "lucide-react";
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from "@/lib/utils";
import { addCategoryRule, deleteCategoryRule } from "@/actions/category-rules";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { toast } from "sonner";

interface Rule {
  id: string;
  pattern: string;
  type: string;
  category: string;
}

export function CategoryRuleManager({ rules }: { rules: Rule[] }) {
  async function handleAdd(formData: FormData) {
    try {
      await addCategoryRule(formData);
      toast.success("Dodano regule");
    } catch {
      toast.error("Blad dodawania reguly");
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCategoryRule(id);
      toast.success("Usunieto regule");
    } catch {
      toast.error("Blad usuwania");
    }
  }

  const expenseRules = rules.filter((r) => r.type === "expense");
  const incomeRules = rules.filter((r) => r.type === "income");

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-5">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500/10">
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Reguly auto-kategoryzacji</h3>
            <p className="text-xs text-muted-foreground">
              {rules.length} {rules.length === 1 ? "regula" : "regul"} aktywnych
            </p>
          </div>
        </div>

        {/* Add new rule */}
        <form action={handleAdd} className="flex items-end gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-[120px]">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
              Wzorzec
            </label>
            <Input
              name="pattern"
              placeholder="np. biedronka"
              className="h-8 text-xs"
              required
            />
          </div>
          <div className="w-28">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
              Typ
            </label>
            <Select name="type" defaultValue="expense">
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Wydatek</SelectItem>
                <SelectItem value="income">Przychod</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-36">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">
              Kategoria
            </label>
            <Select name="category" required>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Wybierz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__divider_exp" disabled className="text-[10px] font-semibold">
                  Wydatki
                </SelectItem>
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">
                    {v}
                  </SelectItem>
                ))}
                <SelectItem value="__divider_inc" disabled className="text-[10px] font-semibold">
                  Przychody
                </SelectItem>
                {Object.entries(INCOME_CATEGORY_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k} className="text-xs">
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" size="sm" className="h-8">
            <Plus className="h-3.5 w-3.5 mr-1" /> Dodaj
          </Button>
        </form>

        {/* Rules list */}
        {rules.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Brak regul. Dodaj regule lub uzyj przycisku <Zap className="h-3 w-3 inline text-amber-500" /> podczas importu.
          </p>
        ) : (
          <div className="space-y-3">
            {expenseRules.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                  Wydatki
                </p>
                <div className="space-y-1">
                  {expenseRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {rule.pattern}
                      </code>
                      <span className="text-muted-foreground/40 text-xs">→</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {EXPENSE_CATEGORY_LABELS[rule.category] || rule.category}
                      </Badge>
                      <div className="flex-1" />
                      <ConfirmDeleteDialog onConfirm={() => handleDelete(rule.id)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {incomeRules.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1.5">
                  Przychody
                </p>
                <div className="space-y-1">
                  {incomeRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">
                        {rule.pattern}
                      </code>
                      <span className="text-muted-foreground/40 text-xs">→</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {INCOME_CATEGORY_LABELS[rule.category] || rule.category}
                      </Badge>
                      <div className="flex-1" />
                      <ConfirmDeleteDialog onConfirm={() => handleDelete(rule.id)} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
