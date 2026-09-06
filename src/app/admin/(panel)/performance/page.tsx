import { db } from "@/lib/db";

export default async function AdminPerformancePage() {
  const staff = await db.staffUser.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      assignedLeads: { select: { status: true } },
      leadNotes: { select: { id: true } },
    },
  });

  const rows = staff.map((s) => {
    const total = s.assignedLeads.length;
    const converted = s.assignedLeads.filter((l) => l.status === "CONVERTED").length;
    const closed = s.assignedLeads.filter((l) => l.status === "CLOSED").length;
    const open = total - converted - closed;
    const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : "0.0";
    return { id: s.id, name: s.name, role: s.role, total, converted, closed, open, rate, notes: s.leadNotes.length };
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Performance</h1>
      <p className="mt-1 text-sm text-ink-500">Leads assigned and converted per staff member.</p>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Open</th>
              <th className="px-4 py-3">Converted</th>
              <th className="px-4 py-3">Closed</th>
              <th className="px-4 py-3">Conversion Rate</th>
              <th className="px-4 py-3">Notes Added</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{r.name}</p>
                  <p className="text-xs text-ink-500 capitalize">{r.role.toLowerCase()}</p>
                </td>
                <td className="px-4 py-3 text-ink-700">{r.total}</td>
                <td className="px-4 py-3 text-ink-700">{r.open}</td>
                <td className="px-4 py-3 font-semibold text-emerald-600">{r.converted}</td>
                <td className="px-4 py-3 text-ink-500">{r.closed}</td>
                <td className="px-4 py-3 font-semibold text-brand-600">{r.rate}%</td>
                <td className="px-4 py-3 text-ink-700">{r.notes}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-500">
                  No staff accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
