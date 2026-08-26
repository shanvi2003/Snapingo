import Link from "next/link";
import { Search, User } from "lucide-react";
import { db } from "@/lib/db";
import { sourceLabels, statusLabels, statusStyles } from "@/components/admin/leads/statusStyles";
import { bookingStatusLabels, bookingStatusStyles } from "@/components/admin/bookingStyles";

export default async function CustomerSearchPage({
  searchParams,
  basePath = "/admin",
}: {
  searchParams: Promise<{ q?: string }>;
  basePath?: string;
}) {
  const { q } = await searchParams;
  const query = q?.trim();

  const [leads, bookings] = query
    ? await Promise.all([
        db.lead.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        db.booking.findMany({
          where: {
            OR: [
              { travelerName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
      ])
    : [[], []];

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Customer Search</h1>
      <p className="mt-1 text-sm text-ink-500">Search by name, phone or email across leads and bookings.</p>

      <form className="mt-6 flex gap-3" action={`${basePath}/search`} method="get">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Search by name, phone or email..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button type="submit" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      {query && (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink-900">
              <User className="h-4 w-4 text-brand-600" />
              Leads ({leads.length})
            </h2>
            <div className="mt-3 space-y-2">
              {leads.map((l) => (
                <Link
                  key={l.id}
                  href={`${basePath}/leads/${l.id}`}
                  className="block rounded-xl border border-ink-100 bg-white p-4 shadow-sm transition hover:border-brand-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink-900">{l.name || l.phone || l.email || "Anonymous"}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[l.status]}`}>
                      {statusLabels[l.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {l.phone} · {sourceLabels[l.source]}
                  </p>
                </Link>
              ))}
              {leads.length === 0 && <p className="text-sm text-ink-500">No matching leads.</p>}
            </div>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink-900">
              <User className="h-4 w-4 text-brand-600" />
              Bookings ({bookings.length})
            </h2>
            <div className="mt-3 space-y-2">
              {bookings.map((b) => (
                <Link
                  key={b.id}
                  href={`${basePath}/bookings/${b.id}`}
                  className="block rounded-xl border border-ink-100 bg-white p-4 shadow-sm transition hover:border-brand-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-ink-900">{b.travelerName}</p>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${bookingStatusStyles[b.status]}`}>
                      {bookingStatusLabels[b.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {b.phone} · ₹{(b.totalAmount + b.taxAmount).toLocaleString("en-IN")}
                  </p>
                </Link>
              ))}
              {bookings.length === 0 && <p className="text-sm text-ink-500">No matching bookings.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
