import "server-only";
import { db } from "@/lib/db";
import type { Flight, FlightClass } from "@/data/flights";

export async function getFlightsByFilter({
  departureCitySlug,
  destinationSlug,
  flightClass,
}: {
  departureCitySlug: string;
  destinationSlug: string;
  flightClass: FlightClass;
}): Promise<Flight[]> {
  const rows = await db.flight.findMany({
    where: { departureCitySlug, destinationSlug, flightClass },
    orderBy: { price: "asc" },
  });
  return rows.map((f) => ({
    id: f.id,
    airline: f.airline,
    departureCitySlug: f.departureCitySlug,
    destinationSlug: f.destinationSlug,
    flightClass: f.flightClass as FlightClass,
    price: f.price,
    duration: f.duration,
  }));
}
