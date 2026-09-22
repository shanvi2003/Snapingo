// Seeds the admin-editable master data introduced in the Phase 1 admin-panel
// changes: dropdown option lists, the itinerary PDF's policy copy, and the
// handful of scalar settings that used to be TypeScript literals.
//
// Every write here is an upsert with an EMPTY `update` block. That is the
// whole point: this script is safe to re-run on production at any time, and
// re-running it will never overwrite a label an admin has since reworded or
// a policy they have since edited. It only ever fills in rows that are
// missing.
//
// Run with: npm run db:seed:master
import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import type { ContentBlockKey, MasterListKey } from "../src/generated/prisma/enums";
import { formatDuration, parseDuration } from "../src/lib/durationHelpers";
import { cancellationPolicyBody, termsBody } from "./legalContent";

// DIRECT_URL first: DATABASE_URL is Render's *internal* pooled host, which
// only resolves from inside Render's network, so a developer running this
// from a laptop would otherwise get ECONNREFUSED.
const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

type OptionSeed = {
  value: string;
  label: string;
  icon?: string;
  freeText?: boolean;
};

// NOTE on the inclusion `value`s: the first five deliberately keep the slugs
// the 148 existing packages already store ("hotel", "transfer", ...) even
// though the client asked for new wording. Renaming a label is free; renaming
// a slug would mean rewriting every package row and risking a mismatch, so
// only the labels change. This is exactly what MasterOption's stable-slug
// design is for.
const masterOptions: Record<MasterListKey, OptionSeed[]> = {
  PACKAGE_INCLUSION: [
    { value: "hotel", label: "Accommodation", icon: "BedDouble" },
    { value: "flight", label: "Flight", icon: "Plane" },
    {
      value: "transfer",
      label: "Pickup and Drop (Airport / Railway Station / Bus Stand)",
      icon: "Car",
    },
    { value: "sightseeing", label: "Sightseeing", icon: "Camera" },
    { value: "train", label: "Train", icon: "TrainFront" },
    { value: "meals", label: "Meals", icon: "UtensilsCrossed" },
    { value: "candle-light-dinner", label: "Candle Light Dinner", icon: "Flame" },
    { value: "flower-bed-decoration", label: "Flower Bed Decoration", icon: "Flower2" },
    { value: "honeymoon-cake", label: "Honeymoon Cake", icon: "Cake" },
    { value: "welcome-drink", label: "Welcome Drink on Arrival", icon: "Martini" },
    { value: "visa", label: "Visa", icon: "FileCheck" },
    { value: "volvo-ticket", label: "Volvo Ticket", icon: "Bus" },
    { value: "other", label: "Other (Specify)", icon: "Plus", freeText: true },
  ],

  // Seeded from the badges already in use on live packages, so switching the
  // field from free text to a dropdown doesn't orphan any existing row.
  PACKAGE_BADGE: [
    { value: "Bestseller", label: "Bestseller" },
    { value: "Hot Deal", label: "Hot Deal" },
    { value: "Trending", label: "Trending" },
    { value: "Handpicked", label: "Handpicked" },
    { value: "Luxury", label: "Luxury" },
  ],

  ROOM_CATEGORY: [
    { value: "standard", label: "Standard" },
    { value: "deluxe", label: "Deluxe" },
    { value: "super-deluxe", label: "Super Deluxe" },
    { value: "executive", label: "Executive" },
    { value: "family", label: "Family" },
    { value: "premium", label: "Premium" },
    { value: "camp-stay", label: "Camp Stay" },
    { value: "house-boat-stay", label: "House Boat Stay" },
    { value: "other", label: "Other (Specify)", freeText: true },
  ],

  HOTEL_CATEGORY: [
    { value: "2-star", label: "2 Star" },
    { value: "3-star", label: "3 Star" },
    { value: "4-star", label: "4 Star" },
    { value: "5-star", label: "5 Star" },
  ],

  // Left empty on purpose: the client asked for Vehicle Name to be a free-text
  // field staff type, so this list starts out as something an admin can grow
  // over time rather than a guess we impose up front.
  VEHICLE_TYPE: [],
};

// The exact copy that was hardcoded in src/components/ItineraryPrintView.tsx,
// moved here verbatim so the generated PDF reads identically on day one and
// becomes editable from day two. A line beginning with "- " renders as a
// bullet; anything else renders as a paragraph.
const contentBlocks: Record<ContentBlockKey, { title: string; body: string }> = {
  PDF_ABOUT: {
    title: "About Snapingo",
    body: "Snapingo Travel was built to give the modern traveller flexibility and a genuine sense of independence in planning a trip. We curate all-inclusive holiday packages, flights, stay, transfers and sightseeing, bundled into a single booking, backed by an in-house team that stays reachable through the whole journey, not just at the time of booking.",
  },
  PDF_TERMS: {
    title: "Terms & Conditions",
    body: termsBody,
  },
  PDF_PAYMENT_POLICY: {
    title: "Payment Policy",
    body: [
      "- Standard packages: 75% advance at booking, 25% on arrival.",
      "- Himachal packages: 50% advance, 50% on arrival.",
      "- 4-star / 5-star & luxury packages: 100% advance required.",
      "- Accepted modes: Bank Transfer (NEFT/RTGS/IMPS), UPI, Cheque.",
    ].join("\n"),
  },
  PDF_CANCELLATION_POLICY: {
    title: "Cancellation Policy",
    body: cancellationPolicyBody,
  },
  // This block is new - the PDF never had one. Seeded with an obvious
  // placeholder rather than invented bank details, so an admin filling it in
  // is the only way real account numbers ever reach a customer document.
  PDF_ACCOUNT_DETAILS: {
    title: "Account Details",
    body: [
      "- Account Name: (add your account name in Admin → Settings → PDF Content)",
      "- Bank & Branch: (add)",
      "- Account Number: (add)",
      "- IFSC Code: (add)",
      "- UPI ID: (add)",
    ].join("\n"),
  },
  PDF_DISCLAIMER: {
    title: "Disclaimer",
    body: "Hotel, room category and vehicle details above are indicative and subject to availability at the time of booking; a specific property and vehicle will be confirmed in your Booking Confirmation. Prices are per person, starting from. This itinerary is indicative: contact us to confirm final dates and inclusions.",
  },
};

// Scalar settings. Keys are also declared in src/lib/settings.ts, which is
// what the app reads them through.
const settings: Record<string, string> = {
  gst_percent: "5",
  trip_id_prefix: "SNP",
  operation_head_name: "Ashutosh Pandey",
  operation_head_phone: "+91 87077 36609",
  operation_head_email: "ashutosh@snapingo.com",
};

async function seedMasterOptions() {
  let created = 0;
  for (const [list, options] of Object.entries(masterOptions) as [MasterListKey, OptionSeed[]][]) {
    for (const [index, option] of options.entries()) {
      const result = await db.masterOption.upsert({
        where: { list_value: { list, value: option.value } },
        update: {},
        create: {
          list,
          value: option.value,
          label: option.label,
          icon: option.icon ?? null,
          order: index,
          freeText: option.freeText ?? false,
        },
      });
      if (result.createdAt.getTime() === result.updatedAt.getTime()) created += 1;
    }
  }
  console.log(`Master options: ${created} created, existing rows left untouched`);
}

async function seedContentBlocks() {
  for (const [key, block] of Object.entries(contentBlocks) as [
    ContentBlockKey,
    { title: string; body: string },
  ][]) {
    await db.contentBlock.upsert({ where: { key }, update: {}, create: { key, ...block } });
  }
  console.log(`Content blocks ready: ${Object.keys(contentBlocks).length}`);
}

async function seedSettings() {
  for (const [key, value] of Object.entries(settings)) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }
  console.log(`Settings ready: ${Object.keys(settings).length}`);
}

/**
 * Fills durationNights/durationDays on packages created before the dropdowns
 * existed, by reading their free-text `duration`. Only touches rows where the
 * numbers are still null, so it is safe to re-run and never overwrites a
 * value staff have since set from the form.
 */
async function backfillPackageDurations() {
  const packages = await db.package.findMany({
    where: { OR: [{ durationNights: null }, { durationDays: null }] },
    select: { id: true, duration: true },
  });

  let filled = 0;
  const unparsed: string[] = [];

  for (const pkg of packages) {
    const parsed = parseDuration(pkg.duration);
    if (!parsed) {
      unparsed.push(`${pkg.id} ("${pkg.duration}")`);
      continue;
    }
    await db.package.update({
      where: { id: pkg.id },
      data: {
        durationNights: parsed.nights,
        durationDays: parsed.days,
        // Normalises the few rows typed as "3N/4D" onto the same display
        // format every other package uses.
        duration: formatDuration(parsed),
      },
    });
    filled += 1;
  }

  console.log(`Package durations backfilled: ${filled} of ${packages.length}`);
  if (unparsed.length > 0) {
    console.log(`  Could not parse (left for staff to set from the form): ${unparsed.join(", ")}`);
  }
}

async function main() {
  await seedMasterOptions();
  await seedContentBlocks();
  await seedSettings();
  await backfillPackageDurations();
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
