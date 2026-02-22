import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { IncomeCategory, ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

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

    for (const t of transactions) {
      const amount = Number(t.amount) || 0;
      if (amount <= 0) continue;

      const dateVal = t.date ? new Date(t.date) : new Date();

      if (type === "income") {
        const cat = (t.category || "").toUpperCase();
        const category = VALID_INCOME.includes(cat) ? cat : "INNE";
        await prisma.income.create({
          data: {
            amount,
            category: category as IncomeCategory,
            description: t.description || null,
            date: dateVal,
          },
        });
      } else {
        const cat = (t.category || "").toUpperCase();
        const category = VALID_EXPENSE.includes(cat) ? cat : "OTHER";
        await prisma.expense.create({
          data: {
            amount,
            category: category as ExpenseCategory,
            description: t.description || null,
            date: dateVal,
          },
        });
      }
      savedCount++;
    }

    // Daily checkin
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    await prisma.dailyCheckin.upsert({
      where: { date: today },
      update: {},
      create: { date: today },
    });

    revalidatePath("/");
    revalidatePath(type === "income" ? "/income" : "/expenses");

    console.log(`[scan/save] Saved ${savedCount} ${type}s OK`);

    return NextResponse.json({ saved: savedCount });
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
