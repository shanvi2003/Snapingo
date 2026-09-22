"use client";

import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useUrlFilters } from "@/hooks/useUrlFilters";

/**
 * A search box that searches as you type, replacing the type-then-press-Search
 * flow the admin lists used.
 *
 * Debounced rather than firing per keystroke: each change is a server
 * round-trip that re-queries the database, and "Bangalore" would otherwise
 * cost nine of them.
 */
export default function AutoSearchInput({
  placeholder,
  paramName = "q",
  delayMs = 350,
}: {
  placeholder: string;
  paramName?: string;
  delayMs?: number;
}) {
  const { searchParams, setParam } = useUrlFilters();

  const initial = searchParams.get(paramName) ?? "";
  const [value, setValue] = useState(initial);

  // Tracks what the URL already holds, so the effect below doesn't navigate to
  // the value it just navigated to and fight the user's typing.
  const applied = useRef(initial);

  useEffect(() => {
    if (value === applied.current) return;

    const timer = setTimeout(() => {
      applied.current = value;
      setParam(paramName, value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs, paramName, setParam]);

  // Keeps the box in step when the URL changes from elsewhere - a cleared
  // filter, a back navigation - without clobbering what is being typed.
  useEffect(() => {
    const fromUrl = searchParams.get(paramName) ?? "";
    if (fromUrl !== applied.current) {
      applied.current = fromUrl;
      setValue(fromUrl);
    }
  }, [searchParams, paramName]);

  return (
    <div className="relative min-w-[240px] flex-1">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-10 pr-4 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  );
}
