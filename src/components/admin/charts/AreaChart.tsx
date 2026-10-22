"use client";

import { useId, useState } from "react";
import {
  ChartTooltip,
  chartScale,
  EmptyOverlay,
  Gridlines,
  ScreenReaderTable,
  TONES,
  XAxis,
  YAxis,
  type ChartDatum,
  type ChartTone,
  type ChartUnit,
} from "@/components/admin/charts/shared";

export default function AreaChart({
  data,
  unit,
  metric,
  emptyText,
  labelEvery = 1,
  height = "h-52",
  tone = "emerald",
}: {
  data: ChartDatum[];
  unit: ChartUnit;
  /** Name of the measured value in the tooltip, e.g. "Revenue". */
  metric: string;
  /** Shown over an all-zero chart; omit to show the flat line alone. */
  emptyText?: string;
  /** Show every Nth axis label; the last point is always labelled. */
  labelEvery?: number;
  height?: string;
  tone?: ChartTone;
}) {
  const [active, setActive] = useState<number | null>(null);
  // useId output contains characters that aren't valid inside url(#...).
  const gradientId = `area-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { empty, top, ticks } = chartScale(data.map((d) => d.value), unit);
  const t = TONES[tone];

  // Points sit at column centres so they line up with the shared x-axis
  // labels. Coordinates are in a 0-100 box stretched to the plot; the line
  // keeps a constant 2px width via non-scaling-stroke.
  const pts = data.map((d, i) => ({ x: ((i + 0.5) / data.length) * 100, y: (d.value / top) * 100 }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${100 - p.y}`).join(" ");
  const area = pts.length ? `${line} L${pts[pts.length - 1].x},100 L${pts[0].x},100 Z` : "";
  const last = pts.length - 1;

  return (
    // relative: keeps the sr-only table inside the panel's scrolling <main>.
    <div className="relative">
      <div className={`relative flex ${height}`}>
        <YAxis ticks={ticks} top={top} unit={unit} />

        <div className="relative flex-1" onMouseLeave={() => setActive(null)}>
          <Gridlines ticks={ticks} top={top} />
          {empty && emptyText && <EmptyOverlay text={emptyText} />}

          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={t.hex} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={t.hex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <path d={area} fill={`url(#${gradientId})`} />
              <path
                d={line}
                fill="none"
                stroke={t.hex}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

          {/* Markers are HTML, not SVG, so they stay round on the stretched plot. */}
          {pts.map((p, i) => (
              <span
                key={data[i].key}
                className={`absolute -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-white transition-all ${
                  active === i || (active === null && i === last) ? `h-3 w-3 ${t.strong}` : `h-2 w-2 ${t.base}`
                }`}
                style={{ left: `${p.x}%`, bottom: `${p.y}%` }}
              />
            ))}

          {/* Full-height hit columns, wider than the marks. */}
          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div key={d.key} className="h-full flex-1" onMouseEnter={() => setActive(i)} />
            ))}
          </div>

          {active !== null && (
            <ChartTooltip
              datum={data[active]}
              metric={metric}
              swatch={t.strong}
              unit={unit}
              x={pts[active].x}
              y={pts[active].y}
              offset={14}
            />
          )}
        </div>
      </div>

      <XAxis data={data} labelEvery={labelEvery} />
      <ScreenReaderTable data={data} unit={unit} />
    </div>
  );
}
