import { describe, it, expect } from "vitest";
import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and hyphenates a normal title", () => {
    expect(slugify("Goa Beach Bliss")).toBe("goa-beach-bliss");
  });

  it("collapses punctuation and repeated separators", () => {
    expect(slugify("Shimla, Manali & Dalhousie -- Honeymoon!")).toBe(
      "shimla-manali-dalhousie-honeymoon"
    );
  });

  it("keeps accented letters as their base letter rather than dropping them", () => {
    expect(slugify("Curaçao Getaway")).toBe("curacao-getaway");
  });

  it("never leaves a leading or trailing hyphen", () => {
    expect(slugify("  ...Kerala...  ")).toBe("kerala");
  });

  it("caps the length without leaving a trailing hyphen", () => {
    const result = slugify(`${"a".repeat(118)} tail`);
    expect(result.length).toBeLessThanOrEqual(120);
    expect(result.endsWith("-")).toBe(false);
  });

  it("returns an empty string when there is nothing sluggable", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("returns the base when it is free", async () => {
    expect(await uniqueSlug("goa-beach-bliss", async () => false)).toBe("goa-beach-bliss");
  });

  it("appends a counter until it finds a free slug", async () => {
    const taken = new Set(["goa", "goa-2", "goa-3"]);
    expect(await uniqueSlug("goa", async (c) => taken.has(c))).toBe("goa-4");
  });

  it("falls back to a placeholder base when the title slugifies to nothing", async () => {
    expect(await uniqueSlug("", async () => false)).toBe("package");
  });
});
