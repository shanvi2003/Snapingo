"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&w=1920&q=90",
    place: "Maldives",
  },
  {
    image:
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1920&q=90",
    place: "Santorini, Greece",
  },
  {
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1920&q=90",
    place: "Kerala, India",
  },
  {
    image:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1920&q=90",
    place: "Himachal Pradesh, India",
  },
];

export default function Hero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((v) => (v + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" className="relative overflow-hidden bg-ink-950">
      <div className="absolute inset-0 isolate">
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
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-ink-950 via-ink-950/90 to-ink-950/55 sm:via-ink-950/60 sm:to-ink-950/20" />
      </div>

      <div className="container-app relative flex min-h-screen flex-col justify-end pb-28 pt-32 sm:pb-24">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl 3xl:max-w-4xl 3xl:text-8xl"
        >
          Your whole trip,{" "}
          <span className="text-gradient-brand">packed into one snap.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-5 max-w-xl text-base text-white sm:text-lg lg:text-xl 3xl:max-w-2xl 3xl:text-2xl"
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
