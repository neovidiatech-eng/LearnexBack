-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "target" TEXT NOT NULL DEFAULT 'All Users',
    "offerType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "offerDesc" TEXT NOT NULL,
    "discount" DECIMAL(10,2),
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- CreateIndex
CREATE INDEX "offers_offerType_idx" ON "offers"("offerType");

-- CreateIndex
CREATE INDEX "offers_startDate_idx" ON "offers"("startDate");

-- CreateIndex
CREATE INDEX "offers_endDate_idx" ON "offers"("endDate");
