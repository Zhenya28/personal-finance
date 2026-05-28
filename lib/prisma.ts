import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export type MonthlySum = { month: string; total: number };

/**
 * Returns rows of { month: 'YYYY-MM', total: SUM(amount) } in DB
 * for a date range, leveraging Postgres date_trunc + index on date.
 */
export async function sumByMonth(
  table: "Income" | "Expense",
  from: Date,
  to: Date
): Promise<MonthlySum[]> {
  const tableName = Prisma.raw(`"${table}"`);
  const rows = await prisma.$queryRaw<
    { month: string; total: number | string | null }[]
  >`
    SELECT
      TO_CHAR(DATE_TRUNC('month', "date"), 'YYYY-MM') AS month,
      SUM("amount")::float AS total
    FROM ${tableName}
    WHERE "date" >= ${from} AND "date" <= ${to}
    GROUP BY 1
    ORDER BY 1
  `;
  return rows.map((r) => ({
    month: r.month,
    total: Number(r.total ?? 0),
  }));
}
