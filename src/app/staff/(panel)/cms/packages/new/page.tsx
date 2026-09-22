import { requireStaffFeature } from "@/lib/dal";
import PackageFormPage from "@/components/admin/cms/PackageFormPage";

export default async function StaffNewPackagePage() {
  await requireStaffFeature("packagesEdit");
  return <PackageFormPage isNew basePath="/staff" />;
}
