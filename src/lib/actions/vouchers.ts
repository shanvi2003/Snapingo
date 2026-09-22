"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import { deleteBlob, isBlobConfigured, uploadDocument } from "@/lib/blob";

export type FormState = { error: string } | { success: string } | undefined;

function revalidateBooking(bookingId: string) {
  revalidatePath(`/admin/bookings/${bookingId}`);
  revalidatePath(`/staff/bookings/${bookingId}`);
}

/**
 * Attaches a booking voucher (hotel confirmation, flight ticket, cab voucher)
 * to a booking.
 *
 * The file goes to private blob storage; only its URL and metadata are stored
 * here, and the URL alone is not enough to read it - downloads go through an
 * authenticated route.
 */
export async function uploadVoucherAction(
  bookingId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireStaffFeature("bookings");

  if (!isBlobConfigured()) {
    return { error: "File uploads aren't set up yet. Ask an admin to connect blob storage." };
  }

  const booking = await db.booking.findUnique({ where: { id: bookingId }, select: { id: true } });
  if (!booking) return { error: "That booking no longer exists." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };

  const label = String(formData.get("label") ?? "").trim().slice(0, 120) || null;

  const result = await uploadDocument(file);
  if ("error" in result) return { error: result.error };

  await db.bookingVoucher.create({
    data: {
      bookingId,
      label,
      fileName: file.name.slice(0, 200),
      blobUrl: result.url,
      contentType: result.contentType,
      size: result.size,
      uploadedById: session.userId,
    },
  });

  revalidateBooking(bookingId);
  return { success: "Voucher uploaded." };
}

export async function deleteVoucherAction(voucherId: string): Promise<void> {
  await requireStaffFeature("bookings");

  const voucher = await db.bookingVoucher.findUnique({
    where: { id: voucherId },
    select: { bookingId: true, blobUrl: true },
  });
  if (!voucher) return;

  // Row first, then the file. If the blob delete fails the record is already
  // gone, which is the right way round - an orphaned file costs storage, an
  // orphaned row shows staff a download link that 404s.
  await db.bookingVoucher.delete({ where: { id: voucherId } });
  await deleteBlob(voucher.blobUrl);

  revalidateBooking(voucher.bookingId);
}
