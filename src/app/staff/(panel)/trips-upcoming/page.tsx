import { requireStaffFeature } from "@/lib/dal";
import TripsStagePage from "@/components/admin/bookings/TripsStagePage";

export default async function StaffUpcomingTripsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("bookings");
  return (
    <TripsStagePage
      basePath="/staff"
      stage="UPCOMING"
      title="Upcoming Trips"
      subtitle="Departing soon"
      searchParams={searchParams}
    />
  );
}
