-- CreateTable
CREATE TABLE "outbox_events" (
    "id" BIGSERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "lot_id" UUID,
    "user_id" UUID,
    "payload" JSONB NOT NULL,
    "tx_id" xid8 NOT NULL DEFAULT pg_current_xact_id(),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "outbox_events_tx_id_id_idx" ON "outbox_events"("tx_id", "id");

-- CreateIndex
CREATE INDEX "outbox_events_created_at_idx" ON "outbox_events"("created_at");
