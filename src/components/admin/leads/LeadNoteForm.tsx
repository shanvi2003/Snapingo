"use client";

import { useActionState, useState } from "react";
import { addLeadNoteAction, type FormState } from "@/lib/actions/admin-leads";
import { noteStatusLabels, noteStatusOrder } from "@/components/admin/leads/statusStyles";
import type { LeadNoteStatus } from "@/generated/prisma/enums";

export default function LeadNoteForm({ leadId }: { leadId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => addLeadNoteAction(leadId, prevState, formData),
    undefined
  );

  const [status, setStatus] = useState<LeadNoteStatus | "">("");

  // Picking a reason makes the note mandatory. The server enforces this too
  // (the action refuses a blank body), but marking the field `required` here
  // means staff find out before submitting rather than after.
  const noteRequired = status !== "";

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">Status</p>
        <div className="flex flex-wrap gap-2">
          {noteStatusOrder.map((option) => {
            const active = status === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(active ? "" : option)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 text-ink-700 hover:border-brand-400 hover:text-brand-600"
                }`}
              >
                {noteStatusLabels[option]}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="status" value={status} />
      </div>

      {status === "WONT_BOOK_WITH_ME" && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          Saving this will also mark the lead as Cancelled.
        </p>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900" htmlFor="body">
          Note {noteRequired && <span className="text-red-600">*</span>}
        </label>
        <textarea
          id="body"
          name="body"
          rows={3}
          required={noteRequired}
          placeholder={noteRequired ? "Why? This is required." : "Add a note for the team..."}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-end rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Add note"}
      </button>
    </form>
  );
}
