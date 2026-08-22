"use client";

import { motion } from "framer-motion";
import type { ItineraryDay } from "@/data/packages";

export default function ItineraryTimeline({ days }: { days: ItineraryDay[] }) {
  return (
    <ol className="relative">
      <div
        aria-hidden
        className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-300 via-ink-200 to-transparent sm:left-[23px]"
      />
      {days.map((day, i) => (
        <motion.li
          key={day.day}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.45, delay: i * 0.06 }}
          className="print-show-opaque relative flex gap-5 pb-9 last:pb-0 sm:gap-6"
        >
          <span className="relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white shadow-brand sm:h-12 sm:w-12 sm:text-base">
            {String(day.day).padStart(2, "0")}
          </span>
          <div className="pt-1.5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-500">
              Day {day.day}
            </p>
            <h3 className="mt-1 font-heading text-lg font-bold text-ink-900">{day.title}</h3>
            <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-900">{day.desc}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
