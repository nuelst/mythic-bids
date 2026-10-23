-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "lot_id" UUID NOT NULL,
    "public_token" TEXT NOT NULL,
    "winner_id" UUID NOT NULL,
    "winner_alias" TEXT NOT NULL,
    "amount_cents" BIGINT NOT NULL,
    "bid_count" INTEGER NOT NULL,
    "final_hash" TEXT NOT NULL,
    "seal_signature" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "receipts_lot_id_key" ON "receipts"("lot_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_public_token_key" ON "receipts"("public_token");

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_lot_id_fkey" FOREIGN KEY ("lot_id") REFERENCES "lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
