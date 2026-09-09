import { requireStaffFeature } from "@/lib/dal";
import FlightsListPage from "@/components/admin/cms/FlightsListPage";

export default async function StaffFlightsEditPage() {
  await requireStaffFeature("flightsEdit");
  return <FlightsListPage basePath="/staff" />;
}
