import { requireStaffFeature } from "@/lib/dal";
import TripsStagePage from "@/components/admin/bookings/TripsStagePage";

export default async function StaffTripsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("completeTrips");
  return (
    <TripsStagePage
      basePath="/staff"
      stage="COMPLETE"
      title="Complete Trips"
      subtitle="Trips whose travel dates are over"
      searchParams={searchParams}
    />
  );
}
