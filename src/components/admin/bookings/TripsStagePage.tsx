import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { formatRupees } from "@/lib/gst";
import { getPaymentSummary, getTripStage, type TripStage } from "@/lib/tripStage";
import AutoSearchInput from "@/components/admin/AutoSearchInput";

const fmtDate = (d: Date | null) =>
  d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

/**
 * Ongoing / Upcoming / Complete trips.
 *
 * All three read the same table and decide membership from the travel dates
 * (see getTripStage) rather than from a status column that something has to
 * remember to update - which is how the client's "once the travel dates are
 * over it should move to Complete Trips" happens with no scheduled job.
 *
 * The date filtering is deliberately done in SQL first (a coarse window) and
 * then refined in memory, so a growing bookings table never means loading
 * every row to find today's trips.
 */
export default async function TripsStagePage({
  basePath,
  stage,
  title,
  subtitle,
  searchParams,
}: {
  basePath: string;
  stage: Extract<TripStage, "ONGOING" | "UPCOMING" | "COMPLETE">;
  title: string;
  subtitle: string;
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const q = params.q?.trim();

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const contains = { contains: q ?? "", mode: "insensitive" as const };
  const search: Prisma.BookingWhereInput = q
    ? { OR: [{ tripId: contains }, { travelerName: contains }, { phone: contains }, { email: contains }] }
    : {};

  // Coarse pre-filter. Bookings explicitly marked COMPLETED or CANCELLED are
  // handled by getTripStage, so they're only excluded where the dates alone
  // would otherwise pull them in.
  const stageWhere: Prisma.BookingWhereInput =
    stage === "UPCOMING"
      ? { travelStartDate: { gt: today }, status: { notIn: ["CANCELLED", "COMPLETED"] } }
      : stage === "ONGOING"
        ? {
            travelStartDate: { lte: today },
            OR: [{ travelEndDate: { gte: today } }, { travelEndDate: null }],
            status: { notIn: ["CANCELLED", "COMPLETED"] },
          }
        : {
            OR: [{ travelEndDate: { lt: today } }, { status: "COMPLETED" }],
            status: { not: "CANCELLED" },
          };

  const rows = await db.booking.findMany({
    where: { AND: [stageWhere, search] },
    orderBy: stage === "COMPLETE" ? { travelEndDate: "desc" } : { travelStartDate: "asc" },
    take: 200,
    include: { payments: true },
  });

  // Final authority: a row that slipped through the coarse filter (a null
  // start date, say) is dropped here rather than shown in the wrong list.
  const bookings = rows.filter((b) => getTripStage(b, now) === stage);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {subtitle} · {bookings.length} trip{bookings.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <AutoSearchInput placeholder="Search Trip ID, traveller, phone or email..." />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Trip ID</th>
              <th className="px-4 py-3">Traveller</th>
              <th className="px-4 py-3">Package / Destination</th>
              <th className="px-4 py-3">Travel dates</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
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
                  <td className="px-4 py-3">
                    <p className="font-semibold text-ink-900">{booking.travelerName}</p>
                    <p className="text-xs text-ink-500">{booking.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">
                    {booking.packageTitle || booking.destinationName || "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                    {fmtDate(booking.travelStartDate)} – {fmtDate(booking.travelEndDate)}
                  </td>
                  <td className="px-4 py-3 text-ink-900">{formatRupees(summary.grandTotal)}</td>
                  <td className="px-4 py-3">
                    {summary.isComplete ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Payment Complete
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                        <Clock className="h-3.5 w-3.5" />
                        {formatRupees(Math.max(0, summary.balance))} due
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                  No trips here right now.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
