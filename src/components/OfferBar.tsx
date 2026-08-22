"use client";

import { useState } from "react";
import { X } from "lucide-react";

const messages = [
  "✈️ Flat 20% OFF on International Packages, limited seats",
  "🏨 Free hotel upgrade on bookings above ₹25,000",
  "📞 Talk to a travel expert now: +91 87003 68575",
  "🎉 Zero-cost EMI available on all holiday packages",
];

export default function OfferBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="print-hide relative overflow-hidden bg-ink-900 text-white text-xs sm:text-sm">
      <div className="flex w-full items-center justify-between gap-4 py-2 pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
        <div className="flex-1 overflow-hidden mask-fade-x">
          <div className="flex w-max animate-marquee gap-16 whitespace-nowrap hover:[animation-play-state:paused]">
            {[...messages, ...messages].map((msg, i) => (
              <span key={i} className="opacity-90">
                {msg}
              </span>
            ))}
          </div>
        </div>
        <button
          aria-label="Dismiss offer bar"
          onClick={() => setVisible(false)}
          className="shrink-0 rounded-full p-1 text-white transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
