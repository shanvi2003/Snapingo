import LeadsInboxPage, { type LeadsSearchParams } from "@/components/admin/leads/LeadsInboxPage";

export default function AdminLeadsPage({ searchParams }: { searchParams: Promise<LeadsSearchParams> }) {
  return <LeadsInboxPage basePath="/admin/leads" searchParams={searchParams} />;
}
