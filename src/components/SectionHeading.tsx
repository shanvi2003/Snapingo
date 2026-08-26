"use client";

import { useRevealOnView } from "@/hooks/useRevealOnView";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
}) {
  const { ref, style } = useRevealOnView<HTMLDivElement>({ y: 24, duration: 0.6, margin: "-80px" });

  return (
    <div
      ref={ref}
      style={style}
      className={align === "center" ? "mx-auto max-w-2xl text-center 3xl:max-w-3xl" : "max-w-2xl 3xl:max-w-3xl"}
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600 3xl:text-sm">
          {eyebrow}
        </p>
      )}
      <h2 className={`${eyebrow ? "mt-4" : ""} font-heading text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl 3xl:text-6xl`}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-ink-900 sm:text-lg lg:text-xl 3xl:text-2xl">{subtitle}</p>
      )}
    </div>
  );
}
