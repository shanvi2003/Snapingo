// "Best time to visit" is stored as one display string ("October – March"),
// which is what the public destination page and the mobile API already render.
// The admin form edits it as two month dropdowns plus an optional note, and
// these functions convert between the two.
//
// Keeping the storage as a single string rather than splitting it into columns
// is deliberate: it needs no migration, the website is untouched, and - most
// importantly - it lets the seven destinations whose value isn't a simple
// range ("October – February (snow), March – June (valleys)") keep exactly the
// wording they have today.

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export type Month = (typeof MONTHS)[number];

export type BestTime = {
  from: string;
  to: string;
  note: string;
};

// En dash, matching every value already in the database.
const DASH = "–";

function isMonth(value: string): value is Month {
  return (MONTHS as readonly string[]).includes(value);
}

/**
 * Builds the stored string from the form's three inputs.
 *
 * A note on its own is returned verbatim - that is what carries the values
 * that were never a simple range, so re-saving one of those destinations
 * without touching the dropdowns writes back exactly what was there before.
 */
export function formatBestTime({ from, to, note }: BestTime): string {
  const trimmedNote = note.trim();

  if (isMonth(from) && isMonth(to)) {
    return trimmedNote ? `${from} ${DASH} ${to} (${trimmedNote})` : `${from} ${DASH} ${to}`;
  }

  return trimmedNote;
}

/**
 * Reads a stored value back into the form's three inputs.
 *
 * Only a clean "Month – Month" or "Month – Month (note)" fills the dropdowns.
 * Anything else - two ranges, abbreviated months, free prose - goes into the
 * note untouched, so nothing is silently reworded or dropped. Staff can then
 * set the dropdowns on that destination whenever they choose to.
 */
export function parseBestTime(value: string | null | undefined): BestTime {
  const text = (value ?? "").trim();
  if (!text) return { from: "", to: "", note: "" };

  // Both dash characters, since hand-typed values use a plain hyphen.
  //
  // The note is [^()]* rather than .* on purpose. A greedy .* spans from the
  // first "(" to the last ")", so "October – February (snow), March – June
  // (valleys)" parsed as October-February with a note of "snow), March – June
  // (valleys" - the dropdowns would then show a range that quietly discards
  // the second one. Refusing to match anything containing further brackets
  // sends the whole value to the note instead, which is the safe outcome.
  const match = /^([A-Za-z]+)\s*[–-]\s*([A-Za-z]+)(?:\s*\(([^()]*)\))?$/.exec(text);

  if (match) {
    const [, from, to, note] = match;
    if (isMonth(from) && isMonth(to)) {
      return { from, to, note: (note ?? "").trim() };
    }
  }

  return { from: "", to: "", note: text };
}
