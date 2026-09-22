import { describe, it, expect } from "vitest";
import { calculateGst, formatRupees } from "./gst";

describe("calculateGst", () => {
  it("applies the rate and adds it to the total", () => {
    expect(calculateGst(20000, 5)).toEqual({
      price: 20000,
      percent: 5,
      gstAmount: 1000,
      totalAmount: 21000,
    });
  });

  it("rounds to whole rupees, matching how money is stored", () => {
    // 12,345 x 5% = 617.25
    expect(calculateGst(12345, 5).gstAmount).toBe(617);
  });

  it("supports a rate other than 5, since the rate is a setting", () => {
    expect(calculateGst(10000, 18).gstAmount).toBe(1800);
    expect(calculateGst(10000, 0)).toMatchObject({ gstAmount: 0, totalAmount: 10000 });
  });

  // A NaN price would otherwise propagate into the stored total and print as
  // "₹NaN" on a customer's quotation.
  it("treats invalid or negative input as zero", () => {
    expect(calculateGst(Number.NaN, 5)).toMatchObject({ price: 0, gstAmount: 0, totalAmount: 0 });
    expect(calculateGst(-500, 5)).toMatchObject({ price: 0, gstAmount: 0 });
    expect(calculateGst(1000, Number.NaN)).toMatchObject({ gstAmount: 0, totalAmount: 1000 });
  });
});

describe("formatRupees", () => {
  it("uses the Indian digit grouping", () => {
    expect(formatRupees(2150000)).toBe("₹21,50,000");
  });
});
