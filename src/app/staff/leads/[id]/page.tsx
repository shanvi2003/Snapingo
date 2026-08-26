import { requireStaffFeature } from "@/lib/dal";
import LeadDetailView from "@/components/admin/leads/LeadDetailView";

export default async function StaffLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("leads");
  const { id } = await params;
  return <LeadDetailView basePath="/staff/leads" leadId={id} />;
}
