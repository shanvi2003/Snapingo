import { requireStaffFeature } from "@/lib/dal";
import CustomPackagesListPage, {
  type CustomPackagesSearchParams,
} from "@/components/admin/customPackages/CustomPackagesListPage";

export default async function AdminCustomPackagesPage({
  searchParams,
}: {
  searchParams: Promise<CustomPackagesSearchParams>;
}) {
  await requireStaffFeature("customPackages");
  return <CustomPackagesListPage basePath="/admin" searchParams={searchParams} />;
}
