-- AlterTable
ALTER TABLE "support_messages" ADD COLUMN     "adminSenderId" TEXT;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_adminSenderId_fkey" FOREIGN KEY ("adminSenderId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
