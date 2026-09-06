import { requireStaffFeature } from "@/lib/dal";
import FaqManager from "@/components/admin/cms/FaqManager";

export default async function StaffFaqPage() {
  await requireStaffFeature("contentEdit");
  return <FaqManager />;
}
