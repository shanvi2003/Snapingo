import { requireStaffFeature } from "@/lib/dal";
import CustomPackageFormPage from "@/components/admin/customPackages/CustomPackageFormPage";

export default async function AdminNewCustomPackagePage({
  searchParams,
}: {
  searchParams: Promise<{ leadId?: string }>;
}) {
  await requireStaffFeature("customPackages");
  const { leadId } = await searchParams;
  return <CustomPackageFormPage isNew leadId={leadId} />;
}
