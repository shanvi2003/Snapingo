import type { NextRequest } from "next/server";
import { getHotelsByFilter } from "@/lib/content/hotels";
import type { HotelCategory, PriceRange } from "@/data/hotels";
import { apiError, apiSuccess } from "@/lib/api/respond";

const HOTEL_CATEGORIES: HotelCategory[] = ["3-star", "4-star", "5-star", "luxury"];
const PRICE_RANGES: PriceRange[] = ["any", "under-5k", "5k-10k", "10k-20k", "20k-plus"];

// GET /api/v1/hotels?destinationSlug=goa&category=4-star&priceRange=10k-20k
export async function GET(request: NextRequest) {
  const destinationSlug = request.nextUrl.searchParams.get("destinationSlug");
  const category = request.nextUrl.searchParams.get("category") as HotelCategory | null;
  const priceRange = (request.nextUrl.searchParams.get("priceRange") as PriceRange | null) ?? "any";

  if (!destinationSlug) return apiError("Query param 'destinationSlug' is required");
  if (!category || !HOTEL_CATEGORIES.includes(category)) {
    return apiError(`Query param 'category' must be one of: ${HOTEL_CATEGORIES.join(", ")}`);
  }
  if (!PRICE_RANGES.includes(priceRange)) {
    return apiError(`Query param 'priceRange' must be one of: ${PRICE_RANGES.join(", ")}`);
  }

  const hotels = await getHotelsByFilter({ destinationSlug, category, priceRange });
  return apiSuccess(hotels);
}
