import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Users } from "lucide-react";
import { db } from "@/lib/db";
import { sourceLabels, statusLabels, statusStyles } from "@/components/admin/leads/statusStyles";
import LeadStatusSelect from "@/components/admin/leads/LeadStatusSelect";
import LeadAssignSelect from "@/components/admin/leads/LeadAssignSelect";
import { addLeadNoteAction } from "@/lib/actions/admin-leads";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtDateTime = (d: Date) =>
  d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default async function LeadDetailView({ basePath, leadId }: { basePath: string; leadId: string }) {
  const [lead, staff] = await Promise.all([
    db.lead.findUnique({
      where: { id: leadId },
      include: { assignedTo: { select: { name: true } }, notes: { include: { author: true }, orderBy: { createdAt: "asc" } } },
    }),
    db.staffUser.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!lead) notFound();

  const duplicates = lead.phone
    ? await db.lead.findMany({
        where: { phone: lead.phone, id: { not: lead.id } },
        orderBy: { createdAt: "desc" },
        select: { id: true, source: true, createdAt: true, status: true },
        take: 10,
      })
    : [];

  const fields: { label: string; value: string }[] = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Trip type", lead.tripType],
    ["Destination", lead.destinationName],
    ["Date mode", lead.dateMode],
    ["Start date", lead.startDate ? fmtDate(lead.startDate) : null],
    ["End date", lead.endDate ? fmtDate(lead.endDate) : null],
    ["Month", lead.month],
    ["Duration", lead.days],
    ["Package", lead.packageTitle],
    ["Hotel", lead.hotelName],
    ["Price/night", lead.pricePerNight ? `₹${lead.pricePerNight.toLocaleString("en-IN")}` : null],
    ["Flight", lead.flightLabel],
    ["From city", lead.fromCityName],
    ["Class", lead.classLabel],
    ["Category", lead.categoryLabel],
    ["Price range", lead.priceLabel],
    ["Page", lead.pageUrl],
  ]
    .filter((pair): pair is [string, string] => Boolean(pair[1]))
    .map(([label, value]) => ({ label, value }));

  return (
    <div>
      <Link href={basePath} className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        Back to leads
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">
            {lead.name || lead.phone || lead.email || "Anonymous lead"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {sourceLabels[lead.source]} · {fmtDateTime(lead.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LeadStatusSelect leadId={lead.id} status={lead.status} />
          <LeadAssignSelect leadId={lead.id} assignedToId={lead.assignedToId} staff={staff} />
          {basePath.startsWith("/admin") && (
            <Link
              href={`/admin/bookings/new?leadId=${lead.id}`}
              className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
            >
              <CalendarPlus className="h-4 w-4" />
              Convert to Booking
            </Link>
          )}
        </div>
      </div>

      {duplicates.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-800">
            <Users className="h-4 w-4" />
            {duplicates.length} other lead{duplicates.length === 1 ? "" : "s"} from this phone number
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {duplicates.map((d) => (
              <Link
                key={d.id}
                href={`${basePath}/${d.id}`}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold transition hover:opacity-80 ${statusStyles[d.status]}`}
              >
                {sourceLabels[d.source]} · {fmtDate(d.createdAt)} · {statusLabels[d.status]}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Submitted details</h2>
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {fields.map((f) => (
              <div key={f.label}>
                <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{f.label}</dt>
                <dd className="mt-0.5 text-sm text-ink-900">{f.value}</dd>
              </div>
            ))}
          </dl>
          {lead.message && (
            <div className="mt-5 border-t border-ink-100 pt-4">
              <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">Message</dt>
              <dd className="mt-1 text-sm leading-relaxed text-ink-900">{lead.message}</dd>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Notes</h2>
          <div className="mt-4 space-y-3">
            {lead.notes.map((note) => (
              <div key={note.id} className="rounded-xl bg-ink-50/60 p-3">
                <p className="text-sm text-ink-900">{note.body}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {note.author.name} · {fmtDateTime(note.createdAt)}
                </p>
              </div>
            ))}
            {lead.notes.length === 0 && <p className="text-sm text-ink-500">No notes yet.</p>}
          </div>

          <form action={addLeadNoteAction.bind(null, lead.id)} className="mt-4 flex flex-col gap-2">
            <textarea
              name="body"
              rows={3}
              placeholder="Add a note for the team..."
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="self-end rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Add note
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
