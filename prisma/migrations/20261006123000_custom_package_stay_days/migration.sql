-- Days per hotel on customized packages, alongside the existing nights.
-- Nullable, no backfill: older stays simply have none.

-- AlterTable
ALTER TABLE "CustomPackageStay" ADD COLUMN     "days" INTEGER;
