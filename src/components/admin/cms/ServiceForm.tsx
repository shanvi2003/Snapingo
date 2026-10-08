"use client";

import { useActionState } from "react";
import { saveServiceAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import CompactRows from "@/components/admin/cms/CompactRows";
import FormSection from "@/components/admin/FormSection";

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
    <form action={formAction} className="mt-6 w-full space-y-6">
      <input type="hidden" name="slug" value={defaults.slug} />

      <FormSection title="Basic details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="name">Name</label>
            <input id="name" name="name" required defaultValue={defaults.name} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="tagline">Tagline</label>
            <input id="tagline" name="tagline" required defaultValue={defaults.tagline} className={inputClass} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Image">
        <div className="max-w-xl">
          <ImageUrlField name="image" label="Hero Image URL" defaultValue={defaults.image} required />
        </div>
      </FormSection>

      <FormSection title="Overview">
        <textarea
          id="overview"
          name="overview"
          aria-label="Overview"
          rows={4}
          required
          defaultValue={defaults.overview}
          className={inputClass}
        />
      </FormSection>

      <FormSection title="Highlights">
        <CompactRows
          name="highlights"
          addLabel="Add Highlight"
          columns={[
            { key: "icon", label: "Icon", width: "13rem", options: iconOptions },
            { key: "title", label: "Title", width: "1fr" },
            { key: "desc", label: "Description", width: "2fr" },
          ]}
          initial={defaults.highlights ?? []}
        />
      </FormSection>

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
