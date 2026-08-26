import { requireStaffFeature } from "@/lib/dal";
import BookingsListPage from "@/components/admin/bookings/BookingsListPage";

export default async function StaffBookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaffFeature("bookings");
  return (
    <BookingsListPage
      title="Booking Management"
      subtitle="Manually confirmed bookings."
      searchParams={searchParams}
      basePath="/staff"
    />
  );
}
