import { describe, it, expect } from "vitest";
import { checkInstallmentTotal, findInstallmentIssue } from "./invoice";

describe("checkInstallmentTotal", () => {
  it("accepts a plan that adds up exactly", () => {
    expect(checkInstallmentTotal([{ amount: 30000 }, { amount: 22500 }], 52500)).toBeNull();
  });

  // This is the rule the client asked for: the invoice must not be creatable
  // at all when the parts don't match the package cost.
  it("rejects a short plan and says by how much", () => {
    const result = checkInstallmentTotal([{ amount: 30000 }], 52500);
    expect(result).toContain("₹22,500 short");
  });

  it("rejects an over-allocated plan and says by how much", () => {
    const result = checkInstallmentTotal([{ amount: 60000 }], 52500);
    expect(result).toContain("₹7,500 more");
  });

  it("rejects an empty plan", () => {
    expect(checkInstallmentTotal([], 52500)).toBe("Add at least one installment.");
  });

  it("handles a single full-payment installment", () => {
    expect(checkInstallmentTotal([{ amount: 52500 }], 52500)).toBeNull();
  });
});

describe("findInstallmentIssue", () => {
  it("passes a well-formed plan", () => {
    expect(
      findInstallmentIssue([
        { dueDate: "2026-03-01", amount: 1000 },
        { dueDate: "2026-04-01", amount: 2000 },
      ])
    ).toBeNull();
  });

  // Naming the row is the point - "installment 2" is actionable where a
  // generic validation message is not.
  it("names the row missing a date", () => {
    expect(findInstallmentIssue([{ dueDate: "2026-03-01", amount: 1000 }, { dueDate: "", amount: 500 }]))
      .toEqual({ index: 1, message: "Installment 2 needs a date." });
  });

  it("names the row with a bad amount", () => {
    expect(findInstallmentIssue([{ dueDate: "2026-03-01", amount: 0 }])).toEqual({
      index: 0,
      message: "Installment 1 needs an amount above zero.",
    });
  });

  it("rejects an unparseable date", () => {
    expect(findInstallmentIssue([{ dueDate: "not-a-date", amount: 100 }])?.message).toContain(
      "invalid date"
    );
  });
});
