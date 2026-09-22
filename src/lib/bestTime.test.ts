import { describe, it, expect } from "vitest";
import { formatBestTime, parseBestTime } from "./bestTime";

// Every value below is real production data, taken from the 27 destinations.
const SIMPLE = ["October – March", "April – October", "November – February", "September – May"];

const COMPLEX = [
  "March – May, September – November",
  "October – February (snow), March – June (valleys)",
  "April – October (spring/summer), Dec – Feb (snow)",
  "November – April (Hornbill Festival in December)",
  "March – May, October – December",
  "September – November, February – April",
  "September – December, March – April",
];

describe("parseBestTime", () => {
  it("fills both dropdowns from a simple range", () => {
    expect(parseBestTime("October – March")).toEqual({ from: "October", to: "March", note: "" });
  });

  it("separates a trailing note from the range", () => {
    expect(parseBestTime("November – April (Hornbill Festival in December)")).toEqual({
      from: "November",
      to: "April",
      note: "Hornbill Festival in December",
    });
  });

  it("accepts a plain hyphen as well as an en dash", () => {
    expect(parseBestTime("October - March")).toEqual({ from: "October", to: "March", note: "" });
  });

  // The whole reason the note exists: a value that isn't a clean range must
  // survive untouched rather than being reworded or thrown away.
  it("keeps an unparseable value verbatim in the note", () => {
    const value = "October – February (snow), March – June (valleys)";
    expect(parseBestTime(value)).toEqual({ from: "", to: "", note: value });
  });

  it("does not mistake a non-month word for a month", () => {
    expect(parseBestTime("Summer – Winter")).toEqual({ from: "", to: "", note: "Summer – Winter" });
  });

  it("handles an empty value", () => {
    expect(parseBestTime("")).toEqual({ from: "", to: "", note: "" });
    expect(parseBestTime(null)).toEqual({ from: "", to: "", note: "" });
  });
});

describe("formatBestTime", () => {
  it("joins the two months with an en dash", () => {
    expect(formatBestTime({ from: "October", to: "March", note: "" })).toBe("October – March");
  });

  it("appends a note in brackets", () => {
    expect(formatBestTime({ from: "November", to: "April", note: "Hornbill Festival in December" })).toBe(
      "November – April (Hornbill Festival in December)"
    );
  });

  it("returns a note-only value unchanged", () => {
    const value = "October – February (snow), March – June (valleys)";
    expect(formatBestTime({ from: "", to: "", note: value })).toBe(value);
  });

  it("ignores a half-filled range", () => {
    expect(formatBestTime({ from: "October", to: "", note: "" })).toBe("");
  });
});

describe("round trip", () => {
  it("leaves every simple production value identical", () => {
    for (const value of SIMPLE) {
      expect(formatBestTime(parseBestTime(value))).toBe(value);
    }
  });

  // This is the guarantee that matters: opening and re-saving one of the
  // seven complex destinations must not change what the customer sees.
  it("leaves every complex production value identical", () => {
    for (const value of COMPLEX) {
      expect(formatBestTime(parseBestTime(value))).toBe(value);
    }
  });
});
