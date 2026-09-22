import { describe, it, expect } from "vitest";
import type { MasterOptionView } from "./masterData";
import { getEffectiveExclusions, resolveInclusions } from "./inclusionHelpers";

const options: MasterOptionView[] = [
  { value: "hotel", label: "Accommodation", icon: "BedDouble", freeText: false },
  { value: "flight", label: "Flight", icon: "Plane", freeText: false },
  { value: "meals", label: "Meals", icon: "UtensilsCrossed", freeText: false },
  { value: "other", label: "Other (Specify)", icon: null, freeText: true },
];

describe("resolveInclusions", () => {
  it("maps stored slugs onto their current labels and icons", () => {
    expect(resolveInclusions(["hotel", "flight"], options)).toEqual([
      { value: "hotel", label: "Accommodation", icon: "BedDouble" },
      { value: "flight", label: "Flight", icon: "Plane" },
    ]);
  });

  // The whole point of relabelling instead of re-slugging the 148 existing
  // packages: a row still storing "hotel" must now read "Accommodation".
  it("reflects a relabelled option without the package changing", () => {
    const renamed = options.map((o) => (o.value === "hotel" ? { ...o, label: "Stay" } : o));
    expect(resolveInclusions(["hotel"], renamed)[0].label).toBe("Stay");
  });

  it("falls back to the raw slug for an option that no longer exists", () => {
    expect(resolveInclusions(["deleted-option"], options)).toEqual([
      { value: "deleted-option", label: "deleted-option", icon: null },
    ]);
  });

  it("drops the free-text placeholder and appends what staff typed instead", () => {
    const result = resolveInclusions(["hotel", "other"], options, ["Airport lounge access"]);
    expect(result.map((r) => r.label)).toEqual(["Accommodation", "Airport lounge access"]);
  });

  it("ignores blank custom entries", () => {
    expect(resolveInclusions(["hotel"], options, ["  ", ""])).toHaveLength(1);
  });
});

describe("getEffectiveExclusions", () => {
  it("derives exclusions from whatever was not ticked", () => {
    expect(getEffectiveExclusions([], ["hotel"], options)).toEqual(["Flight", "Meals"]);
  });

  it("never lists the free-text placeholder as an exclusion", () => {
    expect(getEffectiveExclusions([], ["hotel", "flight", "meals"], options)).toEqual([]);
  });

  // Taxes, insurance and personal expenses aren't the inverse of any
  // inclusion, so they can only come from the extra box.
  it("appends additional exclusions after the automatic ones", () => {
    expect(
      getEffectiveExclusions(["GST and government taxes", "Travel insurance"], ["hotel"], options)
    ).toEqual(["Flight", "Meals", "GST and government taxes", "Travel insurance"]);
  });

  it("does not print the same exclusion twice", () => {
    expect(getEffectiveExclusions(["flight", "Travel insurance"], ["hotel"], options)).toEqual([
      "Flight",
      "Meals",
      "Travel insurance",
    ]);
  });

  it("ignores blank lines in the extra box", () => {
    expect(getEffectiveExclusions(["  ", ""], ["hotel", "flight", "meals"], options)).toEqual([]);
  });
});
