// GST maths, kept pure and in one place so the admin form's live preview, the
// server that actually saves the figure, and the PDF that prints it can never
// disagree. The rate itself is a setting (src/lib/settings.ts), never a
// literal - the client asked for 5%, but a rate written into code is a
// redeploy every time the law changes.

export type GstBreakdown = {
  /** What the customer is quoted before tax. */
  price: number;
  percent: number;
  gstAmount: number;
  totalAmount: number;
};

export function calculateGst(price: number, percent: number): GstBreakdown {
  const safePrice = Number.isFinite(price) && price > 0 ? Math.round(price) : 0;
  const safePercent = Number.isFinite(percent) && percent >= 0 ? percent : 0;

  // Rounded to whole rupees, matching how Booking/Payment store money. Round
  // half up so a .5 never silently favours the company over the customer in
  // one direction and the reverse in another.
  const gstAmount = Math.round((safePrice * safePercent) / 100);

  return {
    price: safePrice,
    percent: safePercent,
    gstAmount,
    totalAmount: safePrice + gstAmount,
  };
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}
