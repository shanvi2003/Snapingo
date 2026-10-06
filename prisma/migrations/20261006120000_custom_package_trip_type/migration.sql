-- Domestic / international on customized packages. Nullable, no backfill:
-- quotations saved before this existed simply show no trip type.

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN     "tripType" TEXT;
