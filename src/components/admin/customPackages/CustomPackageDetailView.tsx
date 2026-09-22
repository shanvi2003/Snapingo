import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { formatRupees } from "@/lib/gst";
import { getMasterList } from "@/lib/masterData";
import { getEffectiveExclusions, resolveInclusions } from "@/lib/inclusionHelpers";
import { isEmailConfigured } from "@/lib/email";
import SendEmailPanel from "@/components/admin/SendEmailPanel";
import { sendItineraryEmailAction } from "@/lib/actions/email";

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-base font-bold text-ink-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function CustomPackageDetailView({
  basePath,
  id,
}: {
  basePath: string;
  id: string;
}) {
  const [quotation, inclusionOptions, roomOptions, hotelOptions] = await Promise.all([
    db.customPackage.findUnique({
      where: { id },
      include: {
        days: { orderBy: { day: "asc" } },
        stays: { orderBy: { order: "asc" } },
        createdBy: { select: { name: true } },
        lead: { select: { id: true } },
      },
    }),
    getMasterList("PACKAGE_INCLUSION"),
    getMasterList("ROOM_CATEGORY"),
    getMasterList("HOTEL_CATEGORY"),
  ]);

  if (!quotation) notFound();

  const roomLabels = new Map(roomOptions.map((o) => [o.value, o.label]));
  const hotelLabels = new Map(hotelOptions.map((o) => [o.value, o.label]));

  const inclusions = resolveInclusions(
    quotation.inclusions,
    inclusionOptions,
    quotation.customInclusions
  );
  const exclusions = getEffectiveExclusions([], quotation.inclusions, inclusionOptions);

  const facts: [string, string][] = [
    ["Customer", quotation.customerName],
    ["Phone", quotation.customerPhone ?? "—"],
    ["Email", quotation.customerEmail ?? "—"],
    ["Destination", quotation.destinationName],
    [
      "Travel dates",
      quotation.startDate
        ? `${fmtDate(quotation.startDate)}${quotation.endDate ? ` – ${fmtDate(quotation.endDate)}` : ""}`
        : "—",
    ],
    ["Duration", `${quotation.durationNights} Nights / ${quotation.durationDays} Days`],
    [
      "Travellers",
      [
        `${quotation.adults} Adults`,
        quotation.children ? `${quotation.children} Children` : "",
        quotation.infants ? `${quotation.infants} Infants` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    ],
    [
      "Rooms",
      [
        `${quotation.rooms} Rooms`,
        quotation.extraBeds ? `${quotation.extraBeds} extra bed(s)` : "",
        quotation.extraMattresses ? `${quotation.extraMattresses} extra mattress(es)` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    ],
    [
      "Hotel / room category",
      [
        quotation.hotelCategory ? hotelLabels.get(quotation.hotelCategory) : "",
        quotation.roomCategoryOther || (quotation.roomCategory ? roomLabels.get(quotation.roomCategory) : ""),
      ]
        .filter(Boolean)
        .join(" · ") || "—",
    ],
    ["Vehicle", quotation.vehicleName ?? "—"],
    ["Created by", `${quotation.createdBy.name} · ${fmtDate(quotation.createdAt)}`],
  ];

  return (
    <div>
      <Link
        href={`${basePath}/custom-packages`}
        className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to customized packages
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">
            {quotation.destinationName}
          </h1>
          <p className="mt-1 font-mono text-sm font-semibold text-brand-600">{quotation.tripId}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* A plain link, not a fetch: the browser downloads the streamed PDF
              straight to disk, which is what staff then attach in WhatsApp. */}
          <a
            href={`/api/admin/custom-packages/${quotation.id}/pdf`}
            className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700"
          >
            <Download className="h-4 w-4" />
            Download Itinerary PDF
          </a>
          <Link
            href={`${basePath}/custom-packages/${quotation.id}/edit`}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card title="Trip details">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-bold uppercase tracking-wide text-ink-500">{label}</dt>
                  <dd className="mt-0.5 text-sm text-ink-900">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {quotation.stays.length > 0 && (
            <Card title="Accommodation">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[540px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
                      <th className="py-2 pr-3">City</th>
                      <th className="py-2 pr-3">Hotel</th>
                      <th className="py-2 pr-3">Category</th>
                      <th className="py-2 pr-3">Room</th>
                      <th className="py-2 pr-3">Rooms</th>
                      <th className="py-2">Extras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.stays.map((stay) => (
                      <tr key={stay.id} className="border-b border-ink-50 last:border-0">
                        <td className="py-2 pr-3 text-ink-700">
                          {[stay.city, stay.nights ? `${stay.nights}N` : ""].filter(Boolean).join(" · ") || "—"}
                        </td>
                        <td className="py-2 pr-3 font-semibold text-ink-900">{stay.hotelName}</td>
                        <td className="py-2 pr-3 text-ink-700">
                          {stay.hotelCategory ? hotelLabels.get(stay.hotelCategory) ?? "—" : "—"}
                        </td>
                        <td className="py-2 pr-3 text-ink-700">
                          {stay.roomCategory ? roomLabels.get(stay.roomCategory) ?? "—" : "—"}
                        </td>
                        <td className="py-2 pr-3 text-ink-700">{stay.rooms}</td>
                        <td className="py-2 text-ink-700">
                          {[stay.extraBed ? "Extra bed" : "", stay.extraMattress ? "Extra mattress" : ""]
                            .filter(Boolean)
                            .join(", ") || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card title="Itinerary">
            <ol className="space-y-4">
              {quotation.days.map((day) => (
                <li key={day.id} className="border-l-2 border-brand-200 pl-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-600">
                    Day {day.day}
                    {day.date && <span className="ml-2 text-ink-500">{fmtDate(day.date)}</span>}
                  </p>
                  <p className="mt-0.5 font-semibold text-ink-900">{day.title}</p>
                  {day.desc && <p className="mt-1 text-sm text-ink-700">{day.desc}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-6">
          <SendEmailPanel
            action={sendItineraryEmailAction.bind(null, quotation.id)}
            defaultTo={quotation.customerEmail ?? ""}
            label="Email itinerary to customer"
            disabledReason={
              isEmailConfigured() ? undefined : "Email isn't connected yet. Ask an admin to set it up."
            }
          />

          <Card title="Pricing">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-500">Package price</dt>
                <dd className="text-ink-900">{formatRupees(quotation.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-500">GST ({quotation.gstPercent}%)</dt>
                <dd className="text-ink-900">{formatRupees(quotation.gstAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-100 pt-2 font-bold">
                <dt className="text-ink-900">Total</dt>
                <dd className="text-brand-600">{formatRupees(quotation.totalAmount)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Inclusions">
            <ul className="space-y-1 text-sm text-ink-800">
              {inclusions.map((i) => (
                <li key={i.value}>• {i.label}</li>
              ))}
              {inclusions.length === 0 && <li className="text-ink-500">None selected.</li>}
            </ul>
          </Card>

          <Card title="Exclusions (automatic)">
            <ul className="space-y-1 text-sm text-ink-800">
              {exclusions.map((e) => (
                <li key={e}>• {e}</li>
              ))}
              {exclusions.length === 0 && <li className="text-ink-500">Nothing excluded.</li>}
            </ul>
          </Card>

          {quotation.notes && (
            <Card title="Internal notes">
              <p className="whitespace-pre-line text-sm text-ink-700">{quotation.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
