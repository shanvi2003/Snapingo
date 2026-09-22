import LeadsInboxPage, { type LeadsSearchParams } from "@/components/admin/leads/LeadsInboxPage";

export default function AdminCancelledLeadsPage({
  searchParams,
}: {
  searchParams: Promise<LeadsSearchParams>;
}) {
  return (
    <LeadsInboxPage
      basePath="/admin/leads"
      searchParams={searchParams}
      title="Cancelled Leads"
      subtitle="Leads marked Cancelled — including every lead where staff chose “Won’t Book With Me”."
      fixedStatus="CANCELLED"
    />
  );
}
