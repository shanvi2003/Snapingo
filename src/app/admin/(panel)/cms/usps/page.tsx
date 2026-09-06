import { getUsps } from "@/lib/content/homepage";
import UspsForm from "@/components/admin/cms/UspsForm";

export default async function AdminUspsPage() {
  const rows = await getUsps();
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Why Choose Us</h1>
      <p className="mt-1 text-sm text-ink-500">The 4 highlight cards on the dark &ldquo;Travel planning, minus the chaos&rdquo; homepage section.</p>
      <UspsForm initialRows={rows} />
    </div>
  );
}
