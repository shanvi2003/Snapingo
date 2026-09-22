-- CreateEnum
CREATE TYPE "MasterListKey" AS ENUM ('PACKAGE_INCLUSION', 'PACKAGE_BADGE', 'ROOM_CATEGORY', 'HOTEL_CATEGORY', 'VEHICLE_TYPE');

-- CreateEnum
CREATE TYPE "ContentBlockKey" AS ENUM ('PDF_ABOUT', 'PDF_TERMS', 'PDF_PAYMENT_POLICY', 'PDF_CANCELLATION_POLICY', 'PDF_ACCOUNT_DETAILS', 'PDF_DISCLAIMER');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "customInclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "durationDays" INTEGER,
ADD COLUMN     "durationNights" INTEGER,
ADD COLUMN     "tripsSold" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "MasterOption" (
    "id" TEXT NOT NULL,
    "list" "MasterListKey" NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "freeText" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentBlock" (
    "key" "ContentBlockKey" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "MasterOption_list_order_idx" ON "MasterOption"("list", "order");

-- CreateIndex
CREATE UNIQUE INDEX "MasterOption_list_value_key" ON "MasterOption"("list", "value");
