import "server-only";
import { db } from "@/lib/db";
import { getSetting } from "@/lib/settings";
import { formatTripId, highestSequence, normalizeTripIdPrefix } from "@/lib/tripId";

// One sequence shared by quotations and bookings.
//
// The alternative - a counter per table - would hand a quotation and an
// unrelated booking the same number in the same year, and staff look Trip IDs
// up across both ("find SNP-2026-0042" has to mean one trip, not two). When a
// quotation becomes a booking the booking carries the quotation's existing
// Trip ID rather than drawing a new one, so the customer keeps the reference
// they were already given.

async function issuedThisYear(prefix: string, year: number): Promise<string[]> {
  const startsWith = `${prefix}-${year}-`;
  const [quotations, bookings] = await Promise.all([
    db.customPackage.findMany({ where: { tripId: { startsWith } }, select: { tripId: true } }),
    db.booking.findMany({ where: { tripId: { startsWith } }, select: { tripId: true } }),
  ]);

  return [
    ...quotations.map((q) => q.tripId),
    ...bookings.map((b) => b.tripId).filter((id): id is string => Boolean(id)),
  ];
}

/**
 * Issues the next Trip ID for the current year.
 *
 * Takes the highest sequence already issued rather than counting rows, so
 * deleting a quotation never makes the next one reuse its number. Both
 * `tripId` columns are UNIQUE, so simultaneous saves lose one insert rather
 * than silently duplicating - `withNewTripId` retries that case.
 */
export async function nextTripId(): Promise<string> {
  const prefix = normalizeTripIdPrefix(await getSetting("trip_id_prefix"));
  const year = new Date().getFullYear();
  const existing = await issuedThisYear(prefix, year);

  return formatTripId(prefix, year, highestSequence(existing, prefix, year) + 1);
}

/**
 * Runs `create` with a freshly issued Trip ID, retrying the unique-constraint
 * collision two simultaneous saves can produce. Three attempts is far more
 * than this workload needs - a collision requires two staff members to save
 * within the same few milliseconds.
 */
export async function withNewTripId<T>(create: (tripId: string) => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const tripId = await nextTripId();
    try {
      return await create(tripId);
    } catch (error) {
      if (!isTripIdCollision(error)) throw error;
      lastError = error;
    }
  }

  throw lastError;
}

function isTripIdCollision(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const e = error as { code?: string; meta?: { target?: unknown } };
  if (e.code !== "P2002") return false;
  const target = e.meta?.target;
  // P2002 is "unique constraint failed"; only a clash on tripId is worth
  // retrying - any other unique column would just fail again.
  return Array.isArray(target) ? target.includes("tripId") : target === "tripId";
}
