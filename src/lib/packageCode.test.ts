import { describe, it, expect } from "vitest";
import {
  formatPackageCode,
  highestPackageSequence,
  parsePackageSequence,
} from "./packageCode";

describe("formatPackageCode", () => {
  it("pads short sequences to two digits", () => {
    expect(formatPackageCode("SNP", 2026, 1)).toBe("SNP-2026-01");
    expect(formatPackageCode("SNP", 2026, 9)).toBe("SNP-2026-09");
  });

  // The regression this file exists for: Postgres' LPAD truncates, which made
  // package 14 and packages 140-149 all come out as "-14" and collide on the
  // unique index. padStart must never shorten.
  it("never truncates a sequence longer than the padding", () => {
    expect(formatPackageCode("SNP", 2026, 148)).toBe("SNP-2026-148");
    expect(formatPackageCode("SNP", 2026, 1480)).toBe("SNP-2026-1480");
  });

  it("produces distinct codes for 14 and 140-149", () => {
    const codes = [14, 140, 141, 148, 149].map((n) => formatPackageCode("SNP", 2026, n));
    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe("parsePackageSequence", () => {
  it("reads the sequence back", () => {
    expect(parsePackageSequence("SNP-2026-01", "SNP", 2026)).toBe(1);
    expect(parsePackageSequence("SNP-2026-148", "SNP", 2026)).toBe(148);
  });

  it("ignores another year or prefix", () => {
    expect(parsePackageSequence("SNP-2025-05", "SNP", 2026)).toBeNull();
    expect(parsePackageSequence("OLD-2026-05", "SNP", 2026)).toBeNull();
  });

  it("rejects a non-numeric tail", () => {
    expect(parsePackageSequence("SNP-2026-0a", "SNP", 2026)).toBeNull();
    expect(parsePackageSequence("SNP-2026-", "SNP", 2026)).toBeNull();
  });
});

describe("highestPackageSequence", () => {
  it("returns 0 when nothing has been issued", () => {
    expect(highestPackageSequence([], "SNP", 2026)).toBe(0);
  });

  // Numeric max, not string max - "9" sorts after "148" as text, which would
  // hand the next package a code that already exists.
  it("compares numerically, not alphabetically", () => {
    expect(highestPackageSequence(["SNP-2026-09", "SNP-2026-148"], "SNP", 2026)).toBe(148);
  });

  it("skips codes from other years and prefixes", () => {
    expect(
      highestPackageSequence(["SNP-2025-99", "OLD-2026-99", "SNP-2026-02"], "SNP", 2026)
    ).toBe(2);
  });
});
