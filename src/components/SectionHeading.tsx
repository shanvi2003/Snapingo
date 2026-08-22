"use client";

import { motion } from "framer-motion";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      {eyebrow && (
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className={`${eyebrow ? "mt-4" : ""} font-heading text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl`}>
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-base text-ink-900 sm:text-lg lg:text-xl">{subtitle}</p>
      )}
    </motion.div>
  );
}
