"use client";

import { useActionState } from "react";
import { saveServiceCategoriesAction, type FormState } from "@/lib/actions/homepage";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import type { ServiceCategoryContent } from "@/lib/content/homepage";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/imageHosts";

// Matches the icon set Categories.tsx (homepage "One booking, every part of
// your trip" tiles) knows how to render.
const iconOptions = ["Plane", "BedDouble", "Package", "Heart", "Users", "Car"];

export default function ServiceCategoriesForm({ initialRows }: { initialRows: ServiceCategoryContent[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveServiceCategoriesAction, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-3xl space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <p className="text-xs text-ink-500">
        Image must be a URL from {ALLOWED_IMAGE_HOSTS.join(" / ")} (e.g. an Unsplash photo link) or a path under /public — other image hosts aren&rsquo;t allowed and will fail to save.
      </p>
      <RepeatableRows
        name="items"
        addLabel="Add Category"
        fields={[
          { key: "icon", label: "Icon", type: "select", options: iconOptions },
          { key: "label", label: "Label", type: "text" },
          { key: "desc", label: "Description", type: "text" },
          { key: "image", label: "Image URL", type: "text" },
        ]}
        initialRows={initialRows}
      />

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
