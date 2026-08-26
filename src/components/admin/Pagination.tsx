import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const PAGE_SIZE = 50;

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value);
  }
  if (page > 1) query.set("page", String(page));
  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export default function Pagination({
  basePath,
  params,
  page,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  total: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-ink-500">
      <p>
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(basePath, params, page - 1)}
            className="flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-xl border border-ink-100 px-3 py-2 text-sm font-semibold text-ink-300">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}
        <span className="px-1 font-semibold text-ink-700">
          Page {page} of {totalPages}
        </span>
        {page < totalPages ? (
          <Link
            href={buildHref(basePath, params, page + 1)}
            className="flex items-center gap-1 rounded-xl border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-xl border border-ink-100 px-3 py-2 text-sm font-semibold text-ink-300">
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
}
