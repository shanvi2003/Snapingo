"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import type { SessionPayload } from "@/lib/session";
import {
  checkInstallmentTotal,
  findInstallmentIssue,
  invoiceSchema,
} from "@/lib/validation/invoice";

export type FormState = { error: string } | undefined;

function basePathFor(session: SessionPayload): string {
  return session.role === "ADMIN" ? "/admin" : "/staff";
}

/**
 * Builds the invoice number from the booking's Trip ID so the two documents a
 * customer holds carry the same reference: SNP-2026-0042 -> INV-SNP-2026-0042.
 * Falls back to the booking id for bookings raised before Trip IDs existed.
 */
function invoiceNumberFor(tripId: string | null, bookingId: string): string {
  return `INV-${tripId ?? bookingId.slice(-10).toUpperCase()}`;
}

/**
 * Creates or replaces the invoice for a booking.
 *
 * The rule the client asked for is enforced here, not in the browser: if the
 * installments don't add up to exactly the booking total, nothing is written.
 */
export async function saveInvoiceAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireStaffFeature("bookings");

  const parsed = invoiceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  const { bookingId, installments, ...billing } = parsed.data;

  const booking = await db.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, tripId: true, totalAmount: true, taxAmount: true, invoice: { select: { id: true } } },
  });
  if (!booking) return { error: "That booking no longer exists." };

  const rowIssue = findInstallmentIssue(installments);
  if (rowIssue) return { error: rowIssue.message };

  // The package cost the plan has to match is the tax-inclusive figure - that
  // is what the customer actually owes.
  const expectedTotal = booking.totalAmount + booking.taxAmount;
  const totalIssue = checkInstallmentTotal(installments, expectedTotal);
  if (totalIssue) return { error: totalIssue };

  const rows = installments.map((row) => ({
    order: row.order,
    dueDate: new Date(row.dueDate),
    amount: row.amount,
  }));

  await db.invoice.upsert({
    where: { bookingId },
    create: {
      bookingId,
      invoiceNumber: invoiceNumberFor(booking.tripId, booking.id),
      ...billing,
      totalAmount: expectedTotal,
      createdById: session.userId,
      installments: { create: rows },
    },
    update: {
      ...billing,
      totalAmount: expectedTotal,
      // Replaced wholesale rather than diffed: installments have no identity
      // of their own beyond their order in the plan.
      installments: { deleteMany: {}, create: rows },
    },
  });

  const basePath = basePathFor(session);
  revalidatePath(`${basePath}/invoices`);
  revalidatePath(`${basePath}/bookings/${bookingId}`);
  redirect(`${basePath}/bookings/${bookingId}/invoice`);
}

export async function deleteInvoiceAction(bookingId: string): Promise<void> {
  const session = await requireStaffFeature("bookings");
  await db.invoice.deleteMany({ where: { bookingId } });
  revalidatePath(`${basePathFor(session)}/invoices`);
}
