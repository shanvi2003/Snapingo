import Link from "next/link";
import { CalendarCheck, Inbox, Plus, UserPlus, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { getLeadStats } from "@/lib/leads";
import AreaChart from "@/components/admin/charts/AreaChart";
import BarChart from "@/components/admin/charts/BarChart";
import PipelineDonut from "@/components/admin/charts/PipelineDonut";
import type { ChartDatum } from "@/components/admin/charts/shared";
import { demoDashboard } from "@/lib/dashboardDemo";
import { Empty, IST_OFFSET_MS, Panel, greeting, istDayKey, lastThirtyDays, leadPipeline } from "@/components/admin/dashboard/shared";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function lastTwelveMonths(now: Date) {
  const [y, m] = istDayKey(now).split("-").map(Number);
  const months: ChartDatum[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 15));
    months.push({
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" }),
      title: d.toLocaleDateString("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }),
      value: 0,
    });
  }
  // Midnight IST on the 1st of the oldest month.
  const since = new Date(Date.UTC(y, m - 12, 1) - IST_OFFSET_MS);
  return { months, since };
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const demo = process.env.NODE_ENV !== "production" && (await searchParams).demo === "1";
  const now = new Date();
  const in14Days = new Date(now);
  in14Days.setDate(in14Days.getDate() + 14);
  const { months, since } = lastTwelveMonths(now);
  const { days, since: leadsSince } = lastThirtyDays(now);

  const [stats, packageCount, destinationCount, blogCount, staffCount, bookingCount, departingCount, revenue, yearPayments, recentLeads] =
    demo
      ? demoDashboard(now)
      : await Promise.all([
          getLeadStats(),
          db.package.count(),
          db.destination.count(),
          db.blogPost.count(),
          db.staffUser.count({ where: { isActive: true, role: "STAFF" } }),
          db.booking.count({ where: { status: { not: "CANCELLED" }, deletedAt: null } }),
          db.booking.count({ where: { travelStartDate: { gte: now, lte: in14Days }, deletedAt: null } }),
          db.payment.aggregate({ where: { booking: { deletedAt: null } }, _sum: { amount: true }, _count: true }),
          db.payment.findMany({ where: { paidAt: { gte: since }, booking: { deletedAt: null } }, select: { amount: true, paidAt: true } }),
          db.lead.findMany({ where: { createdAt: { gte: leadsSince } }, select: { createdAt: true } }),
        ]);

  const monthByKey = new Map(months.map((mo) => [mo.key, mo]));
  const paymentCounts = new Map<string, number>();
  for (const p of yearPayments) {
    const key = istDayKey(p.paidAt).slice(0, 7);
    const mo = monthByKey.get(key);
    if (mo) {
      mo.value += p.amount;
      paymentCounts.set(key, (paymentCounts.get(key) ?? 0) + 1);
    }
  }
  for (const mo of months) mo.detail = { label: "Payments", value: String(paymentCounts.get(mo.key) ?? 0) };
  const yearTotal = months.reduce((sum, mo) => sum + mo.value, 0);
  const thisMonth = months[11].value;
  const lastMonth = months[10].value;
  const monthChange = lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

  const dayByKey = new Map(days.map((d) => [d.key, d]));
  for (const l of recentLeads) {
    const d = dayByKey.get(istDayKey(l.createdAt));
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
      {demo && (
        <p className="mb-8 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Preview with sample data. None of these numbers are real.{" "}
          <Link href="/admin" className="font-medium underline">
            Back to live data
          </Link>
        </p>
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-500">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}
          </p>
          <h1 className="mt-0.5 font-heading text-2xl font-bold text-ink-900">{greeting(now)}</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/leads?status=NEW"
            className="rounded-lg border border-ink-200 bg-white px-3.5 py-2 text-sm font-medium text-ink-700 hover:border-ink-300"
          >
            Open leads inbox
          </Link>
          <Link
            href="/admin/bookings/new"
            className="flex items-center gap-1.5 rounded-lg bg-ink-900 px-3.5 py-2 text-sm font-medium text-white hover:bg-ink-800"
          >
            <Plus className="h-4 w-4" />
            New booking
          </Link>
        </div>
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
            Leads today
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-ink-900">{stats.today}</span>
            <span className="text-xs text-ink-400">{conversion}% converted overall</span>
          </dd>
        </div>
        <div className="pr-4 lg:px-6 lg:first:pl-0">
          <dt className="flex items-center gap-2 text-sm text-ink-500">
            <CalendarCheck className="h-6 w-6 rounded-md bg-sky-50 p-1 text-sky-600" />
            Active bookings
          </dt>
          <dd className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-3xl font-bold tabular-nums text-ink-900">{bookingCount}</span>
            <span className="text-xs text-ink-400">{departingCount} departing in 14 days</span>
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
        <Panel title="Revenue, last 12 months" href="/admin/payments" linkLabel="All payments" className="lg:col-span-2">
          <div className="px-5 pb-4 pt-2">
            <div className="mb-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <p>
                <span className="font-heading text-xl font-bold tabular-nums text-ink-900">{inr(yearTotal)}</span>
                <span className="ml-1.5 text-ink-500">in 12 months</span>
              </p>
              <p>
                <span className="font-heading text-xl font-bold tabular-nums text-ink-900">{inr(thisMonth)}</span>
                <span className="ml-1.5 text-ink-500">this month</span>
                {monthChange !== null && (
                  <span className={`ml-1.5 text-xs font-medium ${monthChange >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                    {monthChange >= 0 ? "▲" : "▼"} {Math.abs(monthChange)}% vs last month
                  </span>
                )}
              </p>
            </div>
            <AreaChart data={months} unit="inr" metric="Revenue" />
          </div>
        </Panel>

        <Panel title="Lead pipeline" href="/admin/leads" linkLabel="All leads">
          {stats.total === 0 ? (
            <Empty>No leads yet. Enquiries from the website will land here.</Empty>
          ) : (
            // Centred in whatever height the revenue card next to it sets, so
            // there's no blank strip under the legend.
            <div className="flex flex-1 flex-col justify-center px-5 pb-4 pt-3">
              <PipelineDonut slices={pipeline} total={stats.total} basePath="/admin/leads" />
              <p className="mt-3 px-2 text-xs text-ink-500">
                <span className="font-semibold text-ink-900">{conversion}%</span> of all leads converted to a booking.
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Leads per day, last 30 days" href="/admin/leads" linkLabel="All leads" className="lg:col-span-3">
          <div className="px-5 pb-4 pt-2">
            <div className="mb-5 flex flex-wrap gap-x-8 gap-y-2 text-sm">
              <p>
                <span className="font-heading text-xl font-bold tabular-nums text-violet-600">{leadsToday}</span>
                <span className="ml-1.5 text-ink-500">today</span>
                <span className="ml-1.5 text-xs text-ink-400">{leadsYesterday} yesterday</span>
              </p>
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
              emptyText="No leads in the last 30 days."
            />
          </div>
        </Panel>
      </div>

      <p className="mt-8 text-xs text-ink-400">
        On the site:{" "}
        <Link href="/admin/cms/packages" className="hover:text-ink-700">
          {packageCount} packages
        </Link>
        {" · "}
        <Link href="/admin/cms/destinations" className="hover:text-ink-700">
          {destinationCount} destinations
        </Link>
        {" · "}
        <Link href="/admin/cms/blog" className="hover:text-ink-700">
          {blogCount} blog posts
        </Link>
        {" · "}
        <Link href="/admin/team" className="hover:text-ink-700">
          {staffCount} active staff
        </Link>
      </p>
    </div>
  );
}
