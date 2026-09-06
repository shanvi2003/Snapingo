import InvoiceView from "@/components/admin/bookings/InvoiceView";

export default async function BookingInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <InvoiceView bookingId={id} />;
}
