import { describe, it, expect } from "vitest";
import type { TourPackage } from "@/data/packages";
import {
  inferPackageCategories,
  getPackageDurationDays,
  matchesDurationBucket,
  matchesBudgetBucket,
} from "./packageCategoryHelpers";

function makePackage(overrides: Partial<TourPackage> = {}): TourPackage {
  return {
    id: "test-package",
    title: "Test Package",
    destination: "Test Destination",
    destinationSlug: "test-destination",
    type: "domestic",
    image: "https://images.unsplash.com/photo-test",
    duration: "3 Nights / 4 Days",
    price: 15000,
    originalPrice: 20000,
    rating: 4.5,
    reviews: 100,
    inclusions: ["flight", "hotel"],
    exclusions: [],
    highlights: [],
    itinerary: [],
    featured: false,
    ...overrides,
  };
}

describe("inferPackageCategories", () => {
  it("matches honeymoon from the title", () => {
    const pkg = makePackage({ title: "Romantic Honeymoon Escape" });
    expect(inferPackageCategories(pkg)).toContain("honeymoon");
  });

  it("matches honeymoon from a conventionally-romantic destination slug even without honeymoon in the title", () => {
    const pkg = makePackage({ title: "Island Getaway", destinationSlug: "maldives" });
    expect(inferPackageCategories(pkg)).toContain("honeymoon");
  });

  it("matches adventure from trek/rafting keywords in highlights", () => {
    const pkg = makePackage({ title: "Hill Escape", highlights: ["River rafting", "Mountain trek"] });
    expect(inferPackageCategories(pkg)).toContain("adventure");
  });

  it("matches weekend for a short 2-night trip even with no weekend keyword", () => {
    const pkg = makePackage({ duration: "2 Nights / 3 Days" });
    expect(inferPackageCategories(pkg)).toContain("weekend");
  });

  it("does not tag a 5-night trip as weekend", () => {
    const pkg = makePackage({ duration: "5 Nights / 6 Days" });
    expect(inferPackageCategories(pkg)).not.toContain("weekend");
  });

  it("falls back to family when nothing else matches", () => {
    const pkg = makePackage({
      title: "Generic City Tour",
      duration: "5 Nights / 6 Days",
      destinationSlug: "generic-city",
    });
    expect(inferPackageCategories(pkg)).toEqual(["family"]);
  });

  it("can match multiple categories at once", () => {
    const pkg = makePackage({ title: "Family Adventure Trek", highlights: ["Trekking for all ages"] });
    const categories = inferPackageCategories(pkg);
    expect(categories).toContain("family");
    expect(categories).toContain("adventure");
  });

  it("matches religious from temple/pilgrim keywords", () => {
    const pkg = makePackage({ title: "Char Dham Pilgrim Tour", highlights: ["Temple darshan"] });
    expect(inferPackageCategories(pkg)).toContain("religious");
  });
});

describe("getPackageDurationDays", () => {
  it("parses the day count out of a '3 Nights / 4 Days' style duration string", () => {
    expect(getPackageDurationDays(makePackage({ duration: "3 Nights / 4 Days" }))).toBe(4);
  });

  it("returns 0 when the duration string has no day count", () => {
    expect(getPackageDurationDays(makePackage({ duration: "Custom" }))).toBe(0);
  });
});

describe("matchesDurationBucket", () => {
  it("classifies day counts into the correct bucket", () => {
    expect(matchesDurationBucket(2, "1-3")).toBe(true);
    expect(matchesDurationBucket(5, "4-6")).toBe(true);
    expect(matchesDurationBucket(15, "13-plus")).toBe(true);
    expect(matchesDurationBucket(2, "4-6")).toBe(false);
  });
});

describe("matchesBudgetBucket", () => {
  it("classifies prices into the correct bucket", () => {
    expect(matchesBudgetBucket(9999, "under-10k")).toBe(true);
    expect(matchesBudgetBucket(10000, "under-10k")).toBe(false);
    expect(matchesBudgetBucket(10000, "10k-20k")).toBe(true);
    expect(matchesBudgetBucket(90000, "80k-plus")).toBe(true);
  });
});
