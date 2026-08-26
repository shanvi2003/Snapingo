"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TourPackage } from "@/data/packages";
import PackageCard from "@/components/PackageCard";

export default function SimilarPackages({ packages: list }: { packages: TourPackage[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true });
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

  if (list.length === 0) return null;

  return (
    <section className="bg-ink-50/60 py-16 sm:py-20">
      <div className="container-app">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
              Similar packages
            </h2>
          </div>
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

        <div className="mt-10 overflow-hidden" ref={emblaRef}>
          <div className="-ml-4 flex">
            {list.map((pkg) => (
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
