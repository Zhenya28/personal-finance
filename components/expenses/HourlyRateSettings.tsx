"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateHourlyRate } from "@/actions/budget";
import { toast } from "sonner";
import { Clock } from "lucide-react";

export function HourlyRateSettings({ currentRate }: { currentRate: number }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await updateHourlyRate(formData);
      toast.success("Zaktualizowano stawkę godzinową ✓");
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
          <Clock className="h-4 w-4" />
          Kalkulator godzin pracy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="flex items-end gap-3">
          <div className="space-y-2 flex-1">
            <Label htmlFor="hourlyRate">Stawka godzinowa (PLN/h)</Label>
            <Input
              id="hourlyRate"
              name="hourlyRate"
              type="number"
              step="0.01"
              min="0"
              defaultValue={currentRate || ""}
              placeholder="np. 35.00"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "..." : "Zapisz"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
