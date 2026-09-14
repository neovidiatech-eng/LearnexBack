/*
  Warnings:

  - The values [APPLE] on the enum `AuthProvider` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AuthProvider_new" AS ENUM ('SYSTEM', 'GOOGLE');
ALTER TABLE "public"."users" ALTER COLUMN "provider" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "provider" TYPE "AuthProvider_new" USING ("provider"::text::"AuthProvider_new");
ALTER TYPE "AuthProvider" RENAME TO "AuthProvider_old";
ALTER TYPE "AuthProvider_new" RENAME TO "AuthProvider";
DROP TYPE "public"."AuthProvider_old";
ALTER TABLE "users" ALTER COLUMN "provider" SET DEFAULT 'SYSTEM';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "confirmEmail" TIMESTAMP(3);
