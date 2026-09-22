import type { LeadNoteStatus, LeadStatus } from "@/generated/prisma/enums";

export const statusLabels: Record<LeadStatus, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  CONTACTED: "Contacted",
  QUOTED: "Quoted",
  CONVERTED: "Converted",
  CANCELLED: "Cancelled",
  CLOSED: "Closed",
};

export const statusStyles: Record<LeadStatus, string> = {
  NEW: "bg-brand-50 text-brand-700",
  ASSIGNED: "bg-indigo-50 text-indigo-700",
  CONTACTED: "bg-amber-50 text-amber-700",
  QUOTED: "bg-blue-50 text-blue-700",
  CONVERTED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-700",
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
  META_ADS: "Meta Ads (FB/Instagram)",
};

// The preset reasons staff choose from when adding a note. Order is the order
// they appear in the picker, and matches the list the client supplied.
export const noteStatusLabels: Record<LeadNoteStatus, string> = {
  TRAVELER_NOT_REACHABLE: "Traveler Not Reachable",
  WONT_BOOK_WITH_ME: "Won't Book With Me",
  TALK_IN_PROGRESS_WITH_TRAVELER: "Talk In Progress With Traveler",
  TRAVELER_WILL_FINALIZE: "Traveler Will Finalize",
  MY_HOT: "My Hot",
};

export const noteStatusOrder: LeadNoteStatus[] = [
  "TRAVELER_NOT_REACHABLE",
  "WONT_BOOK_WITH_ME",
  "TALK_IN_PROGRESS_WITH_TRAVELER",
  "TRAVELER_WILL_FINALIZE",
  "MY_HOT",
];

export const noteStatusStyles: Record<LeadNoteStatus, string> = {
  TRAVELER_NOT_REACHABLE: "bg-amber-50 text-amber-700",
  WONT_BOOK_WITH_ME: "bg-red-50 text-red-700",
  TALK_IN_PROGRESS_WITH_TRAVELER: "bg-blue-50 text-blue-700",
  TRAVELER_WILL_FINALIZE: "bg-indigo-50 text-indigo-700",
  MY_HOT: "bg-brand-50 text-brand-700",
};
