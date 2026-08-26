"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Plane, Search } from "lucide-react";
import type { Flight } from "@/data/flights";
import { createLeadAction } from "@/lib/actions/leads";

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

    createLeadAction({
      source: "FLIGHT_BOOKING",
      tripType: summary.tripTypeLabel,
      fromCityName: summary.fromCityName,
      destinationName: summary.destinationName,
      classLabel: summary.classLabel,
      startDate: summary.departDate || undefined,
      endDate: summary.tripTypeLabel === "Round-trip" ? (summary.returnDate || undefined) : undefined,
      flightLabel: label,
      pageUrl: window.location.pathname,
    }).catch((err) => console.warn("Lead save failed", err));
  };

  if (sentFor) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
          <CheckCircle2 className="h-10 w-10" />
        </motion.span>
        <h2 className="font-heading text-xl font-bold text-ink-900">Request Sent!</h2>
        <p className="text-sm text-ink-500">Our travel expert will share the best flight options on WhatsApp shortly.</p>
        <Link
          href="/services/flights"
          className="mt-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
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
