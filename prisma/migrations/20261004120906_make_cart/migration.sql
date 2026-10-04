/*
  Warnings:

  - You are about to drop the column `courseId` on the `cart_items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[cartId,itemId]` on the table `cart_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemId` to the `cart_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `cart_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_courseId_fkey";

-- DropIndex
DROP INDEX "cart_items_cartId_courseId_key";

-- DropIndex
DROP INDEX "cart_items_courseId_idx";

-- AlterTable
ALTER TABLE "cart_items" DROP COLUMN "courseId",
ADD COLUMN     "itemId" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "cart_items_itemId_idx" ON "cart_items"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cartId_itemId_key" ON "cart_items"("cartId", "itemId");
