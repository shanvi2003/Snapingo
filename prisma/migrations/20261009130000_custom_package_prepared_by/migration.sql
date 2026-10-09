-- Who prepared a quotation (name and role), shown on its PDF. Both nullable,
-- so existing quotations are unchanged and simply print without it.

-- AlterTable
ALTER TABLE "CustomPackage" ADD COLUMN "preparedByName" TEXT,
ADD COLUMN "preparedByRole" TEXT;
