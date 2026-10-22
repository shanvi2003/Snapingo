import Link from "next/link";
import { Download, FileText, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { canEditCustomPackage } from "@/lib/customPackageAccess";
import { formatRupees } from "@/lib/gst";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { deleteCustomPackageAction, restoreCustomPackageAction } from "@/lib/actions/customPackages";
import Pagination, { PAGE_SIZE } from "@/components/admin/Pagination";
import AutoSearchInput from "@/components/admin/AutoSearchInput";
import { AutoFilterSelect } from "@/components/admin/AutoFilter";
import RestoreButton from "@/components/admin/RestoreButton";

export type CustomPackagesSearchParams = { q?: string; origin?: string; owner?: string; page?: string };

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function CustomPackagesListPage({
  basePath,
  searchParams,
}: {
  basePath: string;
  searchParams?: Promise<CustomPackagesSearchParams>;
}) {
  const params: CustomPackagesSearchParams = searchParams ? await searchParams : {};
  const q = params.q?.trim();
  const origin = params.origin === "lead" || params.origin === "direct" ? params.origin : undefined;
  // Everyone can see and search every quotation; the list just opens on your
  // own, and "All packages" shows the whole team's.
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  // "Deleted" quotations are only archived (see deletedAt in the schema). The
  // admin alone gets a view of them, to restore one; to staff they're gone.
  const showDeleted = isAdmin && params.owner === "deleted";
  const showAll = params.owner === "all" || showDeleted;
  const page = Math.max(1, Number(params.page) || 1);

  const scope = {
    deletedAt: showDeleted ? { not: null } : null,
    ...(showAll ? {} : { createdById: session?.userId ?? "__no_session__" }),
    // Raised from a lead (it keeps the lead's id) or straight from
    // "New Customized Package" (no lead).
    ...(origin === "lead" ? { leadId: { not: null } } : origin === "direct" ? { leadId: null } : {}),
  };
  const where = q
    ? {
        ...scope,
        OR: [
          { tripId: { contains: q, mode: "insensitive" as const } },
          { customerName: { contains: q, mode: "insensitive" as const } },
          { customerPhone: { contains: q, mode: "insensitive" as const } },
          { customerEmail: { contains: q, mode: "insensitive" as const } },
          { destinationName: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : scope;

  const [total, quotations] = await Promise.all([
    db.customPackage.count({ where }),
    db.customPackage.findMany({
      where,
      orderBy: showDeleted ? { deletedAt: "desc" } : { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { createdBy: { select: { name: true } }, deletedBy: { select: { name: true } } },
    }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-ink-900">Customized Packages</h1>
        <Link
          href={`${basePath}/custom-packages/new`}
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New Customized Package
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <AutoSearchInput placeholder="Search Trip ID, customer, phone, email or destination..." />
        <div className="w-56">
          <AutoFilterSelect
            paramName="owner"
            placeholder="My packages"
            options={[
              { value: "", label: "My packages" },
              { value: "all", label: "All packages" },
              ...(isAdmin ? [{ value: "deleted", label: "Deleted" }] : []),
            ]}
          />
        </div>
        <div className="w-56">
          <AutoFilterSelect
            paramName="origin"
            placeholder="All sources"
            options={[
              { value: "", label: "All sources" },
              { value: "lead", label: "From leads" },
              { value: "direct", label: "Self created" },
            ]}
          />
        </div>
      </div>

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
              <tr key={quotation.id} className="relative cursor-pointer border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                {/* The Trip ID link stretches over the whole row (after:inset-0),
                    so a click anywhere opens the quotation; the PDF and delete
                    buttons sit above it (relative z-10) and keep their own clicks. */}
                <td className="whitespace-nowrap px-4 py-3">
                  <Link
                    href={`${basePath}/custom-packages/${quotation.id}`}
                    className="font-mono text-sm font-bold text-brand-600 after:absolute after:inset-0 hover:text-brand-700"
                  >
                    {quotation.tripId}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{quotation.customerName}</p>
                  <p className="text-xs text-ink-500">{quotation.customerPhone}</p>
                </td>
                <td className="px-4 py-3 text-ink-700">{quotation.destinationName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-ink-700">
                  {quotation.startDate ? fmtDate(quotation.startDate) : "N/A"}
                  <p className="text-xs text-ink-500">
                    {quotation.durationNights}N / {quotation.durationDays}D
                  </p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink-900">
                  {formatRupees(quotation.totalAmount)}
                </td>
                {/* nowrap: with long customer names in the All view the table
                    squeezed this column and split the staff name over lines. */}
                <td className="whitespace-nowrap px-4 py-3 text-xs text-ink-500">
                  {fmtDate(quotation.createdAt)}
                  <p>{quotation.createdBy.name}</p>
                  {quotation.deletedAt && (
                    <p className="mt-1 font-semibold text-red-600">
                      Deleted {fmtDate(quotation.deletedAt)}
                      {quotation.deletedBy ? ` by ${quotation.deletedBy.name}` : ""}
                    </p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {/* The PDF link gets the same h-8 padded hit area as the
                      delete icon button, so the two read evenly. */}
                  {showDeleted ? (
                    <div className="relative z-10 flex items-center justify-end">
                      <RestoreButton
                        id={quotation.id}
                        action={restoreCustomPackageAction}
                        confirmText={`Restore quotation ${quotation.tripId} for ${quotation.customerName}? It will show in the lists again.`}
                      />
                    </div>
                  ) : (
                  <div className="relative z-10 flex items-center justify-end gap-2">
                    <a
                      href={`/api/admin/custom-packages/${quotation.id}/pdf`}
                      className="flex h-8 items-center gap-1.5 rounded-full border border-brand-200 px-3 text-xs font-semibold text-brand-600 transition hover:bg-brand-50"
                    >
                      <Download className="h-3.5 w-3.5" />
                      PDF
                    </a>
                    {/* Only the creator (or an admin) may delete; the slot stays
                        so the PDF buttons line up down the column. */}
                    {canEditCustomPackage(session, quotation.createdById) ? (
                      <DeleteButton
                        id={quotation.id}
                        action={deleteCustomPackageAction}
                        confirmText={`Delete quotation ${quotation.tripId} for ${quotation.customerName}? This cannot be undone.`}
                      />
                    ) : (
                      <span className="w-8" aria-hidden />
                    )}
                  </div>
                  )}
                </td>
              </tr>
            ))}
            {quotations.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-ink-500">
                  <FileText className="mx-auto mb-2 h-6 w-6 text-ink-300" />
                  {showDeleted ? "No deleted packages." : "No customized packages yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination total={total} page={page} basePath={`${basePath}/custom-packages`} params={{ q, origin, owner: showDeleted ? "deleted" : showAll ? "all" : undefined }} />
    </div>
  );
}
