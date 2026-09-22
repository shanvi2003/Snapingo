import "server-only";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { normalizeTripIdPrefix } from "@/lib/tripId";
import { formatPackageCode, highestPackageSequence } from "@/lib/packageCode";

/**
 * The code the next package will get, e.g. SNP-2026-05.
 *
 * Read from the highest code already issued this year rather than a row count,
 * so deleting a package never makes the next one reuse its code - staff quote
 * these to each other, and two packages that have both been SNP-2026-05 is a
 * real support problem.
 */
export async function nextPackageCode(): Promise<string> {
  const prefix = normalizeTripIdPrefix(await getSetting("trip_id_prefix"));
  const year = new Date().getFullYear();

  const rows = await db.package.findMany({
    where: { code: { startsWith: `${prefix}-${year}-` } },
    select: { code: true },
  });

  const codes = rows.map((r) => r.code).filter((c): c is string => Boolean(c));
  return formatPackageCode(prefix, year, highestPackageSequence(codes, prefix, year) + 1);
}

/**
 * Runs `create` with a freshly issued code, retrying the unique-constraint
 * collision two simultaneous saves can produce. The column is UNIQUE, so a
 * race loses one insert rather than silently duplicating a code.
 */
export async function withNewPackageCode<T>(create: (code: string) => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await create(await nextPackageCode());
    } catch (error) {
      if (!isPackageCodeCollision(error)) throw error;
      lastError = error;
    }
  }

  throw lastError;
}

function isPackageCodeCollision(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: string; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  // Only a clash on `code` is worth retrying; a duplicate id would just fail
  // again with the same value.
  return Array.isArray(target) ? target.includes("code") : target === "code";
}
