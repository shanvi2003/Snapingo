import Link from "next/link";
import { Activity, PenLine, ShieldCheck, UserPlus2 } from "lucide-react";
import { db } from "@/lib/db";
import { LeadActivityType } from "@/generated/prisma/enums";
import FilterSelect from "@/components/admin/FilterSelect";

const icons: Record<LeadActivityType, typeof Activity> = {
  CREATED: Activity,
  STATUS_CHANGED: ShieldCheck,
  ASSIGNED: UserPlus2,
  NOTE_ADDED: PenLine,
};

const typeLabels: Record<LeadActivityType, string> = {
  CREATED: "Created",
  STATUS_CHANGED: "Status Changed",
  ASSIGNED: "Assigned",
  NOTE_ADDED: "Note Added",
};

export default async function AdminActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { q, type } = await searchParams;
  const query = q?.trim();

  const activities = await db.leadActivity.findMany({
    where: {
      ...(type ? { type: type as LeadActivityType } : {}),
      ...(query
        ? {
            OR: [
              { message: { contains: query, mode: "insensitive" } },
              { lead: { name: { contains: query, mode: "insensitive" } } },
              { lead: { phone: { contains: query, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { lead: { select: { id: true, name: true, phone: true, email: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Lead Activities</h1>
      <p className="mt-1 text-sm text-ink-500">Recent activity across every lead.</p>

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/activities" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search lead name, phone or activity..."
          className="min-w-[240px] flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <div className="w-52">
          <FilterSelect
            name="type"
            defaultValue={type ?? ""}
            placeholder="All activity types"
            options={[
              { value: "", label: "All activity types" },
              ...Object.values(LeadActivityType).map((t) => ({ value: t, label: typeLabels[t] })),
            ]}
          />
        </div>
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Filter
        </button>
      </form>

      <div className="mt-6 space-y-2">
        {activities.map((a) => {
          const Icon = icons[a.type];
          const leadLabel = a.lead.name || a.lead.phone || a.lead.email || "Anonymous lead";
          return (
            <Link
              key={a.id}
              href={`/admin/leads/${a.lead.id}`}
              className="flex items-start gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm transition hover:border-brand-200"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-ink-900">{a.message}</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {leadLabel} · {a.createdAt.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </Link>
          );
        })}
        {activities.length === 0 && (
          <p className="rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-500 shadow-sm">
            No activity matches.
          </p>
        )}
      </div>
    </div>
  );
}
