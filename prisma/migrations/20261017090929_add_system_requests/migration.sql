-- CreateTable
CREATE TABLE "system_requests" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tab" TEXT NOT NULL DEFAULT 'STUDENT',
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requesterId" TEXT NOT NULL,
    "requesterRole" TEXT NOT NULL,
    "referenceId" TEXT,
    "referenceModel" TEXT,
    "details" JSONB,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "system_requests_code_key" ON "system_requests"("code");

-- CreateIndex
CREATE INDEX "system_requests_tab_status_idx" ON "system_requests"("tab", "status");

-- CreateIndex
CREATE INDEX "system_requests_type_idx" ON "system_requests"("type");

-- CreateIndex
CREATE INDEX "system_requests_priority_idx" ON "system_requests"("priority");

-- CreateIndex
CREATE INDEX "system_requests_requesterId_idx" ON "system_requests"("requesterId");

-- CreateIndex
CREATE INDEX "system_requests_createdAt_idx" ON "system_requests"("createdAt");

-- AddForeignKey
ALTER TABLE "system_requests" ADD CONSTRAINT "system_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
