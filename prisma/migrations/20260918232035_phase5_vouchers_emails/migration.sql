-- CreateEnum
CREATE TYPE "EmailKind" AS ENUM ('ITINERARY', 'INVOICE', 'VOUCHER', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'FAILED');

-- CreateTable
CREATE TABLE "BookingVoucher" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "label" TEXT,
    "fileName" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingVoucher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "kind" "EmailKind" NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "error" TEXT,
    "bookingId" TEXT,
    "customPackageId" TEXT,
    "leadId" TEXT,
    "sentById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingVoucher_bookingId_createdAt_idx" ON "BookingVoucher"("bookingId", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_createdAt_idx" ON "EmailLog"("createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_bookingId_idx" ON "EmailLog"("bookingId");

-- CreateIndex
CREATE INDEX "EmailLog_customPackageId_idx" ON "EmailLog"("customPackageId");

-- AddForeignKey
ALTER TABLE "BookingVoucher" ADD CONSTRAINT "BookingVoucher_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingVoucher" ADD CONSTRAINT "BookingVoucher_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_sentById_fkey" FOREIGN KEY ("sentById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
