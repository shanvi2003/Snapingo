import { requireStaffFeature } from "@/lib/dal";
import PackagesListPage from "@/components/admin/cms/PackagesListPage";

export default async function StaffPackagesEditPage() {
  await requireStaffFeature("packagesEdit");
  return <PackagesListPage basePath="/staff" />;
}
