"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Destination } from "@/data/destinations";
import type { Service } from "@/data/services";

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.03, delayChildren: 0.03 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
};

function NameTile({
  label,
  href,
  onNavigate,
}: {
  label: string;
  href: string;
  onNavigate: () => void;
}) {
  return (
    <motion.div variants={itemVariants}>
      <Link
        href={href}
        onClick={onNavigate}
        className="group relative flex overflow-hidden rounded-xl px-4 py-3 font-heading text-base font-bold text-ink-900 transition-all duration-300 hover:translate-x-1 hover:bg-brand-50 hover:text-brand-700"
      >
        {label}
        <span className="absolute inset-y-2 left-0 w-1 -translate-x-1 rounded-full bg-brand-500 transition-transform duration-300 ease-out group-hover:translate-x-0" />
      </Link>
    </motion.div>
  );
}

function Panel({
  title,
  description,
  items,
  ctaLabel,
  ctaHref,
  onNavigate,
}: {
  title: string;
  description: string;
  items: { label: string; href: string }[];
  ctaLabel: string;
  ctaHref: string;
  onNavigate: () => void;
}) {
  return (
    <div className="container-app grid grid-cols-[1fr_1.6fr] gap-10 py-8">
      <div>
        <h3 className="font-heading text-xl font-bold text-brand-700">{title}</h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-900">{description}</p>
        <Link
          href={ctaHref}
          onClick={onNavigate}
          className="group mt-5 inline-flex items-center gap-1.5 font-heading text-sm font-bold text-brand-600 transition hover:text-brand-700"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </Link>
      </div>
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-x-4 gap-y-1"
      >
        {items.map((item) => (
          <NameTile key={item.label} label={item.label} href={item.href} onNavigate={onNavigate} />
        ))}
      </motion.div>
    </div>
  );
}

export default function NavMegaMenu({
  activeLink,
  onNavigate,
  destinations,
  services,
}: {
  activeLink: string;
  onNavigate: () => void;
  destinations: Destination[];
  services: Service[];
}) {
  if (activeLink === "Domestic") {
    return (
      <Panel
        title="Popular Domestic Destinations"
        description="Handpicked domestic escapes, from Himalayan hill towns to tropical islands, all bundled into full packages."
        items={destinations.filter((d) => d.type === "domestic").map((d) => ({
          label: d.name,
          href: `/destinations/${d.slug}`,
        }))}
        ctaLabel="View all domestic packages"
        ctaHref="/destinations?type=domestic"
        onNavigate={onNavigate}
      />
    );
  }

  if (activeLink === "International") {
    return (
      <Panel
        title="Popular International Destinations"
        description="From island getaways to grand city tours, explore the world with all-inclusive Snapingo packages."
        items={destinations.filter((d) => d.type === "international").map((d) => ({
          label: d.name,
          href: `/destinations/${d.slug}`,
        }))}
        ctaLabel="View all international packages"
        ctaHref="/destinations?type=international"
        onNavigate={onNavigate}
      />
    );
  }

  if (activeLink === "Packages") {
    return (
      <Panel
        title="Explore Holiday Packages"
        description="All-inclusive itineraries: flights, stay, meals & transfers bundled at one transparent price."
        items={[
          { label: "Honeymoon Packages", href: "/packages?category=honeymoon" },
          { label: "Family Packages", href: "/packages?category=family" },
          { label: "Group Tours", href: "/packages?category=group" },
          { label: "Adventure Trips", href: "/packages?category=adventure" },
          { label: "Weekend Getaways", href: "/packages?category=weekend" },
          { label: "Solo Trip Packages", href: "/packages?category=solo" },
          { label: "Religious Tours", href: "/packages?category=religious" },
          { label: "Corporate Trips", href: "/packages?category=corporate" },
        ]}
        ctaLabel="View all featured packages"
        ctaHref="/packages"
        onNavigate={onNavigate}
      />
    );
  }

  if (activeLink === "Services") {
    return (
      <Panel
        title="Book More Than Just a Trip"
        description="Flights, hotels and cabs booked through our trusted partners, plus a self-guided way to plan the rest of your trip."
        items={services.map((s) => ({
          label: s.name,
          href: `/services/${s.slug}`,
        }))}
        ctaLabel="View all services"
        ctaHref="/services"
        onNavigate={onNavigate}
      />
    );
  }

  return null;
}
