"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { navLinks } from "@/data/site";
import NavMegaMenu from "@/components/NavMegaMenu";

const menuLinks = ["Domestic", "International", "Packages", "Services"];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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
      <nav className="flex h-18 w-full items-center justify-between py-3 pl-4 pr-4 sm:pl-6 sm:pr-6 lg:pl-8 lg:pr-8">
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

        <div className="hidden items-center gap-9 lg:flex">
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
              className={`group relative flex items-center gap-1 py-1 font-heading text-lg font-bold tracking-wide transition-colors duration-300 ${
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
                  className={`h-4 w-4 transition-transform duration-300 ${
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
                <NavMegaMenu activeLink={hoveredLink} onNavigate={() => setHoveredLink(null)} />
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
            className="overflow-hidden border-t border-ink-100 bg-white lg:hidden"
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
              <a
                href="tel:+918700368575"
                className="mt-2 flex items-center gap-2 rounded-lg px-3 py-3 text-base font-semibold text-ink-700"
              >
                <Phone className="h-4 w-4 text-brand-500" />
                +91 87003 68575
              </a>
              <Link
                href="/packages"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-brand-600 px-5 py-3 text-center text-base font-semibold text-white shadow-brand"
              >
                Plan My Trip
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
