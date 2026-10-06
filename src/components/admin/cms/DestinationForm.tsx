"use client";

import { useActionState, useState } from "react";
import { saveDestinationAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import DestinationHighlights from "@/components/admin/cms/DestinationHighlights";
import FormSection from "@/components/admin/FormSection";
import CustomSelect from "@/components/CustomSelect";
import { slugify } from "@/lib/slug";
import { MONTHS, formatBestTime, parseBestTime } from "@/lib/bestTime";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

const monthOptions = MONTHS.map((m) => ({ value: m, label: m }));

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

  const [name, setName] = useState(defaults?.name ?? "");
  const [slug, setSlug] = useState(defaults?.slug ?? "");
  // Tracks whether the slug has been typed into directly. Until it has, it
  // follows the name; after that it is left alone, so a deliberate slug is
  // never silently overwritten by a later title tweak.
  const [slugEdited, setSlugEdited] = useState(!isNew);

  const [bestTime, setBestTime] = useState(() => parseBestTime(defaults?.bestTimeToVisit));
  const bestTimeValue = formatBestTime(bestTime);

  const updateName = (next: string) => {
    setName(next);
    if (!slugEdited) setSlug(slugify(next));
  };

  return (
    <form action={formAction} className="mt-6 w-full space-y-6">
      <FormSection title="Basic details">
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
            {/* Labelled "Destination", though the column is still `name` - the
                database field keeps its name, only what staff read changes. */}
            <label className={labelClass} htmlFor="name">Destination</label>
            <input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => updateName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="slug">Slug (URL)</label>
            {/* Filled from the name as it is typed, but still editable on a new
                destination - the slug is the public URL, and occasionally it
                should read differently from the display name. On an existing
                destination it stays read-only, since changing it would break
                every link that already points at the page. */}
            <input
              id="slug"
              name="slug"
              required
              readOnly={!isNew}
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                // Once it's been edited by hand, stop overwriting it.
                setSlugEdited(true);
              }}
              placeholder="goa"
              className={`${inputClass} ${!isNew ? "bg-ink-50 text-ink-400" : ""}`}
            />
          </div>

          {/* Two of the three columns: a tagline is one short line, and the
              full row made its box far longer than anything typed into it. */}
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="tagline">Tagline</label>
            <input id="tagline" name="tagline" required defaultValue={defaults?.tagline} className={inputClass} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Images">
        <ImageUrlField name="image" label="Hero Image URL" defaultValue={defaults?.image} required />

        <div className="mt-5">
          <label className={labelClass} htmlFor="gallery">Gallery Image URLs (one per line)</label>
          <textarea id="gallery" name="gallery" rows={4} defaultValue={defaults?.gallery?.join("\n")} className={inputClass} />
        </div>
      </FormSection>

      <FormSection title="Trip details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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
      </FormSection>

      <FormSection title="Best time to visit">
        {/* The three controls below are not form fields - they compose the
            single string the website renders, which is submitted by the
            hidden input. */}
        <input type="hidden" name="bestTimeToVisit" value={bestTimeValue} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="bestTimeFrom">From</label>
            <CustomSelect
              value={bestTime.from}
              onChange={(from) => setBestTime((prev) => ({ ...prev, from }))}
              placeholder="Select month"
              options={monthOptions}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="bestTimeTo">To</label>
            <CustomSelect
              value={bestTime.to}
              onChange={(to) => setBestTime((prev) => ({ ...prev, to }))}
              placeholder="Select month"
              options={monthOptions}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="bestTimeNote">Note (optional)</label>
            <input
              id="bestTimeNote"
              value={bestTime.note}
              onChange={(e) => setBestTime((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="snow season, festival..."
              className={inputClass}
            />
          </div>
        </div>

        {/* A preview once there's something to show, a plain hint before -
            not a red error on a form nobody has filled in yet. */}
        <p className="mt-3 text-sm text-ink-500">
          {bestTimeValue ? (
            <>
              Shown on the website as <span className="font-semibold text-black">{bestTimeValue}</span>
            </>
          ) : (
            "Pick both months, or just write a note."
          )}
        </p>
      </FormSection>

      <FormSection title="Overview">
        <textarea
          id="overview"
          name="overview"
          aria-label="Overview"
          rows={5}
          required
          defaultValue={defaults?.overview}
          className={inputClass}
        />
      </FormSection>

      <FormSection title="Highlights">
        <DestinationHighlights initial={defaults?.highlights ?? []} iconOptions={iconOptions} />
      </FormSection>

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
