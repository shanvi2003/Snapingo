import { requireSession } from "@/lib/dal";
import { db } from "@/lib/db";
import CreateStaffForm from "@/components/admin/team/CreateStaffForm";
import StaffRow from "@/components/admin/team/StaffRow";

export default async function AdminTeamPage() {
  const session = await requireSession(["ADMIN"]);
  const staff = await db.staffUser.findMany({ where: { role: "STAFF" }, orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Staff Accounts</h1>
      <p className="mt-1 text-sm text-ink-500">
        Manage staff logins. Changing a job role takes effect the next time that person logs in.
      </p>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-ink-900">New Staff Account</h2>
        <CreateStaffForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] table-fixed text-left text-sm">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[24%]" />
            <col className="w-[14%]" />
            <col className="w-[28%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <StaffRow
                key={s.id}
                id={s.id}
                name={s.name}
                email={s.email}
                role={s.role}
                jobRole={s.jobRole}
                isActive={s.isActive}
                isSelf={s.id === session.userId}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
