import Link from "next/link";
import { Pencil } from "lucide-react";
import { db } from "@/lib/db";

export default async function ServicesListPage({ basePath = "/admin" }: { basePath?: string }) {
  const services = await db.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Services</h1>
      <p className="mt-1 text-sm text-ink-500">The 4 core services shown on the site — edit their content below.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {services.map((s) => (
          <div key={s.slug} className="flex items-center justify-between rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
            <div>
              <p className="font-semibold text-ink-900">{s.name}</p>
              <p className="text-xs text-ink-500">{s.tagline}</p>
            </div>
            <Link href={`${basePath}/cms/services/${s.slug}/edit`} className="grid h-9 w-9 place-items-center rounded-full text-ink-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Edit">
              <Pencil className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
