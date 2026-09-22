import { requireStaffFeature } from "@/lib/dal";
import TripsStagePage from "@/components/admin/bookings/TripsStagePage";

export default async function AdminOngoingTripsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("bookings");
  return (
    <TripsStagePage
      basePath="/admin"
      stage="ONGOING"
      title="Ongoing Trips"
      subtitle="Travelling right now"
      searchParams={searchParams}
    />
  );
}
