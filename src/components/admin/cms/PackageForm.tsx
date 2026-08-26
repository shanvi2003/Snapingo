"use client";

import { useActionState, useState } from "react";
import { savePackageAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import { packageCategoryOptions } from "@/lib/packageCategoryHelpers";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

const inclusionOptions: { value: string; label: string }[] = [
  { value: "flight", label: "Flight" },
  { value: "hotel", label: "Hotel" },
  { value: "meals", label: "Meals" },
  { value: "transfer", label: "Transfer" },
  { value: "sightseeing", label: "Sightseeing" },
];

export type PackageDefaults = {
  id?: string;
  title?: string;
  destination?: string;
  destinationSlug?: string;
  type?: string;
  image?: string;
  duration?: string;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
  featured?: boolean;
  hotDeal?: boolean;
  inclusions?: string[];
  categories?: string[];
  exclusions?: string[];
  highlights?: string[];
  itinerary?: { title: string; desc: string }[];
};

export default function PackageForm({ isNew, defaults }: { isNew: boolean; defaults?: PackageDefaults }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => savePackageAction(isNew, prevState, formData),
    undefined
  );
  const [type, setType] = useState(defaults?.type ?? "domestic");

  return (
    <form action={formAction} className="mt-6 max-w-3xl space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="id">Package ID (URL slug)</label>
          <input id="id" name="id" required disabled={!isNew} defaultValue={defaults?.id} placeholder="goa-beach-bliss" className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
        </div>
        <div>
          <label className={labelClass} htmlFor="title">Title</label>
          <input id="title" name="title" required defaultValue={defaults?.title} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="destination">Destination Name</label>
          <input id="destination" name="destination" required defaultValue={defaults?.destination} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="destinationSlug">Destination Slug</label>
          <input id="destinationSlug" name="destinationSlug" required defaultValue={defaults?.destinationSlug} className={inputClass} />
        </div>
      </div>

      <ImageUrlField name="image" label="Cover Image URL" defaultValue={defaults?.image} required />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <label className={labelClass} htmlFor="type">Type</label>
          <CustomSelect
            name="type"
            value={type}
            onChange={setType}
            options={[
              { value: "domestic", label: "Domestic" },
              { value: "international", label: "International" },
            ]}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="duration">Duration</label>
          <input id="duration" name="duration" required placeholder="4N/5D" defaultValue={defaults?.duration} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="badge">Badge (optional)</label>
          <input id="badge" name="badge" defaultValue={defaults?.badge} placeholder="Bestseller" className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div>
          <label className={labelClass} htmlFor="price">Price (₹)</label>
          <input id="price" name="price" type="number" min={0} required defaultValue={defaults?.price} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="originalPrice">Original Price (₹)</label>
          <input id="originalPrice" name="originalPrice" type="number" min={0} required defaultValue={defaults?.originalPrice} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="rating">Rating</label>
          <input id="rating" name="rating" type="number" step="0.1" min={0} max={5} required defaultValue={defaults?.rating} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="reviews">Reviews Count</label>
          <input id="reviews" name="reviews" type="number" min={0} required defaultValue={defaults?.reviews} className={inputClass} />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <input type="checkbox" name="featured" defaultChecked={defaults?.featured} className="h-4 w-4 rounded border-ink-300" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <input type="checkbox" name="hotDeal" defaultChecked={defaults?.hotDeal} className="h-4 w-4 rounded border-ink-300" />
          Hot Deal
        </label>
      </div>

      <div>
        <p className={labelClass}>Inclusions</p>
        <div className="flex flex-wrap gap-4">
          {inclusionOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm text-ink-900">
              <input
                type="checkbox"
                name="inclusions"
                value={opt.value}
                defaultChecked={defaults?.inclusions?.includes(opt.value)}
                className="h-4 w-4 rounded border-ink-300"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className={labelClass}>Categories</p>
        <div className="flex flex-wrap gap-4">
          {packageCategoryOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm text-ink-900">
              <input
                type="checkbox"
                name="categories"
                value={opt.value}
                defaultChecked={defaults?.categories?.includes(opt.value)}
                className="h-4 w-4 rounded border-ink-300"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="highlights">Highlights (one per line)</label>
        <textarea id="highlights" name="highlights" rows={4} defaultValue={defaults?.highlights?.join("\n")} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="exclusions">Exclusions (one per line)</label>
        <textarea id="exclusions" name="exclusions" rows={4} defaultValue={defaults?.exclusions?.join("\n")} className={inputClass} />
      </div>

      <div>
        <p className={labelClass}>Itinerary</p>
        <RepeatableRows
          name="itinerary"
          addLabel="Add Day"
          fields={[
            { key: "title", label: "Day Title", type: "text" },
            { key: "desc", label: "Description", type: "textarea" },
          ]}
          initialRows={defaults?.itinerary ?? []}
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : isNew ? "Create Package" : "Save Changes"}
      </button>
    </form>
  );
}
