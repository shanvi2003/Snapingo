"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Plane, Search } from "lucide-react";
import type { Flight } from "@/data/flights";

export type FlightSearchSummary = {
  tripTypeLabel: string;
  fromCityName: string;
  destinationName: string;
  classLabel: string;
  departDate: string;
  returnDate: string;
};

export default function FlightResultsList({
  flights,
  summary,
}: {
  flights: Flight[];
  summary: FlightSearchSummary;
}) {
  const [sentFor, setSentFor] = useState<string | null>(null);

  const handlePickFlight = (label: string) => {
    const lines = [
      "Hi Snapingo! I'd like to book a flight.",
      "",
      `Trip type: ${summary.tripTypeLabel}`,
      `From: ${summary.fromCityName}`,
      `To: ${summary.destinationName}`,
      `Class: ${summary.classLabel}`,
      `Departure date: ${summary.departDate || "TBD"}`,
      summary.tripTypeLabel === "Round-trip" ? `Return date: ${summary.returnDate || "TBD"}` : null,
      `Flight: ${label}`,
      "",
      "Please share pricing, availability and next steps.",
    ].filter((line): line is string => line !== null);
    const waHref = `https://wa.me/918700368575?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waHref, "_blank", "noopener,noreferrer");
    setSentFor(label);
  };

  if (sentFor) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </span>
        <h2 className="font-heading text-xl font-bold text-ink-900">You will be notified</h2>
        <Link
          href="/services/flights"
          className="mt-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
        >
          Back to Flights
        </Link>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center">
        <Search className="h-7 w-7 text-ink-400" />
        <h2 className="font-heading text-xl font-bold text-ink-900">No exact matches yet</h2>
        <p className="text-sm leading-relaxed text-ink-900">
          We don&apos;t have a listed match for this route yet, but our team can still find you
          the right flight to {summary.destinationName}.
        </p>
        <button
          type="button"
          onClick={() => handlePickFlight("Custom request (no listed match)")}
          className="mt-1 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
        >
          Ask Our Team Instead
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {flights.map((flight) => (
        <div
          key={flight.id}
          className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-heading text-base font-bold text-ink-900">
              {flight.airline}
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-ink-900">
              <span className="flex items-center gap-1 rounded-full bg-ink-50 px-2 py-0.5 font-semibold">
                <Plane className="h-3 w-3" />
                {flight.duration}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handlePickFlight(`${flight.airline} (${summary.fromCityName} to ${summary.destinationName})`)
            }
            className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
          >
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
}
