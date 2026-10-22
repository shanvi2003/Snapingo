-- A quotation's per-person price breakup (label, count, rate per person
-- before GST), printed on its PDF. Nullable, so existing quotations are
-- unchanged and print their total alone until they are next edited.

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN "priceLines" JSONB;
