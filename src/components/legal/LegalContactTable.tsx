import type { ReactNode } from "react";

export default function LegalContactTable({
  rows,
}: {
  rows: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-100">
      <dl className="divide-y divide-ink-100">
        {rows.map((r) => (
          <div
            key={r.label}
            className="grid grid-cols-1 gap-1 bg-white p-4 sm:grid-cols-[220px_1fr] sm:gap-4 sm:p-5"
          >
            <dt className="text-sm font-bold text-ink-900">{r.label}</dt>
            <dd className="text-sm text-ink-900">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
