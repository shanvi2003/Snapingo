"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import type { SessionPayload } from "@/lib/session";
import { customPackageSchema } from "@/lib/validation/customPackage";
import { withNewTripId } from "@/lib/tripIdServer";
import { getGstPercent } from "@/lib/settings";
import { calculateGst } from "@/lib/gst";

export type FormState = { error: string } | undefined;

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
  for (const stay of stays) {
    if (stay.roomCategory && !allowedRooms.has(stay.roomCategory)) {
      return { error: `"${stay.hotelName}" has a room category that isn't on the list.` };
    }
    if (stay.hotelCategory && !allowedHotels.has(stay.hotelCategory)) {
      return { error: `"${stay.hotelName}" has a hotel category that isn't on the list.` };
    }
  }

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
  };

  const saved = isNew
    ? await withNewTripId((tripId) =>
        db.customPackage.create({
          data: {
            ...shared,
            tripId,
            createdById: session.userId,
            days: { create: days },
            stays: { create: stays },
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
          stays: { deleteMany: {}, create: stays },
        },
        select: { id: true },
      });

  const basePath = basePathFor(session);
  revalidatePath(`${basePath}/custom-packages`);
  revalidatePath(`${basePath}/custom-packages/${saved.id}`);
  redirect(`${basePath}/custom-packages/${saved.id}`);
}

export async function deleteCustomPackageAction(id: string): Promise<void> {
  const session = await requireStaffFeature("customPackages");
  await db.customPackage.delete({ where: { id } });
  revalidatePath(`${basePathFor(session)}/custom-packages`);
}
