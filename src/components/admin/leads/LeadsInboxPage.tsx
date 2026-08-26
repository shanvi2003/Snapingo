import Link from "next/link";
import { db } from "@/lib/db";
import { LeadSource, LeadStatus } from "@/generated/prisma/enums";
import { sourceLabels, statusLabels, statusStyles } from "@/components/admin/leads/statusStyles";
import FilterSelect from "@/components/admin/FilterSelect";

export default async function LeadsInboxPage({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams: Promise<{ source?: string; status?: string; q?: string }>;
}) {
  const { source, status, q } = await searchParams;

  const leads = await db.lead.findMany({
    where: {
      ...(source ? { source: source as LeadSource } : {}),
      ...(status ? { status: status as LeadStatus } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { destinationName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { assignedTo: { select: { name: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Leads</h1>
      <p className="mt-1 text-sm text-ink-500">{leads.length} lead{leads.length === 1 ? "" : "s"}</p>

      <form className="mt-6 flex flex-wrap gap-3" action={basePath} method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search name, phone, email, destination..."
          className="min-w-[240px] flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <div className="w-48">
          <FilterSelect
            name="source"
            defaultValue={source ?? ""}
            placeholder="All sources"
            options={[
              { value: "", label: "All sources" },
              ...Object.values(LeadSource).map((s) => ({ value: s, label: sourceLabels[s] })),
            ]}
          />
        </div>
        <div className="w-44">
          <FilterSelect
            name="status"
            defaultValue={status ?? ""}
            placeholder="All statuses"
            options={[
              { value: "", label: "All statuses" },
              ...Object.values(LeadStatus).map((s) => ({ value: s, label: statusLabels[s] })),
            ]}
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          Filter
        </button>
        {(source || status || q) && (
          <Link
            href={basePath}
            className="flex items-center rounded-xl border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <Link href={`${basePath}/${lead.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {lead.name || lead.phone || lead.email || "Anonymous"}
                  </Link>
                  {lead.phone && lead.name && <p className="text-xs text-ink-500">{lead.phone}</p>}
                </td>
                <td className="px-4 py-3 text-ink-700">{sourceLabels[lead.source]}</td>
                <td className="px-4 py-3 text-ink-700">
                  {lead.destinationName || lead.packageTitle || lead.hotelName || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[lead.status]}`}>
                    {statusLabels[lead.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-700">{lead.assignedTo?.name ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                  {lead.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-500">
                  No leads match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

