import Image from "next/image";
import Link from "next/link";
import { BedDouble, Camera, Car, Plane, Star, Utensils } from "lucide-react";
import type { Inclusion, TourPackage } from "@/data/packages";

const inclusionIcons: Record<Inclusion, typeof Plane> = {
  flight: Plane,
  hotel: BedDouble,
  meals: Utensils,
  transfer: Car,
  sightseeing: Camera,
};

export default function PackageCard({ pkg }: { pkg: TourPackage }) {
  const discount = Math.round(
    ((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100
  );

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition-shadow hover:shadow-soft">
      <Link href={`/packages/${pkg.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.title}
          fill
          quality={85}
          sizes="(max-width: 640px) 90vw, (max-width: 1280px) 45vw, (max-width: 1600px) 30vw, 22vw"
          className="object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {pkg.badge ? (
            <span className="rounded-full bg-brand-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow-brand">
              {pkg.badge}
            </span>
          ) : (
            <span />
          )}
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-emerald-600 shadow">
            {discount}% OFF
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5 3xl:p-6">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/packages/${pkg.id}`}>
            <h3 className="font-heading text-lg font-bold text-ink-900 transition hover:text-brand-600 3xl:text-xl">
              {pkg.title}
            </h3>
          </Link>
          <span className="flex shrink-0 items-center gap-1 text-xs 3xl:text-sm">
            <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
            <span className="font-bold text-ink-900">{pkg.rating}</span>
            <span className="text-ink-900">({pkg.reviews.toLocaleString("en-IN")})</span>
          </span>
        </div>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-brand-500 3xl:text-sm">
          {pkg.destination}
        </p>
        <p className="mt-1 text-sm text-ink-900 3xl:text-base">{pkg.duration}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {pkg.inclusions.map((inc) => {
            const Icon = inclusionIcons[inc];
            return (
              <span
                key={inc}
                className="grid h-8 w-8 place-items-center rounded-full bg-ink-50 text-ink-900"
                title={inc}
              >
                <Icon className="h-4 w-4" />
              </span>
            );
          })}
        </div>

        <div className="mt-5 flex flex-1 items-end justify-between border-t border-ink-100 pt-4">
          <div>
            <p className="text-[11px] text-ink-900 line-through 3xl:text-xs">
              ₹{pkg.originalPrice.toLocaleString("en-IN")}
            </p>
            <p className="font-heading text-xl font-bold text-ink-900 3xl:text-2xl">
              ₹{pkg.price.toLocaleString("en-IN")}
              <span className="ml-1 text-xs font-normal text-ink-900 3xl:text-sm">/person</span>
            </p>
          </div>
          <Link
            href={`/packages/${pkg.id}`}
            className="rounded-full bg-ink-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-brand-600 3xl:px-5 3xl:py-3 3xl:text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
