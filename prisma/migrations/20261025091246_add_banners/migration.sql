-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imageUrl" TEXT NOT NULL,
    "actionType" TEXT NOT NULL DEFAULT 'DISCOUNT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "banner_translations" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "locale" TEXT NOT NULL,

    CONSTRAINT "banner_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banner_translations_bannerId_locale_key" ON "banner_translations"("bannerId", "locale");

-- AddForeignKey
ALTER TABLE "banner_translations" ADD CONSTRAINT "banner_translations_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
