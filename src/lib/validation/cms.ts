import { z } from "zod";
import { isAllowedImageSource, imageSourceMessage } from "@/lib/imageHosts";

const linesToArray = (v: unknown) =>
  typeof v === "string" ? v.split("\n").map((s) => s.trim()).filter(Boolean) : [];

// next/image only optimizes local /public paths and the hosts whitelisted in
// next.config.ts - anything else throws at render time and takes the page
// down for every visitor, so every admin-entered image field is checked
// against the same allow-list at save-time instead.
const imageField = z.string().trim().min(1).max(500).refine(isAllowedImageSource, imageSourceMessage);
const galleryField = z.string().transform(linesToArray).pipe(z.array(z.string().refine(isAllowedImageSource, imageSourceMessage)));

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

export const packageSchema = z.object({
  id: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  title: z.string().trim().min(1).max(200),
  destination: z.string().trim().min(1).max(200),
  destinationSlug: z.string().trim().min(1).max(120),
  type: z.enum(["domestic", "international"]),
  image: imageField,
  duration: z.string().trim().min(1).max(60),
  price: z.coerce.number().int().nonnegative(),
  originalPrice: z.coerce.number().int().nonnegative(),
  rating: z.coerce.number().min(0).max(5),
  reviews: z.coerce.number().int().nonnegative(),
  badge: z.string().trim().max(60).optional(),
  featured: z.coerce.boolean(),
  hotDeal: z.coerce.boolean(),
  inclusions: z.array(z.enum(["flight", "hotel", "meals", "transfer", "sightseeing"])),
  categories: z.array(z.string()),
  exclusions: z.string().transform(linesToArray),
  highlights: z.string().transform(linesToArray),
  itinerary: jsonRows.transform((rows) =>
    rows.map((r, i) => ({ day: i + 1, title: r.title ?? "", desc: r.desc ?? "" }))
  ),
});
export type PackageFormValues = z.input<typeof packageSchema>;

export const destinationSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  name: z.string().trim().min(1).max(200),
  tagline: z.string().trim().min(1).max(300),
  image: imageField,
  gallery: galleryField,
  packagesCount: z.coerce.number().int().nonnegative(),
  startingPrice: z.coerce.number().int().nonnegative(),
  type: z.enum(["domestic", "international"]),
  overview: z.string().trim().min(1).max(4000),
  bestTimeToVisit: z.string().trim().min(1).max(200),
  idealDuration: z.string().trim().min(1).max(100),
  highlights: jsonRows.transform((rows) =>
    rows.map((r) => ({ icon: r.icon ?? "", title: r.title ?? "", desc: r.desc ?? "" }))
  ),
});
export type DestinationFormValues = z.input<typeof destinationSchema>;

export const serviceSchema = z.object({
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  name: z.string().trim().min(1).max(200),
  tagline: z.string().trim().min(1).max(300),
  image: imageField,
  overview: z.string().trim().min(1).max(4000),
  highlights: jsonRows.transform((rows) =>
    rows.map((r) => ({ icon: r.icon ?? "", title: r.title ?? "", desc: r.desc ?? "" }))
  ),
});
export type ServiceFormValues = z.input<typeof serviceSchema>;

export const blogPostSchema = z.object({
  id: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  title: z.string().trim().min(1).max(300),
  excerpt: z.string().trim().min(1).max(500),
  image: imageField,
  category: z.string().trim().min(1).max(100),
  readTime: z.string().trim().min(1).max(40),
  author: z.string().trim().min(1).max(120),
  date: z.coerce.date(),
  content: jsonRows.transform((rows) =>
    rows.map((r, i) => ({ order: i, heading: r.heading || undefined, body: r.body ?? "" }))
  ),
});
export type BlogPostFormValues = z.input<typeof blogPostSchema>;

export const hotelSchema = z.object({
  id: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  name: z.string().trim().min(1).max(200),
  destinationSlug: z.string().trim().min(1).max(120),
  category: z.enum(["3-star", "4-star", "5-star", "luxury"]),
  pricePerNight: z.coerce.number().int().nonnegative(),
  rating: z.coerce.number().min(0).max(5),
});
export type HotelFormValues = z.input<typeof hotelSchema>;

export const flightSchema = z.object({
  id: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  airline: z.string().trim().min(1).max(120),
  departureCitySlug: z.string().trim().min(1).max(120),
  destinationSlug: z.string().trim().min(1).max(120),
  flightClass: z.enum(["economy", "premium-economy", "business", "first"]),
  price: z.coerce.number().int().nonnegative(),
  duration: z.string().trim().min(1).max(60),
});
export type FlightFormValues = z.input<typeof flightSchema>;

export const faqItemSchema = z.object({
  categoryId: z.string(),
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2000),
});
