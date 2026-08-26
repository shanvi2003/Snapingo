import "server-only";
import { db } from "@/lib/db";
import type { Service } from "@/data/services";

function toService(s: {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  overview: string;
  highlights: { icon: string; title: string; desc: string }[];
}): Service {
  return {
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    image: s.image,
    overview: s.overview,
    highlights: s.highlights.map((h) => ({ icon: h.icon, title: h.title, desc: h.desc })),
  };
}

export async function getAllServices(): Promise<Service[]> {
  const rows = await db.service.findMany({ include: { highlights: true }, orderBy: { name: "asc" } });
  return rows.map(toService);
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const row = await db.service.findUnique({ where: { slug }, include: { highlights: true } });
  return row ? toService(row) : undefined;
}
