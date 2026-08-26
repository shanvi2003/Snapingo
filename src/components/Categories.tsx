"use client";

import Image from "next/image";
import { BedDouble, Car, Heart, Package, Plane, Users, type LucideIcon } from "lucide-react";
import type { ServiceCategoryContent } from "@/lib/content/homepage";
import SectionHeading from "@/components/SectionHeading";
import { useRevealOnView } from "@/hooks/useRevealOnView";

const icons: Record<string, LucideIcon> = {
  Plane,
  BedDouble,
  Package,
  Heart,
  Users,
  Car,
};

const themes = [
  { blob: "bg-brand-400/30" },
  { blob: "bg-gold-500/30" },
  { blob: "bg-brand-300/30" },
  { blob: "bg-gold-400/25" },
  { blob: "bg-brand-400/25" },
  { blob: "bg-gold-500/25" },
];

export default function Categories({ categories }: { categories: ServiceCategoryContent[] }) {
  return (
    <section className="bg-white pb-8 pt-10 sm:pb-10 sm:pt-12 lg:pt-24">
      <div className="container-app">
        <SectionHeading
          title="One booking, every part of your trip"
          subtitle="Snapingo bundles flights, stay, transfers & experiences so you never juggle separate bookings to plan a trip."
        />

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat, i) => (
            <CategoryTile key={cat.label} category={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ category: cat, index: i }: { category: ServiceCategoryContent; index: number }) {
  const Icon = icons[cat.icon];
  const theme = themes[i % themes.length];
  const { ref, style } = useRevealOnView<HTMLDivElement>({ y: 20, duration: 0.5, delay: i * 0.06, margin: "-60px" });

  return (
    <div
      ref={ref}
      style={style}
      className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg lg:[&:nth-child(even)]:mt-5"
    >
      <Image
        src={cat.image}
        alt={cat.label}
        fill
        quality={85}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        className="object-cover transition duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent" />
      <span
        aria-hidden
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 animate-blob rounded-full blur-2xl transition-transform duration-700 group-hover:scale-125 ${theme.blob}`}
      />

      <div className="relative flex h-full flex-col justify-between p-4 sm:p-5 3xl:p-7">
        <span className="grid h-11 w-11 place-items-center text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-out group-hover:-rotate-6 group-hover:scale-110 sm:h-12 sm:w-12 3xl:h-14 3xl:w-14">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6 3xl:h-7 3xl:w-7" />
        </span>

        <div>
          <h3 className="font-heading text-sm font-bold text-white sm:text-base 3xl:text-xl">{cat.label}</h3>
          <p className="mt-1 text-[11px] leading-snug text-white/80 sm:text-xs 3xl:text-sm">{cat.desc}</p>
        </div>
      </div>
    </div>
  );
}
