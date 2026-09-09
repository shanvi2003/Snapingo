import LeadActivitiesPage from "@/components/admin/LeadActivitiesPage";

export default function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  return <LeadActivitiesPage searchParams={searchParams} />;
}
