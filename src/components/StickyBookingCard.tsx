"use client";

import { Download, Phone, ShieldCheck, Star } from "lucide-react";
import DownloadPdfButton from "@/components/DownloadPdfButton";
import { WhatsappIcon } from "@/components/SocialIcons";

export default function StickyBookingCard({
  title,
  price,
  originalPrice,
  rating,
  reviews,
  duration,
}: {
  title: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  duration: string;
}) {
  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  const waMessage = encodeURIComponent(
    `Hi Snapingo! I'm interested in the "${title}" package (${duration}). Can you share more details?`
  );
  const waHref = `https://wa.me/918700368575?text=${waMessage}`;

  return (
    <>
      {/* Desktop sidebar card */}
      <div className="hidden lg:block">
        <div className="sticky top-28 rounded-2xl border border-ink-100 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-gold-500 text-gold-500" />
            <span className="text-sm font-bold text-ink-900">{rating}</span>
            <span className="text-xs text-ink-900">
              ({reviews.toLocaleString("en-IN")} reviews)
            </span>
          </div>

          <div className="mt-4 flex items-end gap-2">
            <p className="font-heading text-3xl font-bold text-ink-900">
              ₹{price.toLocaleString("en-IN")}
            </p>
            <p className="pb-1 text-sm text-ink-900 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-600">{discount}% off</span>
            <span className="text-xs text-ink-900">per person</span>
          </div>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
          >
            <WhatsappIcon className="h-4.5 w-4.5" />
            Book on WhatsApp
          </a>
          <a
            href="tel:+918700368575"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-brand-400 hover:text-brand-600"
          >
            <Phone className="h-4 w-4" />
            Talk to a Travel Expert
          </a>

          <DownloadPdfButton />

          <p className="mt-5 flex items-center gap-2 text-xs text-ink-900">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            No hidden costs, price is fully transparent.
          </p>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-100 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.2)] backdrop-blur-lg lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] text-ink-900 line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </p>
            <p className="font-heading text-lg font-bold text-ink-900">
              ₹{price.toLocaleString("en-IN")}
              <span className="ml-1 text-xs font-normal text-ink-900">/person</span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              aria-label="Download itinerary PDF"
              className="print-hide grid h-11 w-11 shrink-0 place-items-center rounded-full border border-ink-200 text-ink-800"
            >
              <Download className="h-4.5 w-4.5" />
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-brand"
            >
              <WhatsappIcon className="h-4 w-4" />
              Book Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
