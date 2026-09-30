/*
  Warnings:

  - You are about to drop the column `bio` on the `teacher_certificates` table. All the data in the column will be lost.
  - You are about to drop the column `headline` on the `teacher_certificates` table. All the data in the column will be lost.
  - You are about to drop the column `locale` on the `teacher_certificates` table. All the data in the column will be lost.
  - You are about to drop the column `subject` on the `teacher_certificates` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'ar';

-- AlterTable
ALTER TABLE "teacher_certificates" DROP COLUMN "bio",
DROP COLUMN "headline",
DROP COLUMN "locale",
DROP COLUMN "subject";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "preferredLanguage" TEXT NOT NULL DEFAULT 'ar';

-- CreateTable
CREATE TABLE "app_settings" (
    "id" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "logoUrl" TEXT,
    "facebookUrl" TEXT,
    "instaUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_setting_translations" (
    "id" TEXT NOT NULL,
    "settingId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "appName" TEXT NOT NULL,
    "aboutUs" TEXT NOT NULL,
    "copyright" TEXT NOT NULL DEFAULT 'جميع الحقوق محفوظة © 2024',

    CONSTRAINT "app_setting_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "static_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "static_page_translations" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "static_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_academy_items" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "link" TEXT,
    "duration" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teacher_academy_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teacher_academy_translations" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "teacher_academy_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_setting_translations_settingId_locale_key" ON "app_setting_translations"("settingId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "static_pages_slug_key" ON "static_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "static_page_translations_pageId_locale_key" ON "static_page_translations"("pageId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "teacher_academy_translations_itemId_locale_key" ON "teacher_academy_translations"("itemId", "locale");

-- AddForeignKey
ALTER TABLE "app_setting_translations" ADD CONSTRAINT "app_setting_translations_settingId_fkey" FOREIGN KEY ("settingId") REFERENCES "app_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "static_page_translations" ADD CONSTRAINT "static_page_translations_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "static_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teacher_academy_translations" ADD CONSTRAINT "teacher_academy_translations_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "teacher_academy_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
