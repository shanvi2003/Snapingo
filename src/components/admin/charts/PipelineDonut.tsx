"use client";

import Link from "next/link";
import { useState } from "react";

export type PipelineSlice = { status: string; label: string; count: number; color: string };

const SIZE = 168;
const STROKE = 22;
// A hovered slice thickens by HOVER_GROW; the radius leaves room for that so
// the ring's outer edge isn't clipped flat by the SVG box.
const HOVER_GROW = 4;
const R = (SIZE - STROKE - HOVER_GROW) / 2;
const CIRC = 2 * Math.PI * R;
// Surface-coloured gap between slices so neighbours never touch.
const GAP = 2;

export default function PipelineDonut({ slices, total, basePath }: { slices: PipelineSlice[]; total: number; basePath: string }) {
  const [active, setActive] = useState<string | null>(null);
  const visible = slices.filter((s) => s.count > 0);
  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);
  const focused = slices.find((s) => s.status === active);

  const arcs = visible.map((s, i) => {
    const offset = visible.slice(0, i).reduce((sum, prev) => sum + (prev.count / total) * CIRC, 0);
    const len = (s.count / total) * CIRC;
    return { ...s, dash: Math.max(len - (visible.length > 1 ? GAP : 0), 0.5), offset };
  });

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90" role="img" aria-label="Leads by pipeline stage">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#f4ecf1" strokeWidth={STROKE} />
          {arcs.map((a) => (
            <circle
              key={a.status}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth={active === a.status && arcs.length > 1 ? STROKE + HOVER_GROW : STROKE}
              strokeDasharray={`${a.dash} ${CIRC - a.dash}`}
              strokeDashoffset={-a.offset}
              opacity={active && active !== a.status ? 0.3 : 1}
              className="cursor-pointer transition-[opacity,stroke-width]"
              onMouseEnter={() => setActive(a.status)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-heading text-2xl font-bold tabular-nums text-ink-900">
            {focused ? focused.count : total}
          </span>
          <span className="text-xs text-ink-500">{focused ? `${focused.label} · ${pct(focused.count)}%` : "total leads"}</span>
        </div>
      </div>

      <ul className="grid w-full grid-cols-2 gap-x-3 gap-y-0.5">
        {slices.map((s) => (
          <li key={s.status}>
            <Link
              href={`${basePath}?status=${s.status}`}
              onMouseEnter={() => setActive(s.status)}
              onMouseLeave={() => setActive(null)}
              className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                active === s.status ? "bg-ink-50" : "hover:bg-ink-50"
              }`}
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
              <span className="whitespace-nowrap text-ink-600">{s.label}</span>
              <span className="ml-auto font-medium tabular-nums text-ink-900">{s.count}</span>
              <span className="w-8 text-right text-xs tabular-nums text-ink-400">{pct(s.count)}%</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
