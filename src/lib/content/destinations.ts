import "server-only";
import { db } from "@/lib/db";
import type { Destination } from "@/data/destinations";

function toDestination(d: {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  gallery: string[];
  packagesCount: number;
  startingPrice: number;
  type: string;
  overview: string;
  bestTimeToVisit: string;
  idealDuration: string;
  highlights: { icon: string; title: string; desc: string }[];
}): Destination {
  return {
    slug: d.slug,
    name: d.name,
    tagline: d.tagline,
    image: d.image,
    gallery: d.gallery,
    packages: d.packagesCount,
    startingPrice: d.startingPrice,
    type: d.type as "domestic" | "international",
    overview: d.overview,
    highlights: d.highlights.map((h) => ({ icon: h.icon, title: h.title, desc: h.desc })),
    bestTimeToVisit: d.bestTimeToVisit,
    idealDuration: d.idealDuration,
  };
}

const withHighlights = { highlights: true };

export async function getAllDestinations(): Promise<Destination[]> {
  const rows = await db.destination.findMany({ include: withHighlights, orderBy: { name: "asc" } });
  return rows.map(toDestination);
}

export async function getDomesticDestinations(): Promise<Destination[]> {
  const rows = await db.destination.findMany({ where: { type: "domestic" }, include: withHighlights, orderBy: { name: "asc" } });
  return rows.map(toDestination);
}

export async function getInternationalDestinations(): Promise<Destination[]> {
  const rows = await db.destination.findMany({ where: { type: "international" }, include: withHighlights, orderBy: { name: "asc" } });
  return rows.map(toDestination);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | undefined> {
  const row = await db.destination.findUnique({ where: { slug }, include: withHighlights });
  return row ? toDestination(row) : undefined;
}

export async function getDestinationSlugs(): Promise<string[]> {
  const rows = await db.destination.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

// Lightweight - just names, for populating a destination picker (e.g. the
// booking form's destination dropdown) without pulling in highlights/gallery.
export async function getDestinationNames(): Promise<string[]> {
  const rows = await db.destination.findMany({ select: { name: true }, orderBy: { name: "asc" } });
  return rows.map((r) => r.name);
}
