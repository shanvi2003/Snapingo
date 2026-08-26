"use client";

import {
  Headset,
  MapPinned,
  PackageCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { UspContent } from "@/lib/content/homepage";
import { useRevealOnView } from "@/hooks/useRevealOnView";

const icons: Record<string, LucideIcon> = {
  ShieldCheck,
  Headset,
  PackageCheck,
  MapPinned,
};

export default function WhyChooseUs({ items }: { items: UspContent[] }) {
  const { ref: headingRef, style: headingStyle } = useRevealOnView<HTMLDivElement>({
    y: 24,
    duration: 0.6,
    margin: "-80px",
  });

  return (
    <section className="relative overflow-hidden bg-black py-20 sm:py-24">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-40" />

      <div className="container-app relative">
        <div ref={headingRef} style={headingStyle} className="mx-auto max-w-2xl text-center 3xl:max-w-3xl">
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl 3xl:text-6xl">
            Travel planning, minus the chaos
          </h2>
          <p className="mt-3 text-base text-white sm:text-lg 3xl:text-2xl">
            We do the running around (flights, hotels, cabs, and permits) so
            your itinerary just works.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 3xl:gap-8">
          {items.map((u, i) => (
            <UspTile key={u.title} item={u} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function UspTile({ item: u, index: i }: { item: UspContent; index: number }) {
  const Icon = icons[u.icon];
  const { ref, style } = useRevealOnView<HTMLDivElement>({ y: 24, duration: 0.55, delay: i * 0.08, margin: "-60px" });

  return (
    <div
      ref={ref}
      style={style}
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-brand-400/50 hover:bg-white/[0.08] 3xl:p-8"
    >
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand 3xl:h-14 3xl:w-14">
        <Icon className="h-6 w-6 3xl:h-7 3xl:w-7" />
      </span>
      <h3 className="mt-5 font-heading text-lg font-bold text-white 3xl:text-xl">{u.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white 3xl:text-base">{u.desc}</p>
    </div>
  );
}
