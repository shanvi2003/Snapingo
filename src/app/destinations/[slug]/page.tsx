import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Building2,
  Calendar,
  Camera,
  Compass,
  Flame,
  Landmark,
  MapPin,
  Mountain,
  Music,
  Package,
  Sailboat,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Sun,
  Tent,
  TreePine,
  Utensils,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { allDestinations, getDestinationBySlug } from "@/data/destinations";
import { getPackagesByDestinationSlug } from "@/data/packages";
import DetailHero from "@/components/DetailHero";
import Gallery from "@/components/Gallery";
import PackagePillRow from "@/components/PackagePillRow";
import { WhatsappIcon } from "@/components/SocialIcons";

const highlightIcons: Record<string, LucideIcon> = {
  Waves,
  Landmark,
  ShoppingBag,
  Sailboat,
  Mountain,
  Music,
  TreePine,
  Sun,
  Camera,
  Tent,
  Building2,
  Snowflake,
  Compass,
  Sparkles,
  Flame,
  Utensils,
};

export async function generateStaticParams() {
  return allDestinations.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) return {};
  return {
    title: `${destination.name} Packages | Snapingo`,
    description: destination.overview,
  };
}

export default async function DestinationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestinationBySlug(slug);
  if (!destination) notFound();

  const packages = getPackagesByDestinationSlug(slug);
  const waMessage = encodeURIComponent(
    `Hi Snapingo! I'd like to plan a trip to ${destination.name}. Can you help me with the packages?`
  );

  return (
    <>
      <DetailHero
        image={destination.gallery[0]}
        title={destination.name}
        subtitle={destination.tagline}
        animateImage
        breadcrumb={[
          { label: "Destinations", href: "/destinations" },
          { label: destination.name },
        ]}
        meta={[
          { icon: <Calendar />, label: destination.bestTimeToVisit },
          { icon: <MapPin />, label: destination.idealDuration },
          { icon: <Package />, label: `${destination.packages} packages` },
        ]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-app grid grid-cols-1 gap-14 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
              About {destination.name}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-900">
              {destination.overview}
            </p>

            <div className="mt-10">
              <h3 className="font-heading text-xl font-bold text-ink-900">
                Highlights of {destination.name}
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {destination.highlights.map((h) => {
                  const Icon = highlightIcons[h.icon] ?? Sparkles;
                  return (
                    <div
                      key={h.title}
                      className="flex gap-4 rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition hover:shadow-soft"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h4 className="font-heading text-base font-bold text-ink-900">
                          {h.title}
                        </h4>
                        <p className="mt-1 text-sm leading-relaxed text-ink-900">{h.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-heading text-xl font-bold text-ink-900">
                {destination.name} in pictures
              </h3>
              <div className="mt-6">
                <Gallery images={destination.gallery} alt={destination.name} />
              </div>
            </div>
          </div>

          <aside className="rounded-2xl border border-ink-100 bg-ink-50/60 p-6 lg:sticky lg:top-28 lg:self-start">
            <h3 className="font-heading text-lg font-bold text-ink-900">Quick Facts</h3>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <dt className="text-ink-900">Best time to visit</dt>
                <dd className="font-semibold text-ink-900">{destination.bestTimeToVisit}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <dt className="text-ink-900">Ideal duration</dt>
                <dd className="font-semibold text-ink-900">{destination.idealDuration}</dd>
              </div>
              <div className="flex items-center justify-between border-b border-ink-100 pb-3">
                <dt className="text-ink-900">Trip type</dt>
                <dd className="font-semibold capitalize text-ink-900">{destination.type}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-ink-900">Starting price</dt>
                <dd className="font-heading text-lg font-bold text-brand-600">
                  ₹{destination.startingPrice.toLocaleString("en-IN")}
                </dd>
              </div>
            </dl>

            <a
              href={`https://wa.me/918700368575?text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              <WhatsappIcon className="h-4.5 w-4.5" />
              Plan This Trip
            </a>
            <a
              href="#packages"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-brand-400 hover:text-brand-600"
            >
              View Packages
              <ArrowRight className="h-4 w-4" />
            </a>
          </aside>
        </div>
      </section>

      {packages.length > 0 && (
        <section id="packages" className="scroll-mt-24 bg-ink-50/60 py-16 sm:py-20">
          <div className="container-app">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
                Packages for {destination.name}
              </h2>
              <span className="shrink-0 text-sm font-semibold text-ink-900">
                {packages.length} package{packages.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-4">
              {packages.map((pkg) => (
                <PackagePillRow key={pkg.id} pkg={pkg} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-14 text-center shadow-brand sm:px-16 sm:py-16">
            <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
            <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl animate-float" />
            <div className="relative">
              <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold text-white sm:text-4xl">
                Ready to experience {destination.name}?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white sm:text-base">
                Talk to a travel expert and get a custom itinerary built around your dates and budget.
              </p>
              <div className="mx-auto mt-8 flex w-max flex-col gap-3 sm:flex-row">
                <a
                  href={`https://wa.me/918700368575?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink-800"
                >
                  <WhatsappIcon className="h-4 w-4" />
                  Chat With Us
                </a>
                <Link
                  href="/destinations"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5"
                >
                  Explore More Destinations
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
