import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

// Auto-suggest for free-text fields: when staff start typing a package title,
// a destination, a hotel name or a vehicle, they see what has been entered
// before and can pick it instead of retyping.
//
// Deliberately NOT backed by a "saved suggestions" table.
//
// The brief describes storing each entered value so it can be offered later,
// but a second copy of data the database already holds is a liability: it
// drifts the moment a package is renamed or a quotation deleted, it needs its
// own cleanup, and it would happily keep suggesting a typo forever. Reading
// DISTINCT off the real columns means suggestions are always exactly the set
// of values actually in use - correcting a typo in the source removes it from
// the suggestions for free.
//
// At this data size (hundreds of rows) a DISTINCT scan is trivial. The
// per-request `cache` keeps one form render to a single query.

export type SuggestionField =
  | "packageTitle"
  | "destinationName"
  | "hotelName"
  | "vehicleName"
  | "city";

const MAX_SUGGESTIONS = 200;

function clean(values: (string | null)[]): string[] {
  const seen = new Map<string, string>();
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    // Case-insensitive de-dupe, keeping the first spelling seen - so
    // "Goa" and "goa" collapse to one entry rather than both being offered.
    const key = trimmed.toLowerCase();
    if (!seen.has(key)) seen.set(key, trimmed);
  }
  return [...seen.values()].sort((a, b) => a.localeCompare(b)).slice(0, MAX_SUGGESTIONS);
}

const loaders: Record<SuggestionField, () => Promise<(string | null)[]>> = {
  // Titles staff have used before, from both website packages and quotations.
  packageTitle: async () => {
    const [packages, leads] = await Promise.all([
      db.package.findMany({ select: { title: true }, distinct: ["title"] }),
      db.lead.findMany({
        where: { packageTitle: { not: null } },
        select: { packageTitle: true },
        distinct: ["packageTitle"],
      }),
    ]);
    return [...packages.map((p) => p.title), ...leads.map((l) => l.packageTitle)];
  },

  destinationName: async () => {
    const [destinations, quotations] = await Promise.all([
      db.destination.findMany({ select: { name: true }, distinct: ["name"] }),
      db.customPackage.findMany({ select: { destinationName: true }, distinct: ["destinationName"] }),
    ]);
    return [...destinations.map((d) => d.name), ...quotations.map((q) => q.destinationName)];
  },

  hotelName: async () => {
    const [hotels, stays] = await Promise.all([
      db.hotel.findMany({ select: { name: true }, distinct: ["name"] }),
      db.customPackageStay.findMany({ select: { hotelName: true }, distinct: ["hotelName"] }),
    ]);
    return [...hotels.map((h) => h.name), ...stays.map((s) => s.hotelName)];
  },

  vehicleName: async () => {
    const rows = await db.customPackage.findMany({
      where: { vehicleName: { not: null } },
      select: { vehicleName: true },
      distinct: ["vehicleName"],
    });
    return rows.map((r) => r.vehicleName);
  },

  city: async () => {
    const rows = await db.customPackageStay.findMany({
      where: { city: { not: null } },
      select: { city: true },
      distinct: ["city"],
    });
    return rows.map((r) => r.city);
  },
};

const load = cache(async (field: SuggestionField): Promise<string[]> => clean(await loaders[field]()));

export async function getSuggestions(field: SuggestionField): Promise<string[]> {
  return load(field);
}

/** Loads several lists in one go for a form that needs more than one. */
export async function getSuggestionSets<T extends SuggestionField>(
  fields: readonly T[]
): Promise<Record<T, string[]>> {
  const entries = await Promise.all(fields.map(async (f) => [f, await load(f)] as const));
  return Object.fromEntries(entries) as Record<T, string[]>;
}
