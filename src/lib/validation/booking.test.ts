import { describe, it, expect } from "vitest";
import { createBookingSchema, addPaymentSchema } from "./booking";

describe("createBookingSchema", () => {
  it("accepts a minimal valid booking", () => {
    const result = createBookingSchema.safeParse({
      travelerName: "Priya Verma",
      phone: "9123456780",
      totalAmount: "50000",
    });
    expect(result.success).toBe(true);
  });

  it("defaults taxAmount to 0 when omitted", () => {
    const result = createBookingSchema.safeParse({
      travelerName: "Priya Verma",
      phone: "9123456780",
      totalAmount: "50000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.taxAmount).toBe(0);
    }
  });

  it("coerces string amounts from form fields into numbers", () => {
    const result = createBookingSchema.safeParse({
      travelerName: "Priya Verma",
      phone: "9123456780",
      totalAmount: "50000",
      taxAmount: "2500",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalAmount).toBe(50000);
      expect(result.data.taxAmount).toBe(2500);
    }
  });

  it("rejects a missing traveler name", () => {
    const result = createBookingSchema.safeParse({ phone: "9123456780", totalAmount: "50000" });
    expect(result.success).toBe(false);
  });

  it("rejects a negative total amount", () => {
    const result = createBookingSchema.safeParse({
      travelerName: "Priya Verma",
      phone: "9123456780",
      totalAmount: "-100",
    });
    expect(result.success).toBe(false);
  });

  it("accepts an empty-string email (the edit form sends '' when cleared)", () => {
    const result = createBookingSchema.safeParse({
      travelerName: "Priya Verma",
      phone: "9123456780",
      totalAmount: "50000",
      email: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("addPaymentSchema", () => {
  it("accepts a valid payment", () => {
    const result = addPaymentSchema.safeParse({ bookingId: "abc123", amount: "10000", mode: "UPI" });
    expect(result.success).toBe(true);
  });

  it("rejects a zero or negative amount", () => {
    const result = addPaymentSchema.safeParse({ bookingId: "abc123", amount: "0", mode: "UPI" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing payment mode", () => {
    const result = addPaymentSchema.safeParse({ bookingId: "abc123", amount: "10000" });
    expect(result.success).toBe(false);
  });
});
