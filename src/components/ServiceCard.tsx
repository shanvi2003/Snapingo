"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import type { Service } from "@/data/services";

export default function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 6) * 0.06 }}
    >
      <Link
        href={`/services/${service.slug}`}
        className="group relative block aspect-[4/3] overflow-hidden rounded-2xl shadow-sm"
      >
        <Image
          src={service.image}
          alt={service.name}
          fill
          quality={85}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/15 to-transparent" />

        <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow transition-all duration-300 group-hover:opacity-100 group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5">
          <h3 className="font-heading text-xl font-bold text-white">{service.name}</h3>
          <p className="mt-1 text-sm text-white">{service.tagline}</p>
        </div>
      </Link>
    </motion.div>
  );
}
