-- CreateTable
CREATE TABLE "idempotency_keys" (
    "user_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "status_code" INTEGER,
    "response" JSONB,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("user_id","key")
);

-- CreateIndex
CREATE INDEX "idempotency_keys_created_at_idx" ON "idempotency_keys"("created_at");
