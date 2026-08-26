"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/lib/actions/bookings";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";
const sectionTitleClass = "font-heading text-sm font-bold text-ink-900";

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
            <label className={labelClass} htmlFor="travelerName">Traveler Name</label>
            <input id="travelerName" name="travelerName" required defaultValue={defaults?.travelerName} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="phone">Phone</label>
            <input id="phone" name="phone" required defaultValue={defaults?.phone} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">Email (optional)</label>
            <input id="email" name="email" type="email" defaultValue={defaults?.email} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5">
        <p className={sectionTitleClass}>Trip Details</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass} htmlFor="packageTitle">Package (optional)</label>
            <input id="packageTitle" name="packageTitle" defaultValue={defaults?.packageTitle} className={inputClass} />
            {defaults?.packageId && <input type="hidden" name="packageId" value={defaults.packageId} />}
          </div>
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
            <label className={labelClass} htmlFor="travelStartDate">Travel Start</label>
            <input id="travelStartDate" name="travelStartDate" type="date" defaultValue={defaults?.travelStartDate} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="travelEndDate">Travel End</label>
            <input id="travelEndDate" name="travelEndDate" type="date" defaultValue={defaults?.travelEndDate} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5">
        <p className={sectionTitleClass}>Pricing</p>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="totalAmount">Package Amount (₹)</label>
            <input id="totalAmount" name="totalAmount" type="number" min={0} required defaultValue={defaults?.totalAmount} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="taxAmount">GST / Tax (₹, optional)</label>
            <input id="taxAmount" name="taxAmount" type="number" min={0} defaultValue={defaults?.taxAmount ?? 0} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 pt-5">
        <label className={labelClass} htmlFor="notes">Notes (optional)</label>
        <textarea id="notes" name="notes" rows={2} defaultValue={defaults?.notes} className={inputClass} />
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
