import BookingDetailView from "@/components/admin/bookings/BookingDetailView";

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} />;
}
