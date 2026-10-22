import { z } from "zod";

export const createBookingSchema = z.object({
  leadId: z.string().optional(),
  travelerName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(40),
  email: z.email("Enter a valid email address.").max(200),
  packageId: z.string().max(120).optional(),
  packageTitle: z.string().trim().max(200).optional(),
  destinationName: z.string().max(200).optional(),
  // Required: Upcoming / Ongoing / Complete Trips place a booking by its dates
  // alone (src/lib/tripStage.ts), so one without a start date is in none of them.
  travelStartDate: z.coerce.date({ error: "Pick the travel start date." }),
  travelEndDate: z.coerce.date().optional(),
  totalAmount: z.coerce.number().int().nonnegative(),
  taxAmount: z.coerce.number().int().nonnegative().default(0),
  notes: z.string().max(2000).optional(),
});

export const addPaymentSchema = z.object({
  bookingId: z.string(),
  amount: z.coerce.number().int().positive(),
  mode: z.string().trim().min(1).max(60),
  paidAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});
