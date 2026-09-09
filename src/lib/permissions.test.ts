import { describe, it, expect } from "vitest";
import type { StaffJobRole } from "@/generated/prisma/enums";
import { staffCan, jobRoleLabels, jobRoleOptions, type StaffFeature } from "./permissions";

const allFeatures: StaffFeature[] = [
  "leads",
  "leadActivities",
  "customerSearch",
  "bookings",
  "completeTrips",
  "blogEdit",
  "reviewsEdit",
  "packagesEdit",
  "destinationsEdit",
  "hotelsEdit",
  "flightsEdit",
  "contentEdit",
];

// The approved access matrix (see conversation with the client) - this test
// exists specifically so an accidental edit to the permission map in
// permissions.ts gets caught instead of silently shipping.
const expectedMatrix: Record<StaffJobRole, StaffFeature[]> = {
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

describe("staffCan", () => {
  for (const jobRole of Object.keys(expectedMatrix) as StaffJobRole[]) {
    describe(jobRole, () => {
      for (const feature of allFeatures) {
        const expected = expectedMatrix[jobRole].includes(feature);
        it(`${expected ? "grants" : "denies"} "${feature}"`, () => {
          expect(staffCan(jobRole, feature)).toBe(expected);
        });
      }
    });
  }

  it("denies every feature when jobRole is null", () => {
    for (const feature of allFeatures) {
      expect(staffCan(null, feature)).toBe(false);
    }
  });

  it("denies every feature when jobRole is undefined", () => {
    for (const feature of allFeatures) {
      expect(staffCan(undefined, feature)).toBe(false);
    }
  });
});

describe("jobRoleLabels / jobRoleOptions", () => {
  it("has a label for every StaffJobRole in the matrix", () => {
    for (const jobRole of Object.keys(expectedMatrix) as StaffJobRole[]) {
      expect(jobRoleLabels[jobRole]).toBeTruthy();
    }
  });

  it("jobRoleOptions covers exactly the same roles as jobRoleLabels", () => {
    const optionValues = jobRoleOptions.map((o) => o.value).sort();
    const labelKeys = Object.keys(jobRoleLabels).sort();
    expect(optionValues).toEqual(labelKeys);
  });
});
