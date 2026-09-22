import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveMasterList } from "@/lib/masterData";
import { getGstPercent } from "@/lib/settings";
import { getSuggestionSets } from "@/lib/suggestions";
import CustomPackageForm from "@/components/admin/customPackages/CustomPackageForm";

// <input type="date"> only accepts yyyy-mm-dd, and toISOString() would shift
// the day backwards for anyone east of UTC (which is everyone here) - so the
// date is formatted from its local parts instead.
function toDateInput(value: Date | null): string | undefined {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function CustomPackageFormPage({
  isNew,
  customPackageId,
  leadId,
}: {
  isNew: boolean;
  customPackageId?: string;
  leadId?: string;
}) {
  const [suggestions, inclusions, roomCategories, hotelCategories, gstPercent] = await Promise.all([
    getSuggestionSets(["destinationName", "hotelName", "city", "vehicleName"] as const),
    getActiveMasterList("PACKAGE_INCLUSION"),
    getActiveMasterList("ROOM_CATEGORY"),
    getActiveMasterList("HOTEL_CATEGORY"),
    getGstPercent(),
  ]);

  const quotation = customPackageId
    ? await db.customPackage.findUnique({
        where: { id: customPackageId },
        include: { days: { orderBy: { day: "asc" } }, stays: { orderBy: { order: "asc" } } },
      })
    : null;

  if (customPackageId && !quotation) notFound();

  const toOptions = (list: { value: string; label: string; freeText: boolean }[]) =>
    list.map((o) => ({ value: o.value, label: o.label, freeText: o.freeText }));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">
        {isNew ? "New Customized Package" : `Edit ${quotation?.tripId}`}
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        A quotation for one customer. This never appears on the website - it only produces a PDF.
      </p>
      <CustomPackageForm
        isNew={isNew}
        destinationSuggestions={suggestions.destinationName}
        hotelSuggestions={suggestions.hotelName}
        citySuggestions={suggestions.city}
        vehicleSuggestions={suggestions.vehicleName}
        inclusionOptions={toOptions(inclusions)}
        roomCategories={toOptions(roomCategories)}
        hotelCategories={toOptions(hotelCategories)}
        gstPercent={gstPercent}
        defaults={
          quotation
            ? {
                id: quotation.id,
                customerName: quotation.customerName,
                customerPhone: quotation.customerPhone ?? undefined,
                customerEmail: quotation.customerEmail ?? undefined,
                leadId: quotation.leadId ?? undefined,
                destinationName: quotation.destinationName,
                startDate: toDateInput(quotation.startDate),
                endDate: toDateInput(quotation.endDate),
                durationNights: quotation.durationNights,
                durationDays: quotation.durationDays,
                adults: quotation.adults,
                children: quotation.children,
                infants: quotation.infants,
                childAges: quotation.childAges,
                rooms: quotation.rooms,
                extraBeds: quotation.extraBeds,
                extraMattresses: quotation.extraMattresses,
                roomCategory: quotation.roomCategory ?? undefined,
                roomCategoryOther: quotation.roomCategoryOther ?? undefined,
                hotelCategory: quotation.hotelCategory ?? undefined,
                inclusions: quotation.inclusions,
                customInclusions: quotation.customInclusions,
                vehicleName: quotation.vehicleName ?? undefined,
                price: quotation.price,
                notes: quotation.notes ?? undefined,
                days: quotation.days.map((d) => ({
                  date: toDateInput(d.date) ?? "",
                  title: d.title,
                  desc: d.desc,
                })),
                stays: quotation.stays.map((s) => ({
                  city: s.city ?? "",
                  nights: s.nights != null ? String(s.nights) : "",
                  hotelName: s.hotelName,
                  hotelCategory: s.hotelCategory ?? "",
                  roomCategory: s.roomCategory ?? "",
                  rooms: String(s.rooms),
                  extraBed: s.extraBed ? "true" : "",
                  extraMattress: s.extraMattress ? "true" : "",
                })),
              }
            : leadId
              ? { leadId }
              : undefined
        }
      />
    </div>
  );
}
