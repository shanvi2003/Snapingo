import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Plane } from "lucide-react";
import { domesticDestinations, internationalDestinations } from "@/data/destinations";
import {
  flightClassLabels,
  getFlightsByFilter,
  majorIndianCities,
  type FlightClass,
} from "@/data/flights";
import FlightResultsList from "@/components/FlightResultsList";

export const metadata: Metadata = {
  title: "Flight Search Results | Snapingo",
  description: "Flights matching your route, class and travel dates.",
};

const VALID_CLASSES: FlightClass[] = ["economy", "premium-economy", "business", "first"];

export default async function FlightResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tripType?: string;
    from?: string;
    to?: string;
    flightClass?: string;
    departDate?: string;
    returnDate?: string;
  }>;
}) {
  const params = await searchParams;
  const tripType = params.tripType === "one-way" ? "one-way" : "round-trip";
  const departureCitySlug = params.from ?? "";
  const destinationSlug = params.to ?? "";
  const flightClass = VALID_CLASSES.includes(params.flightClass as FlightClass)
    ? (params.flightClass as FlightClass)
    : null;
  const departDate = params.departDate ?? "";
  const returnDate = params.returnDate ?? "";

  const departureCity = majorIndianCities.find((c) => c.slug === departureCitySlug);
  const destination = [...domesticDestinations, ...internationalDestinations].find(
    (d) => d.slug === destinationSlug
  );

  if (!departureCity || !destination || !flightClass) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center pb-16 pt-28 sm:pt-32">
        <div className="container-app">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center">
            <h1 className="font-heading text-xl font-bold text-ink-900">
              Start a flight search first
            </h1>
            <p className="text-sm leading-relaxed text-ink-900">
              We couldn&apos;t find search details for this link. Head back and use the flight
              finder to search by route, class and dates.
            </p>
            <Link
              href="/services/flights"
              className="mt-1 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
            >
              Find a Flight
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const flights = getFlightsByFilter({ departureCitySlug, destinationSlug, flightClass });

  const summary = {
    tripTypeLabel: tripType === "one-way" ? "One-way" : "Round-trip",
    fromCityName: departureCity.name,
    destinationName: destination.name,
    classLabel: flightClassLabels[flightClass],
    departDate,
    returnDate,
  };

  return (
    <section className="pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div className="container-app">
        <h1 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
          Flights: {departureCity.name.split(" (")[0]} &rarr; {destination.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-900">
          <span className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand-500" />
            {summary.tripTypeLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5">
            <Plane className="h-3.5 w-3.5 text-brand-500" />
            {summary.classLabel}
          </span>
          {departDate && (
            <span className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-500" />
              {departDate}
              {tripType === "round-trip" && returnDate ? ` – ${returnDate}` : ""}
            </span>
          )}
        </div>

        {flights.length > 0 && (
          <p className="mt-6 text-sm font-semibold text-ink-900">
            {flights.length} {flights.length === 1 ? "flight" : "flights"} found
          </p>
        )}

        <div className="mt-8">
          <FlightResultsList flights={flights} summary={summary} />
        </div>
      </div>
    </section>
  );
}
