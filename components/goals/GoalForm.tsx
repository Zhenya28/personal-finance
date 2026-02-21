"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addSavingsGoal } from "@/actions/goals";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export function GoalForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addSavingsGoal(formData);
      toast.success("Dodano cel oszczędnościowy ✓");
    } catch {
      toast.error("Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nowy cel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Nazwa</Label>
              <Input
                id="goal-name"
                name="name"
                placeholder="np. Wakacje"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-target">Kwota docelowa (PLN)</Label>
              <Input
                id="goal-target"
                name="targetAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="np. 5000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Deadline (opcjonalnie)</Label>
              <Input
                id="goal-deadline"
                name="deadline"
                type="date"
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Dodawanie..." : "Dodaj cel"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
