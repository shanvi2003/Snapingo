import { requireStaffFeature } from "@/lib/dal";
import { getServiceCategories } from "@/lib/content/homepage";
import ServiceCategoriesForm from "@/components/admin/cms/ServiceCategoriesForm";

export default async function StaffServiceCategoriesPage() {
  await requireStaffFeature("contentEdit");
  const rows = await getServiceCategories();
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Homepage Service Categories</h1>
      <p className="mt-1 text-sm text-ink-500">The &ldquo;Flights / Hotels / Packages...&rdquo; tiles near the top of the homepage.</p>
      <ServiceCategoriesForm initialRows={rows} />
    </div>
  );
}
