import { requireStaffFeature } from "@/lib/dal";
import HotelsListPage from "@/components/admin/cms/HotelsListPage";

export default async function StaffHotelsEditPage() {
  await requireStaffFeature("hotelsEdit");
  return <HotelsListPage basePath="/staff" />;
}
