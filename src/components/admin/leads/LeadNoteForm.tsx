"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { addLeadNoteAction, type FormState } from "@/lib/actions/admin-leads";
import { noteStatusLabels, noteStatusOrder } from "@/components/admin/leads/statusStyles";
import type { LeadNoteStatus } from "@/generated/prisma/enums";
import CustomSelect from "@/components/CustomSelect";

const NO_STATUS = { value: "", label: "No status" };

export default function LeadNoteForm({ leadId }: { leadId: string }) {
  // Closed behind an "Add note" button: the lead page is mostly read while on
  // a call, and an always-open form takes half the card for something used
  // once per conversation.
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<LeadNoteStatus | "">("");

  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    const result = await addLeadNoteAction(leadId, prevState, formData);
    // Saved: fold the form away again, ready for the next note.
    if (result && "success" in result) {
      setOpen(false);
      setStatus("");
    }
    return result;
  }, undefined);

  // Picking a reason makes the note mandatory. The server enforces this too
  // (the action refuses a blank body), but marking the field `required` here
  // means staff find out before submitting rather than after.
  const noteRequired = status !== "";

  if (!open) {
    return (
      <div className="mt-4 flex items-center gap-3">
        {/* The new note appearing in the list is the confirmation; no
            separate "Note added" message. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Add note
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3 rounded-xl border border-ink-100 bg-ink-50/40 p-4">
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">Status</p>
        <CustomSelect
          name="status"
          value={status}
          onChange={(next) => setStatus(next as LeadNoteStatus | "")}
          placeholder="No status"
          options={[NO_STATUS, ...noteStatusOrder.map((s) => ({ value: s, label: noteStatusLabels[s] }))]}
        />
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
          autoFocus
          placeholder={noteRequired ? "Why? This is required." : "Add a note for the team..."}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setStatus("");
          }}
          className="text-sm font-semibold text-ink-500 hover:text-ink-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save note"}
        </button>
      </div>
    </form>
  );
}
