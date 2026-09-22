-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "packageNo" INTEGER;

-- Backfill: number the packages that already exist in the order they were
-- created, so the oldest is 000001 and the sequence staff see has no gaps at
-- the start. Done inside this migration rather than in a separate script so
-- the column is never observed half-populated, and so the unique index below
-- is created against data that already satisfies it.
WITH numbered AS (
  SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS seq
  FROM "Package"
)
UPDATE "Package" p
SET "packageNo" = n.seq
FROM numbered n
WHERE p."id" = n."id";

-- CreateIndex
CREATE UNIQUE INDEX "Package_packageNo_key" ON "Package"("packageNo");
