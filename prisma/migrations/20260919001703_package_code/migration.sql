-- Replaces the short-lived numeric `packageNo` with a readable code
-- (SNP-2026-01). `packageNo` was added in the previous migration and is not
-- referenced by anything outside this codebase, so dropping it loses nothing
-- that wasn't regenerated here.

-- DropIndex
DROP INDEX "Package_packageNo_key";

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "code" TEXT;

-- Backfill. The prefix is read from the same setting Trip IDs use rather than
-- being written into this file, so changing it in the admin panel doesn't
-- leave the historical codes disagreeing with the new ones.
--
-- The sequence restarts per calendar year (PARTITION BY year), matching how
-- new codes will be issued, and orders by creation time so the oldest package
-- of each year is -01.
--
-- NOTE on the padding: Postgres' LPAD TRUNCATES when the input is longer than
-- the target width - LPAD('148', 2, '0') is '14', not '148'. Padding to
-- GREATEST(2, length) keeps two digits as the minimum without ever cutting a
-- longer number short, which is what silently collided 14 with 140-149.
WITH prefix AS (
  SELECT COALESCE(NULLIF((SELECT "value" FROM "Setting" WHERE "key" = 'trip_id_prefix'), ''), 'SNP') AS value
),
numbered AS (
  SELECT
    "id",
    EXTRACT(YEAR FROM "createdAt")::int AS year,
    ROW_NUMBER() OVER (
      PARTITION BY EXTRACT(YEAR FROM "createdAt")
      ORDER BY "createdAt" ASC, "id" ASC
    ) AS seq
  FROM "Package"
)
UPDATE "Package" p
SET "code" =
  (SELECT value FROM prefix)
  || '-' || n.year
  || '-' || LPAD(n.seq::text, GREATEST(2, LENGTH(n.seq::text)), '0')
FROM numbered n
WHERE p."id" = n."id";

-- AlterTable
ALTER TABLE "Package" DROP COLUMN "packageNo";

-- CreateIndex
CREATE UNIQUE INDEX "Package_code_key" ON "Package"("code");
