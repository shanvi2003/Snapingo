import { describe, it, expect } from "vitest";
import { parsePriceLines, priceLinesGst, priceLinesTotal, rateWithGst } from "./priceLines";

describe("parsePriceLines", () => {
  it("reads form strings as whole numbers", () => {
    expect(parsePriceLines([{ label: " Adult ", count: "4", rate: "35000" }])).toEqual([
      { label: "Adult", count: 4, rate: 35000 },
    ]);
  });

  it("drops rows with no name or nobody in them", () => {
    expect(
      parsePriceLines([
        { label: "", count: "2", rate: "100" },
        { label: "Child", count: "0", rate: "20000" },
        { label: "Adult", count: "2", rate: "30000" },
      ])
    ).toEqual([{ label: "Adult", count: 2, rate: 30000 }]);
  });

  it("keeps a free row", () => {
    expect(parsePriceLines([{ label: "Infant", count: "1", rate: "" }])).toEqual([
      { label: "Infant", count: 1, rate: 0 },
    ]);
  });

  it("treats a negative or garbage rate as 0", () => {
    expect(parsePriceLines([{ label: "Adult", count: "1", rate: "-5" }])[0].rate).toBe(0);
    expect(parsePriceLines([{ label: "Adult", count: "1", rate: "abc" }])[0].rate).toBe(0);
  });

  it("returns nothing for a quotation saved before the breakup existed", () => {
    expect(parsePriceLines(null)).toEqual([]);
  });
});

describe("priceLinesTotal", () => {
  it("adds count × rate across rows", () => {
    expect(
      priceLinesTotal([
        { label: "Adult", count: 4, rate: 35000 },
        { label: "Child with bed", count: 1, rate: 25000 },
      ])
    ).toBe(165000);
  });
});

describe("priceLinesGst", () => {
  it("adds GST to each per-person rate", () => {
    expect(priceLinesGst([{ label: "Adult", count: 1, rate: 10000 }], 5)).toEqual({
      price: 10000,
      percent: 5,
      gstAmount: 500,
      totalAmount: 10500,
    });
  });

  it("makes printed rate × travellers add up exactly to the total", () => {
    const lines = [
      { label: "Adult", count: 3, rate: 7333 },
      { label: "Child", count: 1, rate: 4999 },
    ];
    const { totalAmount } = priceLinesGst(lines, 5);
    const printed = lines.reduce((sum, l) => sum + l.count * rateWithGst(l.rate, 5), 0);
    expect(totalAmount).toBe(printed);
    expect(rateWithGst(7333, 5)).toBe(7700);
  });

  it("keeps a free row free", () => {
    expect(priceLinesGst([{ label: "Infant", count: 1, rate: 0 }], 5).totalAmount).toBe(0);
  });
});
