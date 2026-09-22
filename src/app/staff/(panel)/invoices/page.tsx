import { requireStaffFeature } from "@/lib/dal";
import InvoicesListPage from "@/components/admin/bookings/InvoicesListPage";

export default async function StaffInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireStaffFeature("bookings");
  return <InvoicesListPage basePath="/staff" searchParams={searchParams} />;
}
