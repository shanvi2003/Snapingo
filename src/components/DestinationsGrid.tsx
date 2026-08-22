"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { domesticDestinations, internationalDestinations } from "@/data/destinations";
import DestinationCard from "@/components/DestinationCard";

type Tab = "all" | "domestic" | "international";

export default function DestinationsGrid({ initialType }: { initialType: Tab }) {
  const [tab, setTab] = useState<Tab>(initialType);
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const base =
      tab === "domestic"
        ? domesticDestinations
        : tab === "international"
          ? internationalDestinations
          : [...domesticDestinations, ...internationalDestinations];
    if (!query.trim()) return base;
    const q = query.trim().toLowerCase();
    return base.filter(
      (d) => d.name.toLowerCase().includes(q) || d.tagline.toLowerCase().includes(q)
    );
  }, [tab, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex shrink-0 gap-1.5 rounded-full border border-ink-100 bg-white p-1.5 shadow-sm">
          {(["all", "domestic", "international"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition ${
                tab === t ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="flex w-full items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2.5 shadow-sm sm:w-72">
          <Search className="h-4 w-4 shrink-0 text-ink-900" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search destinations..."
            className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </label>
      </div>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-900">
          No destinations match &ldquo;{query}&rdquo;. Try a different search.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((d, i) => (
            <DestinationCard key={d.slug} destination={d} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
