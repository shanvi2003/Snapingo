import "server-only";
import { db } from "@/lib/db";
import type { Hotel, HotelCategory, PriceRange } from "@/data/hotels";

function priceRangeToBounds(range: PriceRange): { gte?: number; lt?: number } {
  switch (range) {
    case "under-5k":
      return { lt: 5000 };
    case "5k-10k":
      return { gte: 5000, lt: 10000 };
    case "10k-20k":
      return { gte: 10000, lt: 20000 };
    case "20k-plus":
      return { gte: 20000 };
    default:
      return {};
  }
}

export async function getHotelsByFilter({
  destinationSlug,
  category,
  priceRange,
}: {
  destinationSlug: string;
  category: HotelCategory;
  priceRange: PriceRange;
}): Promise<Hotel[]> {
  const rows = await db.hotel.findMany({
    where: { destinationSlug, category, pricePerNight: priceRangeToBounds(priceRange) },
    orderBy: { pricePerNight: "asc" },
  });
  return rows.map((h) => ({
    id: h.id,
    name: h.name,
    destinationSlug: h.destinationSlug,
    category: h.category as HotelCategory,
    pricePerNight: h.pricePerNight,
    rating: h.rating,
  }));
}
