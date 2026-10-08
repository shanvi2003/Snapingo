"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions/bookings";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";
const sectionTitleClass = "font-heading text-lg font-bold text-ink-900";

export type BookingDefaults = {
  leadId?: string;
  travelerName?: string;
  phone?: string;
  email?: string;
  packageId?: string;
  packageTitle?: string;
  destinationName?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  notes?: string;
};

export default function BookingForm({
  action,
  defaults,
  submitLabel,
  destinationOptions = [],
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaults?: BookingDefaults;
  submitLabel: string;
  destinationOptions?: string[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [destinationName, setDestinationName] = useState(defaults?.destinationName ?? "");

  // The current value might be a one-off name typed on a lead (not in the
  // catalog) - keep it selectable instead of silently blanking the field.
  const destinationSelectOptions = (
    destinationName && !destinationOptions.includes(destinationName)
      ? [destinationName, ...destinationOptions]
      : destinationOptions
  ).map((name) => ({ value: name, label: name }));

  return (
    <form action={formAction} className="mt-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      {defaults?.leadId && <input type="hidden" name="leadId" value={defaults.leadId} />}

      <div className="pb-5">
        <p className={sectionTitleClass}>Traveler Details</p>
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="travelerName">Traveller Name</label>
            <input id="travelerName" name="travelerName" required defaultValue={defaults?.travelerName} placeholder="Full name" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">Phone Number</label>
            <input id="phone" name="phone" required defaultValue={defaults?.phone} placeholder="+91 XXXXX XXXXX" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" required defaultValue={defaults?.email} placeholder="name@example.com" className={inputClass} />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5">
        <p className={sectionTitleClass}>Trip Details</p>
        {/* No package field: a booking doesn't have to be for a listed
            package. A package carried over from the lead (or already on a
            booking being edited) still rides along unseen, so it isn't lost. */}
        {defaults?.packageTitle && <input type="hidden" name="packageTitle" value={defaults.packageTitle} />}
        {defaults?.packageId && <input type="hidden" name="packageId" value={defaults.packageId} />}
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="destinationName">Destination</label>
            <CustomSelect
              name="destinationName"
              value={destinationName}
              onChange={setDestinationName}
              placeholder="Select destination"
              options={destinationSelectOptions}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="travelStartDate">Travel Start Date</label>
            <input id="travelStartDate" name="travelStartDate" type="date" defaultValue={defaults?.travelStartDate} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="travelEndDate">Travel End Date</label>
            <input id="travelEndDate" name="travelEndDate" type="date" defaultValue={defaults?.travelEndDate} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5">
        <p className={sectionTitleClass}>Pricing</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="totalAmount">Package Price (₹, before GST)</label>
            <input id="totalAmount" name="totalAmount" type="number" min={0} required defaultValue={defaults?.totalAmount} placeholder="25000" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="taxAmount">GST Amount (₹, optional)</label>
            <input id="taxAmount" name="taxAmount" type="number" min={0} defaultValue={defaults?.taxAmount ?? 0} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 pt-5">
        <label className={labelClass} htmlFor="notes">Notes for the Team (optional)</label>
        <textarea id="notes" name="notes" rows={2} defaultValue={defaults?.notes} placeholder="Anything to remember, e.g. honeymoon couple, early check-in requested" className={inputClass} />
      </div>

      {state?.error && (
        <p className="mt-5 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
