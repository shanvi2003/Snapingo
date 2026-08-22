import type { ReactNode } from "react";

export default function LegalCallout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
      {title && <p className="text-sm font-bold text-brand-700">{title}</p>}
      <div className={`space-y-3 text-[15px] leading-relaxed text-ink-900 ${title ? "mt-2.5" : ""}`}>
        {children}
      </div>
    </div>
  );
}
