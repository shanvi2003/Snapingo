import Link from "next/link";
import type { ReactNode } from "react";
import type { ChartDatum } from "@/components/admin/charts/shared";
import type { PipelineSlice } from "@/components/admin/charts/PipelineDonut";
import type { getLeadStats } from "@/lib/leads";

// Pieces shared by the admin and staff dashboards.

// Charts bucket by the IST calendar day/month, not the server's (UTC on
// Vercel), so a lead or payment late at night lands on the date staff expect.
export const istDayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
export const IST_OFFSET_MS = 330 * 60 * 1000;

export function lastThirtyDays(now: Date) {
  const [y, m, day] = istDayKey(now).split("-").map(Number);
  const days: ChartDatum[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1, day - i));
    days.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }),
      title:
        i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }),
      value: 0,
    });
  }
  const since = new Date(Date.UTC(y, m - 1, day - 29) - IST_OFFSET_MS);
  return { days, since };
}

// Closed and cancelled are both "dropped out", so they share one grey slice
// rather than two near-identical ones. Hues are in a fixed order and were
// checked for colour-blind separation; the legend always prints the counts.
const PIPELINE_COLORS = {
  NEW: "#ec1278",
  ASSIGNED: "#6366f1",
  CONTACTED: "#f59e0b",
  QUOTED: "#0ea5e9",
  CONVERTED: "#059669",
  CLOSED: "#c9b0c1",
};

export function leadPipeline(stats: Awaited<ReturnType<typeof getLeadStats>>): PipelineSlice[] {
  return [
    { status: "NEW", label: "New", count: stats.new },
    { status: "ASSIGNED", label: "Assigned", count: stats.assigned },
    { status: "CONTACTED", label: "Contacted", count: stats.contacted },
    { status: "QUOTED", label: "Quoted", count: stats.quoted },
    { status: "CONVERTED", label: "Converted", count: stats.converted },
    { status: "CLOSED", label: "Closed / lost", count: stats.closed + stats.cancelled },
  ].map((s) => ({ ...s, color: PIPELINE_COLORS[s.status as keyof typeof PIPELINE_COLORS] }));
}

export function greeting(now: Date) {
  const h = Number(now.toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Panel({
  title,
  href,
  linkLabel,
  className = "",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`flex flex-col rounded-lg border border-ink-200/70 bg-white pb-2 ${className}`}>
      <div className="flex items-center justify-between px-5 pb-1 pt-5">
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        {href && (
          <Link href={href} className="text-xs font-medium text-ink-500 hover:text-brand-600">
            {linkLabel ?? "See all"}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-5 pb-4 pt-2 text-sm text-ink-400">{children}</p>;
}
