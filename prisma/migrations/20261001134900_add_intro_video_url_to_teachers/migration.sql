-- AlterTable: add introVideoUrl column to teachers if it doesn't already exist
ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "introVideoUrl" TEXT;
