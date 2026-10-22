import { requireStaffFeature } from "@/lib/dal";
import NewBookingView from "@/components/admin/bookings/NewBookingView";

export default async function StaffNewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; customPackageId?: string }>;
}) {
  await requireStaffFeature("bookings");
  const { leadId, customPackageId } = await searchParams;
  return <NewBookingView leadId={leadId} customPackageId={customPackageId} />;
}
