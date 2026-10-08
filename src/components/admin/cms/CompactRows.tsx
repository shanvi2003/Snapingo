"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CustomSelect from "@/components/CustomSelect";

export type CompactColumn = {
  key: string;
  label: string;
  // CSS grid track for this column, sized to what it holds - a fixed width
  // for a short pick-list, a share of the free space for text.
  width: string;
  // Present for a pick-list column, absent for plain text.
  options?: string[];
};

// py-3 matches CustomSelect's height, so pick-lists and text boxes in a row
// line up exactly.
const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "text-xs font-bold uppercase tracking-wide text-ink-900";

/**
 * Short repeated rows (service highlights, "Why Choose Us" cards, trust logos)
 * as one compact line each: every box the same height, column labels shown
 * once above rather than repeated in every row. Posted as one JSON field
 * under `name`.
 */
export default function CompactRows({
  name,
  columns,
  initial,
  addLabel,
}: {
  name: string;
  columns: CompactColumn[];
  initial: Record<string, string>[];
  addLabel: string;
}) {
  const blank = () => Object.fromEntries(columns.map((c) => [c.key, ""]));
  const [rows, setRows] = useState<Record<string, string>[]>(initial.length > 0 ? initial : [blank()]);

  const update = (index: number, key: string, value: string) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  // The last 2rem track holds the delete button.
  const gridStyle = { gridTemplateColumns: `${columns.map((c) => c.width).join(" ")} 2rem` };

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(rows)} />
      {rows.length > 0 && (
        <div className="mb-2 grid items-center gap-3" style={gridStyle}>
          {columns.map((c) => (
            <p key={c.key} className={labelClass}>{c.label}</p>
          ))}
        </div>
      )}
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="grid items-center gap-3" style={gridStyle}>
            {columns.map((c) =>
              c.options ? (
                <CustomSelect
                  key={c.key}
                  value={row[c.key] ?? ""}
                  onChange={(value) => update(index, c.key, value)}
                  placeholder="Select"
                  options={c.options.map((opt) => ({ value: opt, label: opt }))}
                />
              ) : (
                <input
                  key={c.key}
                  aria-label={`Row ${index + 1} ${c.label}`}
                  value={row[c.key] ?? ""}
                  onChange={(e) => update(index, c.key, e.target.value)}
                  className={inputClass}
                />
              )
            )}
            <button
              type="button"
              onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
              aria-label={`Remove row ${index + 1}`}
              className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, blank()])}
        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
