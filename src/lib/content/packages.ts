import "server-only";
import { db } from "@/lib/db";
import type { Inclusion, TourPackage } from "@/data/packages";

// DB-backed replacement for src/data/packages.ts. Every function here maps
// Prisma's result onto the exact same TourPackage shape the static file
// exported, so every existing component that takes a `TourPackage` prop
// needs zero changes — only the fetch call sites (pages) switch from a
// synchronous array import to an awaited call into this module.
function toTourPackage(pkg: {
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
  exclusions: string[];
  highlights: string[];
  badge: string | null;
  featured: boolean;
  hotDeal: boolean;
  itinerary: { day: number; title: string; desc: string }[];
}): TourPackage {
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
    exclusions: pkg.exclusions,
    highlights: pkg.highlights,
    itinerary: pkg.itinerary.map((d) => ({ day: d.day, title: d.title, desc: d.desc })),
    badge: pkg.badge ?? undefined,
    featured: pkg.featured,
    hotDeal: pkg.hotDeal,
  };
}

const withItinerary = { itinerary: { orderBy: { day: "asc" as const } } };

export async function getAllPackages(): Promise<TourPackage[]> {
  const rows = await db.package.findMany({ include: withItinerary, orderBy: { title: "asc" } });
  return rows.map(toTourPackage);
}

export async function getPackageById(id: string): Promise<TourPackage | undefined> {
  const row = await db.package.findUnique({ where: { id }, include: withItinerary });
  return row ? toTourPackage(row) : undefined;
}

export async function getFeaturedPackages(): Promise<TourPackage[]> {
  const rows = await db.package.findMany({ where: { featured: true }, include: withItinerary, orderBy: { title: "asc" } });
  return rows.map(toTourPackage);
}

export async function getHotDealPackages(): Promise<TourPackage[]> {
  const rows = await db.package.findMany({ where: { hotDeal: true }, include: withItinerary, orderBy: { title: "asc" } });
  return rows.map(toTourPackage);
}

export async function getPackagesByDestinationSlug(slug: string): Promise<TourPackage[]> {
  const rows = await db.package.findMany({ where: { destinationSlug: slug }, include: withItinerary, orderBy: { title: "asc" } });
  return rows.map(toTourPackage);
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
  return [...sameDestination, ...sameType].slice(0, 8).map(toTourPackage);
}

export async function getPackageIds(): Promise<string[]> {
  const rows = await db.package.findMany({ select: { id: true } });
  return rows.map((r) => r.id);
}
