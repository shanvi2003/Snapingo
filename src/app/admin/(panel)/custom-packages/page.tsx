import { requireStaffFeature } from "@/lib/dal";
import CustomPackagesListPage from "@/components/admin/customPackages/CustomPackagesListPage";

export default async function AdminCustomPackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireStaffFeature("customPackages");
  return <CustomPackagesListPage basePath="/admin" searchParams={searchParams} />;
}
