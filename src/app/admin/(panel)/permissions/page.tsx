import type { Metadata } from "next";
import { getAllRolePermissions } from "@/lib/rolePermissions";
import PermissionsTable from "@/components/admin/PermissionsTable";

export const metadata: Metadata = {
  title: "Staff Access | Snapingo Admin",
};

export default async function AdminPermissionsPage() {
  const permissions = await getAllRolePermissions();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Staff Access</h1>
      <p className="mt-1 text-sm text-ink-500">
        What each staff role can view and edit. Admin always has full access. Changes take effect immediately —
        no need for that staff member to sign out and back in.
      </p>

      <PermissionsTable initialPermissions={permissions} />
    </div>
  );
}
