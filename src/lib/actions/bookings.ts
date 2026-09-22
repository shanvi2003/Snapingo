"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import { createBookingSchema, addPaymentSchema } from "@/lib/validation/booking";
import type { BookingStatus } from "@/generated/prisma/client";
import type { SessionPayload } from "@/lib/session";
import { withNewTripId } from "@/lib/tripIdServer";

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
    email: raw.email || undefined,
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

  // If this booking comes from a lead that already has a quotation, it
  // inherits that quotation's Trip ID rather than drawing a new one: the
  // customer has already been given that reference on a PDF, and handing them
  // a second number for the same trip is exactly the confusion Trip IDs exist
  // to prevent.
  const existingQuotation = parsed.data.leadId
    ? await db.customPackage.findFirst({
        where: { leadId: parsed.data.leadId },
        orderBy: { createdAt: "desc" },
        select: { tripId: true },
      })
    : null;

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
  await db.booking.update({ where: { id: bookingId }, data: parsed.data });

  revalidateBookingPaths(bookingId);
  redirect(`${basePathFor(session)}/bookings/${bookingId}`);
}

export async function deleteBookingAction(bookingId: string): Promise<void> {
  await requireStaffFeature("bookings");
  await db.booking.delete({ where: { id: bookingId } });
  revalidateBookingPaths(bookingId);
}

export async function updateBookingStatusAction(bookingId: string, status: BookingStatus): Promise<void> {
  await requireStaffFeature("bookings");
  await db.booking.update({ where: { id: bookingId }, data: { status } });
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

  await db.payment.create({ data: { ...parsed.data, recordedById: session.userId } });
  revalidateBookingPaths(bookingId);
}
