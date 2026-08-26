import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { deleteDestinationAction } from "@/lib/actions/cms";

export default async function DestinationsListPage({ basePath = "/admin" }: { basePath?: string }) {
  const destinations = await db.destination.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">Destinations</h1>
          <p className="mt-1 text-sm text-ink-500">{destinations.length} destinations</p>
        </div>
        <Link href={`${basePath}/cms/destinations/new`} className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          New Destination
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Starting Price</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.slug} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3 font-semibold text-ink-900">{d.name}</td>
                <td className="px-4 py-3 capitalize text-ink-700">{d.type}</td>
                <td className="px-4 py-3 font-semibold text-brand-600">₹{d.startingPrice.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`${basePath}/cms/destinations/${d.slug}/edit`} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton id={d.slug} action={deleteDestinationAction} confirmText="Delete this destination? This can't be undone." />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
