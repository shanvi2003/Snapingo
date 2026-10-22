import NewBookingView from "@/components/admin/bookings/NewBookingView";

export default async function NewBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string; customPackageId?: string }>;
}) {
  const { leadId, customPackageId } = await searchParams;
  return <NewBookingView leadId={leadId} customPackageId={customPackageId} />;
}
