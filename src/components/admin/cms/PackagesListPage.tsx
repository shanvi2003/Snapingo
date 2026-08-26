import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { deletePackageAction } from "@/lib/actions/cms";

export default async function PackagesListPage({
  searchParams,
  basePath = "/admin",
}: {
  searchParams: Promise<{ q?: string }>;
  basePath?: string;
}) {
  const { q } = await searchParams;

  const packages = await db.package.findMany({
    where: q
      ? { OR: [{ title: { contains: q, mode: "insensitive" } }, { destination: { contains: q, mode: "insensitive" } }] }
      : {},
    orderBy: { title: "asc" },
    take: 300,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">Packages</h1>
          <p className="mt-1 text-sm text-ink-500">{packages.length} package{packages.length === 1 ? "" : "s"}</p>
        </div>
        <Link href={`${basePath}/cms/packages/new`} className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          New Package
        </Link>
      </div>

      <form className="mt-6 flex gap-3" action={`${basePath}/cms/packages`} method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title or destination..."
          className="min-w-[240px] flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {packages.map((p) => (
              <tr key={p.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <p className="font-semibold text-ink-900">{p.title}</p>
                  {p.featured && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-600">Featured</span>}
                </td>
                <td className="px-4 py-3 text-ink-700">{p.destination}</td>
                <td className="px-4 py-3 capitalize text-ink-700">{p.type}</td>
                <td className="px-4 py-3 font-semibold text-brand-600">₹{p.price.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`${basePath}/cms/packages/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton id={p.id} action={deletePackageAction} confirmText="Delete this package? This can't be undone." />
                  </div>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-500">No packages found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
