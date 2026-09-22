"use client";

import CustomSelect, { type SelectOption } from "@/components/CustomSelect";
import { useUrlFilters } from "@/hooks/useUrlFilters";

/**
 * Dropdown filter that applies the moment it changes.
 *
 * FilterSelect (the older sibling) is for filter bars that are a native GET
 * form with a Filter button; these apply instantly, which is what the client
 * asked for on the leads list. No `name` is passed to CustomSelect on purpose
 * - the value travels through the URL, not a form submission.
 */
export function AutoFilterSelect({
  paramName,
  options,
  placeholder,
}: {
  paramName: string;
  options: SelectOption[];
  placeholder: string;
}) {
  const { searchParams, setParam } = useUrlFilters();
  const value = searchParams.get(paramName) ?? "";

  return (
    <CustomSelect
      value={value}
      onChange={(next) => setParam(paramName, next)}
      options={options}
      placeholder={placeholder}
    />
  );
}

/** Date filter (travel-date range on the leads list), applied on change. */
export function AutoFilterDate({ paramName, label }: { paramName: string; label: string }) {
  const { searchParams, setParam } = useUrlFilters();
  const value = searchParams.get(paramName) ?? "";

  return (
    <input
      type="date"
      value={value}
      aria-label={label}
      title={label}
      onChange={(e) => setParam(paramName, e.target.value)}
      className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
    />
  );
}

/** On/off pill, used for "Favourites only". */
export function AutoFilterToggle({
  paramName,
  label,
  icon,
}: {
  paramName: string;
  label: string;
  icon?: React.ReactNode;
}) {
  const { searchParams, setParam } = useUrlFilters();
  const active = searchParams.get(paramName) === "1";

  return (
    <button
      type="button"
      onClick={() => setParam(paramName, active ? "" : "1")}
      aria-pressed={active}
      className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-gold-400 bg-gold-400/15 text-gold-600"
          : "border-ink-200 text-ink-700 hover:border-gold-400 hover:text-gold-600"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/** Clears every filter by navigating to the bare path. */
export function AutoFilterClear({ show }: { show: boolean }) {
  const { pathname, searchParams } = useUrlFilters();
  if (!show) return null;

  // A plain link rather than a router call: this is a navigation, and letting
  // it be a real anchor keeps middle-click and open-in-new-tab working.
  void searchParams;
  return (
    <a
      href={pathname}
      className="flex items-center rounded-xl border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
    >
      Clear
    </a>
  );
}
