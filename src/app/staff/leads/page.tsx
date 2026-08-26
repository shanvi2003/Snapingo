import { requireStaffFeature } from "@/lib/dal";
import LeadsInboxPage from "@/components/admin/leads/LeadsInboxPage";

export default async function StaffLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; q?: string }>;
}) {
  await requireStaffFeature("leads");
  return <LeadsInboxPage basePath="/staff/leads" searchParams={searchParams} />;
}
