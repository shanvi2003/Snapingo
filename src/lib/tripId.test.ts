import { describe, it, expect } from "vitest";
import { formatTripId, highestSequence, normalizeTripIdPrefix, parseTripSequence } from "./tripId";

describe("formatTripId", () => {
  it("zero-pads the sequence to four digits", () => {
    expect(formatTripId("SNP", 2026, 42)).toBe("SNP-2026-0042");
    expect(formatTripId("SNP", 2026, 1)).toBe("SNP-2026-0001");
  });

  it("does not truncate once past four digits", () => {
    expect(formatTripId("SNP", 2026, 12345)).toBe("SNP-2026-12345");
  });
});

describe("parseTripSequence", () => {
  it("reads the sequence back out", () => {
    expect(parseTripSequence("SNP-2026-0042", "SNP", 2026)).toBe(42);
  });

  it("ignores IDs from another year", () => {
    expect(parseTripSequence("SNP-2025-0100", "SNP", 2026)).toBeNull();
  });

  // Changing the prefix must restart numbering rather than inherit the old
  // series, or the first ID under the new prefix would look like a gap.
  it("ignores IDs issued under another prefix", () => {
    expect(parseTripSequence("OLD-2026-0100", "SNP", 2026)).toBeNull();
  });

  it("rejects anything that isn't a plain number after the year", () => {
    expect(parseTripSequence("SNP-2026-00x2", "SNP", 2026)).toBeNull();
    expect(parseTripSequence("SNP-2026-", "SNP", 2026)).toBeNull();
  });
});

describe("highestSequence", () => {
  it("returns 0 when nothing has been issued", () => {
    expect(highestSequence([], "SNP", 2026)).toBe(0);
  });

  // Reading the max (rather than counting rows) is what stops a deleted
  // quotation from causing the next one to reuse its number.
  it("takes the maximum, not the count", () => {
    const ids = ["SNP-2026-0001", "SNP-2026-0007", "SNP-2026-0003"];
    expect(highestSequence(ids, "SNP", 2026)).toBe(7);
  });

  it("skips IDs from other years and prefixes", () => {
    const ids = ["SNP-2025-9999", "OLD-2026-9999", "SNP-2026-0002"];
    expect(highestSequence(ids, "SNP", 2026)).toBe(2);
  });
});

describe("normalizeTripIdPrefix", () => {
  it("uppercases and strips separators that make an ID hard to read out", () => {
    expect(normalizeTripIdPrefix("snp travel")).toBe("SNPTRAVEL".slice(0, 6));
    expect(normalizeTripIdPrefix("s-n-p")).toBe("SNP");
  });

  it("falls back to SNP when nothing usable is left", () => {
    expect(normalizeTripIdPrefix("---")).toBe("SNP");
    expect(normalizeTripIdPrefix("")).toBe("SNP");
  });
});
