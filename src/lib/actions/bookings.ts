"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession, requireStaffFeature } from "@/lib/dal";
import { createBookingSchema, addPaymentSchema } from "@/lib/validation/booking";
import type { SessionPayload } from "@/lib/session";
import { withNewTripId } from "@/lib/tripIdServer";
import { canAccessLead } from "@/lib/leads";

export type FormState = { error: string } | undefined;

// Bookings are Admin + whichever staff roles are granted the "bookings"
// feature on /admin/permissions (defaults to Travel Executive only - see
// src/lib/permissions.ts). Every mutation revalidates both the /admin and
// /staff booking routes unconditionally - revalidatePath on a path with no
// matching route is a harmless no-op, and this keeps whichever panel the
// caller isn't in from ever showing stale data.
function basePathFor(session: SessionPayload): string {
  return session.role === "ADMIN" ? "/admin" : "/staff";
}

function revalidateBookingPaths(bookingId?: string) {
  revalidatePath("/admin/bookings");
  revalidatePath("/staff/bookings");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/payments");
  revalidatePath("/admin/trips");
  revalidatePath("/staff/trips");
  if (bookingId) {
    revalidatePath(`/admin/bookings/${bookingId}`);
    revalidatePath(`/staff/bookings/${bookingId}`);
    revalidatePath(`/admin/bookings/${bookingId}/invoice`);
    revalidatePath(`/staff/bookings/${bookingId}/invoice`);
  }
}

function parseBookingForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return createBookingSchema.safeParse({
    ...raw,
    leadId: raw.leadId || undefined,
    packageTitle: raw.packageTitle || undefined,
    travelStartDate: raw.travelStartDate || undefined,
    travelEndDate: raw.travelEndDate || undefined,
    notes: raw.notes || undefined,
  });
}

export async function createBookingAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaffFeature("bookings");
  const parsed = parseBookingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form fields." };
  }

  // A booking converted from a quotation, or from a lead that already has
  // one, inherits that quotation's Trip ID rather than drawing a new one: the
  // customer has already been given that reference on a PDF, and handing them
  // a second number for the same trip is exactly the confusion Trip IDs exist
  // to prevent.
  const customPackageId = formData.get("customPackageId");
  const existingQuotation =
    typeof customPackageId === "string" && customPackageId
      ? await db.customPackage.findFirst({
          where: { id: customPackageId, deletedAt: null },
          select: { tripId: true, leadId: true },
        })
      : parsed.data.leadId
        ? await db.customPackage.findFirst({
            where: { leadId: parsed.data.leadId, deletedAt: null },
            orderBy: { createdAt: "desc" },
            select: { tripId: true, leadId: true },
          })
        : null;

  // A quotation raised from a lead converts that lead too.
  parsed.data.leadId ??= existingQuotation?.leadId ?? undefined;
  if (parsed.data.leadId && !(await canAccessLead(session, parsed.data.leadId))) {
    return { error: "This lead isn't assigned to you." };
  }

  // Trip IDs are unique across bookings, so a trip can only be booked once.
  if (existingQuotation) {
    const alreadyBooked = await db.booking.findUnique({
      where: { tripId: existingQuotation.tripId },
      select: { id: true },
    });
    if (alreadyBooked) {
      return { error: `Trip ${existingQuotation.tripId} already has a booking.` };
    }
  }

  const booking = existingQuotation
    ? await db.booking.create({
        data: { ...parsed.data, tripId: existingQuotation.tripId, createdById: session.userId },
      })
    : await withNewTripId((tripId) =>
        db.booking.create({ data: { ...parsed.data, tripId, createdById: session.userId } })
      );

  // Converting a lead into a booking is what makes it Converted - that status
  // is what the Converted Leads list reads.
  if (parsed.data.leadId) {
    await db.lead.update({ where: { id: parsed.data.leadId }, data: { status: "CONVERTED" } });
    revalidatePath("/admin/leads");
    revalidatePath("/staff/leads");
  }
  // The quotation's page swaps its Convert button for a link to this booking.
  if (typeof customPackageId === "string" && customPackageId) {
    revalidatePath(`/admin/custom-packages/${customPackageId}`);
    revalidatePath(`/staff/custom-packages/${customPackageId}`);
  }

  revalidateBookingPaths();
  redirect(`${basePathFor(session)}/bookings/${booking.id}`);
}

export async function updateBookingAction(bookingId: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaffFeature("bookings");
  const parsed = parseBookingForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form fields." };
  }

  // parsed.data.leadId is undefined here (the edit form has no leadId field),
  // and Prisma treats an undefined scalar in `update` as "leave unchanged" -
  // so this can't accidentally clear the lead link established at creation.
  const { count } = await db.booking.updateMany({ where: { id: bookingId, deletedAt: null }, data: parsed.data });
  if (count === 0) return { error: "That booking no longer exists." };

  revalidateBookingPaths(bookingId);
  redirect(`${basePathFor(session)}/bookings/${bookingId}`);
}

export async function deleteBookingAction(bookingId: string): Promise<void> {
  const session = await requireStaffFeature("bookings");
  const booking = await db.booking.findFirst({ where: { id: bookingId, deletedAt: null }, select: { tripId: true } });
  if (!booking) return;
  // Archived, not deleted: to everyone in the panel it is gone, but the
  // booking and its payments, invoice and vouchers stay for an admin to
  // restore. The Trip ID is set aside so its quotation can be booked again.
  await db.booking.update({
    where: { id: bookingId },
    data: { deletedAt: new Date(), deletedById: session.userId, deletedTripId: booking.tripId, tripId: null },
  });
  revalidateBookingPaths(bookingId);
}

/**
 * Brings an archived ("deleted") booking back. Admin only. Its Trip ID comes
 * back with it unless a newer booking of the same quotation has taken it
 * meanwhile - then it returns without one (lists fall back to the booking id).
 */
export async function restoreBookingAction(bookingId: string): Promise<void> {
  await requireSession(["ADMIN"]);
  const booking = await db.booking.findFirst({
    where: { id: bookingId, deletedAt: { not: null } },
    select: { deletedTripId: true },
  });
  if (!booking) return;
  const tripIdTaken = booking.deletedTripId
    ? Boolean(await db.booking.findUnique({ where: { tripId: booking.deletedTripId }, select: { id: true } }))
    : true;
  await db.booking.update({
    where: { id: bookingId },
    data: {
      deletedAt: null,
      deletedById: null,
      deletedTripId: null,
      tripId: tripIdTaken ? null : booking.deletedTripId,
    },
  });
  revalidateBookingPaths(bookingId);
}

export async function addPaymentAction(bookingId: string, formData: FormData): Promise<void> {
  const session = await requireStaffFeature("bookings");

  const parsed = addPaymentSchema.safeParse({
    bookingId,
    amount: formData.get("amount"),
    mode: formData.get("mode"),
    paidAt: formData.get("paidAt") || undefined,
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return;
  // An archived ("deleted") booking takes no new payments.
  if (!(await db.booking.findFirst({ where: { id: bookingId, deletedAt: null }, select: { id: true } }))) return;

  await db.payment.create({ data: { ...parsed.data, recordedById: session.userId } });
  revalidateBookingPaths(bookingId);
}
