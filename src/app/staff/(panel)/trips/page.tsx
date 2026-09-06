import { requireStaffFeature } from "@/lib/dal";
import BookingsListPage from "@/components/admin/bookings/BookingsListPage";

export default async function StaffTripsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("completeTrips");
  return (
    <BookingsListPage
      title="Complete Trips"
      subtitle="Bookings marked as completed."
      fixedStatus="COMPLETED"
      searchParams={searchParams}
      basePath="/staff"
    />
  );
}
