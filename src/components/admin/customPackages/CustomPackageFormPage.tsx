import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveMasterList } from "@/lib/masterData";
import { getGstPercent } from "@/lib/settings";
import { getSuggestionSets } from "@/lib/suggestions";
import CustomPackageForm, { type CustomPackageDefaults } from "@/components/admin/customPackages/CustomPackageForm";
import { parseDuration } from "@/lib/durationHelpers";
import { getContentBlocks } from "@/lib/contentBlocks";
import { currentPreparer, defaultsFromQuotation, loadQuotation, toDateInput } from "@/lib/customPackageDefaults";

type LeadRow = NonNullable<Awaited<ReturnType<typeof loadLead>>>;

function loadLead(id: string) {
  return db.lead.findUnique({
    where: { id },
    include: {
      // The lead's most recent quotation is the one its Edit screen opens.
      customPackages: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true } },
    },
  });
}

/**
 * A lead's own details as the quotation form's starting values, so a
 * quotation raised from a lead starts with everything the customer already
 * told us instead of a blank form.
 */
function defaultsFromLead(lead: LeadRow): CustomPackageDefaults {
  // Leads from the flight form store "round-trip"/"one-way" here - only the
  // two values the quotation form offers are carried over.
  const tripType =
    lead.tripType === "domestic" || lead.tripType === "international" ? lead.tripType : undefined;

  // Both dates known: the duration follows from them, as it does in the form.
  // Otherwise fall back to whatever duration text the enquiry carried.
  let duration: { nights: number; days: number } | null = null;
  if (lead.startDate && lead.endDate) {
    const nights = Math.round((lead.endDate.getTime() - lead.startDate.getTime()) / 86_400_000);
    if (nights >= 0) duration = { nights, days: nights + 1 };
  }
  duration ??= lead.days ? parseDuration(lead.days) : null;

  return {
    leadId: lead.id,
    customerName: lead.name ?? undefined,
    customerPhone: lead.phone ?? undefined,
    customerEmail: lead.email ?? undefined,
    tripType,
    destinationName: lead.destinationName ?? lead.packageTitle ?? undefined,
    startDate: toDateInput(lead.startDate),
    endDate: toDateInput(lead.endDate),
    durationNights: duration?.nights,
    durationDays: duration?.days,
    adults: lead.adults ?? undefined,
    children: lead.children ?? undefined,
    infants: lead.infants ?? undefined,
    childAges: lead.childAges,
    rooms: lead.rooms ?? undefined,
    extraBeds: lead.extraBeds ?? undefined,
    extraMattresses: lead.extraMattresses ?? undefined,
    roomCategory: lead.roomCategory ?? undefined,
    hotelCategory: lead.hotelCategory ?? undefined,
    notes: lead.message ?? undefined,
  };
}

export default async function CustomPackageFormPage({
  isNew: isNewProp = false,
  customPackageId: customPackageIdProp,
  leadId,
  editLeadId,
}: {
  isNew?: boolean;
  customPackageId?: string;
  // "New quotation" from a lead: a fresh quotation, pre-filled from the lead.
  leadId?: string;
  // A lead's Edit screen: opens the lead's latest quotation if it has one,
  // otherwise a new one pre-filled from the lead. Saving also updates the
  // lead's own details and returns to the lead.
  editLeadId?: string;
}) {
  const sourceLeadId = editLeadId ?? leadId;
  const [suggestions, inclusions, roomCategories, hotelCategories, gstPercent, lead] = await Promise.all([
    getSuggestionSets(["destinationName", "hotelName", "city", "vehicleName"] as const),
    getActiveMasterList("PACKAGE_INCLUSION"),
    getActiveMasterList("ROOM_CATEGORY"),
    getActiveMasterList("HOTEL_CATEGORY"),
    getGstPercent(),
    sourceLeadId ? loadLead(sourceLeadId) : null,
  ]);

  if (sourceLeadId && !lead) notFound();

  const customPackageId = editLeadId ? lead?.customPackages[0]?.id : customPackageIdProp;
  const isNew = editLeadId ? !customPackageId : isNewProp;

  const quotation = customPackageId ? await loadQuotation(customPackageId) : null;

  if (customPackageId && !quotation) notFound();

  // A new quotation starts from the standard PDF sections (passed separately,
  // below); an existing one carries its own.
  const [standardContentBlocks, quotationDefaults, preparer] = await Promise.all([
    getContentBlocks(),
    quotation ? defaultsFromQuotation(quotation) : null,
    currentPreparer(),
  ]);
  const toEditable = (list: { key: string; title: string; body: string }[]) =>
    list.map((b) => ({ key: b.key, title: b.title, body: b.body }));

  const heading = editLeadId
    ? `Edit Lead${lead?.name ? `: ${lead.name}` : ""}`
    : isNew
      ? "New Customized Package"
      : `Edit ${quotation?.tripId}`;

  // A quotation nobody has signed yet (every new one, and older ones saved
  // before this existed) starts as prepared by whoever is signed in now.
  const baseDefaults = quotationDefaults ?? (lead ? defaultsFromLead(lead) : undefined);
  const defaults = baseDefaults?.preparedByName
    ? baseDefaults
    : { ...baseDefaults, ...preparer };

  const toOptions = (list: { value: string; label: string; freeText: boolean }[]) =>
    list.map((o) => ({ value: o.value, label: o.label, freeText: o.freeText }));

  return (
    <div>
      <CustomPackageForm
        header={
          <>
            <h1 className="font-heading text-2xl font-bold text-ink-900">{heading}</h1>
            {editLeadId && quotation && (
              <p className="mt-1 font-mono text-sm font-semibold text-brand-600">{quotation.tripId}</p>
            )}
          </>
        }
        isNew={isNew}
        returnToLead={Boolean(editLeadId)}
        destinationSuggestions={suggestions.destinationName}
        hotelSuggestions={suggestions.hotelName}
        citySuggestions={suggestions.city}
        vehicleSuggestions={suggestions.vehicleName}
        inclusionOptions={toOptions(inclusions)}
        roomCategories={toOptions(roomCategories)}
        hotelCategories={toOptions(hotelCategories)}
        gstPercent={gstPercent}
        standardContentBlocks={toEditable(standardContentBlocks)}
        defaults={defaults}
      />
    </div>
  );
}
