// Customer-facing reference for a quotation: SNP-2026-0042. The prefix is a
// setting (see src/lib/settings.ts) rather than a literal, the year comes from
// when the quotation was raised, and the sequence restarts each year so the
// number stays short and readable over a phone call.
//
// Pure functions only - the database side lives in
// src/lib/tripIdServer.ts, so these stay unit-testable.

export const TRIP_ID_SEQUENCE_DIGITS = 4;

export function formatTripId(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${String(sequence).padStart(TRIP_ID_SEQUENCE_DIGITS, "0")}`;
}

/**
 * Pulls the sequence back out of an existing Trip ID, so the next one can
 * continue from the highest number actually issued rather than from a count of
 * rows (which would collide the moment a quotation is deleted).
 *
 * Returns null for anything that isn't a Trip ID of this shape - including IDs
 * issued under a previous prefix, which must not influence the current year's
 * numbering.
 */
export function parseTripSequence(tripId: string, prefix: string, year: number): number | null {
  const expected = `${prefix}-${year}-`;
  if (!tripId.startsWith(expected)) return null;

  const tail = tripId.slice(expected.length);
  if (!/^\d+$/.test(tail)) return null;

  const sequence = Number(tail);
  return Number.isSafeInteger(sequence) ? sequence : null;
}

/**
 * Highest sequence among the Trip IDs already issued for this prefix+year,
 * or 0 when none have been.
 */
export function highestSequence(tripIds: string[], prefix: string, year: number): number {
  let highest = 0;
  for (const tripId of tripIds) {
    const sequence = parseTripSequence(tripId, prefix, year);
    if (sequence !== null && sequence > highest) highest = sequence;
  }
  return highest;
}

/** Strips anything that would make a Trip ID ambiguous to read out loud. */
export function normalizeTripIdPrefix(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return cleaned.slice(0, 6) || "SNP";
}
