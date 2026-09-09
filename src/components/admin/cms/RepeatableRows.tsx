"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export type RowField =
  | { key: string; label: string; type: "text" | "textarea" }
  | { key: string; label: string; type: "select"; options: string[] };

// Generic editor for an array of objects (itinerary days, highlights,
// blog content sections) inside a native form. State lives here in React,
// serialized into one JSON hidden input on every change so a plain Server
// Action still receives it via formData.get(name) — no client fetch needed.
export default function RepeatableRows({
  name,
  fields,
  initialRows,
  addLabel,
  stacked = false,
  textareaRows = 3,
}: {
  name: string;
  fields: RowField[];
  initialRows: Record<string, string>[];
  addLabel: string;
  // Side-by-side columns (the default) suit fields that are all similarly
  // short, like an itinerary day's title next to its short description.
  // Blog content sections are a heading (short, optional) followed by a
  // long-form body - forcing that pair into equal-height side-by-side
  // columns squashes the body into a title-sized box. `stacked` puts each
  // field on its own full-width row instead, heading above body, with the
  // body given real room to write in.
  stacked?: boolean;
  // Per-usage override for a non-stacked textarea's starting height - some
  // callers' descriptions (e.g. the "Why Choose Us" cards) run long enough
  // that the default 3 rows needs an internal scrollbar to see the whole
  // value. Only affects the caller that passes it; every other RepeatableRows
  // usage keeps the default.
  textareaRows?: number;
}) {
  const [rows, setRows] = useState<Record<string, string>[]>(
    initialRows.length > 0 ? initialRows : [Object.fromEntries(fields.map((f) => [f.key, ""]))]
  );

  const updateField = (index: number, key: string, value: string) => {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, Object.fromEntries(fields.map((f) => [f.key, ""]))]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="flex gap-2 rounded-xl border border-ink-200 bg-ink-50/40 p-3">
            <GripVertical className="mt-2.5 h-4 w-4 shrink-0 text-ink-300" />
            <div
              className={
                stacked
                  ? "flex flex-1 flex-col gap-3"
                  : "grid flex-1 grid-cols-1 items-stretch gap-2 sm:grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
              }
            >
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col">
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-500">
                    {field.label}
                  </label>
                  {field.type === "textarea" ? (
                    <textarea
                      rows={stacked ? 6 : textareaRows}
                      value={row[field.key] ?? ""}
                      onChange={(e) => updateField(index, field.key, e.target.value)}
                      className={`w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${stacked ? "" : "flex-1"}`}
                    />
                  ) : field.type === "select" ? (
                    <CustomSelect
                      value={row[field.key] ?? ""}
                      onChange={(value) => updateField(index, field.key, value)}
                      placeholder="—"
                      options={field.options.map((opt) => ({ value: opt, label: opt }))}
                    />
                  ) : (
                    // flex-1 (not just w-full) so a single-line input
                    // stretches to match a taller sibling textarea's height
                    // in the default side-by-side layout (e.g. the
                    // itinerary's Day Title next to its Description);
                    // stacked rows have no such sibling to match, so this
                    // field just sits at its own natural height instead.
                    <input
                      type="text"
                      value={row[field.key] ?? ""}
                      onChange={(e) => updateField(index, field.key, e.target.value)}
                      className={`w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${stacked ? "" : "flex-1"}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => removeRow(index)}
              aria-label="Remove row"
              className="mt-1 grid h-7 w-7 shrink-0 place-items-center self-start rounded-full text-ink-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2.5 flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <Plus className="h-3.5 w-3.5" />
        {addLabel}
      </button>
    </div>
  );
}
