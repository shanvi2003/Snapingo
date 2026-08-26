"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { hotDealsLink } from "@/data/site";

const slides = [
  {
    image: "/images/unsplash/1573843981267-be1999ff37cd.jpg",
    place: "Maldives",
  },
  {
    image: "/images/unsplash/1533105079780-92b9be482077.jpg",
    place: "Santorini, Greece",
  },
  {
    image: "/images/unsplash/1602216056096-3b40cc0c9944.jpg",
    place: "Kerala, India",
  },
  {
    image: "/images/unsplash/1626621341517-bbf3d9990a23.jpg",
    place: "Himachal Pradesh, India",
  },
];

// Runs on the client only - see the effect below for why.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Hero() {
  const [active, setActive] = useState(0);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  // The two heading lines must never wrap to a 3rd line at any screen size.
  // Tailwind breakpoint classes alone can't guarantee that (the container's
  // real width vs. this exact string's rendered width isn't knowable ahead
  // of time), so this measures each line's actual rendered width against
  // the heading's actual available width and shrinks the font just enough
  // to make it fit - a hard guarantee instead of a size estimate.
  useIsomorphicLayoutEffect(() => {
    const container = headingRef.current;
    const lines = [line1Ref.current, line2Ref.current];
    if (!container) return;

    const fit = () => {
      const availableWidth = container.clientWidth;
      if (availableWidth <= 0) return;
      for (const el of lines) {
        if (!el) continue;
        el.style.fontSize = "";
        const natural = el.scrollWidth;
        if (natural > availableWidth) {
          const currentSize = parseFloat(getComputedStyle(el).fontSize);
          el.style.fontSize = `${(currentSize * availableWidth) / natural}px`;
        }
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(container);
    document.fonts?.ready.then(fit);
    return () => ro.disconnect();
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-ink-950">
      {/* top-18 keeps the image clear of the transparent, overlaid h-18
          navbar on mobile AND tablet (both use the hamburger nav up to
          lg) instead of rendering faded behind its blur - desktop (lg+,
          where the full nav takes over) keeps the original full-bleed
          inset-0. */}
      <div className="absolute inset-x-0 bottom-0 top-18 isolate lg:top-0">
        {slides.map((slide, i) => (
          <motion.div
            key={slide.place}
            initial={false}
            animate={{ opacity: active === i ? 1 : 0, scale: active === i ? 1 : 1.08 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            style={{ zIndex: active === i ? 1 : 0 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt={slide.place}
              fill
              loading={i === 0 ? "eager" : undefined}
              fetchPriority={i === 0 ? "high" : undefined}
              quality={85}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink-950 via-ink-950/90 to-ink-950/55 lg:via-ink-950/60 lg:to-ink-950/20" />
      </div>

      {/* Mobile & tablet only (both use the hamburger nav, which no longer
          carries this): the hamburger menu no longer has a Hot Deals
          link, so it lives here on the homepage hero instead - desktop
          (lg+) still has its own copy in the navbar. z-30 (above the
          z-20 text block below) so that block's empty top space - which
          still hit-tests for clicks even though it's visually blank -
          can't swallow taps meant for this button. */}
      <Link
        href={hotDealsLink.href}
        className="absolute right-4 top-20 z-30 flex items-center gap-1.5 rounded-full bg-brand-600 px-3.5 py-2 font-heading text-xs font-bold text-white shadow-lg animate-hot-deal-pulse lg:hidden"
      >
        <Flame className="h-3.5 w-3.5" />
        {hotDealsLink.label}
      </Link>

      {/* pt-24 clears the h-18 (72px) navbar that's absolutely overlaid on
          top of this section on mobile & tablet - going shorter lets the
          heading collide with it. Desktop (lg+) switches to the full,
          full-height hero. */}
      <div className="container-app relative z-20 flex min-h-[calc(35vh+4.5rem)] flex-col justify-end pb-6 pt-24 lg:min-h-screen lg:pb-24 lg:pt-32">
        <motion.h1
          ref={headingRef}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl font-heading font-bold leading-[1.05] text-white 3xl:max-w-4xl"
        >
          <span
            ref={line1Ref}
            className="block whitespace-nowrap text-3xl sm:text-4xl md:text-5xl lg:text-6xl 3xl:text-7xl"
          >
            Your whole trip,
          </span>
          <span
            ref={line2Ref}
            className="block whitespace-nowrap text-gradient-brand text-3xl sm:text-4xl md:text-5xl lg:text-6xl 3xl:text-7xl"
          >
            packed into one snap.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 hidden max-w-xl text-base text-white sm:block sm:text-lg lg:text-xl 3xl:max-w-2xl 3xl:text-2xl"
        >
          Flights, stays, transfers & sightseeing, bundled into one package,
          for destinations across India and the world.
        </motion.p>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 right-6 z-10 hidden gap-2 sm:flex">
        {slides.map((s, i) => (
          <button
            key={s.place}
            aria-label={`Show ${s.place}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-8 bg-brand-400" : "w-4 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
