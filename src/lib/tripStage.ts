// Which list a booking belongs in - Upcoming, Ongoing or Complete.
//
// Derived from the travel dates on every read rather than moved by a
// scheduled job. The client asked that a trip leave Ongoing/Upcoming
// "once the travel dates are over"; a cron doing that is a job that can fail,
// be missed during downtime, or run in the wrong timezone, and would leave a
// finished trip sitting in Ongoing until someone noticed. Computing it means
// the answer is right the moment anyone looks.
//
// A booking that has been explicitly CANCELLED or marked COMPLETED by staff
// keeps that outcome - the dates only decide where an active booking sits.

export type TripStage = "UPCOMING" | "ONGOING" | "COMPLETE" | "CANCELLED" | "UNSCHEDULED";

export type TripStageInput = {
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  travelStartDate: Date | null;
  travelEndDate: Date | null;
};

/** Midnight local time, so a trip counts as ongoing for the whole of its last day. */
function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getTripStage(booking: TripStageInput, now: Date = new Date()): TripStage {
  if (booking.status === "CANCELLED") return "CANCELLED";
  if (booking.status === "COMPLETED") return "COMPLETE";

  const { travelStartDate, travelEndDate } = booking;
  // No dates agreed yet - it is a real booking, but it can't be placed on a
  // timeline, so it shows under Booking Management only.
  if (!travelStartDate && !travelEndDate) return "UNSCHEDULED";

  const today = startOfDay(now);
  const start = travelStartDate ? startOfDay(travelStartDate) : null;
  // A one-day trip with only a start date ends the same day.
  const end = travelEndDate ? startOfDay(travelEndDate) : start;

  if (end && end < today) return "COMPLETE";
  if (start && start > today) return "UPCOMING";
  return "ONGOING";
}

export type PaymentSummary = {
  paid: number;
  grandTotal: number;
  balance: number;
  isComplete: boolean;
};

export function getPaymentSummary(booking: {
  totalAmount: number;
  taxAmount: number;
  payments: { amount: number }[];
}): PaymentSummary {
  const paid = booking.payments.reduce((sum, p) => sum + p.amount, 0);
  const grandTotal = booking.totalAmount + booking.taxAmount;
  const balance = grandTotal - paid;

  return {
    paid,
    grandTotal,
    balance,
    // `<= 0` rather than `=== 0`: an overpayment is still fully paid, and
    // showing "Payment Pending" on a booking the customer has overpaid would
    // be worse than wrong.
    isComplete: grandTotal > 0 && balance <= 0,
  };
}

export const tripStageLabels: Record<TripStage, string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETE: "Complete",
  CANCELLED: "Cancelled",
  UNSCHEDULED: "Dates not set",
};
