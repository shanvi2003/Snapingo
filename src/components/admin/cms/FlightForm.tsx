"use client";

import { useActionState, useState } from "react";
import { saveFlightAction, type FormState } from "@/lib/actions/cms";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

export type FlightDefaults = {
  id?: string;
  airline?: string;
  departureCitySlug?: string;
  destinationSlug?: string;
  flightClass?: string;
  price?: number;
  duration?: string;
};

export default function FlightForm({ isNew, defaults }: { isNew: boolean; defaults?: FlightDefaults }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => saveFlightAction(isNew, prevState, formData),
    undefined
  );
  const [flightClass, setFlightClass] = useState(defaults?.flightClass ?? "economy");

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div>
        <label className={labelClass} htmlFor="id">Flight ID</label>
        <input id="id" name="id" required disabled={!isNew} defaultValue={defaults?.id} placeholder="del-goa-indigo-eco" className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
      </div>
      <div>
        <label className={labelClass} htmlFor="airline">Airline</label>
        <input id="airline" name="airline" required defaultValue={defaults?.airline} className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="departureCitySlug">Departure City Slug</label>
          <input id="departureCitySlug" name="departureCitySlug" required defaultValue={defaults?.departureCitySlug} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="destinationSlug">Destination Slug</label>
          <input id="destinationSlug" name="destinationSlug" required defaultValue={defaults?.destinationSlug} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="flightClass">Class</label>
          <CustomSelect
            name="flightClass"
            value={flightClass}
            onChange={setFlightClass}
            options={[
              { value: "economy", label: "Economy" },
              { value: "premium-economy", label: "Premium Economy" },
              { value: "business", label: "Business" },
              { value: "first", label: "First Class" },
            ]}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="price">Price (₹)</label>
          <input id="price" name="price" type="number" min={0} required defaultValue={defaults?.price} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="duration">Duration</label>
          <input id="duration" name="duration" required placeholder="2h 40m" defaultValue={defaults?.duration} className={inputClass} />
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : isNew ? "Create Flight" : "Save Changes"}
      </button>
    </form>
  );
}
