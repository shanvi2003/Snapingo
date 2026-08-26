"use client";

import { useActionState } from "react";
import type { FormState } from "@/lib/actions/reviews";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

export default function TestimonialForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  defaults?: { name?: string; location?: string; avatar?: string; rating?: number; trip?: string; quote?: string; order?: number };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-5 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">Name</label>
          <input id="name" name="name" required defaultValue={defaults?.name} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="location">Location</label>
          <input id="location" name="location" required defaultValue={defaults?.location} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="avatar">Avatar Image URL (Unsplash)</label>
        <input id="avatar" name="avatar" required defaultValue={defaults?.avatar} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="rating">Rating (1-5)</label>
          <input id="rating" name="rating" type="number" step="0.1" min={1} max={5} required defaultValue={defaults?.rating} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="trip">Trip</label>
          <input id="trip" name="trip" required defaultValue={defaults?.trip} placeholder="e.g. Goa, 4N/5D" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="quote">Quote</label>
        <textarea id="quote" name="quote" rows={4} required defaultValue={defaults?.quote} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="order">Display Order</label>
        <input id="order" name="order" type="number" defaultValue={defaults?.order ?? 0} className={inputClass} />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
