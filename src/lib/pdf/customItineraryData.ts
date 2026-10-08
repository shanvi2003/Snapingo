import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { db } from "@/lib/db";
import { siteConfig } from "@/lib/siteConfig";
import { resolveContentBlocks } from "@/lib/contentBlocks";
import { getSettings } from "@/lib/settings";
import { getMasterList } from "@/lib/masterData";
import { getEffectiveExclusions, resolveInclusions } from "@/lib/inclusionHelpers";
import type { CustomItineraryContext, CustomItineraryData } from "@/lib/pdf/customItineraryHtml";

const IMAGE_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
};

async function fetchAsDataUri(url: string): Promise<string> {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`${response.status}`);
  const type = response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  if (!type.startsWith("image/")) throw new Error(type);
  return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`;
}

/**
 * The destination's photo as a data URI, since the PDF renderer loads
 * nothing over the network (see renderPdf). Photos under /public are read
 * from disk where the files exist (local dev); on Vercel they are not bundled
 * into this function - 40+ MB of photos for one image - so they are fetched
 * from the live site instead. Any failure prints the PDF without a photo
 * rather than failing it.
 */
async function destinationPhoto(destinationName: string): Promise<string> {
  const destination = await db.destination.findFirst({
    where: { name: { equals: destinationName.trim(), mode: "insensitive" } },
    select: { image: true },
  });
  const image = destination?.image;
  if (!image) return "";

  if (/^https?:\/\//.test(image)) return fetchAsDataUri(image).catch(() => "");

  const mime = IMAGE_MIME[path.extname(image).toLowerCase()];
  if (!mime) return "";
  try {
    const buffer = await readFile(path.join(process.cwd(), "public", image));
    return `data:${mime};base64,${buffer.toString("base64")}`;
  } catch {
    const hosts = [process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`, siteConfig.url];
    for (const host of hosts) {
      if (!host) continue;
      try {
        return await fetchAsDataUri(`${host}${image}`);
      } catch {
        // Try the next host.
      }
    }
    return "";
  }
}

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
  const [blocks, photo] = await Promise.all([
    resolveContentBlocks(quotation.contentBlocks),
    destinationPhoto(quotation.destinationName),
  ]);

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
      photo,
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
