"use client";

import { useActionState, useState } from "react";
import { saveDestinationAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

// Matches the icon set rendered on the public destination page
// (src/app/(site)/destinations/[slug]/page.tsx's highlightIcons map).
const iconOptions = [
  "Waves", "Landmark", "ShoppingBag", "Sailboat", "Mountain", "Music", "TreePine", "Sun",
  "Camera", "Tent", "Building2", "Snowflake", "Compass", "Sparkles", "Flame", "Utensils",
];

export type DestinationDefaults = {
  slug?: string;
  name?: string;
  tagline?: string;
  image?: string;
  gallery?: string[];
  packagesCount?: number;
  startingPrice?: number;
  type?: string;
  overview?: string;
  bestTimeToVisit?: string;
  idealDuration?: string;
  highlights?: { icon: string; title: string; desc: string }[];
};

export default function DestinationForm({ isNew, defaults }: { isNew: boolean; defaults?: DestinationDefaults }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => saveDestinationAction(isNew, prevState, formData),
    undefined
  );
  const [type, setType] = useState(defaults?.type ?? "domestic");

  return (
    <form action={formAction} className="mt-6 max-w-3xl space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="slug">Slug (URL)</label>
          <input id="slug" name="slug" required disabled={!isNew} defaultValue={defaults?.slug} placeholder="goa" className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
        </div>
        <div>
          <label className={labelClass} htmlFor="name">Name</label>
          <input id="name" name="name" required defaultValue={defaults?.name} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="tagline">Tagline</label>
        <input id="tagline" name="tagline" required defaultValue={defaults?.tagline} className={inputClass} />
      </div>

      <ImageUrlField name="image" label="Hero Image URL" defaultValue={defaults?.image} required />

      <div>
        <label className={labelClass} htmlFor="gallery">Gallery Image URLs (one per line)</label>
        <textarea id="gallery" name="gallery" rows={4} defaultValue={defaults?.gallery?.join("\n")} className={inputClass} />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
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
          <label className={labelClass} htmlFor="packagesCount">Packages Count</label>
          <input id="packagesCount" name="packagesCount" type="number" min={0} required defaultValue={defaults?.packagesCount} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="startingPrice">Starting Price (₹)</label>
          <input id="startingPrice" name="startingPrice" type="number" min={0} required defaultValue={defaults?.startingPrice} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="idealDuration">Ideal Duration</label>
          <input id="idealDuration" name="idealDuration" required placeholder="5-6 days" defaultValue={defaults?.idealDuration} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="bestTimeToVisit">Best Time to Visit</label>
        <input id="bestTimeToVisit" name="bestTimeToVisit" required defaultValue={defaults?.bestTimeToVisit} className={inputClass} />
      </div>

      <div>
        <label className={labelClass} htmlFor="overview">Overview</label>
        <textarea id="overview" name="overview" rows={5} required defaultValue={defaults?.overview} className={inputClass} />
      </div>

      <div>
        <p className={labelClass}>Highlights</p>
        <RepeatableRows
          name="highlights"
          addLabel="Add Highlight"
          fields={[
            { key: "icon", label: "Icon", type: "select", options: iconOptions },
            { key: "title", label: "Title", type: "text" },
            { key: "desc", label: "Description", type: "textarea" },
          ]}
          initialRows={defaults?.highlights ?? []}
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : isNew ? "Create Destination" : "Save Changes"}
      </button>
    </form>
  );
}
