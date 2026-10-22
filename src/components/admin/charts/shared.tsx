// Pieces shared by the dashboard's bar and area charts: the data shape,
// colour tones, value scales, the hover tooltip and the axis/table chrome.

export type ChartDatum = {
  key: string;
  /** Axis label under the point/bar. */
  label: string;
  /** Heading in the tooltip and the screen-reader table. */
  title: string;
  value: number;
  /** Optional extra row in the tooltip, e.g. { label: "Payments", value: "3" }. */
  detail?: { label: string; value: string };
};

export type ChartUnit = "inr" | "count";

// Full class names so Tailwind picks them up. "strong" marks the current
// period and the hovered mark; "faint" is everything else while hovering.
// `hex` feeds the SVG line/area, which can't take a class.
export const TONES = {
  emerald: { base: "bg-emerald-400", strong: "bg-emerald-600", faint: "bg-emerald-100", hex: "#059669" },
  violet: { base: "bg-violet-400", strong: "bg-violet-600", faint: "bg-violet-100", hex: "#7c3aed" },
} as const;
export type ChartTone = keyof typeof TONES;

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// Axis labels in lakh/thousand, the way the team reads money day to day.
function compactInr(n: number) {
  if (n >= 1_00_00_000) return `₹${+(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${+(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000) return `₹${+(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

const formatValue = (unit: ChartUnit) => (unit === "inr" ? inr : (n: number) => n.toLocaleString("en-IN"));
const formatAxis = (unit: ChartUnit) => (unit === "inr" ? compactInr : (n: number) => n.toLocaleString("en-IN"));

// Rounds the top of the scale up to 1/2/2.5/5 x 10^n so gridlines land on
// readable numbers instead of whatever the biggest value happened to be.
// Counts never get a fractional half-way gridline.
function niceMax(max: number, unit: ChartUnit) {
  if (max <= 0) return 0;
  if (unit === "count" && max <= 4) return max % 2 ? max + 1 : max;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= max)!;
  const top = step * pow;
  return unit === "count" && top % 2 ? top * 2 : top;
}

const TOOLTIP_HALF_WIDTH = "4.75rem";

/**
 * Card that sits just above the hovered mark. The card is clamped inside the
 * plot while its pointer stays on the mark itself. `x` and `y` are percentages
 * of the plot's width and height (y from the bottom).
 */
export function ChartTooltip({
  datum,
  metric,
  swatch,
  unit,
  x,
  y,
  offset = 10,
}: {
  datum: ChartDatum;
  metric: string;
  swatch: string;
  unit: ChartUnit;
  x: number;
  y: number;
  offset?: number;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 z-10" style={{ bottom: `calc(${y}% + ${offset}px)` }}>
      <div
        className="absolute bottom-0 w-38 -translate-x-1/2 rounded-lg border border-ink-200 bg-white text-xs"
        style={{ left: `clamp(${TOOLTIP_HALF_WIDTH}, ${x}%, calc(100% - ${TOOLTIP_HALF_WIDTH}))` }}
      >
        <p className="border-b border-ink-100 px-3 py-1.5 font-medium text-ink-500">{datum.title}</p>
        <div className="space-y-1 px-3 py-2">
          <p className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-sm ${swatch}`} />
            <span className="text-ink-500">{metric}</span>
            <span className="ml-auto font-semibold tabular-nums text-ink-900">{formatValue(unit)(datum.value)}</span>
          </p>
          {datum.detail && (
            <p className="flex items-center gap-2 pl-4">
              <span className="text-ink-500">{datum.detail.label}</span>
              <span className="ml-auto tabular-nums text-ink-700">{datum.detail.value}</span>
            </p>
          )}
        </div>
      </div>
      <span
        className="absolute -bottom-[5px] h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-b border-r border-ink-200 bg-white"
        style={{ left: `${x}%` }}
      />
    </div>
  );
}

/**
 * Scale for the plot. With no data yet the axes still render against a
 * placeholder top, so staff see the months/days and units the chart will fill.
 */
export function chartScale(values: number[], unit: ChartUnit) {
  const top = niceMax(Math.max(0, ...values), unit);
  const empty = top === 0;
  const scaleTop = empty ? (unit === "inr" ? 1_00_000 : 10) : top;
  return { empty, top: scaleTop, ticks: [scaleTop, scaleTop / 2, 0] };
}

/** Message laid over an empty plot, between its gridlines. */
export function EmptyOverlay({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <p className="rounded-md border border-ink-100 bg-white px-3 py-1.5 text-xs text-ink-400">{text}</p>
    </div>
  );
}

/** Y-axis labels for a plot of height `top`. */
export function YAxis({ ticks, top, unit }: { ticks: number[]; top: number; unit: ChartUnit }) {
  return (
    <div className="relative w-12 shrink-0 text-[11px] tabular-nums text-ink-400">
      {ticks.map((t) => (
        <span key={t} className="absolute right-2 -translate-y-1/2" style={{ top: `${(1 - t / top) * 100}%` }}>
          {formatAxis(unit)(t)}
        </span>
      ))}
    </div>
  );
}

export function Gridlines({ ticks, top }: { ticks: number[]; top: number }) {
  return (
    <>
      {ticks.map((t) => (
        <div
          key={t}
          className={`absolute inset-x-0 border-t ${t === 0 ? "border-ink-200" : "border-dashed border-ink-100"}`}
          style={{ top: `${(1 - t / top) * 100}%` }}
        />
      ))}
    </>
  );
}

/** X-axis labels centred under each column; every Nth, and always the last. */
export function XAxis({ data, labelEvery }: { data: ChartDatum[]; labelEvery: number }) {
  const last = data.length - 1;
  return (
    <div className="ml-12 mt-1.5 flex text-[11px] whitespace-nowrap text-ink-400">
      {data.map((d, i) => {
        const show = i === last || (i % labelEvery === 0 && last - i >= labelEvery / 2);
        return (
          <span key={d.key} className="relative flex-1">
            {show && <span className="absolute left-1/2 -translate-x-1/2">{d.label}</span>}
          </span>
        );
      })}
    </div>
  );
}

export function ScreenReaderTable({ data, unit }: { data: ChartDatum[]; unit: ChartUnit }) {
  // sr-only goes on a wrapping div, not the table: a table ignores the 1px
  // height, so its full row height would still stretch the scroll area and
  // leave a long blank gap under the dashboard.
  return (
    <div className="sr-only">
      <table>
        <tbody>
          {data.map((d) => (
            <tr key={d.key}>
              <td>{d.title}</td>
              <td>{formatValue(unit)(d.value)}</td>
              {d.detail && <td>{`${d.detail.label}: ${d.detail.value}`}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
