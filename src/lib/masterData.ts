import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { MasterListKey } from "@/generated/prisma/enums";

export type MasterOptionView = {
  value: string;
  label: string;
  icon: string | null;
  freeText: boolean;
};

// React's `cache` dedupes within a single render pass: a package page that
// renders a card, a detail panel and the print view all needing the inclusion
// list hits the database once, not three times. It is not a cross-request
// cache - `revalidatePath` after an admin edit is still what makes a change
// show up, and there's no stale window to reason about.
const loadList = cache(async (list: MasterListKey): Promise<MasterOptionView[]> => {
  const rows = await db.masterOption.findMany({
    where: { list },
    orderBy: [{ order: "asc" }, { label: "asc" }],
    select: { value: true, label: true, icon: true, freeText: true },
  });
  return rows;
});

/** Every option in a list, including ones retired from new forms. */
export async function getMasterList(list: MasterListKey): Promise<MasterOptionView[]> {
  return loadList(list);
}

/**
 * Only the options that should be offered on a form. Retired options stay out
 * of the picker but keep rendering wherever they're already saved, which is
 * why the two readers are separate.
 */
export async function getActiveMasterList(list: MasterListKey): Promise<MasterOptionView[]> {
  const rows = await db.masterOption.findMany({
    where: { list, isActive: true },
    orderBy: [{ order: "asc" }, { label: "asc" }],
    select: { value: true, label: true, icon: true, freeText: true },
  });
  return rows;
}

/**
 * value -> label for one list. Used anywhere a stored slug has to be shown to
 * a human. Falls back to the raw slug at the call site rather than throwing,
 * so a package referencing an option an admin has since deleted still renders.
 */
export async function getMasterLabels(list: MasterListKey): Promise<Map<string, string>> {
  const rows = await loadList(list);
  return new Map(rows.map((r) => [r.value, r.label]));
}
