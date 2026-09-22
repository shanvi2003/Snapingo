import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import { readPrivateDocument } from "@/lib/blob";

export const dynamic = "force-dynamic";

/**
 * Streams a booking voucher back to an authenticated staff member.
 *
 * This route is the only way to read one: the file is stored with private
 * access, so its blob URL cannot be opened directly even by someone who has
 * it. That is what makes the "not accessible by guessing a link" requirement
 * real for customer documents rather than just unlikely.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("bookings");

  const { id } = await params;
  const voucher = await db.bookingVoucher.findUnique({ where: { id } });
  if (!voucher) return NextResponse.json({ error: "Voucher not found" }, { status: 404 });

  const result = await readPrivateDocument(voucher.blobUrl);
  if (!result || result.statusCode !== 200 || !result.stream) {
    return NextResponse.json({ error: "That file is no longer available." }, { status: 404 });
  }

  // The stored filename is quoted and stripped of quotes/newlines so it can't
  // break out of the Content-Disposition header.
  const safeName = voucher.fileName.replace(/["\r\n]/g, "");

  return new NextResponse(result.stream, {
    headers: {
      "Content-Type": voucher.contentType,
      "Content-Disposition": `attachment; filename="${safeName}"`,
      // Never let a shared cache hold a customer's document.
      "Cache-Control": "private, no-store",
    },
  });
}
