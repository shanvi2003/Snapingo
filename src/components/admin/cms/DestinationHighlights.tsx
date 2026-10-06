"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

type Highlight = { icon: string; title: string; desc: string };

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

const blank = (): Highlight => ({ icon: "", title: "", desc: "" });

/**
 * A destination's highlight cards: icon and title side by side, the
 * description on its own full-width row beneath - the generic row editor put
 * all three in equal columns, which squeezed the description and stretched a
 * one-line title into a tall box. Posted as one JSON field, `highlights`.
 */
export default function DestinationHighlights({
  initial,
  iconOptions,
}: {
  initial: Highlight[];
  iconOptions: string[];
}) {
  const [rows, setRows] = useState<Highlight[]>(initial.length > 0 ? initial : [blank()]);

  const update = (index: number, key: keyof Highlight, value: string) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  return (
    <div>
      <input type="hidden" name="highlights" value={JSON.stringify(rows)} />
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-ink-200 bg-ink-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="font-heading text-base font-extrabold text-brand-600">Highlight {index + 1}</p>
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                aria-label={`Remove highlight ${index + 1}`}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <p className={labelClass}>Icon</p>
                <CustomSelect
                  value={row.icon}
                  onChange={(value) => update(index, "icon", value)}
                  placeholder="Select icon"
                  options={iconOptions.map((icon) => ({ value: icon, label: icon }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass} htmlFor={`highlight-title-${index}`}>Title</label>
                <input
                  id={`highlight-title-${index}`}
                  value={row.title}
                  onChange={(e) => update(index, "title", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={labelClass} htmlFor={`highlight-desc-${index}`}>Description</label>
              <textarea
                id={`highlight-desc-${index}`}
                rows={3}
                value={row.desc}
                onChange={(e) => update(index, "desc", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, blank()])}
        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <Plus className="h-4 w-4" />
        Add Highlight
      </button>
    </div>
  );
}
