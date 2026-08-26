import type { LeadStatus } from "@/generated/prisma/enums";

export const statusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-brand-50 text-brand-700",
  CONTACTED: "bg-amber-50 text-amber-700",
  QUOTED: "bg-blue-50 text-blue-700",
  CONVERTED: "bg-emerald-50 text-emerald-700",
  CLOSED: "bg-ink-100 text-ink-500",
};

export const sourceLabels: Record<string, string> = {
  TRAVEL_GUIDE: "Travel Guide",
  TRIP_PLANNER: "Trip Planner",
  CONTACT_FORM: "Contact Form",
  HOTEL_BOOKING: "Hotel Booking",
  FLIGHT_BOOKING: "Flight Booking",
  CAB_BOOKING: "Cab Booking",
  PACKAGE_INTEREST: "Package Interest",
  GENERAL_ENQUIRY: "General Enquiry",
};
