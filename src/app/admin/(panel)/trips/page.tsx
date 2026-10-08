import { requireStaffFeature } from "@/lib/dal";
import TripsStagePage from "@/components/admin/bookings/TripsStagePage";

export default async function AdminTripsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("bookings");
  return (
    <TripsStagePage
      basePath="/admin"
      stage="COMPLETE"
      title="Complete Trips"
      subtitle="Trips whose travel dates are over"
      searchParams={searchParams}
    />
  );
}
