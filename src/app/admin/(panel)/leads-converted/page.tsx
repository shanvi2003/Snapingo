import LeadsInboxPage, { type LeadsSearchParams } from "@/components/admin/leads/LeadsInboxPage";

export default async function AdminConvertedLeadsPage({ searchParams }: { searchParams: Promise<LeadsSearchParams> }) {
  return (
    <LeadsInboxPage
      basePath="/admin/leads"
      searchParams={searchParams}
      title="Converted Leads"
      subtitle="Leads that turned into a booking."
      fixedStatus="CONVERTED"
    />
  );
}
