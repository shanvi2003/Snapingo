-- CreateTable
CREATE TABLE "CustomPackage" (
    "id" TEXT NOT NULL,
    "tripId" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "customerEmail" TEXT,
    "leadId" TEXT,
    "destinationName" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "durationNights" INTEGER NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "infants" INTEGER NOT NULL DEFAULT 0,
    "childAges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rooms" INTEGER NOT NULL DEFAULT 1,
    "extraBeds" INTEGER NOT NULL DEFAULT 0,
    "extraMattresses" INTEGER NOT NULL DEFAULT 0,
    "roomCategory" TEXT,
    "roomCategoryOther" TEXT,
    "hotelCategory" TEXT,
    "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customInclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "vehicleName" TEXT,
    "price" INTEGER NOT NULL,
    "gstPercent" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "gstAmount" INTEGER NOT NULL DEFAULT 0,
    "totalAmount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPackageDay" (
    "id" TEXT NOT NULL,
    "customPackageId" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,

    CONSTRAINT "CustomPackageDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPackageStay" (
    "id" TEXT NOT NULL,
    "customPackageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "city" TEXT,
    "nights" INTEGER,
    "hotelName" TEXT NOT NULL,
    "hotelCategory" TEXT,
    "roomCategory" TEXT,
    "rooms" INTEGER NOT NULL DEFAULT 1,
    "extraBed" BOOLEAN NOT NULL DEFAULT false,
    "extraMattress" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomPackageStay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomPackage_tripId_key" ON "CustomPackage"("tripId");

-- CreateIndex
CREATE INDEX "CustomPackage_createdAt_idx" ON "CustomPackage"("createdAt");

-- CreateIndex
CREATE INDEX "CustomPackage_createdById_idx" ON "CustomPackage"("createdById");

-- CreateIndex
CREATE INDEX "CustomPackageDay_customPackageId_day_idx" ON "CustomPackageDay"("customPackageId", "day");

-- CreateIndex
CREATE INDEX "CustomPackageStay_customPackageId_order_idx" ON "CustomPackageStay"("customPackageId", "order");

-- AddForeignKey
ALTER TABLE "CustomPackage" ADD CONSTRAINT "CustomPackage_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPackage" ADD CONSTRAINT "CustomPackage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "StaffUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPackageDay" ADD CONSTRAINT "CustomPackageDay_customPackageId_fkey" FOREIGN KEY ("customPackageId") REFERENCES "CustomPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPackageStay" ADD CONSTRAINT "CustomPackageStay_customPackageId_fkey" FOREIGN KEY ("customPackageId") REFERENCES "CustomPackage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
