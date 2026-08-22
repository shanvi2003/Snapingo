"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { allPackages } from "@/data/packages";
import PackageCard from "@/components/PackageCard";
import CustomSelect from "@/components/CustomSelect";

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

type Tab = "all" | "domestic" | "international";
type Sort = "popular" | "price-low" | "price-high" | "rating";

export default function PackagesGrid({ initialType }: { initialType: Tab }) {
  const [tab, setTab] = useState<Tab>(initialType);
  const [sort, setSort] = useState<Sort>("popular");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    let base = tab === "all" ? allPackages : allPackages.filter((p) => p.type === tab);

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter(
        (p) =>
          p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q)
      );
    }

    const sorted = [...base];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else sorted.sort((a, b) => b.reviews - a.reviews);

    return sorted;
  }, [tab, sort, query]);

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex w-full items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2.5 shadow-sm sm:w-64">
            <Search className="h-4 w-4 shrink-0 text-ink-900" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search packages..."
              className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
            />
          </label>

          <div className="sm:w-56">
            <CustomSelect
              value={sort}
              onChange={(v) => setSort(v as Sort)}
              options={sortOptions}
              placeholder="Sort by"
            />
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-ink-900">{list.length} packages found</p>

      {list.length === 0 ? (
        <p className="mt-16 text-center text-sm text-ink-900">
          No packages match your search. Try a different filter.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
}
