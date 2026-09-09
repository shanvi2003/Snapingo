import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import PackagesTable from "@/components/admin/cms/PackagesTable";

export default async function PackagesListPage({ basePath = "/admin" }: { basePath?: string }) {
  // The whole list is handed to the client table below, which filters it
  // instantly as the visitor types - no per-keystroke round trip, so the
  // search box doesn't need its own submit button anymore.
  const packages = await db.package.findMany({
    orderBy: { title: "asc" },
    take: 1000,
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

      <PackagesTable packages={packages} basePath={basePath} />
    </div>
  );
}
