"use client";

import { useState } from "react";
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

export default function BarChart({
  data,
  unit,
  metric,
  emptyText,
  labelEvery = 1,
  emphasizeLast = false,
  height = "h-44",
  tone = "emerald",
}: {
  data: ChartDatum[];
  unit: ChartUnit;
  /** Name of the measured value in the tooltip, e.g. "Leads". */
  metric: string;
  emptyText: string;
  /** Show every Nth axis label; the last bar is always labelled. */
  labelEvery?: number;
  /** Draw the final bar (today / this month) darker than the rest. */
  emphasizeLast?: boolean;
  height?: string;
  tone?: ChartTone;
}) {
  const [active, setActive] = useState<number | null>(null);
  const { empty, top, ticks } = chartScale(data.map((d) => d.value), unit);
  const last = data.length - 1;
  const t = TONES[tone];

  const barColor = (i: number) => {
    if (active !== null) return active === i ? t.strong : t.faint;
    if (emphasizeLast) return i === last ? t.strong : t.base;
    return t.base;
  };

  return (
    // relative: the sr-only table below is absolutely positioned, and without a
    // positioned ancestor it escapes the panel's scrolling <main> and makes the
    // whole page scroll, sidebar included.
    <div className="relative">
      <div className={`relative flex ${height}`}>
        <YAxis ticks={ticks} top={top} unit={unit} />

        <div className="relative flex-1" onMouseLeave={() => setActive(null)}>
          <Gridlines ticks={ticks} top={top} />
          {empty && <EmptyOverlay text={emptyText} />}

          <div className="absolute inset-0 flex">
            {data.map((d, i) => (
              <div
                key={d.key}
                className={`flex h-full flex-1 items-end justify-center rounded-t-md ${active === i ? "bg-ink-50" : ""} ${
                  data.length > 20 ? "px-px" : "px-[3px] sm:px-1.5"
                }`}
                onMouseEnter={() => setActive(i)}
              >
                {d.value > 0 && (
                  <div
                    className={`w-full max-w-7 rounded-t-[3px] transition-colors ${barColor(i)}`}
                    style={{ height: `${(d.value / top) * 100}%` }}
                  />
                )}
              </div>
            ))}
          </div>

          {active !== null && (
            <ChartTooltip
              datum={data[active]}
              metric={metric}
              swatch={t.strong}
              unit={unit}
              x={((active + 0.5) / data.length) * 100}
              y={(data[active].value / top) * 100}
            />
          )}
        </div>
      </div>

      <XAxis data={data} labelEvery={labelEvery} />
      <ScreenReaderTable data={data} unit={unit} />
    </div>
  );
}
