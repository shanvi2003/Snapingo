import { z } from "zod";
import { LeadSource } from "@/generated/prisma/client";
import { isValidEmail, isValidName, isValidPhone } from "./contact";

// Mirrors the Prisma `Lead` model. `source`, `name`, `phone` and `email` are
// the only required fields - every lead-capture touchpoint on the site now
// collects all three before it's allowed to submit (see LeadContactFields),
// so a Lead with no way to contact the person behind it should never reach
// the database. The name/phone/email checks below reuse the exact same
// isValid* helpers the client forms use, so "valid on the form" and "valid
// on the server" can never disagree. Everything else stays loose (not
// enums) for tripType/dateMode/etc. since the source components already
// constrain their own values; this is a shape/size boundary, not a
// business-rule boundary.
//
// Note: the underlying Prisma `Lead.name/phone/email` columns stay nullable
// - there are pre-existing leads in production with these fields empty from
// before this validation existed, so a NOT NULL migration would need a data
// backfill first. This schema is the actual enforcement point for every new
// lead (createLeadAction below is the only code path that creates one).
export const createLeadSchema = z.object({
  source: z.enum(LeadSource),

  name: z.string().trim().max(200).refine(isValidName, "Please enter your name"),
  phone: z.string().trim().max(40).refine(isValidPhone, "Please enter a valid phone number"),
  email: z.string().trim().max(200).refine(isValidEmail, "Please enter a valid email address"),

  tripType: z.string().max(40).optional(),
  destinationSlug: z.string().max(120).optional(),
  destinationName: z.string().max(200).optional(),

  dateMode: z.string().max(40).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  month: z.string().max(40).optional(),
  days: z.string().max(40).optional(),

  packageId: z.string().max(120).optional(),
  packageTitle: z.string().max(200).optional(),
  hotelName: z.string().max(200).optional(),
  pricePerNight: z.coerce.number().int().positive().optional(),
  flightLabel: z.string().max(200).optional(),
  fromCityName: z.string().max(200).optional(),
  classLabel: z.string().max(100).optional(),
  categoryLabel: z.string().max(100).optional(),
  priceLabel: z.string().max(100).optional(),

  message: z.string().max(2000).optional(),
  raw: z.record(z.string(), z.unknown()).optional(),

  pageUrl: z.string().max(500).optional(),
});

// z.input (pre-coercion) so callers can pass plain date strings straight
// from <input type="date"> - z.output/z.infer would require an already-coerced
// Date, which is what safeParse below actually validates against.
export type CreateLeadInput = z.input<typeof createLeadSchema>;
