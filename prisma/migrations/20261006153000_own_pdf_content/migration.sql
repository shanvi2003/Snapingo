-- Each package and quotation can carry its own copy of the PDF content blocks
-- (About, Terms, Payment Policy...). Nullable, no backfill: existing rows keep
-- printing the standard content from "ContentBlock".

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "contentBlocks" JSONB;

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN     "contentBlocks" JSONB;
