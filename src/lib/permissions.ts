import type { StaffJobRole } from "@/generated/prisma/enums";

// Central permission matrix for staff sub-roles. ADMIN accounts bypass this
// entirely (see requireStaffFeature in src/lib/dal.ts) - this only governs
// what a STAFF account with a given jobRole can reach.
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

const jobRolePermissions: Record<StaffJobRole, StaffFeature[]> = {
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

export function staffCan(jobRole: StaffJobRole | null | undefined, feature: StaffFeature): boolean {
  if (!jobRole) return false;
  return jobRolePermissions[jobRole].includes(feature);
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
