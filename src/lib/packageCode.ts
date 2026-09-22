// A package's staff-facing reference: SNP-2026-01.
//
// Same shape as a Trip ID and drawn from the same prefix setting, but its own
// sequence - a package is website content, a Trip ID belongs to a customer's
// trip, and numbering them together would make the two look interchangeable.
//
// Pure functions only; the database side lives in src/lib/packageCodeServer.ts
// so this stays unit-testable and importable from the form.

export const PACKAGE_CODE_MIN_DIGITS = 2;

/**
 * Pads to a minimum width without ever truncating a longer number.
 *
 * Worth stating because the SQL equivalent does the opposite: Postgres'
 * LPAD('148', 2, '0') returns '14'. That silently collided package 14 with
 * 140-149 during the backfill, so the same mistake must not be repeatable here.
 */
export function formatPackageCode(prefix: string, year: number, sequence: number): string {
  return `${prefix}-${year}-${String(sequence).padStart(PACKAGE_CODE_MIN_DIGITS, "0")}`;
}

/**
 * Reads the sequence back out of a code issued under this prefix and year.
 * Returns null for anything else - including a code from a previous prefix,
 * which must not influence the current year's numbering.
 */
export function parsePackageSequence(code: string, prefix: string, year: number): number | null {
  const expected = `${prefix}-${year}-`;
  if (!code.startsWith(expected)) return null;

  const tail = code.slice(expected.length);
  if (!/^\d+$/.test(tail)) return null;

  const sequence = Number(tail);
  return Number.isSafeInteger(sequence) ? sequence : null;
}

/** Highest sequence already issued for this prefix+year, or 0 if none. */
export function highestPackageSequence(codes: string[], prefix: string, year: number): number {
  let highest = 0;
  for (const code of codes) {
    const sequence = parsePackageSequence(code, prefix, year);
    if (sequence !== null && sequence > highest) highest = sequence;
  }
  return highest;
}
