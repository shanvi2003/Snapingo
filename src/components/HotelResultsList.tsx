"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Search, Star } from "lucide-react";
import { hotelCategoryLabels, type Hotel } from "@/data/hotels";
import { createLeadAction } from "@/lib/actions/leads";

export type SearchSummary = {
  tripTypeLabel: string;
  destinationName: string;
  categoryLabel: string;
  priceLabel: string;
  checkIn: string;
  checkOut: string;
};

export default function HotelResultsList({
  hotels,
  summary,
}: {
  hotels: Hotel[];
  summary: SearchSummary;
}) {
  const [sentFor, setSentFor] = useState<string | null>(null);

  const handlePickHotel = (hotelName: string, pricePerNight: number) => {
    const lines = [
      "Hi Snapingo! I'd like to book a hotel.",
      "",
      `Trip type: ${summary.tripTypeLabel}`,
      `Destination: ${summary.destinationName}`,
      `Star category: ${summary.categoryLabel}`,
      `Price range: ${summary.priceLabel}`,
      `Check-in: ${summary.checkIn || "TBD"}`,
      `Check-out: ${summary.checkOut || "TBD"}`,
      pricePerNight > 0
        ? `Hotel: ${hotelName} (₹${pricePerNight.toLocaleString("en-IN")}/person/night)`
        : `Hotel: ${hotelName}`,
      "",
      "Please confirm availability and next steps.",
    ];
    const waHref = `https://wa.me/918700368575?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waHref, "_blank", "noopener,noreferrer");
    setSentFor(hotelName);

    createLeadAction({
      source: "HOTEL_BOOKING",
      tripType: summary.tripTypeLabel,
      destinationName: summary.destinationName,
      categoryLabel: summary.categoryLabel,
      priceLabel: summary.priceLabel,
      startDate: summary.checkIn || undefined,
      endDate: summary.checkOut || undefined,
      hotelName,
      pricePerNight: pricePerNight > 0 ? pricePerNight : undefined,
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
        <p className="text-sm text-ink-500">Our travel expert will share the best hotel options on WhatsApp shortly.</p>
        <Link
          href="/services/hotels"
          className="mt-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
        >
          Back to Hotels
        </Link>
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-6 py-14 text-center">
        <Search className="h-7 w-7 text-ink-400" />
        <h2 className="font-heading text-xl font-bold text-ink-900">No exact matches yet</h2>
        <p className="text-sm leading-relaxed text-ink-900">
          We don&apos;t have a listed match for this combination yet, but our team can still find
          you the right stay for {summary.destinationName}.
        </p>
        <button
          type="button"
          onClick={() => handlePickHotel("Custom request (no listed match)", 0)}
          className="mt-1 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
        >
          Ask Our Team Instead
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {hotels.map((hotel) => (
        <div
          key={hotel.id}
          className="flex flex-col gap-3 rounded-2xl border border-ink-100 bg-white px-5 py-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-heading text-base font-bold text-ink-900">
                {hotel.name}
              </p>
              <p className="mt-1.5 flex items-center gap-2 text-xs text-ink-900">
                <span className="rounded-full bg-ink-50 px-2 py-0.5 font-semibold">
                  {hotelCategoryLabels[hotel.category]}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
                  {hotel.rating}
                </span>
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="font-heading text-lg font-bold text-brand-600">
                ₹{hotel.pricePerNight.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] font-semibold text-ink-900">/person/night</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handlePickHotel(hotel.name, hotel.pricePerNight)}
            className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
          >
            Book Now
          </button>
        </div>
      ))}
    </div>
  );
}
