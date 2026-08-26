import { db } from "@/lib/db";

export default async function StaffFlightsPage() {
  const flights = await db.flight.findMany({
    orderBy: { airline: "asc" },
    select: { id: true, airline: true, departureCitySlug: true, destinationSlug: true, flightClass: true, price: true, duration: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Flights</h1>
      <p className="mt-1 text-sm text-ink-500">Read-only catalog — for reference while talking to customers.</p>

      {flights.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 text-sm text-ink-500 shadow-sm">
          No flight routes in the database yet.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
                <th className="px-4 py-3">Airline</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f) => (
                <tr key={f.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3 font-semibold text-ink-900">{f.airline}</td>
                  <td className="px-4 py-3 text-ink-700">{f.departureCitySlug} → {f.destinationSlug}</td>
                  <td className="px-4 py-3 text-ink-700">{f.flightClass}</td>
                  <td className="px-4 py-3 text-ink-700">{f.duration}</td>
                  <td className="px-4 py-3 font-semibold text-brand-600">₹{f.price.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
