"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { allPackages, type Inclusion } from "@/data/packages";
import PackageCard from "@/components/PackageCard";
import CustomSelect from "@/components/CustomSelect";
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
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm text-ink-900">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 shrink-0 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
      />
      {label}
    </label>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-ink-100 py-5 first:pt-0">
      <p className="font-heading text-sm font-bold text-ink-900">{title}</p>
      <div className="mt-2.5">{children}</div>
    </div>
  );
}

export default function PackagesGrid({
  initialType,
  initialCategory,
}: {
  initialType: DestType | "all";
  initialCategory: PackageCategory | null;
}) {
  const [destTypes, setDestTypes] = useState<Set<DestType>>(
    new Set(initialType === "all" ? ["domestic", "international"] : [initialType])
  );
  const [categories, setCategories] = useState<Set<PackageCategory>>(
    new Set(initialCategory ? [initialCategory] : [])
  );
  const [durations, setDurations] = useState<Set<DurationBucket>>(new Set());
  const [budgets, setBudgets] = useState<Set<BudgetBucket>>(new Set());
  const [inclusions, setInclusions] = useState<Set<Inclusion>>(new Set());
  const [sort, setSort] = useState<Sort>("popular");
  const [query, setQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const list = useMemo(() => {
    let base = allPackages.filter((p) => destTypes.has(p.type));

    if (categories.size > 0) {
      base = base.filter((p) => inferPackageCategories(p).some((c) => categories.has(c)));
    }
    if (durations.size > 0) {
      base = base.filter((p) => {
        const days = getPackageDurationDays(p);
        return [...durations].some((bucket) => matchesDurationBucket(days, bucket));
      });
    }
    if (budgets.size > 0) {
      base = base.filter((p) => [...budgets].some((bucket) => matchesBudgetBucket(p.price, bucket)));
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
  }, [destTypes, categories, durations, budgets, inclusions, query, sort]);

  const activeFilterCount =
    (destTypes.size < 2 ? 1 : 0) + categories.size + durations.size + budgets.size + inclusions.size;

  const resetFilters = () => {
    setDestTypes(new Set(["domestic", "international"]));
    setCategories(new Set());
    setDurations(new Set());
    setBudgets(new Set());
    setInclusions(new Set());
  };

  const filterPanel = (
    <>
      <FilterSection title="Type of Destination">
        <FilterCheckbox
          label="All"
          checked={destTypes.size === 2}
          onChange={() => setDestTypes(new Set(["domestic", "international"]))}
        />
        <FilterCheckbox
          label="Domestic"
          checked={destTypes.has("domestic")}
          onChange={() => setDestTypes((s) => toggleInSet(s, "domestic"))}
        />
        <FilterCheckbox
          label="International"
          checked={destTypes.has("international")}
          onChange={() => setDestTypes((s) => toggleInSet(s, "international"))}
        />
      </FilterSection>

      <FilterSection title="Categories">
        <FilterCheckbox label="All" checked={categories.size === 0} onChange={() => setCategories(new Set())} />
        {packageCategoryOptions.map((opt) => (
          <FilterCheckbox
            key={opt.value}
            label={opt.label}
            checked={categories.has(opt.value)}
            onChange={() => setCategories((s) => toggleInSet(s, opt.value))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Duration (in Days)">
        {durationBucketOptions.map((opt) => (
          <FilterCheckbox
            key={opt.value}
            label={opt.label}
            checked={durations.has(opt.value)}
            onChange={() => setDurations((s) => toggleInSet(s, opt.value))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Budget Per Person">
        {budgetBucketOptions.map((opt) => (
          <FilterCheckbox
            key={opt.value}
            label={opt.label}
            checked={budgets.has(opt.value)}
            onChange={() => setBudgets((s) => toggleInSet(s, opt.value))}
          />
        ))}
      </FilterSection>

      <FilterSection title="Inclusions">
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
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
      <aside className="sticky top-28 hidden max-h-[calc(100vh-8rem)] self-start overflow-y-auto overscroll-contain rounded-2xl border border-ink-100 bg-white p-5 lg:block">
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
