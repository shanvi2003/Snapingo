"use client";

import { useActionState } from "react";
import { saveUspsAction, type FormState } from "@/lib/actions/homepage";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import type { UspContent } from "@/lib/content/homepage";

// Matches the icon set WhyChooseUs.tsx (homepage "Travel planning, minus
// the chaos" cards) knows how to render.
const iconOptions = ["ShieldCheck", "Headset", "PackageCheck", "MapPinned"];

export default function UspsForm({ initialRows }: { initialRows: UspContent[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveUspsAction, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-3xl space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <RepeatableRows
        name="items"
        addLabel="Add Item"
        fields={[
          { key: "icon", label: "Icon", type: "select", options: iconOptions },
          { key: "title", label: "Title", type: "text" },
          { key: "desc", label: "Description", type: "textarea" },
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
