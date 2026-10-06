import { requireSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { getSettings, settingDefinitions, settingKeys } from "@/lib/settings";
import ChangePasswordForm from "@/components/admin/settings/ChangePasswordForm";
import PdfContentForm from "@/components/admin/cms/PdfContentForm";

export default async function AdminSettingsPage() {
  const session = await requireSession(["ADMIN", "STAFF"]);
  const isAdmin = session.role === "ADMIN";
  const [user, settings] = await Promise.all([
    db.staffUser.findUniqueOrThrow({ where: { id: session.userId } }),
    isAdmin ? getSettings() : null,
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Settings</h1>
      <p className="mt-1 text-sm text-ink-500">Account settings for {user.email}.</p>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-ink-900">Change Password</h2>
        <ChangePasswordForm />
      </div>

      {/* Company-wide values (GST rate, operation-head contact, Trip ID
          prefix, email sender) - admin only, since they reach every
          customer-facing document. These used to sit on a separate
          "Itinerary PDF Content" page alongside the PDF text sections, which
          are now edited per package and per quotation instead. */}
      {settings && (
        <PdfContentForm
          settings={settings}
          settingFields={settingKeys.map((key) => ({
            key,
            label: settingDefinitions[key].label,
            help: settingDefinitions[key].help,
          }))}
        />
      )}
    </div>
  );
}
