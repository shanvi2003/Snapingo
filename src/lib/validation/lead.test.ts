import { describe, it, expect } from "vitest";
import { createLeadSchema } from "./lead";

const validContact = { name: "Test User", phone: "9876543210", email: "test@example.com" };

describe("createLeadSchema", () => {
  it("rejects a payload with just a source (no contact info)", () => {
    const result = createLeadSchema.safeParse({ source: "GENERAL_ENQUIRY" });
    expect(result.success).toBe(false);
  });

  it("rejects a payload with no source at all", () => {
    const result = createLeadSchema.safeParse({ destinationName: "Goa", ...validContact });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid source enum value", () => {
    const result = createLeadSchema.safeParse({ source: "NOT_A_REAL_SOURCE", ...validContact });
    expect(result.success).toBe(false);
  });

  it("accepts a full Trip Planner-shaped payload with valid contact info", () => {
    const result = createLeadSchema.safeParse({
      source: "TRIP_PLANNER",
      ...validContact,
      destinationSlug: "goa",
      destinationName: "Goa",
      dateMode: "fixed",
      startDate: "2026-10-01",
      days: "4-6 days",
      pageUrl: "/",
      raw: { purpose: "honeymoon" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", phone: "9876543210", email: "test@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing phone", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", name: "Test User", email: "test@example.com" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing email", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", name: "Test User", phone: "9876543210" });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", name: "Test User", phone: "9876543210", email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a phone number that's too short to be real", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", name: "Test User", phone: "12345", email: "test@example.com" });
    expect(result.success).toBe(false);
  });

  it("accepts a phone number with a country code and separators", () => {
    const result = createLeadSchema.safeParse({
      source: "CONTACT_FORM",
      name: "Test User",
      phone: "+91 98765-43210",
      email: "test@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("coerces a date string into a real Date", () => {
    const result = createLeadSchema.safeParse({ source: "TRAVEL_GUIDE", ...validContact, startDate: "2026-10-01" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date);
    }
  });

  it("rejects an out-of-range field length (message too long)", () => {
    const result = createLeadSchema.safeParse({ source: "CONTACT_FORM", ...validContact, message: "x".repeat(2001) });
    expect(result.success).toBe(false);
  });

  it("rejects a negative pricePerNight", () => {
    const result = createLeadSchema.safeParse({ source: "HOTEL_BOOKING", ...validContact, pricePerNight: -100 });
    expect(result.success).toBe(false);
  });
});
