import { requireStaffFeature } from "@/lib/dal";
import LeadsInboxPage, { type LeadsSearchParams } from "@/components/admin/leads/LeadsInboxPage";

export default async function StaffLeadsPage({ searchParams }: { searchParams: Promise<LeadsSearchParams> }) {
  await requireStaffFeature("leads");
  return <LeadsInboxPage basePath="/staff/leads" searchParams={searchParams} />;
}
