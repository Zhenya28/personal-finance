import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IncomeCategory, ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/auth";
import {
  buildTransactionSignature,
  sanitizeTransactionDescription,
} from "@/lib/transaction-dedupe";
import { parseLocalDate } from "@/lib/utils";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "@/lib/validation";

const VALID_INCOME = INCOME_CATEGORIES as readonly string[];
const VALID_EXPENSE = EXPENSE_CATEGORIES as readonly string[];

export async function POST(request: NextRequest) {
  try {
    if (!(await verifySession())) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    let savedCount = 0;
    let skippedDuplicates = 0;

    // --- Phase 1: Pre-process all transactions in memory (zero DB calls) ---
    const currentYear = new Date().getFullYear();
    const processed: {
      amount: number;
      category: string;
      description: string | null;
      date: Date;
      signature: string;
    }[] = [];

    for (const t of transactions) {
      const amount = Math.abs(Number(t.amount) || 0);
      if (amount === 0) continue;

      const dateVal = parseLocalDate(t.date) ?? new Date();

      // Fix wrong year — Gemini sometimes defaults to 2024 when bank shows only day/month
      if (dateVal.getFullYear() < currentYear) {
        dateVal.setFullYear(currentYear);
      }

      const description = sanitizeTransactionDescription(t.description) || null;
      const cat = (t.category || "").toUpperCase();
      const category =
        type === "income"
          ? VALID_INCOME.includes(cat) ? cat : "INNE"
          : VALID_EXPENSE.includes(cat) ? cat : "OTHER";

      const signature = buildTransactionSignature({
        amount,
        category,
        description,
        date: dateVal,
      });

      processed.push({
        amount: Math.round(amount * 100) / 100,
        category,
        description,
        date: dateVal,
        signature,
      });
    }

    // --- Phase 2: Batch-fetch existing records for the date window in one query ---
    const timestamps = processed.map((p) => p.date.getTime());
    const minDate = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
    const maxDate = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

    const existingSignatures = new Set<string>();

    if (minDate && maxDate) {
      const existingRows = type === "income"
        ? await prisma.income.findMany({
            where: { date: { gte: minDate, lte: maxDate } },
            select: { amount: true, category: true, description: true, date: true },
          })
        : await prisma.expense.findMany({
            where: { date: { gte: minDate, lte: maxDate } },
            select: { amount: true, category: true, description: true, date: true },
          });

      for (const row of existingRows) {
        existingSignatures.add(
          buildTransactionSignature({
            amount: row.amount,
            category: row.category,
            description: row.description,
            date: row.date,
          })
        );
      }
    }

    // --- Phase 3: Filter duplicates (against DB + within the batch itself) ---
    const seenSignatures = new Set(existingSignatures);
    const toInsert: typeof processed = [];

    for (const p of processed) {
      if (seenSignatures.has(p.signature)) {
        skippedDuplicates++;
        continue;
      }
      seenSignatures.add(p.signature);
      toInsert.push(p);
    }

    // --- Phase 4: Batch insert all non-duplicate records in one query ---
    if (toInsert.length > 0) {
      if (type === "income") {
        await prisma.income.createMany({
          data: toInsert.map((p) => ({
            amount: p.amount,
            category: p.category as IncomeCategory,
            description: p.description,
            date: p.date,
          })),
        });
      } else {
        await prisma.expense.createMany({
          data: toInsert.map((p) => ({
            amount: p.amount,
            category: p.category as ExpenseCategory,
            description: p.description,
            date: p.date,
          })),
        });
      }
      savedCount = toInsert.length;
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

    revalidatePath("/", "layout");

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
