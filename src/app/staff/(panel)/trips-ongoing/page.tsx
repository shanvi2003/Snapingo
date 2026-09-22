import { requireStaffFeature } from "@/lib/dal";
import TripsStagePage from "@/components/admin/bookings/TripsStagePage";

export default async function StaffOngoingTripsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("bookings");
  return (
    <TripsStagePage
      basePath="/staff"
      stage="ONGOING"
      title="Ongoing Trips"
      subtitle="Travelling right now"
      searchParams={searchParams}
    />
  );
}
