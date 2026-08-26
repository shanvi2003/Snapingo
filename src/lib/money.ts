// Shared across every booking balance display (list, detail, invoice) so
// "customer paid more than the total" reads as a clearly distinct state
// instead of a bare negative number that looks like a rendering bug.
export function formatBalance(balance: number): { label: string; amount: string; className: string } {
  const amount = `₹${Math.abs(balance).toLocaleString("en-IN")}`;
  if (balance < 0) return { label: "Overpaid", amount, className: "text-amber-600" };
  if (balance === 0) return { label: "Settled", amount, className: "text-emerald-600" };
  return { label: "Balance Due", amount, className: "text-ink-900" };
}
