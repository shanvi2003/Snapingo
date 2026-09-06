import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { getLeadStats } from "@/lib/leads";
import { staffCan, jobRoleLabels } from "@/lib/permissions";
import StatCard from "@/components/admin/StatCard";

export default async function StaffDashboardPage() {
  const session = await requireSession(["ADMIN", "STAFF"]);
  const user = await db.staffUser.findUniqueOrThrow({ where: { id: session.userId } });
  const canLeads = user.role === "ADMIN" || staffCan(user.jobRole, "leads");

  if (!canLeads) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink-900">Welcome, {user.name}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {user.jobRole ? jobRoleLabels[user.jobRole] : "Staff"} — use the sidebar to get to your tools.
        </p>
      </div>
    );
  }

  const stats = await getLeadStats();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-500">Leads that need a response.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="New leads" value={stats.new} accent />
        <StatCard label="Leads today" value={stats.today} />
        <StatCard label="Contacted" value={stats.contacted} />
        <StatCard label="Total leads" value={stats.total} />
      </div>

      <div className="mt-8 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-ink-900">Leads inbox</h2>
          <Link href="/staff/leads" className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <p className="mt-2 text-sm text-ink-500">
          {stats.total === 0
            ? "No leads yet — as soon as someone fills out a form on the site, it'll show up here."
            : `${stats.new} new leads waiting.`}
        </p>
      </div>
    </div>
  );
}
