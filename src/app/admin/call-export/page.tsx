import { Download } from "lucide-react";
import { db } from "@/lib/db";
import { LeadSource, LeadStatus } from "@/generated/prisma/enums";
import { sourceLabels, statusLabels } from "@/components/admin/leads/statusStyles";
import FilterSelect from "@/components/admin/FilterSelect";

export default async function CallExportPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string }>;
}) {
  const { source, status } = await searchParams;

  const count = await db.lead.count({
    where: {
      ...(source ? { source: source as (typeof LeadSource)[keyof typeof LeadSource] } : {}),
      ...(status ? { status: status as (typeof LeadStatus)[keyof typeof LeadStatus] } : {}),
    },
  });

  const exportHref = `/api/admin/leads/export${source || status ? "?" : ""}${[
    source ? `source=${source}` : "",
    status ? `status=${status}` : "",
  ]
    .filter(Boolean)
    .join("&")}`;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Call Export</h1>
      <p className="mt-1 text-sm text-ink-500">Export lead contact details as a CSV file for calling campaigns.</p>

      <div className="mt-6 max-w-lg rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <form className="flex flex-wrap gap-3" action="/admin/call-export" method="get">
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
          <button type="submit" className="rounded-xl border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50">
            Apply Filter
          </button>
        </form>

        <p className="mt-5 text-sm text-ink-700">
          <span className="font-heading text-2xl font-extrabold text-ink-900">{count}</span> lead{count === 1 ? "" : "s"} match this filter.
        </p>

        <a
          href={exportHref}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
        >
          <Download className="h-4 w-4" />
          Download CSV
        </a>
      </div>
    </div>
  );
}
