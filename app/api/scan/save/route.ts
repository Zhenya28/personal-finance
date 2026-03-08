import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IncomeCategory, ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  buildTransactionSignature,
  sanitizeTransactionDescription,
} from "@/lib/transaction-dedupe";

const VALID_INCOME = ["WYPLATA_1", "WYPLATA_2", "INNE"];
const VALID_EXPENSE = [
  "ZAKUPY",
  "RESTAURACJE",
  "TRANSPORT",
  "SUBSCRIPTIONS",
  "MIESZKANIE",
  "FUN",
  "OTHER",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactions, type } = body as {
      transactions: {
        amount: number;
        category: string;
        description: string;
        date: string;
      }[];
      type: "income" | "expense";
    };

    if (!transactions || transactions.length === 0) {
      return NextResponse.json(
        { error: "Brak transakcji" },
        { status: 400 }
      );
    }

    console.log(`[scan/save] Saving ${transactions.length} ${type}s`);

    let savedCount = 0;
    let skippedDuplicates = 0;

    for (const t of transactions) {
      // Use Math.abs — bank screenshots often show negative amounts for expenses
      const amount = Math.abs(Number(t.amount) || 0);
      if (amount === 0) continue;

      const dateVal = t.date ? new Date(t.date) : new Date();
      
      // Fix wrong year — Gemini sometimes defaults to 2024 when bank shows only day/month
      const currentYear = new Date().getFullYear();
      if (dateVal.getFullYear() < currentYear) {
        dateVal.setFullYear(currentYear);
      }

      const description = sanitizeTransactionDescription(t.description) || null;

      if (type === "income") {
        const cat = (t.category || "").toUpperCase();
        const category = VALID_INCOME.includes(cat) ? cat : "INNE";
        const existingSameDate = await prisma.income.findMany({
          where: { date: dateVal },
          select: { amount: true, category: true, description: true, date: true },
        });
        const signature = buildTransactionSignature({
          amount,
          category,
          description,
          date: dateVal,
        });
        const isDuplicate = existingSameDate.some(
          (row) =>
            buildTransactionSignature({
              amount: row.amount,
              category: row.category,
              description: row.description,
              date: row.date,
            }) === signature
        );
        if (isDuplicate) {
          skippedDuplicates++;
          continue;
        }
        await prisma.income.create({
          data: {
            amount,
            category: category as IncomeCategory,
            description,
            date: dateVal,
          },
        });
      } else {
        const cat = (t.category || "").toUpperCase();
        const category = VALID_EXPENSE.includes(cat) ? cat : "OTHER";
        const existingSameDate = await prisma.expense.findMany({
          where: { date: dateVal },
          select: { amount: true, category: true, description: true, date: true },
        });
        const signature = buildTransactionSignature({
          amount,
          category,
          description,
          date: dateVal,
        });
        const isDuplicate = existingSameDate.some(
          (row) =>
            buildTransactionSignature({
              amount: row.amount,
              category: row.category,
              description: row.description,
              date: row.date,
            }) === signature
        );
        if (isDuplicate) {
          skippedDuplicates++;
          continue;
        }
        await prisma.expense.create({
          data: {
            amount,
            category: category as ExpenseCategory,
            description,
            date: dateVal,
          },
        });
      }
      savedCount++;
    }

    if (savedCount === 0) {
      return NextResponse.json({
        saved: 0,
        skipped: skippedDuplicates,
        message: skippedDuplicates
          ? "Wszystkie pozycje to duplikaty albo kwoty 0"
          : "Żadna transakcja nie została zapisana (kwoty = 0)",
      });
    }

    revalidatePath("/");
    revalidatePath(type === "income" ? "/income" : "/expenses");

    console.log(`[scan/save] Saved ${savedCount} ${type}s OK`);

    return NextResponse.json({ saved: savedCount, skipped: skippedDuplicates });
  } catch (error) {
    console.error("[scan/save] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Nieznany blad zapisu",
      },
      { status: 500 }
    );
  }
}
