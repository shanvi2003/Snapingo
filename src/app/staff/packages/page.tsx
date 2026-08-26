import { db } from "@/lib/db";

export default async function StaffPackagesPage() {
  const packages = await db.package.findMany({
    orderBy: { title: "asc" },
    select: { id: true, title: true, destination: true, type: true, duration: true, price: true, featured: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Packages</h1>
      <p className="mt-1 text-sm text-ink-500">Read-only catalog — for reference while talking to customers.</p>

      {packages.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500 shadow-sm">
          No packages in the database yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3 font-semibold text-ink-900">
                    {p.title}
                    {p.featured && (
                      <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase text-brand-600">
                        Featured
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{p.destination}</td>
                  <td className="px-4 py-3 capitalize text-ink-700">{p.type}</td>
                  <td className="px-4 py-3 text-ink-700">{p.duration}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">₹{p.price.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
