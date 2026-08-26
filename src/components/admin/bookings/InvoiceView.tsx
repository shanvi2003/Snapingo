import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/siteConfig";
import PrintInvoiceButton from "@/components/admin/bookings/PrintInvoiceButton";
import { formatBalance } from "@/lib/money";

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default async function InvoiceView({ bookingId }: { bookingId: string }) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: { payments: { orderBy: { paidAt: "asc" } } },
  });
  if (!booking) notFound();

  const paid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
  const grandTotal = booking.totalAmount + booking.taxAmount;
  const balance = grandTotal - paid;
  const balanceDisplay = formatBalance(balance);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print-hide mb-6 flex justify-end">
        <PrintInvoiceButton />
      </div>

      <div className="rounded-2xl border border-ink-100 bg-white p-8 shadow-sm sm:p-10 print:rounded-none print:border-0 print:shadow-none">
        <header className="flex items-start justify-between border-b-2 border-brand-600 pb-4">
          <div>
            <p className="font-heading text-2xl font-extrabold text-brand-600">{siteConfig.name}</p>
            <p className="text-xs text-ink-500">{siteConfig.legalName}</p>
          </div>
          <div className="text-right">
            <p className="font-heading text-lg font-bold text-ink-900">INVOICE</p>
            <p className="text-xs text-ink-500">#{booking.id.slice(-10).toUpperCase()}</p>
            <p className="text-xs text-ink-500">{fmtDate(booking.createdAt)}</p>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Billed To</p>
            <p className="mt-1 text-sm font-semibold text-ink-900">{booking.travelerName}</p>
            <p className="text-sm text-ink-700">{booking.phone}</p>
            {booking.email && <p className="text-sm text-ink-700">{booking.email}</p>}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">From</p>
            <p className="mt-1 text-sm text-ink-700">
              {siteConfig.address.street}, {siteConfig.address.locality}, {siteConfig.address.region} {siteConfig.address.postalCode}
            </p>
            <p className="text-sm text-ink-700">{siteConfig.phone}</p>
            <p className="text-sm text-ink-700">{siteConfig.email}</p>
            {siteConfig.gstin && <p className="mt-1 text-sm font-semibold text-ink-900">GSTIN: {siteConfig.gstin}</p>}
          </div>
        </div>

        {booking.taxAmount > 0 && !siteConfig.gstin && (
          <p className="print-hide mt-4 rounded-lg bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
            This invoice charges GST but no GSTIN is set — add NEXT_PUBLIC_GSTIN to your environment before sending this to a customer.
          </p>
        )}

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-ink-100">
              <td className="py-3">
                <p className="font-semibold text-ink-900">{booking.packageTitle || booking.destinationName || "Travel package"}</p>
                {booking.travelStartDate && (
                  <p className="text-xs text-ink-500">
                    {fmtDate(booking.travelStartDate)}
                    {booking.travelEndDate ? ` – ${fmtDate(booking.travelEndDate)}` : ""}
                  </p>
                )}
              </td>
              <td className="py-3 text-right font-semibold text-ink-900">₹{booking.totalAmount.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-700">
              <span>Subtotal</span>
              <span className="font-semibold text-ink-900">₹{booking.totalAmount.toLocaleString("en-IN")}</span>
            </div>
            {booking.taxAmount > 0 && (
              <div className="flex justify-between text-ink-700">
                <span>GST / Tax</span>
                <span className="font-semibold text-ink-900">₹{booking.taxAmount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-200 pt-1.5 text-ink-700">
              <span>Grand Total</span>
              <span className="font-semibold text-ink-900">₹{grandTotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-ink-700">
              <span>Paid</span>
              <span className="font-semibold text-emerald-600">₹{paid.toLocaleString("en-IN")}</span>
            </div>
            <div className={`flex justify-between border-t border-ink-200 pt-1.5 font-heading text-base font-bold ${balanceDisplay.className}`}>
              <span>{balanceDisplay.label}</span>
              <span>{balanceDisplay.amount}</span>
            </div>
          </div>
        </div>

        {booking.payments.length > 0 && (
          <div className="mt-8 border-t border-ink-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Payment History</p>
            <table className="mt-2 w-full text-left text-xs">
              <tbody>
                {booking.payments.map((p) => (
                  <tr key={p.id} className="border-b border-ink-50 last:border-0">
                    <td className="py-1.5 text-ink-700">{fmtDate(p.paidAt)}</td>
                    <td className="py-1.5 text-ink-700">{p.mode}</td>
                    <td className="py-1.5 text-right font-semibold text-ink-900">₹{p.amount.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-ink-400">
          Payment collected manually — this invoice is a record of an agreed booking, not an online payment receipt.
        </p>
      </div>
    </div>
  );
}
