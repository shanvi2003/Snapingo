-- "Delete" on a booking now archives it: when, by whom, and the Trip ID it
-- held (freed while archived). All nullable, so every existing booking stays
-- live and unchanged.

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "deletedAt" TIMESTAMP(3),
ADD COLUMN "deletedById" TEXT,
ADD COLUMN "deletedTripId" TEXT;

-- CreateIndex
CREATE INDEX "Booking_deletedAt_idx" ON "Booking"("deletedAt");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
