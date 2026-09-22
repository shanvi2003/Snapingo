import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import InvoiceForm from "@/components/admin/bookings/InvoiceForm";

function toDateInput(value: Date): string {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate()
  ).padStart(2, "0")}`;
}

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("bookings");
  const { id } = await params;

  const booking = await db.booking.findUnique({
    where: { id },
    include: { invoice: { include: { installments: { orderBy: { order: "asc" } } } } },
  });
  if (!booking) notFound();

  const expectedTotal = booking.totalAmount + booking.taxAmount;
  const invoice = booking.invoice;

  return (
    <div>
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to booking
      </Link>

      <h1 className="mt-4 font-heading text-2xl font-bold text-ink-900">
        {invoice ? "Edit Invoice" : "Create Invoice"}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        {booking.travelerName}
        {booking.tripId ? ` · ${booking.tripId}` : ""}
      </p>

      <div className="mt-6">
        <InvoiceForm
          bookingId={booking.id}
          expectedTotal={expectedTotal}
          defaults={{
            // Pre-filled from the booking so staff don't retype what the
            // system already knows about the traveller.
            billingName: invoice?.billingName ?? booking.travelerName,
            billingAddress: invoice?.billingAddress ?? "",
            billingCity: invoice?.billingCity ?? "",
            billingState: invoice?.billingState ?? "",
            billingCountry: invoice?.billingCountry ?? "India",
            billingPincode: invoice?.billingPincode ?? "",
            installments:
              invoice?.installments.map((i) => ({
                dueDate: toDateInput(i.dueDate),
                amount: String(i.amount),
              })) ?? [],
          }}
        />
      </div>
    </div>
  );
}
