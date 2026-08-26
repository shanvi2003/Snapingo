import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import { BookingStatus } from "@/generated/prisma/enums";
import { bookingStatusLabels, bookingStatusStyles } from "@/components/admin/bookingStyles";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { deleteBookingAction } from "@/lib/actions/bookings";
import FilterSelect from "@/components/admin/FilterSelect";
import { formatBalance } from "@/lib/money";

export default async function BookingsListPage({
  title,
  subtitle,
  fixedStatus,
  searchParams,
  basePath = "/admin",
}: {
  title: string;
  subtitle: string;
  fixedStatus?: BookingStatus;
  searchParams?: Promise<{ status?: string; q?: string }>;
  basePath?: string;
}) {
  const params = searchParams ? await searchParams : {};
  const status = fixedStatus ?? (params.status as BookingStatus | undefined);
  const q = params.q?.trim();

  const bookings = await db.booking.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? { OR: [{ travelerName: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { payments: true },
    take: 200,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
        </div>
        <Link
          href={`${basePath}/bookings/new`}
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </Link>
      </div>

      <form className="mt-6 flex flex-wrap gap-3" action={fixedStatus ? undefined : `${basePath}/bookings`} method="get">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search traveler name or phone..."
          className="min-w-[220px] flex-1 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {!fixedStatus && (
          <div className="w-44">
            <FilterSelect
              name="status"
              defaultValue={params.status ?? ""}
              placeholder="All statuses"
              options={[
                { value: "", label: "All statuses" },
                ...Object.values(BookingStatus).map((s) => ({ value: s, label: bookingStatusLabels[s] })),
              ]}
            />
          </div>
        )}
        <button type="submit" className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          {fixedStatus ? "Search" : "Filter"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Traveler</th>
              <th className="px-4 py-3">Package / Destination</th>
              <th className="px-4 py-3">Travel Dates</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const paid = b.payments.reduce((sum, p) => sum + p.amount, 0);
              const balance = b.totalAmount + b.taxAmount - paid;
              const balanceDisplay = formatBalance(balance);
              return (
                <tr key={b.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <Link href={`${basePath}/bookings/${b.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                      {b.travelerName}
                    </Link>
                    <p className="text-xs text-ink-500">{b.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{b.packageTitle || b.destinationName || "—"}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                    {b.travelStartDate ? b.travelStartDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold text-ink-900">₹{(b.totalAmount + b.taxAmount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-emerald-600">₹{paid.toLocaleString("en-IN")}</td>
                  <td className={`px-4 py-3 font-semibold ${balanceDisplay.className}`}>
                    {balanceDisplay.amount}
                    {balance < 0 && <span className="ml-1 text-[10px] font-bold uppercase tracking-wide">Overpaid</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${bookingStatusStyles[b.status]}`}>
                      {bookingStatusLabels[b.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`${basePath}/bookings/${b.id}/edit`} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton id={b.id} action={deleteBookingAction} confirmText="Delete this booking and its payment history? This can't be undone." />
                    </div>
                  </td>
                </tr>
              );
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink-500">
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
