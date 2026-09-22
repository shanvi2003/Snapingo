import InvoicesListPage from "@/components/admin/bookings/InvoicesListPage";

export default function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  return <InvoicesListPage basePath="/admin" searchParams={searchParams} />;
}
