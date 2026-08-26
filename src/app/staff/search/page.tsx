import { requireStaffFeature } from "@/lib/dal";
import CustomerSearchPage from "@/components/admin/CustomerSearchPage";

export default async function StaffSearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("customerSearch");
  return <CustomerSearchPage searchParams={searchParams} basePath="/staff" />;
}
