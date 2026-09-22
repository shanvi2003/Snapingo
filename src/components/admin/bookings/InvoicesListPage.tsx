import Link from "next/link";
import { FilePlus2, Receipt } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { formatRupees } from "@/lib/gst";
import { getPaymentSummary } from "@/lib/tripStage";
import AutoSearchInput from "@/components/admin/AutoSearchInput";
import Pagination, { PAGE_SIZE } from "@/components/admin/Pagination";

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

/** Whole days between the two travel dates, inclusive of both. */
function tripDays(start: Date | null, end: Date | null): string {
  if (!start || !end) return "—";
  const ms = end.getTime() - start.getTime();
  if (ms < 0) return "—";
  return String(Math.round(ms / 86_400_000) + 1);
}

export default async function InvoicesListPage({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const q = params.q?.trim();
  const page = Math.max(1, Number(params.page) || 1);

  const contains = { contains: q ?? "", mode: "insensitive" as const };
  const where: Prisma.BookingWhereInput = q
    ? {
        OR: [
          { tripId: contains },
          { travelerName: contains },
          { email: contains },
          { phone: contains },
          { invoice: { invoiceNumber: contains } },
        ],
      }
    : {};

  const [total, bookings] = await Promise.all([
    db.booking.count({ where }),
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { payments: true, invoice: { select: { id: true, invoiceNumber: true } } },
    }),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Invoices</h1>
      <p className="mt-1 text-sm text-ink-500">
        One invoice per booking. {total} booking{total === 1 ? "" : "s"}.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <AutoSearchInput placeholder="Search Trip ID, customer, email or invoice number..." />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Trip ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Days</th>
              <th className="px-4 py-3">Travel dates</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const summary = getPaymentSummary(booking);
              return (
                <tr key={booking.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <Link
                      href={`${basePath}/bookings/${booking.id}`}
                      className="font-mono text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      {booking.tripId ?? `#${booking.id.slice(-10).toUpperCase()}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{booking.travelerName}</td>
                  <td className="px-4 py-3 text-ink-700">{booking.email || "—"}</td>
                  <td className="px-4 py-3 text-ink-700">
                    {tripDays(booking.travelStartDate, booking.travelEndDate)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                    {fmtDate(booking.travelStartDate)} – {fmtDate(booking.travelEndDate)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">
                    {formatRupees(summary.paid)}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${summary.balance > 0 ? "text-red-600" : "text-ink-500"}`}
                  >
                    {formatRupees(Math.max(0, summary.balance))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {booking.invoice ? (
                        <Link
                          href={`${basePath}/bookings/${booking.id}/invoice`}
                          target="_blank"
                          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                          View
                        </Link>
                      ) : null}
                      <Link
                        href={`${basePath}/bookings/${booking.id}/invoice/edit`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand-600"
                      >
                        <FilePlus2 className="h-3.5 w-3.5" />
                        {booking.invoice ? "Edit" : "Create Invoice"}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-500">
                  No bookings match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath={`${basePath}/invoices`} params={{ q }} page={page} total={total} />
    </div>
  );
}
