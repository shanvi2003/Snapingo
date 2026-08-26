import { z } from "zod";
import { isAllowedImageSource, imageSourceMessage } from "@/lib/imageHosts";

export const testimonialSchema = z.object({
  name: z.string().trim().min(1).max(120),
  location: z.string().trim().min(1).max(120),
  avatar: z.string().trim().min(1).max(500).refine(isAllowedImageSource, imageSourceMessage),
  rating: z.coerce.number().min(1).max(5),
  trip: z.string().trim().min(1).max(200),
  quote: z.string().trim().min(1).max(1000),
  order: z.coerce.number().int().default(0),
});

export type TestimonialInput = z.input<typeof testimonialSchema>;
