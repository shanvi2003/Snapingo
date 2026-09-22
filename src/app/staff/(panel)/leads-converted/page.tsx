import { requireStaffFeature } from "@/lib/dal";
import LeadsInboxPage, { type LeadsSearchParams } from "@/components/admin/leads/LeadsInboxPage";

export default async function StaffConvertedLeadsPage({ searchParams }: { searchParams: Promise<LeadsSearchParams> }) {
  await requireStaffFeature("leads");
  return (
    <LeadsInboxPage
      basePath="/staff/leads"
      searchParams={searchParams}
      title="Converted Leads"
      subtitle="Leads that turned into a booking."
      fixedStatus="CONVERTED"
    />
  );
}
