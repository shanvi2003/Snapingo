import { requireStaffFeature } from "@/lib/dal";
import DestinationsListPage from "@/components/admin/cms/DestinationsListPage";

export default async function StaffDestinationsEditPage() {
  await requireStaffFeature("contentEdit");
  return <DestinationsListPage basePath="/staff" />;
}
