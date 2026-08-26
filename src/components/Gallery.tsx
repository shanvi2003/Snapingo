"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useRevealOnView } from "@/hooks/useRevealOnView";

export default function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );

  // body-only locking left <html> as its own independently-scrollable
  // container (globals.css gives both overflow-x:hidden, which per spec
  // forces overflow-y:auto on each), so the page kept scrolling behind
  // the open lightbox - this hook locks both.
  useScrollLock(openIndex !== null);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, close, prev, next]);

  return (
    <>
      <div className="grid h-[420px] grid-cols-2 grid-rows-3 gap-3 sm:h-[520px] sm:grid-cols-4 sm:grid-rows-2 sm:gap-4">
        {images.slice(0, 5).map((src, i) => (
          <GalleryThumb key={src + i} src={src} alt={alt} index={i} onOpen={() => setOpenIndex(i)} />
        ))}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-sm"
            onClick={close}
          >
            <button
              aria-label="Close gallery"
              onClick={close}
              className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              aria-label="Previous photo"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <motion.div
              key={openIndex}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="relative aspect-[4/3] w-full max-w-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[openIndex]}
                alt={`${alt} photo ${openIndex + 1}`}
                fill
                quality={85}
                sizes="90vw"
                className="rounded-2xl object-cover"
              />
            </motion.div>

            <button
              aria-label="Next photo"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-white">
              {openIndex + 1} / {images.length}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function GalleryThumb({
  src,
  alt,
  index,
  onOpen,
}: {
  src: string;
  alt: string;
  index: number;
  onOpen: () => void;
}) {
  const { ref, style } = useRevealOnView<HTMLButtonElement>({
    y: 16,
    duration: 0.5,
    delay: index * 0.06,
    margin: "-60px",
  });

  return (
    <button
      ref={ref}
      style={style}
      type="button"
      onClick={onOpen}
      className={`group relative overflow-hidden rounded-2xl ${
        index === 0 ? "col-span-2 row-span-1 sm:row-span-2" : "col-span-1 row-span-1"
      }`}
    >
      <Image
        src={src}
        alt={`${alt} photo ${index + 1}`}
        fill
        quality={85}
        sizes="(max-width: 640px) 50vw, 25vw"
        className="object-cover transition duration-700 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-ink-950/0 transition group-hover:bg-ink-950/25" />
      <span className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow transition group-hover:opacity-100">
        <Expand className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}
