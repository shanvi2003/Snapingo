import Link from "next/link";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { LeadSource, LeadStatus } from "@/generated/prisma/enums";
import type { Prisma } from "@/generated/prisma/client";
import { sourceLabels, statusLabels, statusStyles } from "@/components/admin/leads/statusStyles";
import LeadFavoriteButton from "@/components/admin/leads/LeadFavoriteButton";
import AutoSearchInput from "@/components/admin/AutoSearchInput";
import {
  AutoFilterClear,
  AutoFilterDate,
  AutoFilterSelect,
  AutoFilterToggle,
} from "@/components/admin/AutoFilter";
import Pagination, { PAGE_SIZE } from "@/components/admin/Pagination";

export type LeadsSearchParams = {
  source?: string;
  status?: string;
  q?: string;
  destination?: string;
  from?: string;
  to?: string;
  favorite?: string;
  page?: string;
};

/**
 * Searches the things staff actually have in front of them when a customer
 * calls: a Trip ID read off a PDF, a name, a phone number, an email.
 *
 * Trip IDs live on quotations and bookings rather than on the lead itself,
 * so those two are matched through the relation - typing "SNP-2026-0042"
 * finds the lead that quotation came from.
 */
function searchFilter(q: string): Prisma.LeadWhereInput {
  const contains = { contains: q, mode: "insensitive" as const };
  return {
    OR: [
      { name: contains },
      { phone: contains },
      { email: contains },
      { destinationName: contains },
      { packageTitle: contains },
      { customPackages: { some: { tripId: contains } } },
      { bookings: { some: { tripId: contains } } },
    ],
  };
}

export default async function LeadsInboxPage({
  basePath,
  searchParams,
  title = "Leads",
  subtitle,
  // Set by the Cancelled Leads / Converted Leads pages, which are this same
  // list pinned to one outcome - the client asked for them as their own
  // sections rather than a filter staff have to remember to apply.
  fixedStatus,
}: {
  basePath: string;
  searchParams: Promise<LeadsSearchParams>;
  title?: string;
  subtitle?: string;
  fixedStatus?: LeadStatus;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim();
  const status = fixedStatus ?? (params.status as LeadStatus | undefined);

  // A travel-date filter has to catch leads whose window overlaps the range,
  // not just ones that start inside it - a trip running 1-10 March is a match
  // for "leaving on or after 5 March".
  const from = params.from ? new Date(params.from) : null;
  const to = params.to ? new Date(params.to) : null;
  const validFrom = from && !Number.isNaN(from.getTime()) ? from : null;
  const validTo = to && !Number.isNaN(to.getTime()) ? to : null;

  // Built as an AND list rather than one merged object on purpose: the search
  // filter contributes its own OR, and a spread would let whichever condition
  // came last silently overwrite it.
  const conditions: Prisma.LeadWhereInput[] = [];
  if (params.source) conditions.push({ source: params.source as LeadSource });
  if (status) conditions.push({ status });
  if (params.destination) {
    conditions.push({ destinationName: { contains: params.destination, mode: "insensitive" } });
  }
  if (params.favorite === "1") conditions.push({ isFavorite: true });
  if (validFrom) conditions.push({ endDate: { gte: validFrom } });
  if (validTo) conditions.push({ startDate: { lte: validTo } });
  if (q) conditions.push(searchFilter(q));

  const where: Prisma.LeadWhereInput = conditions.length ? { AND: conditions } : {};

  const [total, leads, destinations] = await Promise.all([
    db.lead.count({ where }),
    db.lead.findMany({
      where,
      // Favourites first, then newest: the pinned leads are the ones staff
      // said they need to find quickly.
      orderBy: [{ isFavorite: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { assignedTo: { select: { name: true } } },
    }),
    // Destination options come from the leads themselves, so the filter can
    // only ever offer values that will actually return something.
    db.lead.findMany({
      where: { destinationName: { not: null } },
      select: { destinationName: true },
      distinct: ["destinationName"],
      orderBy: { destinationName: "asc" },
      take: 200,
    }),
  ]);

  const hasFilters = Boolean(
    params.source || params.status || q || params.destination || params.from || params.to || params.favorite
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">
        {subtitle ?? `${total} lead${total === 1 ? "" : "s"}`}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <AutoSearchInput placeholder="Search Trip ID, name, phone or email..." />

        {!fixedStatus && (
          <div className="w-44">
            <AutoFilterSelect
              paramName="status"
              placeholder="All statuses"
              options={[
                { value: "", label: "All statuses" },
                ...Object.values(LeadStatus).map((s) => ({ value: s, label: statusLabels[s] })),
              ]}
            />
          </div>
        )}

        <div className="w-48">
          <AutoFilterSelect
            paramName="source"
            placeholder="All sources"
            options={[
              { value: "", label: "All sources" },
              ...Object.values(LeadSource).map((s) => ({ value: s, label: sourceLabels[s] })),
            ]}
          />
        </div>

        <div className="w-52">
          <AutoFilterSelect
            paramName="destination"
            placeholder="All destinations"
            options={[
              { value: "", label: "All destinations" },
              ...destinations
                .map((d) => d.destinationName)
                .filter((name): name is string => Boolean(name))
                .map((name) => ({ value: name, label: name })),
            ]}
          />
        </div>

        <AutoFilterDate paramName="from" label="Travelling on or after" />
        <AutoFilterDate paramName="to" label="Travelling on or before" />

        <AutoFilterToggle
          paramName="favorite"
          label="Favourites"
          icon={<Star className="h-3.5 w-3.5" />}
        />

        <AutoFilterClear show={hasFilters} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-3 py-3"></th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned</th>
              <th className="px-4 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-3 py-3">
                  <LeadFavoriteButton leadId={lead.id} isFavorite={lead.isFavorite} variant="icon" />
                </td>
                <td className="px-4 py-3">
                  <Link href={`${basePath}/${lead.id}`} className="font-semibold text-ink-900 hover:text-brand-600">
                    {lead.name || lead.phone || lead.email || "Anonymous"}
                  </Link>
                  {lead.phone && lead.name && <p className="text-xs text-ink-500">{lead.phone}</p>}
                </td>
                <td className="px-4 py-3 text-ink-700">{sourceLabels[lead.source]}</td>
                <td className="px-4 py-3 text-ink-700">
                  {lead.destinationName || lead.packageTitle || lead.hotelName || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[lead.status]}`}>
                    {statusLabels[lead.status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-700">{lead.assignedTo?.name ?? "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                  {lead.createdAt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-500">
                  No leads match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath={basePath}
        params={{
          source: params.source,
          status: params.status,
          q,
          destination: params.destination,
          from: params.from,
          to: params.to,
          favorite: params.favorite,
        }}
        page={page}
        total={total}
      />
    </div>
  );
}
