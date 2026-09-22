import type { MasterOptionView } from "@/lib/masterData";

export type ResolvedInclusion = {
  value: string;
  label: string;
  icon: string | null;
};

/**
 * Turns the slugs stored on a package into displayable rows. An option an
 * admin has since deleted still renders - falling back to its own slug beats
 * silently dropping an inclusion the customer was told they were getting.
 */
export function resolveInclusions(
  stored: string[],
  options: MasterOptionView[],
  custom: string[] = []
): ResolvedInclusion[] {
  const byValue = new Map(options.map((o) => [o.value, o]));

  const fromMaster = stored
    // The "Other (Specify)" row is a UI affordance that opens a text box; the
    // text staff typed lives in `custom`, so showing the placeholder itself
    // would just add a meaningless "Other (Specify)" line to the customer's PDF.
    .filter((value) => !byValue.get(value)?.freeText)
    .map((value) => {
      const option = byValue.get(value);
      return { value, label: option?.label ?? value, icon: option?.icon ?? null };
    });

  const fromCustom = custom
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({ value: `custom:${text}`, label: text, icon: null }));

  return [...fromMaster, ...fromCustom];
}

/**
 * What the customer sees under Exclusions.
 *
 * Two parts, in this order:
 *   1. Automatic - every master inclusion the staff member did NOT tick. This
 *      is the rule the client asked for, so nobody has to keep the two lists
 *      in sync by hand.
 *   2. Additional - anything typed into the extra box (taxes, personal
 *      expenses, travel insurance...). These are real exclusions that aren't
 *      the inverse of an inclusion, so they can't be derived, and the 148
 *      pre-existing packages already carry exactly this kind of curated copy.
 *
 * De-duplicated case-insensitively so a staff member retyping something the
 * automatic half already covers doesn't print it twice.
 */
export function getEffectiveExclusions(
  additionalExclusions: string[],
  inclusions: string[],
  options: MasterOptionView[]
): string[] {
  const ticked = new Set(inclusions);
  const derived = options
    .filter((o) => !o.freeText && !ticked.has(o.value))
    .map((o) => o.label);

  const seen = new Set<string>();
  const result: string[] = [];

  for (const label of [...derived, ...additionalExclusions]) {
    const text = label.trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(text);
  }

  return result;
}
