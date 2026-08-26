import { requireStaffFeature } from "@/lib/dal";
import PackagesListPage from "@/components/admin/cms/PackagesListPage";

export default async function StaffPackagesEditPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaffFeature("contentEdit");
  return <PackagesListPage searchParams={searchParams} basePath="/staff" />;
}
