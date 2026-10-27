-- DropIndex
DROP INDEX "banners_order_key";

-- AlterTable
ALTER TABLE "banners" ALTER COLUMN "order" DROP DEFAULT;
