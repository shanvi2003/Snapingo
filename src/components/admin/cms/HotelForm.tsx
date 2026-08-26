"use client";

import { useActionState, useState } from "react";
import { saveHotelAction, type FormState } from "@/lib/actions/cms";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

export type HotelDefaults = {
  id?: string;
  name?: string;
  destinationSlug?: string;
  category?: string;
  pricePerNight?: number;
  rating?: number;
};

export default function HotelForm({ isNew, defaults }: { isNew: boolean; defaults?: HotelDefaults }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => saveHotelAction(isNew, prevState, formData),
    undefined
  );
  const [category, setCategory] = useState(defaults?.category ?? "3-star");

  return (
    <form action={formAction} className="mt-6 max-w-xl space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div>
        <label className={labelClass} htmlFor="id">Hotel ID</label>
        <input id="id" name="id" required disabled={!isNew} defaultValue={defaults?.id} placeholder="goa-sea-breeze-inn" className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
      </div>
      <div>
        <label className={labelClass} htmlFor="name">Name</label>
        <input id="name" name="name" required defaultValue={defaults?.name} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="destinationSlug">Destination Slug</label>
        <input id="destinationSlug" name="destinationSlug" required defaultValue={defaults?.destinationSlug} className={inputClass} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <CustomSelect
            name="category"
            value={category}
            onChange={setCategory}
            options={[
              { value: "3-star", label: "3-Star" },
              { value: "4-star", label: "4-Star" },
              { value: "5-star", label: "5-Star" },
              { value: "luxury", label: "Luxury" },
            ]}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="pricePerNight">Price/Night (₹)</label>
          <input id="pricePerNight" name="pricePerNight" type="number" min={0} required defaultValue={defaults?.pricePerNight} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="rating">Rating</label>
          <input id="rating" name="rating" type="number" step="0.1" min={0} max={5} required defaultValue={defaults?.rating} className={inputClass} />
        </div>
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : isNew ? "Create Hotel" : "Save Changes"}
      </button>
    </form>
  );
}
