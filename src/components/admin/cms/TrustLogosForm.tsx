"use client";

import { useActionState } from "react";
import { saveTrustLogosAction, type FormState } from "@/lib/actions/homepage";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import type { TrustLogoContent } from "@/lib/content/homepage";
import { ALLOWED_IMAGE_HOSTS } from "@/lib/imageHosts";

export default function TrustLogosForm({ initialRows }: { initialRows: TrustLogoContent[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveTrustLogosAction, undefined);

  return (
    <form action={formAction} className="mt-6 max-w-3xl space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <p className="text-xs text-ink-500">
        Logo is a path under /public (e.g. /partners/indigo.png), or a URL from {ALLOWED_IMAGE_HOSTS.join(" / ")} — other image hosts aren&rsquo;t allowed and will fail to save. Shown in the scrolling strip near the top of the homepage.
      </p>
      <RepeatableRows
        name="items"
        addLabel="Add Logo"
        fields={[
          { key: "name", label: "Partner Name", type: "text" },
          { key: "category", label: "Category", type: "select", options: ["airline", "hotel"] },
          { key: "logo", label: "Logo Path/URL", type: "text" },
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
