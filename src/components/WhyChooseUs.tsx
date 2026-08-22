"use client";

import { motion } from "framer-motion";
import {
  Headset,
  MapPinned,
  PackageCheck,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { usps } from "@/data/site";

const icons: Record<string, LucideIcon> = {
  ShieldCheck,
  Headset,
  PackageCheck,
  MapPinned,
};

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-black py-20 sm:py-24">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-40" />

      <div className="container-app relative">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Travel planning, minus the chaos
          </h2>
          <p className="mt-3 text-base text-white sm:text-lg">
            We do the running around (flights, hotels, cabs, and permits) so
            your itinerary just works.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {usps.map((u, i) => {
            const Icon = icons[u.icon];
            return (
              <motion.div
                key={u.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-brand-400/50 hover:bg-white/[0.08]"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-brand">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-heading text-lg font-bold text-white">
                  {u.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white">
                  {u.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
