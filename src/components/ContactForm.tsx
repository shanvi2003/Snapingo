"use client";

import { useState, type FormEvent } from "react";
import {
  Calendar,
  CalendarRange,
  CheckCircle2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import { domesticDestinations, internationalDestinations } from "@/data/destinations";
import CustomSelect from "@/components/CustomSelect";

type DateMode = "fixed" | "flexible";
type TripType = "domestic" | "international";

const NOT_SURE = "Not sure yet, need suggestions";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

const labelClass =
  "mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900";

export default function ContactForm() {
  const [tripType, setTripType] = useState<TripType>("domestic");
  const [destination, setDestination] = useState("");
  const [dateMode, setDateMode] = useState<DateMode>("fixed");
  const [submitted, setSubmitted] = useState(false);

  const destinationOptions = [
    { value: NOT_SURE, label: NOT_SURE },
    ...(tripType === "domestic" ? domesticDestinations : internationalDestinations).map((d) => ({
      value: d.name,
      label: d.name,
    })),
  ];

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name")?.toString().trim() ?? "";
    const phone = form.get("phone")?.toString().trim() ?? "";
    const email = form.get("email")?.toString().trim() ?? "";
    const message = form.get("message")?.toString().trim() ?? "";

    let tripLine: string;
    if (dateMode === "fixed") {
      const startDate = form.get("startDate")?.toString() ?? "";
      const endDate = form.get("endDate")?.toString() ?? "";
      tripLine = `Travel dates: ${startDate || "TBD"} to ${endDate || "TBD"}`;
    } else {
      const days = form.get("days")?.toString() ?? "";
      const nights = form.get("nights")?.toString() ?? "";
      tripLine = `Duration needed: ${nights || "?"} Nights / ${days || "?"} Days (dates flexible)`;
    }

    const lines = [
      "Hi Snapingo! I'd like to enquire about a trip.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      email ? `Email: ${email}` : null,
      `Trip type: ${tripType === "domestic" ? "Domestic" : "International"}`,
      `Destination: ${destination}`,
      tripLine,
      message ? `Notes: ${message}` : null,
    ].filter((line): line is string => Boolean(line));

    const waHref = `https://wa.me/918700368575?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waHref, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="font-heading text-xl font-bold text-ink-900">Enquiry sent</h3>
        <p className="max-w-sm text-sm leading-relaxed text-ink-900">
          We opened WhatsApp with your trip details filled in. Hit send there
          and our team will get back to you shortly.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          Submit another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            <User className="h-3.5 w-3.5" />
            Full Name
          </label>
          <input id="name" name="name" required type="text" placeholder="Your full name" className={inputClass} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            <Phone className="h-3.5 w-3.5" />
            Phone
          </label>
          <input id="phone" name="phone" required type="tel" placeholder="98XXXXXXXX" className={inputClass} />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="email" className={labelClass}>
          <Mail className="h-3.5 w-3.5" />
          Email
        </label>
        <input id="email" name="email" type="email" placeholder="you@example.com" className={inputClass} />
      </div>

      <div className="mt-5">
        <p className={labelClass}>
          <MapPin className="h-3.5 w-3.5" />
          Trip Type
        </p>
        <div className="flex w-max gap-1.5 rounded-full border border-ink-100 bg-ink-50 p-1.5">
          <button
            type="button"
            onClick={() => {
              setTripType("domestic");
              setDestination("");
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tripType === "domestic" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
            }`}
          >
            Domestic
          </button>
          <button
            type="button"
            onClick={() => {
              setTripType("international");
              setDestination("");
            }}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tripType === "international" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
            }`}
          >
            International
          </button>
        </div>
      </div>

      <div className="mt-5">
        <p className={labelClass}>
          <MapPin className="h-3.5 w-3.5" />
          Destination
        </p>
        <CustomSelect
          name="destination"
          required
          value={destination}
          onChange={setDestination}
          options={destinationOptions}
          placeholder={tripType === "domestic" ? "Select a state or city in India" : "Select a country"}
        />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-900">Travel Dates</p>
        <div className="mb-4 flex w-max gap-1.5 rounded-full border border-ink-100 bg-ink-50 p-1.5">
          <button
            type="button"
            onClick={() => setDateMode("fixed")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              dateMode === "fixed" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
            }`}
          >
            Fixed Dates
          </button>
          <button
            type="button"
            onClick={() => setDateMode("flexible")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              dateMode === "flexible" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
            }`}
          >
            Flexible
          </button>
        </div>

        {dateMode === "fixed" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startDate" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-900">
                <Calendar className="h-3.5 w-3.5" />
                Start Date
              </label>
              <input id="startDate" name="startDate" type="date" className={inputClass} />
            </div>
            <div>
              <label htmlFor="endDate" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-900">
                <Calendar className="h-3.5 w-3.5" />
                End Date
              </label>
              <input id="endDate" name="endDate" type="date" className={inputClass} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label htmlFor="nights" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-900">
                <CalendarRange className="h-3.5 w-3.5" />
                Nights
              </label>
              <input id="nights" name="nights" type="number" min={0} placeholder="e.g. 4" className={inputClass} />
            </div>
            <div>
              <label htmlFor="days" className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-ink-900">
                <CalendarRange className="h-3.5 w-3.5" />
                Days
              </label>
              <input id="days" name="days" type="number" min={1} placeholder="e.g. 5" className={inputClass} />
            </div>
          </div>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="message" className={labelClass}>
          <MessageSquare className="h-3.5 w-3.5" />
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Number of travelers, budget, anything else we should know..."
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700 active:translate-y-0"
      >
        Send Enquiry
      </button>
      <p className="mt-3 text-center text-xs text-ink-900">
        Opens WhatsApp with your details pre-filled. Our team replies within a few hours.
      </p>
    </form>
  );
}
