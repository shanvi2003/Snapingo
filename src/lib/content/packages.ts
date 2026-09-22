import "server-only";
import { db } from "@/lib/db";
import type { Inclusion, TourPackage } from "@/data/packages";
import { getMasterList, type MasterOptionView } from "@/lib/masterData";
import { getEffectiveExclusions, resolveInclusions } from "@/lib/inclusionHelpers";

// DB-backed replacement for src/data/packages.ts. Every function here maps
// Prisma's result onto the exact same TourPackage shape the static file
// exported, so every existing component that takes a `TourPackage` prop
// needs zero changes — only the fetch call sites (pages) switch from a
// synchronous array import to an awaited call into this module.
function toTourPackage(
  pkg: {
    id: string;
    title: string;
    destination: string;
    destinationSlug: string;
    type: string;
    image: string;
    duration: string;
    price: number;
    originalPrice: number;
    rating: number;
    reviews: number;
    inclusions: string[];
    customInclusions: string[];
    exclusions: string[];
    highlights: string[];
    badge: string | null;
    featured: boolean;
    hotDeal: boolean;
    tripsSold: number;
    itinerary: { day: number; title: string; desc: string }[];
  },
  // The live PACKAGE_INCLUSION list, fetched once per request by the callers
  // below. Passed in rather than awaited here so this stays a plain mapping
  // function and one render never issues the same lookup N times.
  inclusionOptions: MasterOptionView[]
): TourPackage {
  return {
    id: pkg.id,
    title: pkg.title,
    destination: pkg.destination,
    destinationSlug: pkg.destinationSlug,
    type: pkg.type as "domestic" | "international",
    image: pkg.image,
    duration: pkg.duration,
    price: pkg.price,
    originalPrice: pkg.originalPrice,
    rating: pkg.rating,
    reviews: pkg.reviews,
    inclusions: pkg.inclusions as Inclusion[],
    inclusionDetails: resolveInclusions(pkg.inclusions, inclusionOptions, pkg.customInclusions),
    // Exclusions are derived from whatever wasn't ticked, unless this package
    // carries a curated list from before that rule existed.
    exclusions: getEffectiveExclusions(pkg.exclusions, pkg.inclusions, inclusionOptions),
    highlights: pkg.highlights,
    itinerary: pkg.itinerary.map((d) => ({ day: d.day, title: d.title, desc: d.desc })),
    badge: pkg.badge ?? undefined,
    featured: pkg.featured,
    hotDeal: pkg.hotDeal,
    tripsSold: pkg.tripsSold,
  };
}

const withItinerary = { itinerary: { orderBy: { day: "asc" as const } } };

// One lookup per request thanks to getMasterList's React cache, so calling
// this at the top of every reader below costs a single query no matter how
// many package lists a page renders.
const inclusionOptions = () => getMasterList("PACKAGE_INCLUSION");

export async function getAllPackages(): Promise<TourPackage[]> {
  const [rows, options] = await Promise.all([
    db.package.findMany({ include: withItinerary, orderBy: { title: "asc" } }),
    inclusionOptions(),
  ]);
  return rows.map((row) => toTourPackage(row, options));
}

export async function getPackageById(id: string): Promise<TourPackage | undefined> {
  const [row, options] = await Promise.all([
    db.package.findUnique({ where: { id }, include: withItinerary }),
    inclusionOptions(),
  ]);
  return row ? toTourPackage(row, options) : undefined;
}

export async function getFeaturedPackages(): Promise<TourPackage[]> {
  const [rows, options] = await Promise.all([
    db.package.findMany({ where: { featured: true }, include: withItinerary, orderBy: { title: "asc" } }),
    inclusionOptions(),
  ]);
  return rows.map((row) => toTourPackage(row, options));
}

export async function getHotDealPackages(): Promise<TourPackage[]> {
  const [rows, options] = await Promise.all([
    db.package.findMany({ where: { hotDeal: true }, include: withItinerary, orderBy: { title: "asc" } }),
    inclusionOptions(),
  ]);
  return rows.map((row) => toTourPackage(row, options));
}

export async function getPackagesByDestinationSlug(slug: string): Promise<TourPackage[]> {
  const [rows, options] = await Promise.all([
    db.package.findMany({ where: { destinationSlug: slug }, include: withItinerary, orderBy: { title: "asc" } }),
    inclusionOptions(),
  ]);
  return rows.map((row) => toTourPackage(row, options));
}

export async function getSimilarPackages({
  currentId,
  destinationSlug,
  type,
}: {
  currentId: string;
  destinationSlug: string;
  type: string;
}): Promise<TourPackage[]> {
  const [sameDestination, sameType] = await Promise.all([
    db.package.findMany({
      where: { id: { not: currentId }, destinationSlug },
      include: withItinerary,
      orderBy: { title: "asc" },
      take: 8,
    }),
    db.package.findMany({
      where: { id: { not: currentId }, type, destinationSlug: { not: destinationSlug } },
      include: withItinerary,
      orderBy: { title: "asc" },
      take: 8,
    }),
  ]);
  const options = await inclusionOptions();
  return [...sameDestination, ...sameType].slice(0, 8).map((row) => toTourPackage(row, options));
}

export async function getPackageIds(): Promise<string[]> {
  const rows = await db.package.findMany({ select: { id: true } });
  return rows.map((r) => r.id);
}

export async function getPackageItinerary(id: string) {
  const row = await db.package.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      duration: true,
      itinerary: {
        orderBy: { day: "asc" },
        select: { day: true, title: true, desc: true },
      },
    },
  });
  if (!row) return undefined;
  return { packageId: row.id, title: row.title, duration: row.duration, days: row.itinerary };
}
