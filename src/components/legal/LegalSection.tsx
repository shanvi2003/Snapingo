import type { ReactNode } from "react";

export default function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-ink-100 py-8 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-2.5 font-heading text-xl font-bold text-ink-900 sm:text-2xl">
        <span className="text-brand-500">{number}.</span>
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-900">{children}</div>
    </section>
  );
}
