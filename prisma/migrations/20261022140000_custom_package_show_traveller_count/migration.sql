-- Lets a quotation leave the number of travellers off its PDF. Defaults to
-- true, so every existing quotation keeps printing exactly as before.

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN "showTravellerCount" BOOLEAN NOT NULL DEFAULT true;
