import { requireStaffFeature } from "@/lib/dal";
import CustomPackageFormPage from "@/components/admin/customPackages/CustomPackageFormPage";

export default async function AdminEditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  // Editing a lead here means building its quotation, so it needs both.
  await requireStaffFeature("leads");
  await requireStaffFeature("customPackages");
  const { id } = await params;
  return <CustomPackageFormPage editLeadId={id} />;
}
