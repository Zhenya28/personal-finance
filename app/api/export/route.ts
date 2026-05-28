import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

const BATCH_SIZE = 500;

/* eslint-disable @typescript-eslint/no-explicit-any */
// Prisma model findMany methods are deeply generic; pragmatic any-typing at
// the boundary keeps this stream helper compact.

type Identified = { id: string };

async function* cursorBatches(
  findMany: (args: any) => Promise<Identified[]>,
  opts: Record<string, unknown> = {}
): AsyncGenerator<Identified[]> {
  let cursor: string | undefined;

  while (true) {
    const batch = await findMany({
      ...opts,
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });

    if (batch.length === 0) break;

    yield batch;
    cursor = batch[batch.length - 1].id;

    if (batch.length < BATCH_SIZE) break;
  }
}

async function writeTable(
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  findMany: (args: any) => Promise<Identified[]>,
  opts: Record<string, unknown> = {}
) {
  let first = true;
  for await (const batch of cursorBatches(findMany, opts)) {
    for (const record of batch) {
      controller.enqueue(
        encoder.encode((first ? "" : ",") + JSON.stringify(record))
      );
      first = false;
    }
  }
}

/* eslint-enable @typescript-eslint/no-explicit-any */

export async function GET() {
  const isAuthenticated = await verifySession();
  if (!isAuthenticated) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const push = (text: string) => controller.enqueue(enc.encode(text));

      push(`{"exportedAt":"${new Date().toISOString()}","version":"1.0"`);

      push(`,"incomes":[`);
      await writeTable(controller, enc, prisma.income.findMany.bind(prisma.income), {
        orderBy: { date: "desc" },
        select: { id: true, amount: true, category: true, description: true, date: true },
      });
      push(`]`);

      push(`,"expenses":[`);
      await writeTable(controller, enc, prisma.expense.findMany.bind(prisma.expense), {
        orderBy: { date: "desc" },
        select: { id: true, amount: true, category: true, description: true, date: true },
      });
      push(`]`);

      push(`,"investments":[`);
      await writeTable(controller, enc, prisma.investment.findMany.bind(prisma.investment), {
        orderBy: { date: "desc" },
        select: { id: true, ticker: true, units: true, pricePerUnit: true, date: true },
      });
      push(`]`);

      push(`,"savingsAccounts":[`);
      await writeTable(controller, enc, prisma.savingsAccount.findMany.bind(prisma.savingsAccount), {
        select: { id: true, name: true, balance: true, currency: true },
      });
      push(`]`);

      push(`,"savingsTransactions":[`);
      await writeTable(controller, enc, prisma.savingsTransaction.findMany.bind(prisma.savingsTransaction), {
        orderBy: { date: "desc" },
        select: { id: true, accountId: true, type: true, amount: true, description: true, date: true },
      });
      push(`]`);

      push(`}`);
      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="finance-backup-${new Date().toISOString().split("T")[0]}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
