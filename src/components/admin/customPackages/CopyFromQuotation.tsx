"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Search } from "lucide-react";
import {
  getQuotationCopyAction,
  searchQuotationsAction,
  type QuotationMatch,
} from "@/lib/actions/quotationCopy";
import type { CustomPackageDefaults } from "@/components/admin/customPackages/CustomPackageForm";

/**
 * Search box in the quotation form's header: find a package already quoted to
 * another customer (by Trip ID, or that customer's name, phone or email) and
 * fill the form from it. Sits outside the <form> so Enter here never submits
 * the quotation.
 */
export default function CopyFromQuotation({
  excludeId,
  onCopy,
}: {
  // The quotation being edited, kept out of its own results.
  excludeId?: string;
  onCopy: (values: CustomPackageDefaults, tripId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<QuotationMatch[] | null>(null);
  const [copiedFrom, setCopiedFrom] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, startSearch] = useTransition();
  const [copying, startCopy] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Only the latest search may fill the list, however the replies arrive.
  const latest = useRef("");

  const onQueryChange = (value: string) => {
    setQuery(value);
    setError(null);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults(null);
      return;
    }
    timer.current = setTimeout(() => {
      latest.current = value;
      startSearch(async () => {
        const found = await searchQuotationsAction(value, excludeId);
        if (latest.current === value) setResults(found);
      });
    }, 300);
  };

  const copy = (match: QuotationMatch) => {
    startCopy(async () => {
      const values = await getQuotationCopyAction(match.id);
      if (!values) {
        setError("That package couldn't be loaded. It may have been deleted.");
        return;
      }
      onCopy(values, match.tripId);
      setCopiedFrom(match.tripId);
      setResults(null);
      setQuery("");
    });
  };

  return (
    <div className="relative w-full sm:w-[420px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
        <input
          id="copy-search"
          type="search"
          autoComplete="off"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          aria-label="Copy an existing package"
          placeholder="Copy a package: Trip ID, name, phone or email"
          className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-11 pr-11 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {(searching || copying) && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-400" />
        )}
      </div>

      {results && (
        <ul className="scrollbar-thin absolute left-0 right-0 top-full z-20 mt-1.5 max-h-72 overflow-auto rounded-xl border border-ink-100 bg-white shadow-soft">
          {results.map((match) => (
            <li key={match.id} className="border-b border-ink-50 last:border-0">
              <button
                type="button"
                disabled={copying}
                onClick={() => copy(match)}
                className="w-full px-4 py-2.5 text-left transition hover:bg-brand-50/60 disabled:opacity-60"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-bold text-brand-600">{match.tripId}</span>
                  <span className="text-xs text-ink-500">
                    {match.durationNights}N / {match.durationDays}D
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-sm text-ink-700">
                  {match.customerName}
                  {match.customerPhone ? ` · ${match.customerPhone}` : ""} · {match.destinationName}
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-4 py-3 text-sm text-ink-500">No packages match.</li>}
        </ul>
      )}

      {error && <p className="mt-1.5 text-sm font-medium text-red-600">{error}</p>}
      {copiedFrom && !results && (
        <p className="mt-1.5 text-sm text-ink-700">
          Filled from <span className="font-mono font-bold text-brand-600">{copiedFrom}</span>, customer details kept.
        </p>
      )}
    </div>
  );
}
