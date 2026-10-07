-- Staff-typed extra exclusions on customized packages, as Package already
-- has. Defaults to an empty list, so existing quotations are unchanged.

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN     "exclusions" TEXT[] DEFAULT ARRAY[]::TEXT[];
