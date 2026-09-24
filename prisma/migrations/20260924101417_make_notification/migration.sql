-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "fcmToken" TEXT;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "adminId" TEXT;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
