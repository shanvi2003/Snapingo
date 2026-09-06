import BookingsListPage from "@/components/admin/bookings/BookingsListPage";

export default function AdminBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  return <BookingsListPage title="Booking Management" subtitle="Manually confirmed bookings." searchParams={searchParams} />;
}
