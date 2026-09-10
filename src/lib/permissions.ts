import type { StaffJobRole } from "@/generated/prisma/enums";

// Central permission matrix for staff sub-roles. ADMIN accounts bypass this
// entirely (see requireStaffFeature in src/lib/dal.ts) - this only governs
// what a STAFF account with a given jobRole can reach. The matrix itself is
// admin-editable at runtime (see src/lib/rolePermissions.ts) - this file
// only defines the known features and the built-in fallback values.
export type StaffFeature =
  | "leads"
  | "leadActivities"
  | "customerSearch"
  | "bookings"
  | "completeTrips"
  | "blogEdit"
  | "reviewsEdit"
  | "packagesEdit"
  | "destinationsEdit"
  | "hotelsEdit"
  | "flightsEdit"
  | "contentEdit"; // Services / FAQ / Homepage Categories / Trust Logos / USPs

// Every real feature flag, grouped and ordered the way they're presented on
// /admin/permissions and in the staff panel nav. Adding a new gated feature
// means adding it here (and to StaffFeature above) - everything else
// (the admin table, defaults, validation) is driven off this one list.
export const staffFeatureGroups: { heading: string; features: StaffFeature[] }[] = [
  {
    heading: "Leads & Bookings",
    features: ["leads", "leadActivities", "customerSearch", "bookings", "completeTrips"],
  },
  {
    heading: "Content",
    features: [
      "packagesEdit",
      "destinationsEdit",
      "hotelsEdit",
      "flightsEdit",
      "blogEdit",
      "reviewsEdit",
      "contentEdit",
    ],
  },
];

export const staffFeatures: StaffFeature[] = staffFeatureGroups.flatMap((g) => g.features);

export const featureLabels: Record<StaffFeature, string> = {
  leads: "Leads",
  leadActivities: "Lead Activities",
  customerSearch: "Customer Search",
  bookings: "Booking Management",
  completeTrips: "Complete Trips",
  packagesEdit: "Packages",
  destinationsEdit: "Destinations",
  hotelsEdit: "Hotels",
  flightsEdit: "Flights",
  blogEdit: "Blog",
  reviewsEdit: "Reviews",
  contentEdit: "Services, FAQ & Homepage Content",
};

export const featureDescriptions: Record<StaffFeature, string> = {
  leads: "See and manage the leads inbox.",
  leadActivities: "See the reverse-chronological activity feed across every lead.",
  customerSearch: "Search customers by name, phone or email across leads and bookings.",
  bookings: "Create and manage bookings and record payments.",
  completeTrips: "Mark bookings as completed once travel is finished.",
  packagesEdit: "Create, edit and delete tour packages.",
  destinationsEdit: "Create, edit and delete destinations.",
  hotelsEdit: "Create, edit and delete hotels.",
  flightsEdit: "Create, edit and delete flight routes.",
  blogEdit: "Create, edit and delete blog posts.",
  reviewsEdit: "Moderate and manage customer reviews.",
  contentEdit: "Edit Services, FAQ, Homepage Categories, Trust Logos and Why Choose Us.",
};

// Packages/Destinations/Hotels/Flights each have a permanent read-only
// reference page every staff role can browse regardless of permissions
// (see src/app/staff/(panel)/layout.tsx) - the feature flag here only ever
// adds *editing* on top of that baseline. Everything else in
// staffFeatures is all-or-nothing: no fallback view if the flag is off.
export const featuresWithViewFallback: StaffFeature[] = [
  "packagesEdit",
  "destinationsEdit",
  "hotelsEdit",
  "flightsEdit",
];

// The permission matrix finalized with the client on 2026-09-10. This is
// only the *fallback* used for any StaffJobRole that has no row yet in the
// RolePermission table (see src/lib/rolePermissions.ts) - a brand new
// deployment (or a role an admin hasn't touched on /admin/permissions yet)
// starts here, but an admin's actual edits always take priority over this.
export const defaultRolePermissions: Record<StaffJobRole, StaffFeature[]> = {
  TRAVEL_EXECUTIVE: ["leads", "leadActivities", "customerSearch", "bookings", "completeTrips"],
  BDE: ["leads", "leadActivities", "customerSearch"],
  SOCIAL_MEDIA_EXECUTIVE: [
    "leads",
    "leadActivities",
    "customerSearch",
    "blogEdit",
    "reviewsEdit",
    "packagesEdit",
    "destinationsEdit",
    "hotelsEdit",
    "flightsEdit",
  ],
  DIGITAL_MARKETING: [
    "leads",
    "leadActivities",
    "customerSearch",
    "packagesEdit",
    "destinationsEdit",
    "contentEdit",
    "blogEdit",
    "hotelsEdit",
    "flightsEdit",
  ],
};

export function hasFeature(features: StaffFeature[] | null | undefined, feature: StaffFeature): boolean {
  return features?.includes(feature) ?? false;
}

export const jobRoleLabels: Record<StaffJobRole, string> = {
  TRAVEL_EXECUTIVE: "Travel Executive",
  BDE: "BDE",
  SOCIAL_MEDIA_EXECUTIVE: "Social Media Executive",
  DIGITAL_MARKETING: "Digital Marketing",
};

export const jobRoleOptions = (Object.keys(jobRoleLabels) as StaffJobRole[]).map((value) => ({
  value,
  label: jobRoleLabels[value],
}));
