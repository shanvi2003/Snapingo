import type { TourPackage } from "@/data/packages";

export type PackageCategory =
  | "honeymoon"
  | "family"
  | "group"
  | "adventure"
  | "weekend"
  | "solo"
  | "religious"
  | "corporate";

export const packageCategoryOptions: { value: PackageCategory; label: string }[] = [
  { value: "honeymoon", label: "Honeymoon" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group Tours" },
  { value: "adventure", label: "Adventure" },
  { value: "weekend", label: "Weekend Getaways" },
  { value: "solo", label: "Solo Trip" },
  { value: "religious", label: "Religious" },
  { value: "corporate", label: "Corporate" },
];

export const packageCategoryLabels: Record<PackageCategory, string> = {
  honeymoon: "Honeymoon",
  family: "Family",
  group: "Group Tours",
  adventure: "Adventure",
  weekend: "Weekend Getaways",
  solo: "Solo Trip",
  religious: "Religious",
  corporate: "Corporate",
};

// Destinations conventionally marketed for honeymoon/romantic trips.
const HONEYMOON_DESTINATIONS = new Set([
  "maldives",
  "bali",
  "kashmir",
  "andaman-nicobar",
  "lakshadweep",
  "sikkim-darjeeling",
]);

// Destinations with a strong pilgrimage/temple circuit identity.
const RELIGIOUS_DESTINATIONS = new Set(["uttar-pradesh", "uttarakhand"]);

// Destinations built around trekking, rafting or high-altitude adventure.
const ADVENTURE_DESTINATIONS = new Set([
  "leh-ladakh",
  "himachal",
  "uttarakhand",
  "north-east",
  "andaman-nicobar",
]);

/**
 * Packages have no explicit category field in the data (no per-package
 * backfill exists for 148 entries), so categories are derived from
 * title/highlight keywords, destination conventions and trip length.
 * A package can match more than one category - filtering is OR-based
 * across whichever categories are checked, matching the reference UI.
 */
export function inferPackageCategories(pkg: TourPackage): PackageCategory[] {
  const text = `${pkg.id} ${pkg.title} ${pkg.highlights.join(" ")}`.toLowerCase();
  const categories = new Set<PackageCategory>();

  if (text.includes("honeymoon")) categories.add("honeymoon");
  if (text.includes("family")) categories.add("family");
  if (text.includes("group") || text.includes("backpacking")) categories.add("group");
  if (
    text.includes("adventure") ||
    text.includes("trek") ||
    text.includes("backpack") ||
    text.includes("rafting") ||
    text.includes("paragliding")
  )
    categories.add("adventure");
  if (text.includes("weekend")) categories.add("weekend");
  if (text.includes("solo")) categories.add("solo");
  if (
    text.includes("temple") ||
    text.includes("pilgrim") ||
    text.includes("spiritual") ||
    text.includes("gurudwara") ||
    text.includes("ganga aarti") ||
    text.includes("religious")
  )
    categories.add("religious");
  if (text.includes("corporate") || text.includes("mice") || text.includes("offsite"))
    categories.add("corporate");

  if (HONEYMOON_DESTINATIONS.has(pkg.destinationSlug)) categories.add("honeymoon");
  if (RELIGIOUS_DESTINATIONS.has(pkg.destinationSlug)) categories.add("religious");
  if (ADVENTURE_DESTINATIONS.has(pkg.destinationSlug)) categories.add("adventure");

  const nightsMatch = pkg.duration.match(/(\d+)\s*Night/i);
  const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : null;
  if (nights !== null && nights <= 3) categories.add("weekend");

  if (categories.size === 0) categories.add("family");

  return [...categories];
}

export type DurationBucket = "1-3" | "4-6" | "7-9" | "10-12" | "13-plus";

export const durationBucketOptions: { value: DurationBucket; label: string }[] = [
  { value: "1-3", label: "1 to 3 Days" },
  { value: "4-6", label: "4 to 6 Days" },
  { value: "7-9", label: "7 to 9 Days" },
  { value: "10-12", label: "10 to 12 Days" },
  { value: "13-plus", label: "13 or more" },
];

export function getPackageDurationDays(pkg: TourPackage): number {
  const match = pkg.duration.match(/(\d+)\s*Days?/i);
  return match ? parseInt(match[1], 10) : 0;
}

export function matchesDurationBucket(days: number, bucket: DurationBucket): boolean {
  switch (bucket) {
    case "1-3":
      return days >= 1 && days <= 3;
    case "4-6":
      return days >= 4 && days <= 6;
    case "7-9":
      return days >= 7 && days <= 9;
    case "10-12":
      return days >= 10 && days <= 12;
    case "13-plus":
      return days >= 13;
  }
}

export type BudgetBucket = "under-10k" | "10k-20k" | "20k-40k" | "40k-60k" | "60k-80k" | "80k-plus";

export const budgetBucketOptions: { value: BudgetBucket; label: string }[] = [
  { value: "under-10k", label: "Less than ₹10,000" },
  { value: "10k-20k", label: "₹10,000 - ₹20,000" },
  { value: "20k-40k", label: "₹20,000 - ₹40,000" },
  { value: "40k-60k", label: "₹40,000 - ₹60,000" },
  { value: "60k-80k", label: "₹60,000 - ₹80,000" },
  { value: "80k-plus", label: "Above ₹80,000" },
];

export function matchesBudgetBucket(price: number, bucket: BudgetBucket): boolean {
  switch (bucket) {
    case "under-10k":
      return price < 10000;
    case "10k-20k":
      return price >= 10000 && price < 20000;
    case "20k-40k":
      return price >= 20000 && price < 40000;
    case "40k-60k":
      return price >= 40000 && price < 60000;
    case "60k-80k":
      return price >= 60000 && price < 80000;
    case "80k-plus":
      return price >= 80000;
  }
}
