import Link from "next/link";
import { CalendarCheck, Percent, UserPlus, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { getLeadStats } from "@/lib/leads";
import BarChart from "@/components/admin/charts/BarChart";
import PipelineDonut from "@/components/admin/charts/PipelineDonut";
import { sourceLabels } from "@/components/admin/leads/statusStyles";
import { Empty, Panel, istDayKey, lastThirtyDays, leadPipeline } from "@/components/admin/dashboard/shared";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Fixed hue per source, same family as the pipeline donut, so a source keeps
// its colour as the ranking changes.
const SOURCE_COLORS: Record<string, string> = {
  META_ADS: "#ec1278",
  TRIP_PLANNER: "#6366f1",
  CAB_BOOKING: "#f59e0b",
  CONTACT_FORM: "#0ea5e9",
  PACKAGE_INTEREST: "#059669",
  HOTEL_BOOKING: "#8b5cf6",
  FLIGHT_BOOKING: "#14b8a6",
  TRAVEL_GUIDE: "#f97316",
  GENERAL_ENQUIRY: "#c9b0c1",
};

type RankRow = { key: string; label: string; count: number };

// Ranked rows that open the leads inbox filtered to that destination. Bar
// length is relative to the top row; the share is of the whole list.
function DestinationList({ rows, total }: { rows: RankRow[]; total: number }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ol className="grid grid-cols-1 gap-x-6 px-3 pb-3 pt-2 sm:grid-cols-2">
      {rows.map((r, i) => (
        <li key={r.key}>
          <Link
            href={`/admin/leads?destination=${encodeURIComponent(r.label)}`}
            className="group flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-ink-50"
          >
            <span className="w-4 shrink-0 text-right text-xs font-medium tabular-nums text-ink-400">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate text-ink-700 group-hover:text-ink-900">{r.label}</span>
                <span className="shrink-0 tabular-nums">
                  <span className="font-medium text-ink-900">{r.count.toLocaleString("en-IN")}</span>
                  <span className="ml-1.5 inline-block w-8 text-right text-xs text-ink-400">
                    {total ? Math.round((r.count / total) * 100) : 0}%
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-ink-100">
                <div className="h-full rounded-full bg-violet-400" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ol>
  );
}

export default async function AdminReportsPage() {
  const now = new Date();
  const { days, since } = lastThirtyDays(now);

  const [stats, bySource, byDestination, recentLeads, bookingCount, revenue] = await Promise.all([
    getLeadStats(),
    db.lead.groupBy({ by: ["source"], _count: { _all: true } }),
    db.lead.groupBy({
      by: ["destinationName"],
      where: { destinationName: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { destinationName: "desc" } },
      take: 10,
    }),
    db.lead.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    db.booking.count({ where: { status: { not: "CANCELLED" }, deletedAt: null } }),
    db.payment.aggregate({ where: { booking: { deletedAt: null } }, _sum: { amount: true }, _count: true }),
  ]);

  const dayByKey = new Map(days.map((d) => [d.key, d]));
  for (const l of recentLeads) {
    const d = dayByKey.get(istDayKey(l.createdAt));
    if (d) d.value += 1;
  }
  const leads30 = days.reduce((sum, d) => sum + d.value, 0);
  const busiest = days.reduce((best, d) => (d.value > best.value ? d : best), days[0]);

  const sources: RankRow[] = bySource
    .map((r) => ({ key: r.source, label: sourceLabels[r.source] ?? r.source, count: r._count._all }))
    .sort((a, b) => b.count - a.count);
  const destinations: RankRow[] = byDestination.map((r) => ({
    key: r.destinationName ?? "unknown",
    label: r.destinationName ?? "Unknown",
    count: r._count._all,
  }));
  const destinationTotal = destinations.reduce((sum, r) => sum + r.count, 0);

  const pipeline = leadPipeline(stats);
  const conversion = stats.total ? Math.round((stats.converted / stats.total) * 1000) / 10 : 0;
  const topSource = sources[0];

  return (
    <div className="mx-auto max-w-7xl">
      <header>
        <p className="text-sm text-ink-500">Insights</p>
        <h1 className="mt-0.5 font-heading text-2xl font-bold text-ink-900">Lead Report</h1>
      </header>

      <dl className="mt-8 grid grid-cols-2 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-ink-200">
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <UserPlus className="h-6 w-6 rounded-md bg-brand-50 p-1 text-brand-600" />
            Total leads
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-ink-900">{stats.total.toLocaleString("en-IN")}</span>
            <span className="text-xs text-ink-400">{leads30} in 30 days</span>
          </dd>
        </div>
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <Percent className="h-6 w-6 rounded-md bg-violet-50 p-1 text-violet-600" />
            Conversion rate
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-brand-600">{conversion}%</span>
            <span className="text-xs text-ink-400">{stats.converted} converted</span>
          </dd>
        </div>
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <CalendarCheck className="h-6 w-6 rounded-md bg-sky-50 p-1 text-sky-600" />
            Active bookings
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-ink-900">{bookingCount}</span>
          </dd>
        </div>
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <Wallet className="h-6 w-6 rounded-md bg-emerald-50 p-1 text-emerald-600" />
            Revenue collected
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-emerald-700">{inr(revenue._sum.amount ?? 0)}</span>
            <span className="text-xs text-ink-400">
              {revenue._count} payment{revenue._count === 1 ? "" : "s"}
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel title="Leads per day, last 30 days" href="/admin/leads" linkLabel="All leads" className="lg:col-span-2">
          <div className="px-5 pb-4 pt-2">
            <div className="mb-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <p>
                <span className="font-heading text-xl font-bold tabular-nums text-violet-600">{leads30}</span>
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
              emptyText="No leads in the last 30 days."
            />
          </div>
        </Panel>

        <Panel title="Leads by status" href="/admin/leads" linkLabel="All leads">
          {stats.total === 0 ? (
            <Empty>No leads yet.</Empty>
          ) : (
            <div className="flex flex-1 flex-col justify-center px-5 pb-4 pt-3">
              <PipelineDonut slices={pipeline} total={stats.total} basePath="/admin/leads" />
            </div>
          )}
        </Panel>

        <Panel title="Leads by source" href="/admin/leads" linkLabel="All leads">
          {sources.length === 0 ? (
            <Empty>No leads yet.</Empty>
          ) : (
            <div className="flex flex-1 flex-col justify-center px-5 pb-4 pt-3">
              <PipelineDonut
                slices={sources.map((s) => ({ status: s.key, label: s.label, count: s.count, color: SOURCE_COLORS[s.key] ?? "#c9b0c1" }))}
                total={stats.total}
                basePath="/admin/leads"
                param="source"
                label="Leads by source"
                legendColumns={1}
              />
              <p className="mt-3 px-2 text-xs text-ink-500">
                <span className="font-semibold text-ink-900">{topSource.label}</span> brings in the most leads.
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Most popular destinations" href="/admin/leads" linkLabel="All leads" className="lg:col-span-2">
          {destinations.length === 0 ? (
            <Empty>No destination data yet.</Empty>
          ) : (
            <>
              <p className="px-5 pt-1 text-xs text-ink-500">Top 10 by number of leads mentioning that destination.</p>
              <DestinationList rows={destinations} total={destinationTotal} />
            </>
          )}
        </Panel>
      </div>
    </div>
  );
}
