"use client";

import { useActionState, useState } from "react";
import { Mail, Send } from "lucide-react";
import type { FormState } from "@/lib/actions/email";

/**
 * "Email this to the customer" control, shared by the quotation and invoice
 * screens.
 *
 * Collapsed by default and opened deliberately: sending a customer an email is
 * not something that should be one stray click away, and the address is
 * pre-filled but editable because the person paying is often not the person
 * who filled in the enquiry.
 */
export default function SendEmailPanel({
  action,
  defaultTo,
  label,
  disabledReason,
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultTo: string;
  label: string;
  // Set when email isn't configured, so the reason is visible rather than the
  // button simply failing when pressed.
  disabledReason?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const [open, setOpen] = useState(false);

  const sent = state && "success" in state;

  if (disabledReason) {
    return (
      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink-900">
          <Mail className="h-4 w-4 text-ink-400" />
          {label}
        </h2>
        <p className="mt-2 text-sm text-ink-500">{disabledReason}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold text-ink-900">
          <Mail className="h-4 w-4 text-ink-400" />
          {label}
        </h2>
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full border border-ink-200 px-4 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            Compose
          </button>
        )}
      </div>

      {sent && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
          {state.success}
        </p>
      )}

      {open && (
        <form action={formAction} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-900" htmlFor="to">
              To
            </label>
            <input
              id="to"
              name="to"
              type="email"
              required
              defaultValue={defaultTo}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-900" htmlFor="note">
              Add a personal note (optional)
            </label>
            <textarea
              id="note"
              name="note"
              rows={3}
              placeholder="Anything you want to say alongside the attachment..."
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {state && "error" in state && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{state.error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              <Send className="h-3.5 w-3.5" />
              {pending ? "Sending..." : "Send"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-ink-500 hover:text-ink-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
