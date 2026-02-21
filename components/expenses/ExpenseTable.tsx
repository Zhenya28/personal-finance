"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Copy, Clock } from "lucide-react";
import { formatPLN, formatDate, EXPENSE_CATEGORY_LABELS } from "@/lib/utils";
import { deleteExpense, duplicateExpense } from "@/actions/transactions";
import { toast } from "sonner";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

export function ExpenseTable({
  data,
}: {
  data: Expense[];
}) {
  async function handleDelete(id: string) {
    try {
      await deleteExpense(id);
      toast.success("Usunięto wydatek");
    } catch {
      toast.error("Wystąpił błąd");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      await duplicateExpense(id);
      toast.success("Zduplikowano wydatek ✓");
    } catch {
      toast.error("Wystąpił błąd");
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">Brak wydatków w tym miesiącu</p>
        <p className="text-sm text-muted-foreground">
          Dodaj pierwszy wydatek używając formularza powyżej lub naciśnij{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">e</kbd>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Kategoria</TableHead>
            <TableHead>Opis</TableHead>
            <TableHead className="text-right">Kwota</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell className="font-medium">
                {formatDate(expense.date)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {EXPENSE_CATEGORY_LABELS[expense.category] || expense.category}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {expense.description || "—"}
              </TableCell>
              <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                {formatPLN(expense.amount)}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(expense.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Duplikuj"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Usuń"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
