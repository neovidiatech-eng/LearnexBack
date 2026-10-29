-- AlterTable
ALTER TABLE "app_settings" ADD COLUMN     "commissionType" TEXT DEFAULT 'FIXED',
ADD COLUMN     "commissionValue" DOUBLE PRECISION DEFAULT 10;
