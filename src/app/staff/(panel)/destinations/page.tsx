import { db } from "@/lib/db";

export default async function StaffDestinationsPage() {
  const destinations = await db.destination.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true, type: true, idealDuration: true, startingPrice: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Destinations</h1>
      <p className="mt-1 text-sm text-ink-500">Read-only catalog — for reference while talking to customers.</p>

      {destinations.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500 shadow-sm">
          No destinations in the database yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Ideal duration</th>
                <th className="px-4 py-3">Starting price</th>
              </tr>
            </thead>
            <tbody>
              {destinations.map((d) => (
                <tr key={d.slug} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3 font-semibold text-ink-900">{d.name}</td>
                  <td className="px-4 py-3 capitalize text-ink-700">{d.type}</td>
                  <td className="px-4 py-3 text-ink-700">{d.idealDuration}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">₹{d.startingPrice.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
