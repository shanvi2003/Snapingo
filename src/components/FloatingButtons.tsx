"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { WhatsappIcon } from "@/components/SocialIcons";
import { createLeadAction } from "@/lib/actions/leads";

const whatsappMessage = encodeURIComponent(
  "Hi Snapingo! I'd like to plan a trip. Can you help me with the packages?"
);

// Package detail pages show their own fixed booking bar at the bottom on
// mobile (StickyBookingCard) - lift these buttons above it there so the two
// fixed bars don't overlap.
function hasStickyBookingBar(pathname: string) {
  return /^\/packages\/[^/]+$/.test(pathname);
}

export default function FloatingButtons() {
  const pathname = usePathname();
  const [showTop, setShowTop] = useState(false);
  const liftForBookingBar = hasStickyBookingBar(pathname);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`print-hide fixed right-5 z-50 flex flex-col items-end gap-3 transition-[bottom] duration-300 sm:right-8 ${
        liftForBookingBar ? "bottom-24 lg:bottom-6" : "bottom-6 sm:bottom-8"
      }`}
    >
      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 bg-white text-ink-700 shadow-soft transition hover:text-brand-600"
          >
            <ArrowUp className="h-4.5 w-4.5" />
          </motion.button>
        )}
      </AnimatePresence>

      <motion.a
        href={`https://wa.me/918700368575?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Snapingo on WhatsApp"
        onClick={() =>
          createLeadAction({ source: "GENERAL_ENQUIRY", pageUrl: pathname }).catch((err) =>
            console.warn("Lead save failed", err)
          )
        }
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="relative grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-white shadow-xl"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
        <WhatsappIcon className="relative h-7 w-7" />
      </motion.a>
    </div>
  );
}
