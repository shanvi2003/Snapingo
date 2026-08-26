"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, SlidersHorizontal, X } from "lucide-react";
import type { Inclusion, TourPackage } from "@/data/packages";
import PackageCard from "@/components/PackageCard";
import CustomSelect from "@/components/CustomSelect";
import { useScrollLock } from "@/hooks/useScrollLock";
import {
  budgetBucketOptions,
  durationBucketOptions,
  getPackageDurationDays,
  inferPackageCategories,
  matchesBudgetBucket,
  matchesDurationBucket,
  packageCategoryOptions,
  type BudgetBucket,
  type DurationBucket,
  type PackageCategory,
} from "@/lib/packageCategoryHelpers";

const sortOptions = [
  { value: "popular", label: "Most Popular" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

const inclusionOptions: { value: Inclusion; label: string }[] = [
  { value: "flight", label: "Flights" },
  { value: "hotel", label: "Hotel" },
  { value: "meals", label: "Meals" },
  { value: "transfer", label: "Transfers" },
  { value: "sightseeing", label: "Sightseeing" },
];

type DestType = "domestic" | "international";
type Sort = "popular" | "price-low" | "price-high" | "rating";

function toggleInSet<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-sm text-ink-700 transition hover:bg-brand-50/60">
      <span className="relative flex h-4.5 w-4.5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-md border border-ink-300 bg-white transition checked:border-brand-600 checked:bg-brand-600 group-hover:border-brand-400"
        />
        <Check className="pointer-events-none relative h-3 w-3 scale-0 text-white transition-transform peer-checked:scale-100" />
      </span>
      <span className={checked ? "font-semibold text-ink-900" : ""}>{label}</span>
    </label>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-100 py-5 first:pt-0">
      <p className="font-heading text-sm font-bold text-ink-900">{title}</p>
      <div className="mt-2 space-y-0.5">{children}</div>
    </div>
  );
}

export default function PackagesGrid({
  allPackages,
  initialType,
  initialCategory,
}: {
  allPackages: TourPackage[];
  initialType: DestType | "all";
  initialCategory: PackageCategory | null;
}) {
  // Exclusive, radio-like selection (not a checkbox set) - picking a type
  // shows only that type, picking the same one again clears back to all.
  const [destType, setDestType] = useState<DestType | null>(
    initialType === "all" ? null : initialType
  );
  // Exclusive, tab-like selection (not a checkbox set) - picking a category
  // shows only that category, picking the same one again clears back to all.
  const [activeCategory, setActiveCategory] = useState<PackageCategory | null>(
    initialCategory ?? null
  );
  // Exclusive, radio-like selection (not a checkbox set) - picking a bucket
  // shows only that bucket, picking the same one again clears back to all.
  const [duration, setDuration] = useState<DurationBucket | null>(null);
  const [budget, setBudget] = useState<BudgetBucket | null>(null);
  const [inclusions, setInclusions] = useState<Set<Inclusion>>(new Set());
  const [sort, setSort] = useState<Sort>("popular");
  const [query, setQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  useScrollLock(mobileFiltersOpen);

  // The sidebar must fully scroll into view before its own overflow-y-auto
  // can reach the end - a static max-height (e.g. calc(100vh-8rem)) assumes
  // it's already stuck at top-28, which isn't true until the page has been
  // scrolled that far. This measures the real remaining viewport space from
  // the aside's current position and keeps it in sync as that changes.
  useEffect(() => {
    const aside = asideRef.current;
    if (!aside) return;

    const recalc = () => {
      const top = aside.getBoundingClientRect().top;
      const available = window.innerHeight - top - 16;
      aside.style.maxHeight = `${Math.max(200, available)}px`;
    };

    recalc();
    window.addEventListener("scroll", recalc, { passive: true });
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("scroll", recalc);
      window.removeEventListener("resize", recalc);
    };
  }, []);

  const list = useMemo(() => {
    let base = allPackages;

    if (destType) {
      base = base.filter((p) => p.type === destType);
    }
    if (activeCategory) {
      base = base.filter((p) => inferPackageCategories(p).includes(activeCategory));
    }
    if (duration) {
      base = base.filter((p) => matchesDurationBucket(getPackageDurationDays(p), duration));
    }
    if (budget) {
      base = base.filter((p) => matchesBudgetBucket(p.price, budget));
    }
    if (inclusions.size > 0) {
      base = base.filter((p) => [...inclusions].some((inc) => p.inclusions.includes(inc)));
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter(
        (p) => p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q)
      );
    }

    const sorted = [...base];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else sorted.sort((a, b) => b.reviews - a.reviews);

    return sorted;
  }, [allPackages, destType, activeCategory, duration, budget, inclusions, query, sort]);

  const activeFilterCount =
    (destType ? 1 : 0) +
    (activeCategory ? 1 : 0) +
    (duration ? 1 : 0) +
    (budget ? 1 : 0) +
    inclusions.size;

  const resetFilters = () => {
    setDestType(null);
    setActiveCategory(null);
    setDuration(null);
    setBudget(null);
    setInclusions(new Set());
  };

  const filterPanel = (
    <>
      <FilterSection title="Type of Destination">
        <FilterCheckbox label="All" checked={destType === null} onChange={() => setDestType(null)} />
        <FilterCheckbox
          label="Domestic"
          checked={destType === "domestic"}
          onChange={() => setDestType((d) => (d === "domestic" ? null : "domestic"))}
        />
        <FilterCheckbox
          label="International"
          checked={destType === "international"}
          onChange={() => setDestType((d) => (d === "international" ? null : "international"))}
        />
      </FilterSection>

      <FilterSection title="Duration (in Days)">
        {durationBucketOptions.map((opt) => (
          <FilterCheckbox
            key={opt.value}
            label={opt.label}
            checked={duration === opt.value}
            onChange={() => setDuration((d) => (d === opt.value ? null : opt.value))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Budget Per Person">
        {budgetBucketOptions.map((opt) => (
          <FilterCheckbox
            key={opt.value}
            label={opt.label}
            checked={budget === opt.value}
            onChange={() => setBudget((b) => (b === opt.value ? null : opt.value))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Inclusions">
        <FilterCheckbox
          label="All"
          checked={inclusions.size === 0}
          onChange={() => setInclusions(new Set())}
        />
        {inclusionOptions.map((opt) => (
          <FilterCheckbox
            key={opt.value}
            label={opt.label}
            checked={inclusions.has(opt.value)}
            onChange={() => setInclusions((s) => toggleInSet(s, opt.value))}
          />
        ))}
      </FilterSection>
    </>
  );

  return (
    <div>
      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden">
        {packageCategoryOptions.map((opt) => {
          const active = activeCategory === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveCategory(active ? null : opt.value)}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-brand"
                  : "border-ink-200 bg-white text-ink-900 hover:border-brand-400 hover:text-brand-600"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
      <aside
        ref={asideRef}
        className="scrollbar-thin sticky top-28 hidden self-start overflow-y-auto overscroll-contain border-r border-ink-100 pr-5 lg:block"
      >
        <div className="flex items-center justify-between">
          <p className="font-heading text-base font-bold text-ink-900">Filters</p>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Reset
            </button>
          )}
        </div>
        {filterPanel}
      </aside>

      <div>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-ink-100 bg-white px-5 py-2.5 text-sm font-semibold text-ink-900 shadow-sm lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex flex-col gap-3 sm:flex-row lg:ml-auto">
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
            No packages match your filters. Try removing some.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </div>
      </div>

      {mobileFiltersOpen && (
        <div
          onClick={() => setMobileFiltersOpen(false)}
          className="fixed inset-0 z-[60] flex items-end bg-ink-950/60 backdrop-blur-sm lg:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-4"
          >
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <p className="font-heading text-base font-bold text-ink-900">Filters</p>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-xs font-semibold text-brand-600"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Close filters"
                  onClick={() => setMobileFiltersOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-700 hover:bg-ink-100"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
            {filterPanel}
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-4 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand"
            >
              Show {list.length} packages
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
