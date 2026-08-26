"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Breadcrumb, { type BreadcrumbItem } from "@/components/Breadcrumb";
import TileRevealImage from "@/components/TileRevealImage";

export type DetailHeroMeta = {
  icon: ReactNode;
  label: string;
};

export default function DetailHero({
  image,
  title,
  subtitle,
  meta = [],
  breadcrumb,
  animateImage = false,
}: {
  image: string;
  title: string;
  subtitle?: string;
  meta?: DetailHeroMeta[];
  breadcrumb: BreadcrumbItem[];
  animateImage?: boolean;
}) {
  const isLongTitle = title.length > 45;

  return (
    <section className="print-plain-hero relative flex h-[calc(35vh+4.5rem)] min-h-[340px] items-end overflow-hidden bg-ink-950 lg:h-[70vh] lg:min-h-[420px]">
      <div className="print-hide contents">
        {animateImage ? (
          <TileRevealImage src={image} alt={title} priority />
        ) : (
          <Image
            src={image}
            alt={title}
            fill
            loading="eager"
            fetchPriority="high"
            quality={85}
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/20" />
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-30" />
      </div>

      <div className="container-app relative pb-10 pt-28 lg:pb-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="print-show-opaque"
        >
          <Breadcrumb items={breadcrumb} light />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={
            isLongTitle
              ? "print-show-opaque mt-2 max-w-3xl font-heading text-2xl font-bold leading-[1.15] text-white sm:text-3xl md:text-4xl lg:text-5xl 3xl:max-w-4xl 3xl:text-6xl"
              : "print-show-opaque mt-2 max-w-3xl font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl 3xl:max-w-4xl 3xl:text-8xl"
          }
        >
          {title}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.26 }}
            className="print-show-opaque mt-4 max-w-xl text-base text-white sm:text-lg"
          >
            {subtitle}
          </motion.p>
        )}

        {meta.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34 }}
            className="print-show-opaque mt-7 hidden flex-wrap gap-3 sm:flex"
          >
            {meta.map((m) => (
              <span
                key={m.label}
                className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
              >
                <span className="text-brand-300 [&>svg]:h-4 [&>svg]:w-4">{m.icon}</span>
                {m.label}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
