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
import { Trash2 } from "lucide-react";
import { formatPLN, formatDate } from "@/lib/utils";
import { deleteInvestment } from "@/actions/investments";
import { toast } from "sonner";

interface Investment {
  id: string;
  ticker: string;
  units: number;
  pricePerUnit: number;
  commission: number;
  date: Date;
}

export function InvestmentTable({ data }: { data: Investment[] }) {
  async function handleDelete(id: string) {
    try {
      await deleteInvestment(id);
      toast.success("Usunięto zakup");
    } catch {
      toast.error("Wystąpił błąd");
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-2">Brak zakupów inwestycyjnych</p>
        <p className="text-sm text-muted-foreground">
          Dodaj pierwszy zakup VWCE powyżej
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
            <TableHead>Ticker</TableHead>
            <TableHead className="text-right">Jednostki</TableHead>
            <TableHead className="text-right">Cena/szt (PLN)</TableHead>
            <TableHead className="text-right">Kwota (PLN)</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((inv) => (
            <TableRow key={inv.id}>
              <TableCell className="font-medium">
                {formatDate(inv.date)}
              </TableCell>
              <TableCell>{inv.ticker}</TableCell>
              <TableCell className="text-right">{inv.units.toFixed(4)}</TableCell>
              <TableCell className="text-right">
                {formatPLN(inv.pricePerUnit)}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatPLN(inv.units * inv.pricePerUnit)}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(inv.id)}
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
