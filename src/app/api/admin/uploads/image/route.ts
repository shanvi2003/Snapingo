import { NextResponse } from "next/server";
import { requireSession } from "@/lib/dal";
import { checkRateLimit } from "@/lib/rateLimit";
import { MAX_IMAGE_BYTES, isBlobConfigured, uploadImage } from "@/lib/blob";

// Reading the whole file and forwarding it to blob storage takes longer than
// a normal request on a slow connection.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Receives a cover image from the admin/staff panel and returns the stored
 * URL, which the form then saves into the existing `image` field.
 *
 * Gated on any signed-in staff account rather than a specific content
 * permission: the same field appears on packages, destinations, blog posts,
 * services and reviews, each behind its own flag, and the upload itself
 * doesn't publish anything - the save that follows is what's permission
 * checked, by the action that owns that content.
 */
export async function POST(request: Request) {
  const session = await requireSession(["ADMIN", "STAFF"]);

  if (!isBlobConfigured()) {
    return NextResponse.json(
      { error: "File uploads aren't set up yet. Paste an image URL instead." },
      { status: 503 }
    );
  }

  // Per-account, not per-IP: staff share an office connection, so an IP
  // bucket would throttle the whole team because one person is bulk-loading
  // images. 60 uploads a minute is far above real use and still bounds what a
  // stolen session can push into the store.
  if (!checkRateLimit(`upload:${session.userId}`, 60, 60_000)) {
    return NextResponse.json({ error: "Too many uploads - wait a moment and try again." }, { status: 429 });
  }

  // Checked before reading the body so an oversized file is rejected without
  // buffering it first.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_IMAGE_BYTES * 1.1) {
    return NextResponse.json({ error: "That image is too large." }, { status: 413 });
  }

  let file: File | null = null;
  try {
    const formData = await request.formData();
    const value = formData.get("file");
    if (value instanceof File) file = value;
  } catch {
    return NextResponse.json({ error: "Could not read the uploaded file." }, { status: 400 });
  }

  if (!file) return NextResponse.json({ error: "No file was uploaded." }, { status: 400 });

  const result = await uploadImage(file);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ url: result.url });
}
