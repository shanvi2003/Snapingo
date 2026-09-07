"use client";

import { Mail, Phone, User } from "lucide-react";
import { isValidEmail, isValidName, isValidPhone } from "@/lib/validation/contact";

export type ContactValues = {
  name: string;
  phone: string;
  email: string;
};

export const emptyContactValues: ContactValues = { name: "", phone: "", email: "" };

export function isContactValid(values: ContactValues): boolean {
  return isValidName(values.name) && isValidPhone(values.phone) && isValidEmail(values.email);
}

const inputBaseClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900";
const errorClass = "border-red-400 focus:border-red-400 focus:ring-red-100";
const okClass = "border-ink-200 focus:border-brand-500";

// Every lead popup/form on the site (Trip Planner, Cab Booking, Travel
// Guide, Hotel/Flight results, Package Interest) ends with this same step -
// centralized here so the mandatory-contact rule (and its validation) only
// lives in one place instead of being copy-pasted six times.
export default function LeadContactFields({
  values,
  onChange,
  touched,
}: {
  values: ContactValues;
  onChange: (values: ContactValues) => void;
  touched: boolean;
}) {
  const nameError = touched && !isValidName(values.name);
  const phoneError = touched && !isValidPhone(values.phone);
  const emailError = touched && !isValidEmail(values.email);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="lead-contact-name" className={labelClass}>
          <User className="h-3.5 w-3.5" />
          Your Name
        </label>
        <input
          id="lead-contact-name"
          type="text"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
          placeholder="Your full name"
          className={`${inputBaseClass} ${nameError ? errorClass : okClass}`}
        />
        {nameError && <p className="mt-1 text-xs text-red-500">Please enter your name.</p>}
      </div>

      <div>
        <label htmlFor="lead-contact-phone" className={labelClass}>
          <Phone className="h-3.5 w-3.5" />
          Phone Number
        </label>
        <input
          id="lead-contact-phone"
          type="tel"
          value={values.phone}
          onChange={(e) => onChange({ ...values, phone: e.target.value })}
          placeholder="98XXXXXXXX"
          className={`${inputBaseClass} ${phoneError ? errorClass : okClass}`}
        />
        {phoneError && <p className="mt-1 text-xs text-red-500">Please enter a valid phone number.</p>}
      </div>

      <div>
        <label htmlFor="lead-contact-email" className={labelClass}>
          <Mail className="h-3.5 w-3.5" />
          Email
        </label>
        <input
          id="lead-contact-email"
          type="email"
          value={values.email}
          onChange={(e) => onChange({ ...values, email: e.target.value })}
          placeholder="you@example.com"
          className={`${inputBaseClass} ${emailError ? errorClass : okClass}`}
        />
        {emailError && <p className="mt-1 text-xs text-red-500">Please enter a valid email address.</p>}
      </div>

      <p className="text-xs text-ink-500">
        So our travel expert can reach you with the best options - we never spam or share this.
      </p>
    </div>
  );
}
