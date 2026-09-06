import { requireStaffFeature } from "@/lib/dal";
import BookingDetailView from "@/components/admin/bookings/BookingDetailView";

export default async function StaffBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("bookings");
  const { id } = await params;
  return <BookingDetailView bookingId={id} basePath="/staff" />;
}
