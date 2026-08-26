"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TourPackage } from "@/data/packages";
import PackageCard from "@/components/PackageCard";
import SectionHeading from "@/components/SectionHeading";

export default function Packages({ featuredPackages }: { featuredPackages: TourPackage[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: "start", loop: true, dragFree: true },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    queueMicrotask(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section id="packages" className="scroll-mt-24 bg-white pb-20 pt-8 sm:pb-24 sm:pt-10">
      <div className="container-app">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            title="Featured holiday packages"
            subtitle="All-inclusive itineraries: flights, stay, meals & transfers bundled at one transparent price."
          />
          <div className="flex shrink-0 self-end gap-2">
            <button
              aria-label="Previous package"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 text-ink-900 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <button
              aria-label="Next package"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              className="grid h-11 w-11 place-items-center rounded-full border border-ink-200 text-ink-900 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30"
            >
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div className="mt-12 overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex">
            {featuredPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="min-w-0 shrink-0 grow-0 basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <PackageCard pkg={pkg} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
