-- DropColumn: Investment.commission was always 0 (UI never set it).
ALTER TABLE "Investment" DROP COLUMN IF EXISTS "commission";

-- CreateIndex: composite indexes for groupBy/filter patterns.
CREATE INDEX IF NOT EXISTS "Income_category_date_idx" ON "Income"("category", "date");
CREATE INDEX IF NOT EXISTS "Expense_category_date_idx" ON "Expense"("category", "date");
CREATE INDEX IF NOT EXISTS "Investment_ticker_date_idx" ON "Investment"("ticker", "date");
CREATE INDEX IF NOT EXISTS "SavingsTransaction_accountId_date_idx" ON "SavingsTransaction"("accountId", "date");
