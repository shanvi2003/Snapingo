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
  // Optional because new packages no longer carry one: savePackageAction
  // derives the id from the title (see src/lib/slug.ts). On an edit the form
  // still posts the existing id back in a read-only field, and the action
  // rejects a missing one there.
  id: z
    .string()
    .trim()
    .max(120)
    .regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and hyphens only.")
    .optional(),
  title: z.string().trim().min(1).max(200),
  // `destination` (the display name) is no longer posted by the form at all -
  // staff pick a destination from a dropdown, which submits only the slug,
  // and the action looks the name up from the Destination row. That makes it
  // impossible to save a package whose destination name and slug disagree,
  // which the two free-text fields previously allowed.
  destinationSlug: z.string().trim().min(1).max(120),
  type: z.enum(["domestic", "international"]),
  image: imageField,
  // Duration arrives as two numbers from two dropdowns; the display string is
  // derived from them in the action via formatDuration.
  durationNights: z.coerce.number().int().min(0).max(30),
  durationDays: z.coerce.number().int().min(1).max(31),
  price: z.coerce.number().int().nonnegative(),
  originalPrice: z.coerce.number().int().nonnegative(),
  rating: z.coerce.number().min(0).max(5),
  reviews: z.coerce.number().int().nonnegative(),
  tripsSold: z.coerce.number().int().nonnegative().default(0),
  badge: z.string().trim().max(60).optional(),
  // .default(false), not a bare z.coerce.boolean(): an unchecked checkbox is
  // omitted from FormData entirely (standard HTML behavior), so the key is
  // missing rather than "false" - a non-optional schema field rejected that
  // as invalid on every package/destination/service with the box unchecked.
  featured: z.coerce.boolean().default(false),
  hotDeal: z.coerce.boolean().default(false),
  // Open-ended now that the inclusion list is admin-editable master data
  // rather than a fixed union. The action checks each value against the live
  // PACKAGE_INCLUSION list, which is the only place that can know what's valid.
  inclusions: z.array(z.string().max(120)),
  // Free-text inclusions from the extra box, one per line.
  customInclusions: z.string().transform(linesToArray).pipe(z.array(z.string().max(200)).max(20)),
  // Additional exclusions staff type on top of the automatic ones (taxes,
  // insurance, personal expenses - things that aren't the inverse of any
  // inclusion). See getEffectiveExclusions.
  exclusions: z.string().transform(linesToArray).pipe(z.array(z.string().max(300)).max(30)),
  categories: z.array(z.string()),
  highlights: z.string().transform(linesToArray),
  itinerary: jsonRows.transform((rows) =>
    rows.map((r, i) => ({ day: i + 1, title: r.title ?? "", desc: r.desc ?? "" }))
  ),
});

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

export const hotelSchema = z.object({
  id: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  name: z.string().trim().min(1).max(200),
  destinationSlug: z.string().trim().min(1).max(120),
  category: z.enum(["3-star", "4-star", "5-star", "luxury"]),
  pricePerNight: z.coerce.number().int().nonnegative(),
  rating: z.coerce.number().min(0).max(5),
});

export const flightSchema = z.object({
  id: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and hyphens only."),
  airline: z.string().trim().min(1).max(120),
  departureCitySlug: z.string().trim().min(1).max(120),
  destinationSlug: z.string().trim().min(1).max(120),
  flightClass: z.enum(["economy", "premium-economy", "business", "first"]),
  price: z.coerce.number().int().nonnegative(),
  duration: z.string().trim().min(1).max(60),
});

export const faqItemSchema = z.object({
  categoryId: z.string(),
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(2000),
});
