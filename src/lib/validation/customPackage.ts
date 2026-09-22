import { z } from "zod";

const linesToArray = (v: unknown) =>
  typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : [];

// Rows arrive as one JSON string per repeatable section (see RepeatableRows),
// where every cell is a string - including numbers and checkboxes - so the
// whole section can ride in a single hidden input on a plain form POST.
const jsonRows = z.string().transform((v, ctx) => {
  try {
    const parsed = JSON.parse(v);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, string>[];
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid rows data." });
    return z.NEVER;
  }
});

const toInt = (value: string | undefined, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
};

/** "" and a malformed date both become null rather than an Invalid Date. */
const toDate = (value: string | undefined): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const customPackageSchema = z.object({
  id: z.string().trim().max(60).optional(),

  customerName: z.string().trim().min(1, "Customer name is required.").max(200),
  customerPhone: optionalText(40),
  customerEmail: z.union([z.literal(""), z.email().max(200)]).optional(),
  leadId: optionalText(60),

  destinationName: z.string().trim().min(1, "Destination is required.").max(200),
  startDate: optionalText(40),
  endDate: optionalText(40),
  durationNights: z.coerce.number().int().min(0).max(60),
  durationDays: z.coerce.number().int().min(1).max(61),

  adults: z.coerce.number().int().min(0).max(99),
  children: z.coerce.number().int().min(0).max(99),
  infants: z.coerce.number().int().min(0).max(99),
  // One age per line, kept as text: "8 months" is as valid an answer as "2".
  childAges: z.string().transform(linesToArray).pipe(z.array(z.string().max(40)).max(20)),
  rooms: z.coerce.number().int().min(0).max(99),
  extraBeds: z.coerce.number().int().min(0).max(99),
  extraMattresses: z.coerce.number().int().min(0).max(99),

  roomCategory: optionalText(120),
  roomCategoryOther: optionalText(200),
  hotelCategory: optionalText(120),

  inclusions: z.array(z.string().max(120)),
  customInclusions: z.string().transform(linesToArray).pipe(z.array(z.string().max(200)).max(20)),

  vehicleName: optionalText(200),

  // GST is never posted by the form: it is computed server-side from the
  // configured rate so a crafted request can't understate a customer's tax.
  price: z.coerce.number().int().nonnegative(),

  notes: optionalText(4000),

  days: jsonRows.transform((rows) =>
    rows
      .map((r, i) => ({
        day: i + 1,
        date: toDate(r.date),
        title: (r.title ?? "").trim(),
        desc: (r.desc ?? "").trim(),
      }))
      // A blank trailing row is what RepeatableRows starts every section with;
      // saving it would print an empty day on the customer's itinerary.
      .filter((d) => d.title || d.desc)
  ),

  stays: jsonRows.transform((rows) =>
    rows
      .map((r, i) => ({
        order: i,
        city: (r.city ?? "").trim() || null,
        nights: r.nights ? toInt(r.nights) : null,
        hotelName: (r.hotelName ?? "").trim(),
        hotelCategory: (r.hotelCategory ?? "").trim() || null,
        roomCategory: (r.roomCategory ?? "").trim() || null,
        rooms: toInt(r.rooms, 1),
        extraBed: r.extraBed === "true",
        extraMattress: r.extraMattress === "true",
      }))
      .filter((s) => s.hotelName)
  ),
});

export type CustomPackageInput = z.output<typeof customPackageSchema>;
