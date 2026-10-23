-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('OPEN', 'SETTLED', 'CANCELLED');

-- DropIndex
DROP INDEX "catalog_item_translations_name_trgm_idx";

-- CreateTable
CREATE TABLE "lots" (
    "id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "starting_price_cents" BIGINT NOT NULL,
    "min_increment_cents" BIGINT NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "original_ends_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "LotStatus" NOT NULL DEFAULT 'OPEN',
    "current_price_cents" BIGINT,
    "current_leader_id" UUID,
    "bid_count" INTEGER NOT NULL DEFAULT 0,
    "genesis_hash" TEXT NOT NULL,
    "genesis_signature" TEXT NOT NULL,
    "head_hash" TEXT NOT NULL,
    "winner_id" UUID,
    "final_price_cents" BIGINT,
    "settled_at" TIMESTAMPTZ(3),
    "cancelled_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lots_status_ends_at_idx" ON "lots"("status", "ends_at");

-- CreateIndex
CREATE INDEX "lots_status_starts_at_idx" ON "lots"("status", "starts_at");

-- CreateIndex
CREATE INDEX "lots_seller_id_idx" ON "lots"("seller_id");

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_current_leader_id_fkey" FOREIGN KEY ("current_leader_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lots" ADD CONSTRAINT "lots_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lots"
  ADD CONSTRAINT "lots_terms_check" CHECK (
    "starting_price_cents" > 0
    AND "min_increment_cents" > 0
    AND "ends_at" > "starts_at"
    AND "ends_at" >= "original_ends_at"
  );
