-- CreateTable
CREATE TABLE "CalculatorMonthlyResult" (
    "id" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "hoursP1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "hoursP2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalKm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "weekdayOrders" INTEGER NOT NULL DEFAULT 0,
    "weekendOrders" INTEGER NOT NULL DEFAULT 0,
    "tips" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutPeriod1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payoutPeriod2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalculatorMonthlyResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CalculatorMonthlyResult_month_key" ON "CalculatorMonthlyResult"("month");
