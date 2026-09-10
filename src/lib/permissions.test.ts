import { describe, it, expect } from "vitest";
import type { StaffJobRole } from "@/generated/prisma/enums";
import {
  hasFeature,
  defaultRolePermissions,
  jobRoleLabels,
  jobRoleOptions,
  staffFeatures,
  staffFeatureGroups,
  featureLabels,
  featureDescriptions,
  featuresWithViewFallback,
  type StaffFeature,
} from "./permissions";

// The approved default access matrix (see conversation with the client) -
// this test exists specifically so an accidental edit to
// defaultRolePermissions in permissions.ts gets caught instead of silently
// shipping. An admin's own edits on /admin/permissions live in the DB
// (src/lib/rolePermissions.ts) and are intentionally not covered here.
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

describe("defaultRolePermissions / hasFeature", () => {
  for (const jobRole of Object.keys(expectedMatrix) as StaffJobRole[]) {
    describe(jobRole, () => {
      for (const feature of staffFeatures) {
        const expected = expectedMatrix[jobRole].includes(feature);
        it(`${expected ? "grants" : "denies"} "${feature}" by default`, () => {
          expect(hasFeature(defaultRolePermissions[jobRole], feature)).toBe(expected);
        });
      }
    });
  }

  it("denies every feature when the features list is null", () => {
    for (const feature of staffFeatures) {
      expect(hasFeature(null, feature)).toBe(false);
    }
  });

  it("denies every feature when the features list is undefined", () => {
    for (const feature of staffFeatures) {
      expect(hasFeature(undefined, feature)).toBe(false);
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

  it("defaultRolePermissions has an entry for every job role", () => {
    for (const { value } of jobRoleOptions) {
      expect(defaultRolePermissions[value]).toBeDefined();
    }
  });
});

describe("staffFeatureGroups / staffFeatures", () => {
  it("staffFeatures is exactly the flattened, deduped union of every group", () => {
    const flattened = staffFeatureGroups.flatMap((g) => g.features);
    expect(staffFeatures).toEqual(flattened);
    expect(new Set(staffFeatures).size).toBe(staffFeatures.length);
  });

  it("every feature has a label and a description", () => {
    for (const feature of staffFeatures) {
      expect(featureLabels[feature]).toBeTruthy();
      expect(featureDescriptions[feature]).toBeTruthy();
    }
  });

  it("every default-matrix grant is a real, known feature", () => {
    for (const features of Object.values(defaultRolePermissions)) {
      for (const feature of features) {
        expect(staffFeatures).toContain(feature);
      }
    }
  });

  it("featuresWithViewFallback only lists real, known features", () => {
    for (const feature of featuresWithViewFallback) {
      expect(staffFeatures).toContain(feature);
    }
  });
});
