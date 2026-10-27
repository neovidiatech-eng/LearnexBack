-- DropForeignKey
ALTER TABLE "system_requests" DROP CONSTRAINT "system_requests_requesterId_fkey";

-- AlterTable
ALTER TABLE "system_requests" ALTER COLUMN "requesterId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "system_requests" ADD CONSTRAINT "system_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
