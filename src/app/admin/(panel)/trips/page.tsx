import BookingsListPage from "@/components/admin/bookings/BookingsListPage";

export default function AdminTripsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  return (
    <BookingsListPage
      title="Complete Trips"
      subtitle="Bookings marked as completed."
      fixedStatus="COMPLETED"
      searchParams={searchParams}
    />
  );
}
