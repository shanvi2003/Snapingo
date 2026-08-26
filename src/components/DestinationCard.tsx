"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import type { Destination } from "@/data/destinations";
import { useRevealOnView } from "@/hooks/useRevealOnView";

export default function DestinationCard({
  destination,
  index = 0,
}: {
  destination: Destination;
  index?: number;
}) {
  const { ref, style } = useRevealOnView<HTMLDivElement>({
    y: 24,
    duration: 0.45,
    delay: (index % 10) * 0.05,
    margin: "-40px",
  });

  return (
    <div ref={ref} style={style}>
      <Link
        href={`/destinations/${destination.slug}`}
        className="group relative block aspect-[3/4] overflow-hidden rounded-2xl shadow-sm"
      >
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          quality={85}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/10 to-transparent" />

        <div className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-ink-900 opacity-0 shadow transition-all duration-300 group-hover:opacity-100 group-hover:rotate-45">
          <ArrowUpRight className="h-4 w-4" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4 3xl:p-6">
          <p className="hidden items-center gap-1 text-[11px] font-medium text-white lg:flex 3xl:text-sm">
            <MapPin className="h-3 w-3 3xl:h-3.5 3xl:w-3.5" />
            {destination.packages} packages
          </p>
          <h3 className="font-heading text-lg font-bold text-white lg:mt-1 3xl:text-2xl">{destination.name}</h3>
          <p className="hidden text-xs text-white lg:block 3xl:text-sm">{destination.tagline}</p>
          <p className="hidden text-sm font-semibold text-brand-300 lg:mt-2 lg:block 3xl:text-base">
            From ₹{destination.startingPrice.toLocaleString("en-IN")}
          </p>
        </div>
      </Link>
    </div>
  );
}
