import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil, Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { bookingStatusLabels, bookingStatusStyles } from "@/components/admin/bookingStyles";
import BookingStatusSelect from "@/components/admin/bookings/BookingStatusSelect";
import DeleteBookingButton from "@/components/admin/bookings/DeleteBookingButton";
import { addPaymentAction } from "@/lib/actions/bookings";
import { formatBalance } from "@/lib/money";

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function BookingDetailView({ bookingId, basePath = "/admin" }: { bookingId: string; basePath?: string }) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { payments: { orderBy: { paidAt: "desc" }, include: { recordedBy: { select: { name: true } } } }, createdBy: { select: { name: true } } },
  });
  if (!booking) notFound();

  const paid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
  const grandTotal = booking.totalAmount + booking.taxAmount;
  const balance = grandTotal - paid;
  const balanceDisplay = formatBalance(balance);

  return (
    <div>
      <Link href={`${basePath}/bookings`} className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        Back to bookings
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">{booking.travelerName}</h1>
          <p className="mt-1 text-sm text-ink-500">
            {booking.phone} · Booked by {booking.createdBy.name} on {fmtDate(booking.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <BookingStatusSelect bookingId={booking.id} status={booking.status} />
          <Link
            href={`${basePath}/bookings/${booking.id}/invoice`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            <Receipt className="h-4 w-4" />
            View Invoice
          </Link>
          <Link
            href={`${basePath}/bookings/${booking.id}/edit`}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
          <DeleteBookingButton bookingId={booking.id} basePath={basePath} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Trip Details</h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Package</dt>
              <dd className="mt-0.5 text-sm text-ink-900">{booking.packageTitle || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Destination</dt>
              <dd className="mt-0.5 text-sm text-ink-900">{booking.destinationName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Travel dates</dt>
              <dd className="mt-0.5 text-sm text-ink-900">
                {booking.travelStartDate ? fmtDate(booking.travelStartDate) : "—"}
                {booking.travelEndDate ? ` – ${fmtDate(booking.travelEndDate)}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Email</dt>
              <dd className="mt-0.5 text-sm text-ink-900">{booking.email || "—"}</dd>
            </div>
          </dl>
          {booking.notes && (
            <div className="mt-5 border-t border-ink-100 pt-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Notes</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-900">{booking.notes}</dd>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-ink-100 pt-5 sm:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Package Amount</p>
              <p className="mt-1 font-heading text-lg font-bold text-ink-900">₹{booking.totalAmount.toLocaleString("en-IN")}</p>
            </div>
            {booking.taxAmount > 0 && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-500">GST / Tax</p>
                <p className="mt-1 font-heading text-lg font-bold text-ink-900">₹{booking.taxAmount.toLocaleString("en-IN")}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Paid</p>
              <p className="mt-1 font-heading text-lg font-bold text-emerald-600">₹{paid.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{balanceDisplay.label}</p>
              <p className={`mt-1 font-heading text-lg font-bold ${balanceDisplay.className}`}>{balanceDisplay.amount}</p>
            </div>
          </div>
          <span className={`mt-4 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${bookingStatusStyles[booking.status]}`}>
            {bookingStatusLabels[booking.status]}
          </span>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Payments</h2>
          <div className="mt-4 space-y-3">
            {booking.payments.map((p) => (
              <div key={p.id} className="rounded-xl bg-ink-50/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink-900">₹{p.amount.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-ink-500">{fmtDate(p.paidAt)}</p>
                </div>
                <p className="mt-0.5 text-xs text-ink-500">
                  {p.mode} · recorded by {p.recordedBy.name}
                </p>
                {p.notes && <p className="mt-1 text-xs text-ink-700">{p.notes}</p>}
              </div>
            ))}
            {booking.payments.length === 0 && <p className="text-sm text-ink-500">No payments recorded yet.</p>}
          </div>

          <form action={addPaymentAction.bind(null, booking.id)} className="mt-4 space-y-2.5 border-t border-ink-100 pt-4">
            <div className="grid grid-cols-2 gap-2.5">
              <input
                name="amount"
                type="number"
                min={1}
                required
                placeholder="Amount ₹"
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <input
                name="mode"
                required
                placeholder="UPI / Cash / Bank"
                className="rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <input
              name="notes"
              placeholder="Notes (optional)"
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Record Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
