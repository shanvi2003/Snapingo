import { requireStaffFeature } from "@/lib/dal";
import PackageFormPage from "@/components/admin/cms/PackageFormPage";

export default async function StaffEditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("packagesEdit");
  const { id } = await params;
  return <PackageFormPage isNew={false} packageId={id} basePath="/staff" />;
}
