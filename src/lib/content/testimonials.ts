import "server-only";
import { db } from "@/lib/db";
import type { Testimonial } from "@/data/testimonials";

export async function getAllTestimonials(): Promise<Testimonial[]> {
  const rows = await db.testimonial.findMany({ orderBy: { order: "asc" } });
  return rows.map((t) => ({
    id: t.id,
    name: t.name,
    location: t.location,
    avatar: t.avatar,
    rating: t.rating,
    trip: t.trip,
    quote: t.quote,
  }));
}
