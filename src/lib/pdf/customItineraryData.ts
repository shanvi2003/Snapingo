import "server-only";
import { db } from "@/lib/db";
import { resolveContentBlocks } from "@/lib/contentBlocks";
import { getSettings } from "@/lib/settings";
import { getMasterList } from "@/lib/masterData";
import { getEffectiveExclusions, resolveInclusions } from "@/lib/inclusionHelpers";
import type { CustomItineraryContext, CustomItineraryData } from "@/lib/pdf/customItineraryHtml";

/**
 * Loads one quotation and shapes it for the PDF template.
 *
 * Slug -> label translation happens here rather than in the template so the
 * template stays a pure string builder, and so a category an admin has since
 * renamed prints with its current wording.
 */
export async function loadCustomItinerary(
  id: string
): Promise<{ data: CustomItineraryData; context: CustomItineraryContext } | null> {
  const [quotation, inclusionOptions, roomOptions, hotelOptions, settings] =
    await Promise.all([
      db.customPackage.findUnique({
        where: { id },
        include: {
          days: { orderBy: { day: "asc" } },
          stays: { orderBy: { order: "asc" } },
        },
      }),
      getMasterList("PACKAGE_INCLUSION"),
      getMasterList("ROOM_CATEGORY"),
      getMasterList("HOTEL_CATEGORY"),
      getSettings(),
    ]);

  if (!quotation) return null;

  // The quotation's own PDF sections, standard content for any it lacks.
  const blocks = await resolveContentBlocks(quotation.contentBlocks);

  const roomLabels = new Map(roomOptions.map((o) => [o.value, o.label]));
  const hotelLabels = new Map(hotelOptions.map((o) => [o.value, o.label]));

  // "Other (Specify)" stores the slug plus whatever staff typed; the typed
  // text is what the customer should actually read.
  const roomCategoryLabel = quotation.roomCategory
    ? quotation.roomCategoryOther?.trim() || roomLabels.get(quotation.roomCategory) || null
    : null;

  const inclusions = resolveInclusions(
    quotation.inclusions,
    inclusionOptions,
    quotation.customInclusions
  ).map((i) => i.label);

  return {
    data: {
      tripId: quotation.tripId,
      tripType: quotation.tripType,
      customerName: quotation.customerName,
      customerPhone: quotation.customerPhone,
      customerEmail: quotation.customerEmail,
      destinationName: quotation.destinationName,
      startDate: quotation.startDate,
      endDate: quotation.endDate,
      durationNights: quotation.durationNights,
      durationDays: quotation.durationDays,
      adults: quotation.adults,
      children: quotation.children,
      infants: quotation.infants,
      childAges: quotation.childAges,
      rooms: quotation.rooms,
      extraBeds: quotation.extraBeds,
      extraMattresses: quotation.extraMattresses,
      roomCategoryLabel,
      hotelCategoryLabel: quotation.hotelCategory
        ? hotelLabels.get(quotation.hotelCategory) ?? null
        : null,
      vehicleName: quotation.vehicleName,
      price: quotation.price,
      gstPercent: quotation.gstPercent,
      gstAmount: quotation.gstAmount,
      totalAmount: quotation.totalAmount,
      inclusions,
      // Everything not ticked, then whatever extra the staff member typed -
      // the same rule packages follow.
      exclusions: getEffectiveExclusions(quotation.exclusions, quotation.inclusions, inclusionOptions),
      days: quotation.days.map((d) => ({
        day: d.day,
        date: d.date,
        title: d.title,
        desc: d.desc,
      })),
      stays: quotation.stays.map((s) => ({
        city: s.city,
        nights: s.nights,
        days: s.days,
        hotelName: s.hotelName,
        hotelCategoryLabel: s.hotelCategory ? hotelLabels.get(s.hotelCategory) ?? null : null,
        roomCategoryLabel: s.roomCategory ? roomLabels.get(s.roomCategory) ?? null : null,
        rooms: s.rooms,
        extraBed: s.extraBed,
        extraMattress: s.extraMattress,
      })),
    },
    context: {
      // Printed in order as sections, except the disclaimer, which closes
      // the footer as on the website PDF.
      blocks,
      operationHead: {
        name: settings.operation_head_name,
        phone: settings.operation_head_phone,
        email: settings.operation_head_email,
      },
    },
  };
}
