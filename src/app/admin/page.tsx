import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { db } from "@/lib/db";
import { getLeadStats } from "@/lib/leads";
import StatCard from "@/components/admin/StatCard";
import { bookingStatusLabels, bookingStatusStyles } from "@/components/admin/bookingStyles";

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default async function AdminDashboardPage() {
  const now = new Date();
  const in14Days = new Date(now);
  in14Days.setDate(in14Days.getDate() + 14);

  const [stats, packageCount, destinationCount, blogCount, staffCount, upcomingTrips, recentBookings, recentPayments, revenue] =
    await Promise.all([
      getLeadStats(),
      db.package.count(),
      db.destination.count(),
      db.blogPost.count(),
      db.staffUser.count({ where: { isActive: true } }),
      db.booking.findMany({
        where: { travelStartDate: { gte: now, lte: in14Days }, status: { in: ["CONFIRMED", "PENDING"] } },
        orderBy: { travelStartDate: "asc" },
        take: 6,
      }),
      db.booking.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { payments: true } }),
      db.payment.findMany({
        orderBy: { paidAt: "desc" },
        take: 5,
        include: { booking: { select: { travelerName: true } } },
      }),
      db.payment.aggregate({ _sum: { amount: true } }),
    ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">An overview of leads, bookings and site content.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="New leads" value={stats.new} accent />
        <StatCard label="Leads today" value={stats.today} />
        <StatCard label="Total leads" value={stats.total} />
        <StatCard label="Packages" value={packageCount} />
        <StatCard label="Active staff" value={staffCount} />
        <StatCard label="Revenue collected" value={`₹${(revenue._sum.amount ?? 0).toLocaleString("en-IN")}`} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ink-900">
              <CalendarClock className="h-4.5 w-4.5 text-brand-600" />
              Upcoming Trips
            </h2>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {upcomingTrips.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-ink-50/60 p-3 transition hover:bg-ink-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{b.travelerName}</p>
                  <p className="text-xs text-ink-500">{b.destinationName || b.packageTitle || "—"}</p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-brand-600">
                  {b.travelStartDate ? fmtDate(b.travelStartDate) : "—"}
                </p>
              </Link>
            ))}
            {upcomingTrips.length === 0 && <p className="text-sm text-ink-500">No trips departing in the next 14 days.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-ink-900">Recent Bookings</h2>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 space-y-2.5">
            {recentBookings.map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center justify-between gap-3 rounded-xl bg-ink-50/60 p-3 transition hover:bg-ink-100"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{b.travelerName}</p>
                  <p className="text-xs text-ink-500">₹{(b.totalAmount + b.taxAmount).toLocaleString("en-IN")}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${bookingStatusStyles[b.status]}`}>
                  {bookingStatusLabels[b.status]}
                </span>
              </Link>
            ))}
            {recentBookings.length === 0 && <p className="text-sm text-ink-500">No bookings yet.</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-ink-900">Leads inbox</h2>
          <Link href="/admin/leads" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="mt-2 text-sm text-ink-500">
          {stats.total === 0
            ? "No leads yet — as soon as someone fills out a form on the site, it'll show up here."
            : `${stats.new} new, ${stats.contacted} contacted, ${stats.quoted} quoted, ${stats.converted} converted, ${stats.closed} closed.`}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Recent Payments</h2>
          <div className="mt-4 space-y-2.5">
            {recentPayments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-50/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink-900">{p.booking.travelerName}</p>
                  <p className="text-xs text-ink-500">{p.mode}</p>
                </div>
                <p className="shrink-0 text-sm font-semibold text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</p>
              </div>
            ))}
            {recentPayments.length === 0 && <p className="text-sm text-ink-500">No payments recorded yet.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Destinations" value={destinationCount} />
          <StatCard label="Blog posts" value={blogCount} />
        </div>
      </div>
    </div>
  );
}
