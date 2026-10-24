-- AlterTable
ALTER TABLE "support_messages" ALTER COLUMN "senderId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "support_messages_adminSenderId_createdAt_id_idx" ON "support_messages"("adminSenderId", "createdAt", "id");
