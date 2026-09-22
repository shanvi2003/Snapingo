import { z } from "zod";
import { LeadStatus } from "@/generated/prisma/enums";

const linesToArray = (v: unknown) =>
  typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : [];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    // "" from an untouched input means "cleared", which the database stores as
    // NULL rather than an empty string - otherwise a blank field and a
    // never-answered field would look different in every query.
    .transform((v) => (v ? v : null));

const optionalInt = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 0 && n <= 999 ? n : null;
  });

const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((v) => {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  });

/**
 * What staff may change on a lead while they're on the phone with a customer.
 *
 * Deliberately narrower than the Lead model: `source`, `assignedToId`,
 * `pageUrl`, `userAgent` and `raw` are attribution and workflow facts, not
 * details the customer can correct, so they stay out of the form. Assignment
 * in particular is admin-only and has its own action.
 */
export const editLeadSchema = z.object({
  name: optionalText(200),
  phone: optionalText(40),
  email: optionalText(200),

  status: z.enum(LeadStatus),

  tripType: optionalText(40),
  destinationName: optionalText(200),
  startDate: optionalDate,
  endDate: optionalDate,
  month: optionalText(40),
  days: optionalText(40),
  packageTitle: optionalText(200),

  adults: optionalInt,
  children: optionalInt,
  infants: optionalInt,
  childAges: z.string().optional().transform(linesToArray).pipe(z.array(z.string().max(40)).max(20)),
  rooms: optionalInt,
  extraBeds: optionalInt,
  extraMattresses: optionalInt,
  roomCategory: optionalText(120),
  hotelCategory: optionalText(120),

  message: optionalText(2000),
});

export type EditLeadInput = z.output<typeof editLeadSchema>;
