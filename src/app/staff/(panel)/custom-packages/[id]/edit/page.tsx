import { requireStaffFeature } from "@/lib/dal";
import CustomPackageFormPage from "@/components/admin/customPackages/CustomPackageFormPage";

export default async function StaffEditCustomPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("customPackages");
  const { id } = await params;
  return <CustomPackageFormPage isNew={false} customPackageId={id} />;
}
