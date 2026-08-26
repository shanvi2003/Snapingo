import type { StaffJobRole } from "@/generated/prisma/enums";

// Central permission matrix for staff sub-roles. ADMIN accounts bypass this
// entirely (see requireStaffFeature in src/lib/dal.ts) - this only governs
// what a STAFF account with a given jobRole can reach.
export type StaffFeature =
  | "leads"
  | "customerSearch"
  | "bookings"
  | "completeTrips"
  | "blogEdit"
  | "reviewsEdit"
  | "contentEdit"; // Packages / Destinations / Services / FAQ

const jobRolePermissions: Record<StaffJobRole, StaffFeature[]> = {
  TRAVEL_EXECUTIVE: ["leads", "customerSearch", "bookings", "completeTrips"],
  BDE: ["leads", "customerSearch"],
  SOCIAL_MEDIA_EXECUTIVE: ["blogEdit", "reviewsEdit"],
  DIGITAL_MARKETING: ["contentEdit"],
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
