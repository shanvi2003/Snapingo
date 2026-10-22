"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import { isEmailConfigured, looksLikeEmail, sendEmail } from "@/lib/email";
import { itineraryEmail } from "@/lib/emailTemplates";
import { loadCustomItinerary } from "@/lib/pdf/customItineraryData";
import { buildCustomItineraryHtml } from "@/lib/pdf/customItineraryHtml";
import { renderPdfFromHtml } from "@/lib/pdf/renderPdf";

export type FormState = { error: string } | { success: string } | undefined;

const sendSchema = z.object({
  to: z.string().trim().min(1, "Enter an email address.").max(200),
  note: z.string().trim().max(2000).optional(),
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function travelWindow(start: Date | null, end: Date | null): string {
  if (start && end) return `${dateFormatter.format(start)} – ${dateFormatter.format(end)}`;
  if (start) return dateFormatter.format(start);
  return "To be confirmed";
}

async function senderName(userId: string): Promise<string> {
  const staff = await db.staffUser.findUnique({ where: { id: userId }, select: { name: true } });
  return staff?.name ?? "The Snapingo team";
}

/**
 * Emails a quotation to the customer with the itinerary PDF attached.
 *
 * The PDF is generated fresh at send time rather than reusing a stored copy:
 * a quotation is edited right up until it goes out, and attaching a stale file
 * is the kind of mistake nobody catches until the customer does.
 */
export async function sendItineraryEmailAction(
  customPackageId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireStaffFeature("customPackages");

  if (!isEmailConfigured()) {
    return { error: "Email isn't set up yet. Ask an admin to connect the email provider." };
  }

  const parsed = sendSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  if (!looksLikeEmail(parsed.data.to)) return { error: "That doesn't look like a valid email address." };

  const loaded = await loadCustomItinerary(customPackageId);
  if (!loaded) return { error: "That quotation no longer exists." };

  const html = await buildCustomItineraryHtml(loaded.data, loaded.context);
  const pdf = await renderPdfFromHtml(html);

  const message = itineraryEmail({
    customerName: loaded.data.customerName,
    tripId: loaded.data.tripId,
    destinationName: loaded.data.destinationName,
    travelWindow: travelWindow(loaded.data.startDate, loaded.data.endDate),
    totalAmount: loaded.data.totalAmount,
    senderName: await senderName(session.userId),
    note: parsed.data.note,
  });

  const result = await sendEmail({
    to: parsed.data.to,
    subject: message.subject,
    html: message.html,
    attachments: [{ filename: `${loaded.data.tripId}-itinerary.pdf`, content: Buffer.from(pdf) }],
    kind: "ITINERARY",
    sentById: session.userId,
    customPackageId,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath(`/admin/custom-packages/${customPackageId}`);
  revalidatePath(`/staff/custom-packages/${customPackageId}`);
  return { success: `Itinerary sent to ${parsed.data.to}.` };
}
