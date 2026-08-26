import { requireSession } from "@/lib/dal";
import { db } from "@/lib/db";
import ChangePasswordForm from "@/components/admin/settings/ChangePasswordForm";

export default async function StaffSettingsPage() {
  const session = await requireSession(["ADMIN", "STAFF"]);
  const user = await db.staffUser.findUniqueOrThrow({ where: { id: session.userId } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Settings</h1>
      <p className="mt-1 text-sm text-ink-500">Account settings for {user.email}.</p>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-ink-900">Change Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
