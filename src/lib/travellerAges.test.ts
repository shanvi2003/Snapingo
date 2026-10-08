import { describe, it, expect } from "vitest";
import { CHILD_AGES, INFANT_AGES, splitTravellerAges } from "./travellerAges";

describe("splitTravellerAges", () => {
  it("gives the first ages to the children and the rest to the infants", () => {
    expect(splitTravellerAges(["7 years", "", "2 years"], 2)).toEqual({
      childAges: ["7 years", ""],
      infantAges: ["2 years"],
    });
  });

  it("treats every age as an infant's when there are no children", () => {
    expect(splitTravellerAges(["1 year"], 0)).toEqual({ childAges: [], infantAges: ["1 year"] });
  });
});

describe("age options", () => {
  it("covers 0-5 for infants and 6-12 for children", () => {
    expect(INFANT_AGES[0]).toBe("Below 1 year");
    expect(INFANT_AGES.at(-1)).toBe("5 years");
    expect(CHILD_AGES[0]).toBe("6 years");
    expect(CHILD_AGES.at(-1)).toBe("12 years");
  });
});
