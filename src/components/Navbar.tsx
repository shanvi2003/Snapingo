"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Flame, Menu, X } from "lucide-react";
import { hotDealsLink, navLinks } from "@/data/site";
import NavMegaMenu from "@/components/NavMegaMenu";
import type { Destination } from "@/data/destinations";
import type { Service } from "@/data/services";
import { useScrollLock } from "@/hooks/useScrollLock";

const menuLinks = ["Domestic", "International", "Packages", "Services"];

export default function Navbar({
  destinations,
  services,
}: {
  destinations: Destination[];
  services: Service[];
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const onHotDeals = pathname === hotDealsLink.href;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // body-only locking left <html> as its own independently-scrollable
  // container (globals.css gives both overflow-x:hidden, which per spec
  // forces overflow-y:auto on each), so the page kept scrolling behind
  // the open mobile menu - this hook locks both.
  useScrollLock(open);

  const openMenu = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setHoveredLink(label);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setHoveredLink(null), 180);
  };

  const solid = !isHome || scrolled || open || Boolean(hoveredLink);

  return (
    <header
      onMouseLeave={scheduleClose}
      className={`print-hide inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "fixed" : "absolute"
      } ${
        solid
          ? "border-b border-ink-100 bg-white/90 backdrop-blur-lg shadow-sm"
          : "border-b border-white/20 bg-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      }`}
    >
      {/* Tap-outside-to-close for the mobile/tablet dropdown. `fixed`
          elements always get their own stacking layer above plain in-flow
          content regardless of DOM order or z-index:auto, so this needs an
          explicit z-index - and nav/the dropdown panel below need a higher
          one, or this backdrop paints over them instead of behind them. */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          className="fixed inset-0 z-10 bg-ink-950/25 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <nav className="relative z-20 flex h-18 w-full items-center justify-between py-3 pl-4 pr-4 sm:pl-6 sm:pr-6 xl:pl-8 xl:pr-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="relative block h-11 w-11">
            <Image
              src="/snapingo-icon.png"
              alt="Snapingo"
              fill
              sizes="44px"
              className="object-contain"
              unoptimized
              loading="eager"
              fetchPriority="high"
            />
          </span>
          <span
            className={`font-heading text-2xl font-extrabold tracking-tight transition-colors ${
              solid ? "text-ink-900" : "text-white"
            }`}
          >
            Snapingo
          </span>
        </Link>

        <div className="hidden items-center gap-3 lg:flex xl:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onMouseEnter={() => {
                if (menuLinks.includes(link.label)) openMenu(link.label);
                else scheduleClose();
              }}
              onMouseLeave={() => {
                if (menuLinks.includes(link.label)) scheduleClose();
              }}
              onClick={() => setHoveredLink(null)}
              className={`group relative flex items-center gap-1 py-1 font-heading text-sm font-bold tracking-normal transition-colors duration-300 xl:text-lg xl:tracking-wide ${
                hoveredLink === link.label
                  ? "text-brand-700"
                  : solid
                    ? "text-brand-700 hover:text-brand-800"
                    : "text-white hover:text-brand-600"
              }`}
            >
              {link.label}
              {menuLinks.includes(link.label) && (
                <ChevronDown
                  aria-hidden
                  className={`h-3.5 w-3.5 transition-transform duration-300 xl:h-4 xl:w-4 ${
                    hoveredLink === link.label ? "rotate-180" : ""
                  }`}
                />
              )}
              <span
                aria-hidden
                className={`absolute -bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full transition-all duration-300 ease-out group-hover:w-full ${
                  hoveredLink === link.label ? "w-full" : "w-0"
                } ${solid ? "bg-brand-700" : "bg-brand-600 shadow-[0_0_8px_rgba(236,18,120,0.6)]"}`}
              />
            </Link>
          ))}

          <Link
            href={hotDealsLink.href}
            onClick={() => setHoveredLink(null)}
            className="group flex items-center transition hover:-translate-y-0.5"
          >
            <span
              className={`flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 font-heading text-sm font-bold text-white xl:gap-2 xl:px-6 xl:py-3 xl:text-base ${
                onHotDeals ? "" : "animate-hot-deal-pulse group-hover:[animation-play-state:paused] group-hover:opacity-100!"
              }`}
            >
              <Flame className="h-4 w-4 xl:h-5 xl:w-5" />
              {hotDealsLink.label}
            </span>
          </Link>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className={`grid h-10 w-10 place-items-center rounded-full transition-colors lg:hidden ${
            solid ? "text-ink-800 hover:bg-ink-100" : "text-white hover:bg-white/10"
          }`}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {hoveredLink && (
          <motion.div
            key="mega-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none fixed inset-x-0 bottom-0 top-18 hidden bg-ink-950/25 backdrop-blur-[2px] lg:block"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hoveredLink && (
          <motion.div
            key="mega-panel"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => hoveredLink && openMenu(hoveredLink)}
            onMouseLeave={scheduleClose}
            className="absolute inset-x-0 top-full hidden border-t border-ink-100 bg-white shadow-2xl lg:block"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={hoveredLink}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <NavMegaMenu
                  activeLink={hoveredLink}
                  onNavigate={() => setHoveredLink(null)}
                  destinations={destinations}
                  services={services}
                />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="relative z-20 overflow-hidden border-t border-ink-100 bg-white lg:hidden"
          >
            <div className="container-app flex flex-col gap-1 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 font-heading text-lg font-bold tracking-wide text-brand-700 transition hover:bg-brand-50 hover:text-brand-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
