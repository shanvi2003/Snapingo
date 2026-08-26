import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, MapPin, Star, Wallet } from "lucide-react";
import { getDomesticDestinations, getInternationalDestinations } from "@/lib/content/destinations";
import { getHotelsByFilter } from "@/lib/content/hotels";
import {
  hotelCategoryLabels,
  priceRangeLabels,
  type HotelCategory,
  type PriceRange,
} from "@/data/hotels";
import HotelResultsList from "@/components/HotelResultsList";

export const metadata: Metadata = {
  title: "Hotel Search Results | Snapingo",
  description: "Hotels matching your destination, budget and travel dates.",
};

const VALID_CATEGORIES: HotelCategory[] = ["3-star", "4-star", "5-star", "luxury"];
const VALID_PRICE_RANGES: PriceRange[] = ["any", "under-5k", "5k-10k", "10k-20k", "20k-plus"];

export default async function HotelResultsPage({
  searchParams,
}: {
  searchParams: Promise<{
    tripType?: string;
    destination?: string;
    category?: string;
    price?: string;
    checkIn?: string;
    checkOut?: string;
  }>;
}) {
  const params = await searchParams;
  const tripType = params.tripType === "international" ? "international" : "domestic";
  const destinationSlug = params.destination ?? "";
  const category = VALID_CATEGORIES.includes(params.category as HotelCategory)
    ? (params.category as HotelCategory)
    : null;
  const priceRange = VALID_PRICE_RANGES.includes(params.price as PriceRange)
    ? (params.price as PriceRange)
    : "any";
  const checkIn = params.checkIn ?? "";
  const checkOut = params.checkOut ?? "";

  const destinationList = tripType === "domestic" ? await getDomesticDestinations() : await getInternationalDestinations();
  const destination = destinationList.find((d) => d.slug === destinationSlug);

  if (!destination || !category) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center pb-16 pt-28 sm:pt-32">
        <div className="container-app">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center">
            <h1 className="font-heading text-xl font-bold text-ink-900">
              Start a hotel search first
            </h1>
            <p className="text-sm leading-relaxed text-ink-900">
              We couldn&apos;t find search details for this link. Head back and use the hotel
              finder to search by destination, budget and dates.
            </p>
            <Link
              href="/services/hotels"
              className="mt-1 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
            >
              Find a Hotel
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const hotels = await getHotelsByFilter({ destinationSlug, category, priceRange });

  const summary = {
    tripTypeLabel: tripType === "domestic" ? "Domestic" : "International",
    destinationName: destination.name,
    categoryLabel: hotelCategoryLabels[category],
    priceLabel: priceRangeLabels[priceRange],
    checkIn,
    checkOut,
  };

  return (
    <section className="pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div className="container-app">
        <h1 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
          Hotels in {destination.name}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink-900">
          <span className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-brand-500" />
            {summary.tripTypeLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5">
            <Star className="h-3.5 w-3.5 text-brand-500" />
            {summary.categoryLabel}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5">
            <Wallet className="h-3.5 w-3.5 text-brand-500" />
            {summary.priceLabel}
          </span>
          {checkIn && checkOut && (
            <span className="flex items-center gap-1.5 rounded-full bg-ink-50 px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-brand-500" />
              {checkIn} &ndash; {checkOut}
            </span>
          )}
        </div>

        {hotels.length > 0 && (
          <p className="mt-6 text-sm font-semibold text-ink-900">
            {hotels.length} {hotels.length === 1 ? "hotel" : "hotels"} found
          </p>
        )}

        <div className="mt-8">
          <HotelResultsList hotels={hotels} summary={summary} />
        </div>
      </div>
    </section>
  );
}
