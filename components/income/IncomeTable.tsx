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
import { Trash2 } from "lucide-react";
import { formatPLN, formatDate, INCOME_CATEGORY_LABELS } from "@/lib/utils";
import { deleteIncome } from "@/actions/transactions";
import { toast } from "sonner";

interface Income {
  id: string;
  amount: number;
  category: string;
  description: string | null;
  date: Date;
}

export function IncomeTable({ data }: { data: Income[] }) {
  async function handleDelete(id: string) {
    try {
      await deleteIncome(id);
      toast.success("Usunięto przychód");
    } catch {
      toast.error("Wystąpił błąd");
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">Brak przychodów w tym miesiącu</p>
        <p className="text-sm text-muted-foreground">
          Dodaj pierwszy przychód używając formularza powyżej lub naciśnij{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">i</kbd>
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
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((income) => (
            <TableRow key={income.id}>
              <TableCell className="font-medium">
                {formatDate(income.date)}
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {INCOME_CATEGORY_LABELS[income.category] || income.category}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {income.description || "—"}
              </TableCell>
              <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                {formatPLN(income.amount)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(income.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
