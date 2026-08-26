"use client";

import { useActionState } from "react";
import { saveServiceAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

// Matches the icon set rendered on the public service page
// (src/app/(site)/services/[slug]/page.tsx's highlightIcons map).
const iconOptions = [
  "Search", "RefreshCcw", "Users", "Headset", "BadgeCheck", "Wallet", "Handshake", "CalendarClock",
  "Sparkles", "PlaneLanding", "Route", "MapPin", "ShieldCheck", "Compass", "LayoutGrid", "MessageCircle",
];

export type ServiceDefaults = {
  slug?: string;
  name?: string;
  tagline?: string;
  image?: string;
  overview?: string;
  highlights?: { icon: string; title: string; desc: string }[];
};

export default function ServiceForm({ defaults }: { defaults: ServiceDefaults }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => saveServiceAction(false, prevState, formData),
    undefined
  );

  return (
    <form action={formAction} className="mt-6 max-w-3xl space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <input type="hidden" name="slug" value={defaults.slug} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="name">Name</label>
          <input id="name" name="name" required defaultValue={defaults.name} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="tagline">Tagline</label>
          <input id="tagline" name="tagline" required defaultValue={defaults.tagline} className={inputClass} />
        </div>
      </div>

      <ImageUrlField name="image" label="Hero Image URL" defaultValue={defaults.image} required />

      <div>
        <label className={labelClass} htmlFor="overview">Overview</label>
        <textarea id="overview" name="overview" rows={5} required defaultValue={defaults.overview} className={inputClass} />
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
          initialRows={defaults.highlights ?? []}
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
