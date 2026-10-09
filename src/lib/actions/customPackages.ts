"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import type { SessionPayload } from "@/lib/session";
import { customPackageSchema } from "@/lib/validation/customPackage";
import { withNewTripId } from "@/lib/tripIdServer";
import { getGstPercent } from "@/lib/settings";
import { calculateGst } from "@/lib/gst";
import { formatDuration } from "@/lib/durationHelpers";

// `savedPath` instead of a server-side redirect: the form keeps a browser
// draft and must only drop it once the save has really gone through, which
// it can't know if the action navigates away on its own.
export type FormState = { error: string } | { savedPath: string } | undefined;

function basePathFor(session: SessionPayload): string {
  return session.role === "ADMIN" ? "/admin" : "/staff";
}

function parse(formData: FormData) {
  return {
    ...Object.fromEntries(formData.entries()),
    inclusions: formData.getAll("inclusions"),
  };
}

/**
 * Creates or updates a customer quotation.
 *
 * Nothing here writes to `Package`, which is what keeps quotations off the
 * public site: the website reads packages only, and a quotation has no
 * published URL to reach even if someone guessed its id.
 */
export async function saveCustomPackageAction(
  isNew: boolean,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireStaffFeature("customPackages");

  const parsed = customPackageSchema.safeParse(parse(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  const { id, days, stays, startDate, endDate, leadId, customerEmail, ...data } = parsed.data;

  if (data.durationDays < data.durationNights) {
    return { error: "A trip can't have more nights than days - check the duration." };
  }
  if (days.length === 0) {
    return { error: "Add at least one day to the itinerary." };
  }
  // Checked up front so a deleted lead gives a clear message, not a failed
  // save with the quotation half-written.
  if (leadId && !(await db.lead.findUnique({ where: { id: leadId }, select: { id: true } }))) {
    return { error: "The lead this quotation belongs to no longer exists." };
  }

  // Master-list values are re-checked server-side: a Server Action is a plain
  // POST endpoint, so "the dropdown only offered valid options" is not a
  // guarantee about what actually arrives here.
  const allowed = await db.masterOption.findMany({
    where: { list: { in: ["PACKAGE_INCLUSION", "ROOM_CATEGORY", "HOTEL_CATEGORY"] } },
    select: { list: true, value: true },
  });
  const valuesFor = (list: string) =>
    new Set(allowed.filter((o) => o.list === list).map((o) => o.value));

  const allowedInclusions = valuesFor("PACKAGE_INCLUSION");
  const allowedRooms = valuesFor("ROOM_CATEGORY");
  const allowedHotels = valuesFor("HOTEL_CATEGORY");

  const unknownInclusion = data.inclusions.find((v) => !allowedInclusions.has(v));
  if (unknownInclusion) return { error: `"${unknownInclusion}" is not an inclusion option.` };
  if (data.roomCategory && !allowedRooms.has(data.roomCategory)) {
    return { error: "Choose a room category from the list." };
  }
  if (data.hotelCategory && !allowedHotels.has(data.hotelCategory)) {
    return { error: "Choose a hotel category from the list." };
  }

  // The form now asks for hotel/room category, rooms and extras once, in the
  // Accommodation section, and each hotel row only for city, name and
  // duration. Every stay carries those shared values so the PDF and detail
  // page, which print them per hotel, keep showing them.
  const stayRows = stays.map((stay) => ({
    ...stay,
    hotelCategory: data.hotelCategory || null,
    roomCategory: data.roomCategory || null,
    rooms: data.rooms,
    extraBed: data.extraBeds > 0,
    extraMattress: data.extraMattresses > 0,
  }));

  // The rate is read here, not taken from the form, and then frozen onto the
  // row - reprinting a quotation years later must show the tax the customer
  // was actually quoted, not today's rate.
  const gst = calculateGst(data.price, await getGstPercent());

  const shared = {
    ...data,
    customerEmail: customerEmail || null,
    leadId: leadId || null,
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    gstPercent: gst.percent,
    gstAmount: gst.gstAmount,
    totalAmount: gst.totalAmount,
    // Blank means "leave it off the PDF", stored as null rather than "".
    preparedByName: data.preparedByName || null,
    preparedByRole: data.preparedByRole || null,
  };

  const saved = isNew
    ? await withNewTripId((tripId) =>
        db.customPackage.create({
          data: {
            ...shared,
            tripId,
            createdById: session.userId,
            days: { create: days },
            stays: { create: stayRows },
          },
          select: { id: true },
        })
      )
    : await db.customPackage.update({
        where: { id },
        // Rows are replaced wholesale rather than diffed: they carry no
        // identity of their own (a "day 3" is only meaningful in order), so
        // matching them up would be guesswork with no benefit.
        data: {
          ...shared,
          days: { deleteMany: {}, create: days },
          stays: { deleteMany: {}, create: stayRows },
        },
        select: { id: true },
      });

  // A quotation raised from a lead keeps that lead's own details in step:
  // the lead's Edit screen *is* this form, so what staff correct here (a
  // misspelt name, the real dates, the party size) is the lead's truth too.
  // Only the fields a lead has are written; itinerary, hotels and price
  // belong to the quotation alone.
  if (leadId) {
    await db.lead.update({
      where: { id: leadId },
      data: {
        name: data.customerName,
        phone: data.customerPhone || null,
        email: customerEmail || null,
        tripType: data.tripType,
        destinationName: data.destinationName,
        startDate: shared.startDate,
        endDate: shared.endDate,
        days: formatDuration({ nights: data.durationNights, days: data.durationDays }),
        adults: data.adults,
        children: data.children,
        infants: data.infants,
        childAges: data.childAges,
        rooms: data.rooms,
        extraBeds: data.extraBeds,
        extraMattresses: data.extraMattresses,
        roomCategory: data.roomCategory || null,
        hotelCategory: data.hotelCategory || null,
      },
    });
  }

  const basePath = basePathFor(session);
  revalidatePath(`${basePath}/custom-packages`);
  revalidatePath(`${basePath}/custom-packages/${saved.id}`);
  if (leadId) {
    // Lead screens exist under both panels; either may be showing this lead.
    for (const panel of ["/admin", "/staff"]) {
      revalidatePath(`${panel}/leads`);
      revalidatePath(`${panel}/leads/${leadId}`);
    }
  }

  // Opened from a lead's Edit button: back to that lead, where the quotation
  // is listed with its PDF download.
  if (leadId && formData.get("returnTo") === "lead") {
    return { savedPath: `${basePath}/leads/${leadId}` };
  }
  return { savedPath: `${basePath}/custom-packages/${saved.id}` };
}

export async function deleteCustomPackageAction(id: string): Promise<void> {
  const session = await requireStaffFeature("customPackages");
  await db.customPackage.delete({ where: { id } });
  revalidatePath(`${basePathFor(session)}/custom-packages`);
}
