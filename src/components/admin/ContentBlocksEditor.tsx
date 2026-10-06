"use client";

import { useState } from "react";
import { Pencil, RotateCcw } from "lucide-react";

export type EditableContentBlock = { key: string; title: string; body: string };

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

/**
 * The PDF's standard sections (About, Terms, Payment Policy...) as this
 * package's or quotation's own copy. Starts filled with the standard content
 * and read-only; Edit unlocks it, and whatever is changed is saved with this
 * one document only. Posted as a single JSON field, `contentBlocks`.
 */
export default function ContentBlocksEditor({
  initial,
  standard,
}: {
  // What this document currently has: its own saved copy, or the standard
  // content when it has none yet.
  initial: EditableContentBlock[];
  // The standard content, for "Reset to standard".
  standard: EditableContentBlock[];
}) {
  const [blocks, setBlocks] = useState(initial);
  // Locked until asked for: this copy is long and rarely changed, and an
  // always-live textarea invites accidental edits while scrolling past it.
  const [editing, setEditing] = useState(false);

  const update = (key: string, field: "title" | "body", value: string) =>
    setBlocks((prev) => prev.map((b) => (b.key === key ? { ...b, [field]: value } : b)));

  const reset = (key: string) => {
    const original = standard.find((s) => s.key === key);
    if (original) setBlocks((prev) => prev.map((b) => (b.key === key ? { ...original } : b)));
  };

  return (
    <div>
      <input type="hidden" name="contentBlocks" value={JSON.stringify(blocks)} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {editing ? (
            "Use - at the start of a line for bullets. Empty sections won't show in the PDF."
          ) : (
            "Shown at the end of the PDF. Edits here only change this package's PDF."
          )}
        </p>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-1.5 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        )}
      </div>

      <div className="mt-4 divide-y divide-ink-100">
        {blocks.map((block) => {
          const original = standard.find((s) => s.key === block.key);
          const changed = original && (original.title !== block.title || original.body !== block.body);

          if (!editing) {
            return (
              <div key={block.key} className="py-4 first:pt-0 last:pb-0">
                <p className="text-sm font-bold text-black">{block.title}</p>
                <p className="mt-1 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-ink-700">
                  {block.body || "Empty - not printed."}
                </p>
              </div>
            );
          }

          return (
            <div key={block.key} className="py-5 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="w-full max-w-sm">
                  <label className={labelClass} htmlFor={`content-title-${block.key}`}>
                    Section heading
                  </label>
                  <input
                    id={`content-title-${block.key}`}
                    value={block.title}
                    onChange={(e) => update(block.key, "title", e.target.value)}
                    className={inputClass}
                  />
                </div>
                {changed && (
                  <button
                    type="button"
                    onClick={() => reset(block.key)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-brand-600"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset to standard
                  </button>
                )}
              </div>
              <textarea
                aria-label={`${block.title} content`}
                rows={block.key === "PDF_TERMS" ? 10 : 5}
                value={block.body}
                onChange={(e) => update(block.key, "body", e.target.value)}
                className={`${inputClass} mt-3`}
              />
            </div>
          );
        })}
      </div>

      {editing && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="mt-4 rounded-full border border-ink-200 px-4 py-1.5 text-sm font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
        >
          Done
        </button>
      )}
    </div>
  );
}
