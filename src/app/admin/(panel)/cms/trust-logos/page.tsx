import { getTrustLogos } from "@/lib/content/homepage";
import TrustLogosForm from "@/components/admin/cms/TrustLogosForm";

export default async function AdminTrustLogosPage() {
  const rows = await getTrustLogos();
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Trust Logos</h1>
      <p className="mt-1 text-sm text-ink-500">The scrolling partner-logo strip on the homepage.</p>
      <TrustLogosForm initialRows={rows} />
    </div>
  );
}
