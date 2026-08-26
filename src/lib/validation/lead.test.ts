import { describe, it, expect } from "vitest";
import { createLeadSchema } from "./lead";

describe("createLeadSchema", () => {
  it("accepts a minimal valid payload with just a source", () => {
    const result = createLeadSchema.safeParse({ source: "GENERAL_ENQUIRY" });
    expect(result.success).toBe(true);
  });

  it("rejects a payload with no source at all", () => {
    const result = createLeadSchema.safeParse({ destinationName: "Goa" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid source enum value", () => {
    const result = createLeadSchema.safeParse({ source: "NOT_A_REAL_SOURCE" });
    expect(result.success).toBe(false);
  });

  it("accepts a full Trip Planner-shaped payload", () => {
    const result = createLeadSchema.safeParse({
      source: "TRIP_PLANNER",
      destinationSlug: "goa",
      destinationName: "Goa",
      dateMode: "fixed",
      startDate: "2026-10-01",
      days: "4-6 days",
      email: "test@example.com",
      pageUrl: "/",
      raw: { purpose: "honeymoon" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a malformed email", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("coerces a date string into a real Date", () => {
    const result = createLeadSchema.safeParse({ source: "TRAVEL_GUIDE", startDate: "2026-10-01" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date);
    }
  });

  it("rejects an out-of-range field length (message too long)", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", message: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("rejects a negative pricePerNight", () => {
    const result = createLeadSchema.safeParse({ source: "HOTEL_BOOKING", pricePerNight: -100 });
    expect(result.success).toBe(false);
  });
});
