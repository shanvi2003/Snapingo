import { db } from "@/lib/db";

export default async function StaffHotelsPage() {
  const hotels = await db.hotel.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, destinationSlug: true, category: true, pricePerNight: true, rating: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Hotels</h1>
      <p className="mt-1 text-sm text-ink-500">Read-only catalog — for reference while talking to customers.</p>

      {hotels.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500 shadow-sm">
          No hotels in the database yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price/Night</th>
                <th className="px-4 py-3">Rating</th>
              </tr>
            </thead>
            <tbody>
              {hotels.map((h) => (
                <tr key={h.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3 font-semibold text-ink-900">{h.name}</td>
                  <td className="px-4 py-3 text-ink-700">{h.destinationSlug}</td>
                  <td className="px-4 py-3 text-ink-700">{h.category}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">₹{h.pricePerNight.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-ink-700">{h.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
