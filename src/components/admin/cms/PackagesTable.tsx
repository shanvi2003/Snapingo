"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Search } from "lucide-react";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { deletePackageAction } from "@/lib/actions/cms";
import type { Package } from "@/generated/prisma/client";

export default function PackagesTable({
  packages,
  basePath,
}: {
  packages: Package[];
  basePath: string;
}) {
  const [query, setQuery] = useState("");

  // Filtered client-side (not a server round-trip per keystroke) - the
  // whole list is already on the page, so this is instant either way and
  // needs no debounce/submit button.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return packages;
    return packages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.destination.toLowerCase().includes(q)
    );
  }, [packages, query]);

  return (
    <div>
      <label className="mt-6 flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-100">
        <Search className="h-4 w-4 shrink-0 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title or destination..."
          className="w-full bg-transparent text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
        />
      </label>

      <p className="mt-2 text-xs text-ink-500">
        {filtered.length} package{filtered.length === 1 ? "" : "s"}
        {query && ` matching "${query}"`}
      </p>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{p.title}</p>
                  {p.featured && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-600">Featured</span>}
                </td>
                <td className="px-4 py-3 text-ink-700">{p.destination}</td>
                <td className="px-4 py-3 capitalize text-ink-700">{p.type}</td>
                <td className="px-4 py-3 font-semibold text-brand-600">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`${basePath}/cms/packages/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton id={p.id} action={deletePackageAction} confirmText="Delete this package? This can't be undone." />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-500">
                  {query ? `No packages match "${query}".` : "No packages found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
