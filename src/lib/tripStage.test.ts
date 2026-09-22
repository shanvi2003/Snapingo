import { describe, it, expect } from "vitest";
import { getPaymentSummary, getTripStage, type TripStageInput } from "./tripStage";

const NOW = new Date(2026, 2, 10); // 10 March 2026, local
const d = (day: number) => new Date(2026, 2, day);

function booking(overrides: Partial<TripStageInput> = {}): TripStageInput {
  return { status: "CONFIRMED", travelStartDate: d(12), travelEndDate: d(16), ...overrides };
}

describe("getTripStage", () => {
  it("is Upcoming before the trip starts", () => {
    expect(getTripStage(booking(), NOW)).toBe("UPCOMING");
  });

  it("is Ongoing between the start and end dates", () => {
    expect(getTripStage(booking({ travelStartDate: d(8), travelEndDate: d(14) }), NOW)).toBe("ONGOING");
  });

  // The whole point of deriving this: the client asked that a trip leave
  // Ongoing once its dates are over, with no job needed to move it.
  it("becomes Complete on its own once the dates have passed", () => {
    expect(getTripStage(booking({ travelStartDate: d(1), travelEndDate: d(5) }), NOW)).toBe("COMPLETE");
  });

  it("counts the final day as still ongoing", () => {
    expect(getTripStage(booking({ travelStartDate: d(8), travelEndDate: d(10) }), NOW)).toBe("ONGOING");
  });

  it("counts the first day as ongoing, not upcoming", () => {
    expect(getTripStage(booking({ travelStartDate: d(10), travelEndDate: d(14) }), NOW)).toBe("ONGOING");
  });

  it("treats a start-only booking as a single day", () => {
    expect(getTripStage(booking({ travelStartDate: d(10), travelEndDate: null }), NOW)).toBe("ONGOING");
    expect(getTripStage(booking({ travelStartDate: d(3), travelEndDate: null }), NOW)).toBe("COMPLETE");
  });

  it("keeps an explicit outcome whatever the dates say", () => {
    expect(getTripStage(booking({ status: "CANCELLED" }), NOW)).toBe("CANCELLED");
    expect(getTripStage(booking({ status: "COMPLETED" }), NOW)).toBe("COMPLETE");
  });

  it("does not place a booking with no dates on the timeline", () => {
    expect(getTripStage(booking({ travelStartDate: null, travelEndDate: null }), NOW)).toBe("UNSCHEDULED");
  });
});

describe("getPaymentSummary", () => {
  it("adds up payments against the tax-inclusive total", () => {
    const summary = getPaymentSummary({
      totalAmount: 50000,
      taxAmount: 2500,
      payments: [{ amount: 20000 }, { amount: 10000 }],
    });
    expect(summary).toMatchObject({ paid: 30000, grandTotal: 52500, balance: 22500, isComplete: false });
  });

  it("reports Payment Complete when the balance is settled", () => {
    expect(
      getPaymentSummary({ totalAmount: 10000, taxAmount: 500, payments: [{ amount: 10500 }] }).isComplete
    ).toBe(true);
  });

  it("treats an overpayment as complete rather than pending", () => {
    expect(
      getPaymentSummary({ totalAmount: 10000, taxAmount: 0, payments: [{ amount: 12000 }] }).isComplete
    ).toBe(true);
  });

  it("does not call a zero-value booking paid", () => {
    expect(getPaymentSummary({ totalAmount: 0, taxAmount: 0, payments: [] }).isComplete).toBe(false);
  });
});
