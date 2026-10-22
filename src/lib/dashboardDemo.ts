// Sample numbers for previewing the admin dashboard before the business has
// real bookings and payments (/admin?demo=1, development only). Shaped exactly
// like the dashboard's live query results so the page renders it unchanged.
// Deterministic, so the charts don't reshuffle on every refresh.

const IST_OFFSET_MS = 330 * 60 * 1000;
const wave = (i: number, seed: number) => (Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453) % 1;
const jitter = (i: number, seed: number) => Math.abs(wave(i, seed));

export function demoDashboard(now: Date) {
  const stats = { total: 412, today: 7, new: 38, assigned: 64, contacted: 92, quoted: 71, converted: 86, cancelled: 23, closed: 38 };

  const day = (offset: number, hour = 11) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  // Two to five payments a month, trending up through the year.
  const [y, m] = now.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).split("-").map(Number);
  const yearPayments: { amount: number; paidAt: Date }[] = [];
  for (let i = 11; i >= 0; i--) {
    const count = 2 + Math.floor(jitter(i, 1) * 4);
    for (let p = 0; p < count; p++) {
      const base = 30000 + (11 - i) * 9000;
      yearPayments.push({
        amount: Math.round((base + jitter(i * 7 + p, 2) * 60000) / 500) * 500,
        paidAt: new Date(Date.UTC(y, m - 1 - i, 3 + p * 5, 6) - IST_OFFSET_MS),
      });
    }
  }
  const revenue = {
    _sum: { amount: yearPayments.reduce((sum, p) => sum + p.amount, 0) as number | null },
    _count: yearPayments.length,
  };

  // Weekdays busier than weekends, with today matching stats.today.
  const recentLeads: { createdAt: Date }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = day(-i, 10);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    const count = i === 0 ? stats.today : Math.round((weekend ? 3 : 7) + jitter(i, 3) * 8);
    for (let n = 0; n < count; n++) recentLeads.push({ createdAt: d });
  }

  return [
    stats,
    148, // packages
    27, // destinations
    7, // blog posts
    6, // active staff
    79, // active bookings
    4, // departing in 14 days
    revenue,
    yearPayments,
    recentLeads,
  ] as const;
}
