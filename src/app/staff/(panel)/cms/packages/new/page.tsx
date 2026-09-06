import { requireStaffFeature } from "@/lib/dal";
import PackageForm from "@/components/admin/cms/PackageForm";

export default async function StaffNewPackagePage() {
  await requireStaffFeature("contentEdit");
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Package</h1>
      <PackageForm isNew />
    </div>
  );
}
