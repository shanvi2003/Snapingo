import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import type { TourPackage } from "@/data/packages";

export default function PackagePillRow({ pkg }: { pkg: TourPackage }) {
  return (
    <Link
      href={`/packages/${pkg.id}`}
      className="flex flex-col gap-4 rounded-lg border border-ink-100 bg-white px-5 py-4 shadow-sm lg:flex-row lg:items-center lg:gap-6"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {pkg.badge && (
            <span className="shrink-0 rounded bg-brand-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-600">
              {pkg.badge}
            </span>
          )}
          <h3 className="truncate font-heading text-base font-bold text-brand-600">{pkg.title}</h3>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-900">
          <span className="truncate">{pkg.destination}</span>
          <span className="text-ink-300">&bull;</span>
          <span className="shrink-0">{pkg.duration}</span>
          <span className="text-ink-300">&bull;</span>
          <span className="flex shrink-0 items-center gap-1">
            <Star className="h-3 w-3 fill-gold-500 text-gold-500" />
            {pkg.rating} ({pkg.reviews.toLocaleString("en-IN")})
          </span>
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 lg:justify-end">
        <div className="text-right">
          <p className="font-heading text-lg font-bold text-ink-900">
            ₹{pkg.price.toLocaleString("en-IN")}
            <span className="ml-1 text-xs font-normal text-ink-900">/person</span>
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-lg bg-ink-900 px-4 py-2.5 text-xs font-semibold text-white">
          View Details
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
