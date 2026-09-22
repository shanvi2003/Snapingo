import { z } from "zod";

const jsonRows = z.string().transform((v, ctx) => {
  try {
    const parsed = JSON.parse(v);
    if (!Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, string>[];
  } catch {
    ctx.addIssue({ code: "custom", message: "Invalid installment data." });
    return z.NEVER;
  }
});

export const invoiceSchema = z.object({
  bookingId: z.string().trim().min(1),

  billingName: z.string().trim().min(1, "Billing name is required.").max(200),
  billingAddress: z.string().trim().min(1, "Billing address is required.").max(500),
  billingCity: z.string().trim().min(1, "City is required.").max(120),
  billingState: z.string().trim().min(1, "State is required.").max(120),
  billingCountry: z.string().trim().min(1, "Country is required.").max(120),
  billingPincode: z.string().trim().min(1, "Pincode is required.").max(20),

  installments: jsonRows.transform((rows) =>
    rows
      .map((r, i) => ({
        order: i,
        dueDate: r.dueDate ?? "",
        amount: Math.round(Number(r.amount) || 0),
      }))
      // Blank trailing rows are what the repeatable editor starts with; an
      // installment with no date and no amount is not a real one.
      .filter((r) => r.dueDate || r.amount > 0)
  ),
});

export type InvoiceInput = z.output<typeof invoiceSchema>;

export type InstallmentIssue = { index: number; message: string } | null;

/**
 * Checks each installment row on its own terms. Kept separate from the schema
 * so the error can name *which* row is wrong - "installment 3 has no date" is
 * actionable, "Invalid installment data" is not.
 */
export function findInstallmentIssue(
  installments: { dueDate: string; amount: number }[]
): InstallmentIssue {
  for (const [index, row] of installments.entries()) {
    if (!row.dueDate) return { index, message: `Installment ${index + 1} needs a date.` };
    if (Number.isNaN(new Date(row.dueDate).getTime())) {
      return { index, message: `Installment ${index + 1} has an invalid date.` };
    }
    if (!Number.isFinite(row.amount) || row.amount <= 0) {
      return { index, message: `Installment ${index + 1} needs an amount above zero.` };
    }
  }
  return null;
}

/**
 * The validation the client specifically asked for: an invoice whose
 * installments don't add up to the package cost must not be created at all.
 *
 * Returns null when the plan balances, or a message naming the shortfall or
 * excess - staff need to know by how much, not just that it's wrong.
 */
export function checkInstallmentTotal(
  installments: { amount: number }[],
  expectedTotal: number
): string | null {
  if (installments.length === 0) return "Add at least one installment.";

  const sum = installments.reduce((total, row) => total + row.amount, 0);
  if (sum === expectedTotal) return null;

  const difference = Math.abs(sum - expectedTotal);
  const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return sum < expectedTotal
    ? `Installments add up to ${rupees(sum)}, which is ${rupees(difference)} short of the booking total ${rupees(expectedTotal)}.`
    : `Installments add up to ${rupees(sum)}, which is ${rupees(difference)} more than the booking total ${rupees(expectedTotal)}.`;
}
