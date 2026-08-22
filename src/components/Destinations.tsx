"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { domesticDestinations, internationalDestinations } from "@/data/destinations";
import SectionHeading from "@/components/SectionHeading";
import DestinationCard from "@/components/DestinationCard";

export default function Destinations() {
  const [tab, setTab] = useState<"domestic" | "international">("domestic");
  const list = tab === "domestic" ? domesticDestinations : internationalDestinations;

  return (
    <section id="destinations" className="scroll-mt-24 bg-ink-50/60 pb-8 pt-8 sm:pb-10 sm:pt-10">
      <div className="container-app">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            title="Popular destinations"
            subtitle="Handpicked spots across India and the world, ready-made into full packages."
          />

          <div className="flex shrink-0 gap-1.5 rounded-full border border-ink-100 bg-white p-1.5 shadow-sm">
            {(["domestic", "international"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${
                  tab === t
                    ? "bg-brand-600 text-white shadow-brand"
                    : "text-ink-900 hover:text-brand-600"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {list.slice(0, 10).map((d, i) => (
            <DestinationCard key={d.slug + tab} destination={d} index={i} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/destinations?type=${tab}`}
            className="group inline-flex items-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-500 hover:text-brand-600"
          >
            View all {tab} destinations
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
