import { db } from "@/lib/db";
import { sourceLabels, statusLabels } from "@/components/admin/leads/statusStyles";

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-ink-700">{label}</span>
        <span className="font-semibold text-ink-900">{value}</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-ink-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default async function AdminReportsPage() {
  const now = new Date();
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [bySource, byStatus, byDestination, last14Days, totalLeads, totalBookings, totalRevenue] = await Promise.all([
    db.lead.groupBy({ by: ["source"], _count: { _all: true } }),
    db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    db.lead.groupBy({
      by: ["destinationName"],
      where: { destinationName: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { destinationName: "desc" } },
      take: 10,
    }),
    db.lead.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
    db.lead.count(),
    db.booking.count(),
    db.payment.aggregate({ _sum: { amount: true } }),
  ]);

  const sourceMax = Math.max(1, ...bySource.map((r) => r._count._all));
  const statusMax = Math.max(1, ...byStatus.map((r) => r._count._all));
  const destinationMax = Math.max(1, ...byDestination.map((r) => r._count._all));

  const dayBuckets: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dayBuckets[d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })] = 0;
  }
  for (const lead of last14Days) {
    const key = lead.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (key in dayBuckets) dayBuckets[key] += 1;
  }
  const dayMax = Math.max(1, ...Object.values(dayBuckets));

  const converted = byStatus.find((r) => r.status === "CONVERTED")?._count._all ?? 0;
  const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : "0.0";

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Lead Report</h1>
      <p className="mt-1 text-sm text-ink-500">Overview of lead volume, sources, and conversion.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Total Leads</p>
          <p className="mt-2 font-heading text-2xl font-extrabold text-ink-900">{totalLeads}</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Conversion Rate</p>
          <p className="mt-2 font-heading text-2xl font-extrabold text-brand-600">{conversionRate}%</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Total Bookings</p>
          <p className="mt-2 font-heading text-2xl font-extrabold text-ink-900">{totalBookings}</p>
        </div>
        <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-500">Revenue Collected</p>
          <p className="mt-2 font-heading text-2xl font-extrabold text-emerald-600">
            ₹{(totalRevenue._sum.amount ?? 0).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Leads by Source</h2>
          <div className="mt-4 space-y-3">
            {bySource.map((r) => (
              <Bar key={r.source} label={sourceLabels[r.source]} value={r._count._all} max={sourceMax} />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Leads by Status</h2>
          <div className="mt-4 space-y-3">
            {byStatus.map((r) => (
              <Bar key={r.status} label={statusLabels[r.status]} value={r._count._all} max={statusMax} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-ink-900">Most Popular Destinations</h2>
        <p className="mt-1 text-xs text-ink-500">By number of leads mentioning that destination.</p>
        <div className="mt-4 space-y-3">
          {byDestination.map((r) => (
            <Bar key={r.destinationName} label={r.destinationName ?? "Unknown"} value={r._count._all} max={destinationMax} />
          ))}
          {byDestination.length === 0 && <p className="text-sm text-ink-500">No destination data yet.</p>}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-ink-900">Leads — Last 14 Days</h2>
        <div className="mt-4 flex items-end gap-1.5 overflow-x-auto">
          {Object.entries(dayBuckets).map(([day, count]) => (
            <div key={day} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end">
                <div
                  className="w-full rounded-t-md bg-brand-500"
                  style={{ height: `${Math.max(4, (count / dayMax) * 100)}%` }}
                  title={`${day}: ${count}`}
                />
              </div>
              <p className="text-[10px] text-ink-500">{day.split(" ")[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
