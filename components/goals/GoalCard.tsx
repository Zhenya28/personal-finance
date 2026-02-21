"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatPLN, formatDate } from "@/lib/utils";
import { updateGoalAmount, deleteGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Trash2, PlusCircle, Target, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date | null;
  createdAt: Date;
}

export function GoalCard({ goal }: { goal: Goal }) {
  const [addOpen, setAddOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const percentage = Math.min(
    (goal.currentAmount / goal.targetAmount) * 100,
    100
  );
  const isComplete = goal.currentAmount >= goal.targetAmount;

  useEffect(() => {
    if (isComplete) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isComplete]);

  async function handleAddFunds(formData: FormData) {
    setLoading(true);
    try {
      formData.set("id", goal.id);
      await updateGoalAmount(formData);
      toast.success("Dodano środki do celu ✓");
      setAddOpen(false);
    } catch {
      toast.error("Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      await deleteGoal(goal.id);
      toast.success("Usunięto cel");
    } catch {
      toast.error("Wystąpił błąd");
    }
  }

  return (
    <>
      <Card className={isComplete ? "border-green-500 dark:border-green-400" : ""}>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              {isComplete ? (
                <PartyPopper className="h-4 w-4 text-green-500" />
              ) : (
                <Target className="h-4 w-4" />
              )}
              {goal.name}
            </CardTitle>
            {goal.deadline && (
              <p className="text-xs text-muted-foreground">
                Deadline: {formatDate(goal.deadline)}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {formatPLN(goal.currentAmount)}
            </span>
            <span className="font-medium">{formatPLN(goal.targetAmount)}</span>
          </div>
          <Progress
            value={percentage}
            className={isComplete ? "[&>div]:bg-green-500" : ""}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {percentage.toFixed(0)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddOpen(true)}
              className="gap-1"
            >
              <PlusCircle className="h-3 w-3" />
              Dodaj środki
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Dodaj środki: {goal.name}</DialogTitle>
          </DialogHeader>
          <form action={handleAddFunds} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fund-amount">Kwota (PLN)</Label>
              <Input
                id="fund-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                required
                autoFocus
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Brakuje jeszcze:{" "}
              {formatPLN(Math.max(0, goal.targetAmount - goal.currentAmount))}
            </p>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Dodawanie..." : "Dodaj"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
