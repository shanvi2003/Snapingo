"use client";

import { useActionState } from "react";
import { savePdfContentAction, type FormState } from "@/lib/actions/pdfContent";
import type { ContentBlockKey } from "@/generated/prisma/enums";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

export default function PdfContentForm({
  blocks,
  settings,
  settingFields,
}: {
  blocks: { key: ContentBlockKey; title: string; body: string }[];
  settings: Record<string, string>;
  settingFields: { key: string; label: string; help: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    savePdfContentAction,
    undefined
  );

  return (
    <form action={formAction} className="mt-6 space-y-6">
      <div className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-ink-900">Contact & rates</h2>
        <p className="mt-1 text-sm text-ink-500">
          Used on generated documents and when calculating GST.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {settingFields.map((field) => (
            <div key={field.key}>
              <label className={labelClass} htmlFor={field.key}>
                {field.label}
              </label>
              <input
                id={field.key}
                name={`setting.${field.key}`}
                defaultValue={settings[field.key] ?? ""}
                className={inputClass}
              />
              {field.help && <p className="mt-1 text-xs text-ink-500">{field.help}</p>}
            </div>
          ))}
        </div>
      </div>

      {blocks.map((block) => (
        <div key={block.key} className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
          <div>
            <label className={labelClass} htmlFor={`title.${block.key}`}>
              Section heading
            </label>
            <input
              id={`title.${block.key}`}
              name={`title.${block.key}`}
              defaultValue={block.title}
              required
              className={`${inputClass} max-w-sm`}
            />
          </div>
          <div className="mt-4">
            <label className={labelClass} htmlFor={`body.${block.key}`}>
              Content
            </label>
            <textarea
              id={`body.${block.key}`}
              name={`body.${block.key}`}
              rows={7}
              defaultValue={block.body}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-ink-500">
              Start a line with <code className="rounded bg-ink-50 px-1">-</code> to make it a
              bullet point. Everything else becomes a paragraph. Leave empty to hide the section.
            </p>
          </div>
        </div>
      ))}

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
          {state.success}
        </p>
      )}

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
