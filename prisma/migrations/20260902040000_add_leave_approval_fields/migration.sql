-- AlterTable: Add leave approval workflow fields to LeaveRecord
ALTER TABLE "LeaveRecord" ADD COLUMN "approvedById" TEXT;
ALTER TABLE "LeaveRecord" ADD COLUMN "approvedAt" DATETIME;
ALTER TABLE "LeaveRecord" ADD COLUMN "rejectionReason" TEXT;
ALTER TABLE "LeaveRecord" ADD COLUMN "approvalNote" TEXT;

-- CreateIndex: Performance indexes for leave approval queue querying
CREATE INDEX IF NOT EXISTS "LeaveRecord_status_idx" ON "LeaveRecord"("status");
CREATE INDEX IF NOT EXISTS "LeaveRecord_approvedById_idx" ON "LeaveRecord"("approvedById");
CREATE INDEX IF NOT EXISTS "LeaveRecord_approvedAt_idx" ON "LeaveRecord"("approvedAt");
