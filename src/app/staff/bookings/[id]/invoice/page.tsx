import { requireStaffFeature } from "@/lib/dal";
import InvoiceView from "@/components/admin/bookings/InvoiceView";

export default async function StaffBookingInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("bookings");
  const { id } = await params;
  return <InvoiceView bookingId={id} />;
}
