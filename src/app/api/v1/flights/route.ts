import type { NextRequest } from "next/server";
import { getFlightsByFilter } from "@/lib/content/flights";
import type { FlightClass } from "@/data/flights";
import { apiError, apiSuccess } from "@/lib/api/respond";

const FLIGHT_CLASSES: FlightClass[] = ["economy", "premium-economy", "business", "first"];

// GET /api/v1/flights?departureCitySlug=delhi&destinationSlug=goa&flightClass=economy
export async function GET(request: NextRequest) {
  const departureCitySlug = request.nextUrl.searchParams.get("departureCitySlug");
  const destinationSlug = request.nextUrl.searchParams.get("destinationSlug");
  const flightClass = request.nextUrl.searchParams.get("flightClass") as FlightClass | null;

  if (!departureCitySlug) return apiError("Query param 'departureCitySlug' is required");
  if (!destinationSlug) return apiError("Query param 'destinationSlug' is required");
  if (!flightClass || !FLIGHT_CLASSES.includes(flightClass)) {
    return apiError(`Query param 'flightClass' must be one of: ${FLIGHT_CLASSES.join(", ")}`);
  }

  const flights = await getFlightsByFilter({ departureCitySlug, destinationSlug, flightClass });
  return apiSuccess(flights);
}
