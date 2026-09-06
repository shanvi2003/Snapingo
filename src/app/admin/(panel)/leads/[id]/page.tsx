import LeadDetailView from "@/components/admin/leads/LeadDetailView";

export default async function AdminLeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LeadDetailView basePath="/admin/leads" leadId={id} />;
}
