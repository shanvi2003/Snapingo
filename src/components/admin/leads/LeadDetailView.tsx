import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Download, FileText, Users } from "lucide-react";
import { db } from "@/lib/db";
import { canUseStaffFeature, getSession } from "@/lib/dal";
import { getActiveMasterList } from "@/lib/masterData";
import {
  noteStatusLabels,
  noteStatusTextStyles,
  sourceLabels,
  statusLabels,
  statusStyles,
} from "@/components/admin/leads/statusStyles";
import LeadStatusSelect from "@/components/admin/leads/LeadStatusSelect";
import LeadAssignSelect from "@/components/admin/leads/LeadAssignSelect";
import { jobRoleLabels } from "@/lib/permissions";
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
  const [lead, session, roomCategories, hotelCategories, canQuote] = await Promise.all([
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
    getSession(),
    getActiveMasterList("ROOM_CATEGORY"),
    getActiveMasterList("HOTEL_CATEGORY"),
    // Edit opens the full quotation form only for those allowed to save one;
    // anyone else (e.g. BDE) keeps the inline details form.
    canUseStaffFeature("customPackages"),
  ]);

  if (!lead) notFound();

  // Whoever owns the lead: a team (role) or, for website leads auto-assigned
  // to one person, that staff member.
  const assignee = lead.assignedRole ? jobRoleLabels[lead.assignedRole] : lead.assignedTo?.name ?? null;

  const isAdmin = session?.role === "ADMIN";
  // basePath is the leads list ("/admin/leads"); quotations live beside it at
  // the panel root ("/admin/custom-packages"), not under it - linking them off
  // basePath produced /admin/leads/custom-packages/..., a 404.
  const panelPath = basePath.replace(/\/leads$/, "");

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
            {assignee && ` · assigned to ${assignee}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LeadFavoriteButton leadId={lead.id} isFavorite={lead.isFavorite} />
          <LeadStatusSelect leadId={lead.id} status={lead.status} />
          {/* Assignment is an admin decision (see assignLeadAction). Staff see
              who owns the lead in the subtitle above, but no control. */}
          {isAdmin ? (
            <LeadAssignSelect
              leadId={lead.id}
              assignedRole={lead.assignedRole}
              assignedToName={lead.assignedTo?.name ?? null}
            />
          ) : (
            <span className="rounded-full bg-ink-50 px-4 py-2 text-sm font-semibold text-ink-500">
              {assignee ?? "Unassigned"}
            </span>
          )}
          <Link
            href={`${panelPath}/custom-packages/new?leadId=${lead.id}`}
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
                    href={`${panelPath}/custom-packages/${quotation.id}`}
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

      {/* Details and notes share one card, side by side, split by a divider
          (stacked on narrow screens). */}
      <div className="mt-6 grid grid-cols-1 divide-y divide-ink-100 rounded-2xl border border-ink-100 bg-white shadow-sm lg:grid-cols-[1.4fr_1fr] lg:divide-x lg:divide-y-0">
        <div className="p-6">
          <LeadEditForm
            leadId={lead.id}
            editHref={canQuote ? `${basePath}/${lead.id}/edit` : undefined}
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

        <div className="p-6">
          <h2 className="font-heading text-base font-bold text-ink-900">Notes</h2>
          <div className="mt-4">
            {/* A plain log: the note first, then who/when on one quiet line,
                rows split by hairlines - no per-note boxes or badges. */}
            {lead.notes.length > 0 && (
              <ol className="divide-y divide-ink-100">
                {lead.notes.map((note) => (
                  <li key={note.id} className="py-3 first:pt-0">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-black">{note.body}</p>
                    <p className="mt-1 text-xs text-ink-500">
                      {note.status && (
                        <>
                          <span className={`font-semibold ${noteStatusTextStyles[note.status]}`}>
                            {noteStatusLabels[note.status]}
                          </span>
                          {" · "}
                        </>
                      )}
                      {note.author.name} · {fmtDateTime(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            {lead.notes.length === 0 && <p className="text-sm text-ink-500">No notes yet.</p>}
          </div>

          <LeadNoteForm leadId={lead.id} />
        </div>
      </div>
    </div>
  );
}
