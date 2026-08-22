import { hotels, hotelCategoryLabels, type Hotel, type HotelCategory } from "@/data/hotels";
import type { TourPackage } from "@/data/packages";

function inferHotelCategory(pkg: TourPackage): HotelCategory {
  if (pkg.price >= 20000) return "luxury";
  if (pkg.price >= 12000) return "5-star";
  if (pkg.price >= 7000) return "4-star";
  return "3-star";
}

export function getAccommodationForPackage(pkg: TourPackage): {
  hotel: Hotel | null;
  categoryLabel: string;
} {
  const category = inferHotelCategory(pkg);
  const matches = hotels.filter((h) => h.destinationSlug === pkg.destinationSlug);
  const hotel = matches.find((h) => h.category === category) ?? matches[0] ?? null;
  return { hotel, categoryLabel: hotelCategoryLabels[category] };
}

export function inferVehicleType(pkg: TourPackage): string {
  const text = `${pkg.title} ${pkg.highlights.join(" ")} ${pkg.itinerary
    .map((d) => `${d.title} ${d.desc}`)
    .join(" ")}`.toLowerCase();

  if (text.includes("volvo")) return "AC Volvo Coach (shared seating)";
  if (text.includes("houseboat")) return "Private AC vehicle + houseboat transfer";
  if (text.includes("backpacking") || text.includes("group tour") || text.includes("trek"))
    return "AC Tempo Traveller / Sedan (shared, group basis)";
  if (pkg.title.toLowerCase().includes("honeymoon") || pkg.price >= 20000)
    return "Private AC SUV (Innova or equivalent)";
  return "Private AC Sedan (Dzire or equivalent)";
}

export type NightStayBlock = {
  city: string;
  nights: number;
  hotel: Hotel | null;
  categoryLabel: string;
};

function extractCandidateCities(destination: string): string[] {
  return destination
    .replace(/,?\s*India$/i, "")
    .split(/,|&/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function detectCityForDay(dayTitle: string, candidates: string[]): string | null {
  let found: { city: string; index: number } | null = null;
  for (const city of candidates) {
    const idx = dayTitle.toLowerCase().lastIndexOf(city.toLowerCase());
    if (idx !== -1 && (!found || idx > found.index)) {
      found = { city, index: idx };
    }
  }
  return found?.city ?? null;
}

/**
 * For packages spanning multiple named cities (e.g. "Shimla, Manali &
 * Dalhousie"), splits the itinerary into consecutive per-city night blocks
 * and finds a hotel whose name mentions that city. Returns an empty array
 * for single-destination packages, where the simpler single-hotel
 * `getAccommodationForPackage` view is more appropriate.
 */
export function getNightStayBreakdown(pkg: TourPackage): NightStayBlock[] {
  const candidates = extractCandidateCities(pkg.destination);
  if (candidates.length <= 1) return [];

  let currentCity: string | null = null;
  const blocks: { city: string; nights: number }[] = [];

  for (const day of pkg.itinerary) {
    const detected: string | null = detectCityForDay(day.title, candidates) ?? currentCity;
    if (!detected) continue;
    const last = blocks[blocks.length - 1];
    if (last && last.city === detected) {
      last.nights += 1;
    } else {
      blocks.push({ city: detected, nights: 1 });
    }
    currentCity = detected;
  }

  if (blocks.length <= 1) return [];

  const category = inferHotelCategory(pkg);
  const regionMatches = hotels.filter((h) => h.destinationSlug === pkg.destinationSlug);

  return blocks.map((b) => {
    const cityMatches = regionMatches.filter((h) =>
      h.name.toLowerCase().includes(b.city.toLowerCase())
    );
    const hotel = cityMatches.find((h) => h.category === category) ?? cityMatches[0] ?? null;
    return { city: b.city, nights: b.nights, hotel, categoryLabel: hotelCategoryLabels[category] };
  });
}
