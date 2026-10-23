-- CreateEnum
CREATE TYPE "ImageStatus" AS ENUM ('PENDING', 'MIRRORED', 'FAILED');

-- CreateEnum
CREATE TYPE "TranslationOrigin" AS ENUM ('ORACLE', 'PRINTED', 'SIBLING');

-- CreateEnum
CREATE TYPE "CatalogJobType" AS ENUM ('IMAGE_MIRROR', 'TRANSLATE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "catalog_items" (
    "id" UUID NOT NULL,
    "scryfall_id" UUID NOT NULL,
    "oracle_id" UUID,
    "set_code" TEXT NOT NULL,
    "set_name" TEXT NOT NULL,
    "collector_number" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "mana_cost" TEXT,
    "colors" TEXT[],
    "artist" TEXT,
    "released_at" DATE,
    "reference_price" JSONB,
    "source_image_url" TEXT,
    "image_status" "ImageStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "catalog_item_translations" (
    "item_id" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type_line" TEXT,
    "rules_text" TEXT,
    "flavor_text" TEXT,
    "origin" "TranslationOrigin" NOT NULL,

    CONSTRAINT "catalog_item_translations_pkey" PRIMARY KEY ("item_id","locale")
);

-- CreateTable
CREATE TABLE "catalog_images" (
    "item_id" UUID NOT NULL,
    "content_type" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_images_pkey" PRIMARY KEY ("item_id")
);

-- CreateTable
CREATE TABLE "catalog_jobs" (
    "id" UUID NOT NULL,
    "type" "CatalogJobType" NOT NULL,
    "item_id" UUID NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "run_after" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalog_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "catalog_items_scryfall_id_key" ON "catalog_items"("scryfall_id");

-- CreateIndex
CREATE INDEX "catalog_jobs_status_run_after_idx" ON "catalog_jobs"("status", "run_after");

-- CreateIndex
CREATE UNIQUE INDEX "catalog_jobs_type_item_id_key" ON "catalog_jobs"("type", "item_id");

-- AddForeignKey
ALTER TABLE "catalog_item_translations" ADD CONSTRAINT "catalog_item_translations_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_images" ADD CONSTRAINT "catalog_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_jobs" ADD CONSTRAINT "catalog_jobs_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "catalog_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Offline search (when Scryfall is down) matches names with ILIKE; trigrams keep it indexed.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX "catalog_item_translations_name_trgm_idx"
  ON "catalog_item_translations" USING gin ("name" gin_trgm_ops);
