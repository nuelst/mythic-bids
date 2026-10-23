-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('DEPOSIT', 'HOLD', 'RELEASE', 'CAPTURE', 'PAYOUT', 'REFUND');

-- CreateTable
CREATE TABLE "wallets" (
    "user_id" UUID NOT NULL,
    "balance_cents" BIGINT NOT NULL DEFAULT 0,
    "committed_cents" BIGINT NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amount_cents" BIGINT NOT NULL,
    "lot_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ledger_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ledger_entries_user_id_created_at_idx" ON "ledger_entries"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ledger_entries" ADD CONSTRAINT "ledger_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Wallet invariants: money never goes negative and committed never exceeds the balance.
ALTER TABLE "wallets"
  ADD CONSTRAINT "wallets_balance_check"
  CHECK ("committed_cents" >= 0 AND "committed_cents" <= "balance_cents");

ALTER TABLE "ledger_entries"
  ADD CONSTRAINT "ledger_entries_amount_check" CHECK ("amount_cents" > 0);

-- Append-only tables: history can only grow (reused by the bids table).
CREATE FUNCTION forbid_mutation() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% is append-only', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_entries_append_only
  BEFORE UPDATE OR DELETE ON "ledger_entries"
  FOR EACH ROW EXECUTE FUNCTION forbid_mutation();

INSERT INTO "wallets" ("user_id", "updated_at") SELECT "id", now() FROM "users";
