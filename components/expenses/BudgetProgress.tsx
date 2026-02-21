"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatPLN, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";
import { setBudgetLimit } from "@/actions/budget";
import { toast } from "sonner";
import { Settings } from "lucide-react";

interface BudgetData {
  category: string;
  spent: number;
  limit: number | null;
}

export function BudgetProgress({
  data,
  month,
}: {
  data: BudgetData[];
  month: string;
}) {
  const [editCategory, setEditCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSetLimit(formData: FormData) {
    setLoading(true);
    try {
      formData.set("month", month);
      formData.set("category", editCategory!);
      await setBudgetLimit(formData);
      toast.success("Zaktualizowano limit budżetu ✓");
      setEditCategory(null);
    } catch {
      toast.error("Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Budżet per kategoria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.map((item) => {
            const percentage = item.limit
              ? Math.min((item.spent / item.limit) * 100, 100)
              : 0;
            const isOver = item.limit ? item.spent > item.limit * 0.8 : false;

            return (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {EXPENSE_CATEGORY_LABELS[item.category] || item.category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        isOver
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {formatPLN(item.spent)}
                      {item.limit ? ` / ${formatPLN(item.limit)}` : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setEditCategory(item.category)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {item.limit ? (
                  <Progress
                    value={percentage}
                    className={isOver ? "[&>div]:bg-red-500" : ""}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Kliknij ⚙ aby ustawić limit
                  </p>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog
        open={editCategory !== null}
        onOpenChange={() => setEditCategory(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Ustaw limit:{" "}
              {editCategory
                ? EXPENSE_CATEGORY_LABELS[editCategory] || editCategory
                : ""}
            </DialogTitle>
          </DialogHeader>
          <form action={handleSetLimit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="limitAmount">Limit miesięczny (PLN)</Label>
              <Input
                id="limitAmount"
                name="limitAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Zapisywanie..." : "Zapisz limit"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
