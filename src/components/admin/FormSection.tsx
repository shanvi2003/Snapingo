/**
 * One card per group of related fields, shared by the admin's long forms
 * (packages, destinations, customized packages) so they read alike: a form
 * scans as a few labelled blocks instead of one wall of inputs.
 */
export default function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div className="border-b border-ink-100 pb-3">
        <h2 className="font-heading text-xl font-extrabold text-ink-900">{title}</h2>
        {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
