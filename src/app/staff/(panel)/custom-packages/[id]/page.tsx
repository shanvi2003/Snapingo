import { requireStaffFeature } from "@/lib/dal";
import CustomPackageDetailView from "@/components/admin/customPackages/CustomPackageDetailView";

export default async function StaffCustomPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("customPackages");
  const { id } = await params;
  return <CustomPackageDetailView basePath="/staff" id={id} />;
}
