import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Download, FileText, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { getActiveMasterList } from "@/lib/masterData";
import {
  noteStatusLabels,
  noteStatusStyles,
  sourceLabels,
  statusLabels,
  statusStyles,
} from "@/components/admin/leads/statusStyles";
import LeadStatusSelect from "@/components/admin/leads/LeadStatusSelect";
import LeadAssignSelect from "@/components/admin/leads/LeadAssignSelect";
import LeadFavoriteButton from "@/components/admin/leads/LeadFavoriteButton";
import LeadNoteForm from "@/components/admin/leads/LeadNoteForm";
import LeadEditForm from "@/components/admin/leads/LeadEditForm";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const fmtDateTime = (d: Date) =>
  d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// <input type="date"> wants yyyy-mm-dd, and toISOString() shifts the day
// backwards for any timezone east of UTC - so this formats from local parts.
function toDateInput(value: Date | null): string {
  if (!value) return "";
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(
    value.getDate()
  ).padStart(2, "0")}`;
}

const str = (v: string | number | null | undefined) => (v === null || v === undefined ? "" : String(v));

export default async function LeadDetailView({ basePath, leadId }: { basePath: string; leadId: string }) {
  const [lead, staff, session, roomCategories, hotelCategories] = await Promise.all([
    db.lead.findUnique({
      where: { id: leadId },
      include: {
        assignedTo: { select: { name: true } },
        notes: { include: { author: true }, orderBy: { createdAt: "asc" } },
        // Quotations raised from this lead: what the "download the itinerary
        // PDF and send it on WhatsApp" step actually links to.
        customPackages: {
          orderBy: { createdAt: "desc" },
          select: { id: true, tripId: true, destinationName: true, totalAmount: true, createdAt: true },
        },
      },
    }),
    db.staffUser.findMany({ where: { isActive: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    getSession(),
    getActiveMasterList("ROOM_CATEGORY"),
    getActiveMasterList("HOTEL_CATEGORY"),
  ]);

  if (!lead) notFound();

  const isAdmin = session?.role === "ADMIN";

  const duplicates = lead.phone
    ? await db.lead.findMany({
        where: { phone: lead.phone, id: { not: lead.id } },
        orderBy: { createdAt: "desc" },
        select: { id: true, source: true, createdAt: true, status: true },
        take: 10,
      })
    : [];

  const toOptions = (list: { value: string; label: string }[]) =>
    list.map((o) => ({ value: o.value, label: o.label }));

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
            {lead.assignedTo && ` · assigned to ${lead.assignedTo.name}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LeadFavoriteButton leadId={lead.id} isFavorite={lead.isFavorite} />
          <LeadStatusSelect leadId={lead.id} status={lead.status} />
          {/* Assignment is an admin decision (see assignLeadAction). Staff see
              who owns the lead in the subtitle above, but no control. */}
          {isAdmin ? (
            <LeadAssignSelect leadId={lead.id} assignedToId={lead.assignedToId} staff={staff} />
          ) : (
            <span className="rounded-full bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-500">
              {lead.assignedTo ? lead.assignedTo.name : "Unassigned"}
            </span>
          )}
          <Link
            href={`${basePath}/custom-packages/new?leadId=${lead.id}`}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            <FileText className="h-4 w-4" />
            New quotation
          </Link>
          {isAdmin && (
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

      {lead.customPackages.length > 0 && (
        <div className="mt-4 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-ink-900">Quotations for this lead</p>
          <div className="mt-3 space-y-2">
            {lead.customPackages.map((quotation) => (
              <div
                key={quotation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-50/60 px-3 py-2"
              >
                <div>
                  <Link
                    href={`${basePath}/custom-packages/${quotation.id}`}
                    className="font-mono text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    {quotation.tripId}
                  </Link>
                  <p className="text-xs text-ink-500">
                    {quotation.destinationName} · ₹{quotation.totalAmount.toLocaleString("en-IN")} ·{" "}
                    {fmtDate(quotation.createdAt)}
                  </p>
                </div>
                {/* Downloads the generated PDF straight to disk, ready to
                    attach to a WhatsApp message. */}
                <a
                  href={`/api/admin/custom-packages/${quotation.id}/pdf`}
                  className="flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <LeadEditForm
            leadId={lead.id}
            roomCategories={toOptions(roomCategories)}
            hotelCategories={toOptions(hotelCategories)}
            defaults={{
              name: str(lead.name),
              phone: str(lead.phone),
              email: str(lead.email),
              status: lead.status,
              tripType: str(lead.tripType),
              destinationName: str(lead.destinationName),
              startDate: toDateInput(lead.startDate),
              endDate: toDateInput(lead.endDate),
              month: str(lead.month),
              days: str(lead.days),
              packageTitle: str(lead.packageTitle),
              adults: str(lead.adults),
              children: str(lead.children),
              infants: str(lead.infants),
              childAges: lead.childAges,
              rooms: str(lead.rooms),
              extraBeds: str(lead.extraBeds),
              extraMattresses: str(lead.extraMattresses),
              roomCategory: str(lead.roomCategory),
              hotelCategory: str(lead.hotelCategory),
              message: str(lead.message),
            }}
          />
        </div>

        <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-base font-bold text-ink-900">Notes</h2>
          <div className="mt-4 space-y-3">
            {lead.notes.map((note) => (
              <div key={note.id} className="rounded-xl bg-ink-50/60 p-3">
                {note.status && (
                  <span
                    className={`mb-1.5 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${noteStatusStyles[note.status]}`}
                  >
                    {noteStatusLabels[note.status]}
                  </span>
                )}
                <p className="text-sm text-ink-900">{note.body}</p>
                <p className="mt-1 text-xs text-ink-500">
                  {note.author.name} · {fmtDateTime(note.createdAt)}
                </p>
              </div>
            ))}
            {lead.notes.length === 0 && <p className="text-sm text-ink-500">No notes yet.</p>}
          </div>

          <LeadNoteForm leadId={lead.id} />
        </div>
      </div>
    </div>
  );
}
