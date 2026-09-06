import Link from "next/link";
import { Receipt } from "lucide-react";
import { db } from "@/lib/db";
import { formatBalance } from "@/lib/money";

export default async function AdminInvoicesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q?.trim();

  const bookings = await db.booking.findMany({
    where: query ? { travelerName: { contains: query, mode: "insensitive" } } : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { payments: true },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Invoices</h1>
      <p className="mt-1 text-sm text-ink-500">One invoice per booking.</p>

      <form className="mt-6 flex gap-3" action="/admin/invoices" method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search traveler name..."
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
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Traveler</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const paid = b.payments.reduce((sum, p) => sum + p.amount, 0);
              const grandTotal = b.totalAmount + b.taxAmount;
              const balance = grandTotal - paid;
              const balanceDisplay = formatBalance(balance);
              return (
                <tr key={b.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3 font-mono text-xs text-ink-500">#{b.id.slice(-10).toUpperCase()}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900">{b.travelerName}</td>
                  <td className="px-4 py-3 text-ink-700">₹{grandTotal.toLocaleString("en-IN")}</td>
                  <td className={`px-4 py-3 font-semibold ${balanceDisplay.className}`}>
                    {balanceDisplay.amount}
                    {balance < 0 && <span className="ml-1 text-[10px] font-bold uppercase tracking-wide">Overpaid</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/bookings/${b.id}/invoice`}
                      target="_blank"
                      className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                    >
                      <Receipt className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-500">
                  No bookings match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
