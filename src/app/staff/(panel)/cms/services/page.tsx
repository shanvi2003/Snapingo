import { requireStaffFeature } from "@/lib/dal";
import ServicesListPage from "@/components/admin/cms/ServicesListPage";

export default async function StaffServicesEditPage() {
  await requireStaffFeature("contentEdit");
  return <ServicesListPage basePath="/staff" />;
}
