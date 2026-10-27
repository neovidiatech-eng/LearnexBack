/*
  Warnings:

  - A unique constraint covering the columns `[order]` on the table `banners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "banners_order_key" ON "banners"("order");
