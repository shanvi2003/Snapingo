import { z } from "zod";

export const createBookingSchema = z.object({
  leadId: z.string().optional(),
  travelerName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(40),
  email: z.email().max(200).optional().or(z.literal("")),
  packageId: z.string().max(120).optional(),
  packageTitle: z.string().max(200).optional(),
  destinationName: z.string().max(200).optional(),
  travelStartDate: z.coerce.date().optional(),
  travelEndDate: z.coerce.date().optional(),
  totalAmount: z.coerce.number().int().nonnegative(),
  taxAmount: z.coerce.number().int().nonnegative().default(0),
  notes: z.string().max(2000).optional(),
});

export type CreateBookingInput = z.input<typeof createBookingSchema>;

export const addPaymentSchema = z.object({
  bookingId: z.string(),
  amount: z.coerce.number().int().positive(),
  mode: z.string().trim().min(1).max(60),
  paidAt: z.coerce.date().optional(),
  notes: z.string().max(500).optional(),
});

export type AddPaymentInput = z.input<typeof addPaymentSchema>;
