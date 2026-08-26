import LeadsInboxPage from "@/components/admin/leads/LeadsInboxPage";

export default function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; q?: string }>;
}) {
  return <LeadsInboxPage basePath="/admin/leads" searchParams={searchParams} />;
}
