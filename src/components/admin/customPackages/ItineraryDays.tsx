"use client";

import { Plus, Trash2 } from "lucide-react";

export type DayRow = { date: string; title: string; desc: string };

/** "2026-10-05" + 2 -> "2026-10-07". UTC so no timezone can shift the day. */
export function addDays(isoDate: string, count: number): string {
  const time = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(time)) return "";
  return new Date(time + count * 86_400_000).toISOString().slice(0, 10);
}

/** Day 1 on the trip start date, each later day one date after it. */
export function datesFromStart(rows: DayRow[], startDate: string): DayRow[] {
  return startDate ? rows.map((row, i) => ({ ...row, date: addDays(startDate, i) })) : rows;
}

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

/**
 * Itinerary day editor for customized packages. The rows live in the parent
 * form (not in here) because picking the trip start date rewrites every
 * day's date, and the form is where that date is chosen.
 */
export default function ItineraryDays({
  rows,
  onChange,
  startDate,
}: {
  rows: DayRow[];
  onChange: (rows: DayRow[]) => void;
  startDate: string;
}) {
  const update = (index: number, key: keyof DayRow, value: string) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  // A new day lands on the date after the previous one - or on the trip
  // start date when it's the first.
  const addRow = () => {
    const last = rows[rows.length - 1];
    const date = last?.date ? addDays(last.date, 1) : startDate;
    onChange([...rows, { date, title: "", desc: "" }]);
  };

  return (
    <div>
      <input type="hidden" name="days" value={JSON.stringify(rows)} />
      <div className="space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-ink-200 bg-ink-50/40 p-4">
            <div className="flex items-center justify-between">
              <p className="font-heading text-lg font-extrabold text-brand-600">Day {index + 1}</p>
              <button
                type="button"
                onClick={() => onChange(rows.filter((_, i) => i !== index))}
                aria-label={`Remove day ${index + 1}`}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  value={row.date}
                  onChange={(e) => update(index, "date", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Day title</label>
                <input
                  type="text"
                  value={row.title}
                  onChange={(e) => update(index, "title", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className={labelClass}>Description</label>
              <textarea
                rows={5}
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
        onClick={addRow}
        className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        <Plus className="h-4 w-4" />
        Add Day
      </button>
    </div>
  );
}
