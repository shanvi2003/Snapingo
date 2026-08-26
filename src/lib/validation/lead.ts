import { z } from "zod";
import { LeadSource } from "@/generated/prisma/client";

// Mirrors the Prisma `Lead` model. `source` is the only required field —
// every touchpoint sends a different subset of the rest. Strings are kept
// loose (not enums) for tripType/dateMode/etc. since the source components
// already constrain their own values; this is a shape/size boundary, not a
// business-rule boundary.
export const createLeadSchema = z.object({
  source: z.enum(LeadSource),

  name: z.string().trim().min(1).max(200).optional(),
  phone: z.string().trim().min(1).max(40).optional(),
  email: z.email().max(200).optional(),

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
