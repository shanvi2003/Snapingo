-- CreateEnum
CREATE TYPE "LeadNoteStatus" AS ENUM ('TRAVELER_NOT_REACHABLE', 'WONT_BOOK_WITH_ME', 'TALK_IN_PROGRESS_WITH_TRAVELER', 'TRAVELER_WILL_FINALIZE', 'MY_HOT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LeadStatus" ADD VALUE 'ASSIGNED';
ALTER TYPE "LeadStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "tripId" TEXT;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "adults" INTEGER,
ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "childAges" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "children" INTEGER,
ADD COLUMN     "extraBeds" INTEGER,
ADD COLUMN     "extraMattresses" INTEGER,
ADD COLUMN     "hotelCategory" TEXT,
ADD COLUMN     "infants" INTEGER,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "roomCategory" TEXT,
ADD COLUMN     "rooms" INTEGER;

-- AlterTable
ALTER TABLE "LeadNote" ADD COLUMN     "status" "LeadNoteStatus";

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "billingName" TEXT NOT NULL,
    "billingAddress" TEXT NOT NULL,
    "billingCity" TEXT NOT NULL,
    "billingState" TEXT NOT NULL,
    "billingCountry" TEXT NOT NULL DEFAULT 'India',
    "billingPincode" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvoiceInstallment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "InvoiceInstallment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_bookingId_key" ON "Invoice"("bookingId");

-- CreateIndex
CREATE INDEX "InvoiceInstallment_invoiceId_order_idx" ON "InvoiceInstallment"("invoiceId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_tripId_key" ON "Booking"("tripId");

-- CreateIndex
CREATE INDEX "Booking_travelStartDate_travelEndDate_idx" ON "Booking"("travelStartDate", "travelEndDate");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_createdAt_idx" ON "LeadNote"("leadId", "createdAt");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvoiceInstallment" ADD CONSTRAINT "InvoiceInstallment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
