export default function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-ink-500">{label}</p>
      <p className={`mt-2 font-heading text-3xl font-extrabold ${accent ? "text-brand-600" : "text-ink-900"}`}>
        {value}
      </p>
    </div>
  );
}
