/*
  Warnings:

  - You are about to drop the column `name` on the `offers` table. All the data in the column will be lost.
  - You are about to drop the column `offerDesc` on the `offers` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "offers" DROP COLUMN "name",
DROP COLUMN "offerDesc";

-- CreateTable
CREATE TABLE "offer_translations" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "offerDesc" TEXT NOT NULL,

    CONSTRAINT "offer_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offer_translations_offerId_locale_key" ON "offer_translations"("offerId", "locale");

-- AddForeignKey
ALTER TABLE "offer_translations" ADD CONSTRAINT "offer_translations_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
