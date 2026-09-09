import { requireStaffFeature } from "@/lib/dal";
import LeadActivitiesPage from "@/components/admin/LeadActivitiesPage";

export default async function StaffActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  await requireStaffFeature("leadActivities");
  return <LeadActivitiesPage searchParams={searchParams} basePath="/staff" />;
}
