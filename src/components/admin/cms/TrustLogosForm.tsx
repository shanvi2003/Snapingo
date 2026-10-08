"use client";

import { useActionState } from "react";
import { saveTrustLogosAction, type FormState } from "@/lib/actions/homepage";
import CompactRows from "@/components/admin/cms/CompactRows";
import type { TrustLogoContent } from "@/lib/content/homepage";

export default function TrustLogosForm({ initialRows }: { initialRows: TrustLogoContent[] }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveTrustLogosAction, undefined);

  return (
    <form action={formAction} className="mt-6 w-full space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <CompactRows
        name="items"
        addLabel="Add Logo"
        columns={[
          { key: "name", label: "Partner Name", width: "1fr" },
          { key: "category", label: "Category", width: "11rem", options: ["airline", "hotel"] },
          { key: "logo", label: "Logo Path/URL", width: "1.5fr" },
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
