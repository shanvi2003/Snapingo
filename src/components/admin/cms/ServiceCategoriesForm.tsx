"use client";

import { useActionState } from "react";
import { saveServiceCategoriesAction, type FormState } from "@/lib/actions/homepage";
import CompactRows from "@/components/admin/cms/CompactRows";
import type { ServiceCategoryContent } from "@/lib/content/homepage";

// Matches the icon set Categories.tsx (homepage "One booking, every part of
// your trip" tiles) knows how to render.
const iconOptions = ["Plane", "BedDouble", "Package", "Heart", "Users", "Car"];

export default function ServiceCategoriesForm({ initialRows }: { initialRows: ServiceCategoryContent[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveServiceCategoriesAction, undefined);

  return (
    <form action={formAction} className="mt-6 w-full space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <CompactRows
        name="items"
        addLabel="Add Category"
        columns={[
          { key: "icon", label: "Icon", width: "11rem", options: iconOptions },
          { key: "label", label: "Label", width: "1fr" },
          { key: "desc", label: "Description", width: "1.5fr" },
          { key: "image", label: "Image URL", width: "1.5fr" },
        ]}
        initial={initialRows}
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
