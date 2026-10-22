-- "Delete" on a quotation now archives it: these record when and by whom.
-- Both nullable, so every existing quotation stays live and unchanged.

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedById" TEXT;

-- CreateIndex
CREATE INDEX "CustomPackage_deletedAt_idx" ON "CustomPackage"("deletedAt");

-- AddForeignKey
ALTER TABLE "CustomPackage" ADD CONSTRAINT "CustomPackage_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
