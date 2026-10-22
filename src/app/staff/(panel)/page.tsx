import Link from "next/link";
import { CheckCircle2, Inbox, PhoneCall, UserPlus } from "lucide-react";
import { requireSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { getLeadStats, leadScope } from "@/lib/leads";
import { hasFeature, jobRoleLabels } from "@/lib/permissions";
import { getRolePermissions } from "@/lib/rolePermissions";
import BarChart from "@/components/admin/charts/BarChart";
import PipelineDonut from "@/components/admin/charts/PipelineDonut";
import { Empty, Panel, greeting, istDayKey, lastThirtyDays, leadPipeline } from "@/components/admin/dashboard/shared";

export default async function StaffDashboardPage() {
  const session = await requireSession(["ADMIN", "STAFF"]);
  const user = await db.staffUser.findUniqueOrThrow({ where: { id: session.userId } });
  const canLeads =
    user.role === "ADMIN" || (user.jobRole ? hasFeature(await getRolePermissions(user.jobRole), "leads") : false);

  if (!canLeads) {
    return (
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink-900">Welcome, {user.name}</h1>
        <p className="mt-1 text-sm text-ink-500">
          {user.jobRole ? jobRoleLabels[user.jobRole] : "Staff"}. Use the sidebar to get to your tools.
        </p>
      </div>
    );
  }

  // Staff count only the leads assigned to them - the same ones their inbox shows.
  const scope = leadScope(session);
  const now = new Date();
  const { days, since } = lastThirtyDays(now);
  const [stats, recentLeads] = await Promise.all([
    getLeadStats(scope),
    // A lead reaches a staff member when it's assigned, which can be days
    // after the enquiry came in. Older leads predate assignedAt, so those
    // fall back to when they were created.
    db.lead.findMany({
      where: {
        ...scope,
        OR: [{ assignedAt: { gte: since } }, { assignedAt: null, createdAt: { gte: since } }],
      },
      select: { assignedAt: true, createdAt: true },
    }),
  ]);

  const dayByKey = new Map(days.map((d) => [d.key, d]));
  for (const l of recentLeads) {
    const d = dayByKey.get(istDayKey(l.assignedAt ?? l.createdAt));
    if (d) d.value += 1;
  }
  const leadsToday = days[29].value;
  const leadsYesterday = days[28].value;
  const leads30 = days.reduce((sum, d) => sum + d.value, 0);
  const busiest = days.reduce((best, d) => (d.value > best.value ? d : best), days[0]);

  const pipeline = leadPipeline(stats);
  const conversion = stats.total ? Math.round((stats.converted / stats.total) * 1000) / 10 : 0;

  return (
    <div className="mx-auto max-w-7xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
          </p>
          <h1 className="mt-0.5 font-heading text-2xl font-bold text-ink-900">
            {greeting(now)}, {user.name.split(" ")[0]}
          </h1>
        </div>
        <Link
          href="/staff/leads?status=NEW"
          className="rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 hover:border-ink-300"
        >
          Open leads inbox
        </Link>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-ink-200">
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <Inbox className="h-6 w-6 rounded-md bg-brand-50 p-1 text-brand-600" />
            Waiting for first call
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-brand-600">{stats.new}</span>
            <span className="text-xs text-ink-400">of {stats.total} leads</span>
          </dd>
        </div>
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <UserPlus className="h-6 w-6 rounded-md bg-violet-50 p-1 text-violet-600" />
            Assigned today
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-ink-900">{leadsToday}</span>
            <span className="text-xs text-ink-400">{leadsYesterday} yesterday</span>
          </dd>
        </div>
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <PhoneCall className="h-6 w-6 rounded-md bg-amber-50 p-1 text-amber-600" />
            In progress
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-ink-900">
              {stats.assigned + stats.contacted + stats.quoted}
            </span>
            <span className="text-xs text-ink-400">{stats.quoted} quoted</span>
          </dd>
        </div>
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <CheckCircle2 className="h-6 w-6 rounded-md bg-emerald-50 p-1 text-emerald-600" />
            Converted
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-emerald-700">{stats.converted}</span>
            <span className="text-xs text-ink-400">{conversion}% of your leads</span>
          </dd>
        </div>
      </dl>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Your lead pipeline" href="/staff/leads" linkLabel="All leads">
          {stats.total === 0 ? (
            <Empty>No leads assigned to you yet. They&apos;ll show up here once an admin assigns them.</Empty>
          ) : (
            <div className="flex flex-1 flex-col justify-center px-5 pb-4 pt-3">
              <PipelineDonut slices={pipeline} total={stats.total} basePath="/staff/leads" />
              <p className="mt-3 px-2 text-xs text-ink-500">
                <span className="font-semibold text-ink-900">{conversion}%</span> of your leads converted to a booking.
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Leads assigned per day, last 30 days" href="/staff/leads" linkLabel="All leads" className="lg:col-span-2">
          <div className="px-5 pb-4 pt-2">
            <div className="mb-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <p>
                <span className="font-heading text-xl font-bold tabular-nums text-ink-900">{leads30}</span>
                <span className="ml-1.5 text-ink-500">in 30 days</span>
                <span className="ml-1.5 text-xs text-ink-400">≈ {Math.round((leads30 / 30) * 10) / 10}/day</span>
              </p>
              {busiest.value > 0 && (
                <p>
                  <span className="font-heading text-xl font-bold tabular-nums text-ink-900">{busiest.value}</span>
                  <span className="ml-1.5 text-ink-500">busiest day</span>
                  <span className="ml-1.5 text-xs text-ink-400">{busiest.label}</span>
                </p>
              )}
            </div>
            <BarChart
              data={days}
              unit="count"
              tone="violet"
              metric="Leads"
              labelEvery={5}
              emphasizeLast
              emptyText="No leads assigned to you in the last 30 days."
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
