import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BedDouble,
  Calendar,
  Camera,
  Car,
  Check,
  MapPin,
  Plane,
  Star,
  Utensils,
  X,
} from "lucide-react";
import { allPackages, getPackageById, type Inclusion } from "@/data/packages";
import DetailHero from "@/components/DetailHero";
import ItineraryPrintView from "@/components/ItineraryPrintView";
import ItineraryTimeline from "@/components/ItineraryTimeline";
import StickyBookingCard from "@/components/StickyBookingCard";
import SimilarPackages from "@/components/SimilarPackages";

const inclusionIcons: Record<Inclusion, typeof Plane> = {
  flight: Plane,
  hotel: BedDouble,
  meals: Utensils,
  transfer: Car,
  sightseeing: Camera,
};

const inclusionLabels: Record<Inclusion, string> = {
  flight: "Return flights",
  hotel: "Hotel accommodation",
  meals: "Meals as per itinerary",
  transfer: "Airport & local transfers",
  sightseeing: "Guided sightseeing",
};

export async function generateStaticParams() {
  return allPackages.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pkg = getPackageById(id);
  if (!pkg) return {};
  return {
    title: `${pkg.title} | Snapingo`,
    description: `${pkg.title}: a ${pkg.duration} package for ${pkg.destination}, starting at ₹${pkg.price.toLocaleString("en-IN")} per person.`,
  };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = getPackageById(id);
  if (!pkg) notFound();

  return (
    <>
      <ItineraryPrintView pkg={pkg} />

      <div className="print-hide">
        <DetailHero
          image={pkg.image}
          title={pkg.title}
          breadcrumb={[
            { label: "Packages", href: "/packages" },
            { label: pkg.title },
          ]}
          meta={[
            { icon: <Calendar />, label: pkg.duration },
            { icon: <MapPin />, label: pkg.destination },
            { icon: <Star />, label: `${pkg.rating} (${pkg.reviews.toLocaleString("en-IN")} reviews)` },
          ]}
        />

        <section className="py-16 sm:py-20">
          <div className="container-app grid grid-cols-1 gap-14 lg:grid-cols-[1.6fr_1fr]">
            <div>
              {pkg.badge && (
                <span className="inline-flex rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-brand-600">
                  {pkg.badge}
                </span>
              )}

              <h2 className="mt-4 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
                Package Highlights
              </h2>
              <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {pkg.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <h3 className="font-heading text-xl font-bold text-ink-900">
                  What&apos;s included
                </h3>
                <div className="mt-4 flex flex-wrap gap-3">
                  {pkg.inclusions.map((inc) => {
                    const Icon = inclusionIcons[inc];
                    return (
                      <span
                        key={inc}
                        className="flex items-center gap-2 rounded-full bg-ink-50 px-4 py-2 text-sm font-medium text-ink-700"
                      >
                        <Icon className="h-4 w-4 text-brand-600" />
                        {inclusionLabels[inc]}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="mt-12">
                <h2 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
                  Itinerary
                </h2>
                <div className="mt-8">
                  <ItineraryTimeline days={pkg.itinerary} />
                </div>
              </div>

              <div className="mt-12">
                <h2 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
                  Not included
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {pkg.exclusions.map((ex) => (
                    <li key={ex} className="flex items-start gap-2.5 text-sm text-ink-900">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-ink-300" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <StickyBookingCard
              title={pkg.title}
              price={pkg.price}
              originalPrice={pkg.originalPrice}
              rating={pkg.rating}
              reviews={pkg.reviews}
              duration={pkg.duration}
            />
          </div>
        </section>

        <SimilarPackages currentId={pkg.id} destinationSlug={pkg.destinationSlug} type={pkg.type} />

        {/* Spacer so the mobile sticky bar never covers page content */}
        <div className="h-20 lg:hidden" aria-hidden />
      </div>
    </>
  );
}
