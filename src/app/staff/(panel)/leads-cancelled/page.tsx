import { requireStaffFeature } from "@/lib/dal";
import LeadsInboxPage, { type LeadsSearchParams } from "@/components/admin/leads/LeadsInboxPage";

export default async function StaffCancelledLeadsPage({
  searchParams,
}: {
  searchParams: Promise<LeadsSearchParams>;
}) {
  await requireStaffFeature("leads");
  return (
    <LeadsInboxPage
      basePath="/staff/leads"
      searchParams={searchParams}
      title="Cancelled Leads"
      subtitle="Leads marked Cancelled — including every lead where staff chose “Won’t Book With Me”."
      fixedStatus="CANCELLED"
    />
  );
}
