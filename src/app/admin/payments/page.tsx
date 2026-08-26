import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminPaymentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim();

  const payments = await db.payment.findMany({
    where: query
      ? { OR: [{ booking: { travelerName: { contains: query, mode: "insensitive" } } }, { mode: { contains: query, mode: "insensitive" } }] }
      : {},
    orderBy: { paidAt: "desc" },
    take: 200,
    include: { booking: { select: { id: true, travelerName: true } }, recordedBy: { select: { name: true } } },
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Payments</h1>
      <p className="mt-1 text-sm text-ink-500">
        {payments.length} payment{payments.length === 1 ? "" : "s"} · ₹{totalCollected.toLocaleString("en-IN")} collected
      </p>

      <form className="mt-6 flex gap-3" action="/admin/payments" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search traveler name or payment mode..."
          className="min-w-[240px] flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          Search
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Mode</th>
              <th className="px-4 py-3">Recorded By</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3">
                  <Link href={`/admin/bookings/${p.booking.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {p.booking.travelerName}
                  </Link>
                </td>
                <td className="px-4 py-3 font-semibold text-emerald-600">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3 text-ink-700">{p.mode}</td>
                <td className="px-4 py-3 text-ink-700">{p.recordedBy.name}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                  {p.paidAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-500">
                  No payments match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
