-- DropForeignKey
ALTER TABLE "support_messages" DROP CONSTRAINT "support_messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "support_messages" DROP CONSTRAINT "support_messages_ticketId_fkey";

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
