import { requireStaffFeature } from "@/lib/dal";
import CustomPackagesListPage from "@/components/admin/customPackages/CustomPackagesListPage";

export default async function StaffCustomPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireStaffFeature("customPackages");
  return <CustomPackagesListPage basePath="/staff" searchParams={searchParams} />;
}
