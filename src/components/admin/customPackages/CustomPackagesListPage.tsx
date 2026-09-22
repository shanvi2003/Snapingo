import Link from "next/link";
import { Download, FileText, Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { formatRupees } from "@/lib/gst";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { deleteCustomPackageAction } from "@/lib/actions/customPackages";
import Pagination, { PAGE_SIZE } from "@/components/admin/Pagination";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function CustomPackagesListPage({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const q = params.q?.trim();
  const page = Math.max(1, Number(params.page) || 1);

  const where = q
    ? {
        OR: [
          { tripId: { contains: q, mode: "insensitive" as const } },
          { customerName: { contains: q, mode: "insensitive" as const } },
          { customerPhone: { contains: q, mode: "insensitive" as const } },
          { customerEmail: { contains: q, mode: "insensitive" as const } },
          { destinationName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, quotations] = await Promise.all([
    db.customPackage.count({ where }),
    db.customPackage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { createdBy: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">Customized Packages</h1>
          <p className="mt-1 text-sm text-ink-500">
            {total} quotation{total === 1 ? "" : "s"} · never shown on the website
          </p>
        </div>
        <Link
          href={`${basePath}/custom-packages/new`}
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New Customized Package
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" action={`${basePath}/custom-packages`} method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search Trip ID, customer, phone, email or destination..."
          className="min-w-[260px] flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Trip ID</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Travel</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {quotations.map((quotation) => (
              <tr key={quotation.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <Link
                    href={`${basePath}/custom-packages/${quotation.id}`}
                    className="font-mono text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {quotation.tripId}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{quotation.customerName}</p>
                  <p className="text-xs text-ink-500">{quotation.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-ink-700">{quotation.destinationName}</td>
                <td className="px-4 py-3 text-ink-700">
                  {quotation.startDate ? fmtDate(quotation.startDate) : "—"}
                  <p className="text-xs text-ink-500">
                    {quotation.durationNights}N / {quotation.durationDays}D
                  </p>
                </td>
                <td className="px-4 py-3 font-semibold text-ink-900">
                  {formatRupees(quotation.totalAmount)}
                </td>
                <td className="px-4 py-3 text-xs text-ink-500">
                  {fmtDate(quotation.createdAt)}
                  <p>{quotation.createdBy.name}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/api/admin/custom-packages/${quotation.id}/pdf`}
                      className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </a>
                    <Link
                      href={`${basePath}/custom-packages/${quotation.id}/edit`}
                      className="flex items-center gap-1 text-xs font-semibold text-ink-500 hover:text-brand-600"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    <DeleteButton
                      id={quotation.id}
                      action={deleteCustomPackageAction}
                      confirmText={`Delete quotation ${quotation.tripId} for ${quotation.customerName}? This cannot be undone.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-500">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-ink-300" />
                  No customized packages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={total} page={page} basePath={`${basePath}/custom-packages`} params={{ q }} />
    </div>
  );
}
