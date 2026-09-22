import { requireSession } from "@/lib/dal";
import { getContentBlocks } from "@/lib/contentBlocks";
import { getSettings, settingDefinitions, settingKeys } from "@/lib/settings";
import PdfContentForm from "@/components/admin/cms/PdfContentForm";

export default async function PdfContentPage() {
  // Admin-only: this copy goes out on every customer-facing itinerary.
  await requireSession(["ADMIN"]);

  const [blocks, settings] = await Promise.all([getContentBlocks(), getSettings()]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Itinerary PDF Content</h1>
      <p className="mt-1 text-sm text-ink-500">
        The standard sections printed on every itinerary PDF. Changes here apply to all packages
        at once.
      </p>
      <PdfContentForm
        blocks={blocks.map((b) => ({ key: b.key, title: b.title, body: b.body }))}
        settings={settings}
        settingFields={settingKeys.map((key) => ({
          key,
          label: settingDefinitions[key].label,
          help: settingDefinitions[key].help,
        }))}
      />
    </div>
  );
}
