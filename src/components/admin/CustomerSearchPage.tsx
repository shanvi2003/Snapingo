import Link from "next/link";
import { Search } from "lucide-react";
import { db } from "@/lib/db";

// One row per matching lead or booking - `type` is kept (not just for
// display) since it's what decides which detail page this row's link
// actually points to.
type CustomerRow = {
  key: string;
  type: "Lead" | "Booking";
  name: string;
  email: string;
  phone: string;
  href: string;
};

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

  const rows: CustomerRow[] = [
    ...leads.map((l): CustomerRow => ({
      key: `lead-${l.id}`,
      type: "Lead",
      name: l.name || "—",
      email: l.email || "—",
      phone: l.phone || "—",
      href: `${basePath}/leads/${l.id}`,
    })),
    ...bookings.map((b): CustomerRow => ({
      key: `booking-${b.id}`,
      type: "Booking",
      name: b.travelerName,
      email: b.email || "—",
      phone: b.phone,
      href: `${basePath}/bookings/${b.id}`,
    })),
  ];

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
            placeholder="Search customer..."
            className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <button type="submit" className="rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      {query && (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile Number</th>
                <th className="px-4 py-3">Type</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <Link href={row.href} className="font-semibold text-ink-900 hover:text-brand-600">
                      {row.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{row.email}</td>
                  <td className="px-4 py-3 text-ink-700">{row.phone}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.type === "Lead" ? "bg-brand-50 text-brand-700" : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {row.type}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-500">
                    No matching customers.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
