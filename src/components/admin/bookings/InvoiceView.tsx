import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/siteConfig";
import PrintInvoiceButton from "@/components/admin/bookings/PrintInvoiceButton";
import { formatBalance } from "@/lib/money";

const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// A plain invoice: rows separated by a thin rule, no boxed grid or shaded
// header - it should read like a document, not a dashboard widget.
const cell = "border-b border-ink-200 py-2";
const headCell = "border-b-2 border-ink-900 pb-2 text-left font-semibold";
const sectionHeading = "font-heading text-lg font-bold";

export default async function InvoiceView({ bookingId }: { bookingId: string }) {
  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    include: {
      payments: { orderBy: { paidAt: "asc" } },
      invoice: { include: { installments: { orderBy: { order: "asc" } } } },
    },
  });
  if (!booking) notFound();

  const paid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
  const grandTotal = booking.totalAmount + booking.taxAmount;
  const balance = grandTotal - paid;
  const balanceDisplay = formatBalance(balance);
  const invoice = booking.invoice;

  const travelDates = booking.travelStartDate
    ? `${fmtDate(booking.travelStartDate)}${booking.travelEndDate ? ` to ${fmtDate(booking.travelEndDate)}` : ""}`
    : "";

  return (
    <div className="mx-auto max-w-3xl">
      <div className="print-hide mb-3 flex justify-end">
        <PrintInvoiceButton />
      </div>

      <div className="border border-ink-200 bg-white p-6 text-sm text-ink-900 print:border-0 print:p-0">
        <header className="flex items-start justify-between gap-6 border-b-2 border-brand-600 pb-3">
          <div>
            {/* The same icon + wordmark artwork the itinerary PDFs carry. Plain
                <img> so it is already loaded when the browser prints. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/snapingo-wordmark-horizontal.png" alt={siteConfig.name} className="h-10 w-auto" />
            <p className="mt-1 font-semibold">{siteConfig.legalName}</p>
            <p>
              {siteConfig.address.street}, {siteConfig.address.locality}, {siteConfig.address.region}{" "}
              {siteConfig.address.postalCode}
            </p>
            <p>
              {siteConfig.phone} · {siteConfig.email}
            </p>
            {siteConfig.gstin && <p className="font-semibold">GSTIN: {siteConfig.gstin}</p>}
          </div>
          <div className="shrink-0 text-right">
            <h1 className="font-heading text-3xl font-bold">Invoice</h1>
            <table className="ml-auto mt-1">
              <tbody>
                <tr>
                  <td className="pr-3 text-left">Invoice No.</td>
                  <td className="font-semibold">
                    {invoice?.invoiceNumber ?? booking.tripId ?? `#${booking.id.slice(-10).toUpperCase()}`}
                  </td>
                </tr>
                <tr>
                  <td className="pr-3 text-left">Date</td>
                  <td className="font-semibold">{fmtDate(booking.createdAt)}</td>
                </tr>
                {booking.tripId && (
                  <tr>
                    <td className="pr-3 text-left">Trip ID</td>
                    <td className="font-semibold">{booking.tripId}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </header>

        <section className="mt-4">
          <h2 className={sectionHeading}>Bill To</h2>
          <p className="mt-1 font-semibold">{invoice?.billingName ?? booking.travelerName}</p>
          {/* Billing address comes from the invoice when one has been raised -
              a customer's billing address is regularly not the traveller's
              contact details. */}
          {invoice && (
            <p>
              {invoice.billingAddress}, {invoice.billingCity}, {invoice.billingState} {invoice.billingPincode},{" "}
              {invoice.billingCountry}
            </p>
          )}
          <p>
            {booking.phone}
            {booking.email ? ` · ${booking.email}` : ""}
          </p>
        </section>

        <table className="mt-4 w-full border-collapse">
          <thead>
            <tr>
              <th className={headCell}>Description</th>
              <th className={`${headCell} text-right`}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={cell}>
                <p className="font-semibold">{booking.packageTitle || booking.destinationName || "Travel package"}</p>
                {travelDates && <p>{travelDates}</p>}
              </td>
              <td className={`${cell} text-right`}>{rupees(booking.totalAmount)}</td>
            </tr>
          </tbody>
        </table>

        <div className="ml-auto mt-3 w-full max-w-xs space-y-1">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{rupees(booking.totalAmount)}</span>
          </div>
          {booking.taxAmount > 0 && (
            <div className="flex justify-between">
              <span>GST</span>
              <span>{rupees(booking.taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-200 pt-1.5 font-semibold">
            <span>Grand Total</span>
            <span>{rupees(grandTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paid</span>
            <span>{rupees(paid)}</span>
          </div>
          <div className={`flex justify-between border-t-2 border-ink-900 pt-1.5 text-base font-bold ${balanceDisplay.className}`}>
            <span>{balanceDisplay.label}</span>
            <span>{balanceDisplay.amount}</span>
          </div>
        </div>

        {invoice && invoice.installments.length > 0 && (
          <section className="mt-5">
            <h2 className={sectionHeading}>Installment Plan</h2>
            <table className="mt-1 w-full border-collapse">
              <thead>
                <tr>
                  <th className={`${headCell} w-32`}>Installment</th>
                  <th className={headCell}>Due Date</th>
                  <th className={`${headCell} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.installments.map((installment, index) => (
                  <tr key={installment.id}>
                    <td className={cell}>{index + 1}</td>
                    <td className={cell}>{fmtDate(installment.dueDate)}</td>
                    <td className={`${cell} text-right`}>{rupees(installment.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {booking.payments.length > 0 && (
          <section className="mt-5">
            <h2 className={sectionHeading}>Payments Received</h2>
            <table className="mt-1 w-full border-collapse">
              <thead>
                <tr>
                  <th className={headCell}>Date</th>
                  <th className={headCell}>Mode</th>
                  <th className={`${headCell} text-right`}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {booking.payments.map((p) => (
                  <tr key={p.id}>
                    <td className={cell}>{fmtDate(p.paidAt)}</td>
                    <td className={cell}>{p.mode}</td>
                    <td className={`${cell} text-right`}>{rupees(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        <p className="mt-6 text-center text-xs">
          This is a computer-generated invoice and does not need a signature.
        </p>
      </div>
    </div>
  );
}
