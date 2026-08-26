import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Compass,
  Handshake,
  Headset,
  LayoutGrid,
  MapPin,
  MessageCircle,
  PlaneLanding,
  RefreshCcw,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getAllServices, getServiceBySlug } from "@/lib/content/services";
import { getAllDestinations } from "@/lib/content/destinations";
import DetailHero from "@/components/DetailHero";
import { WhatsappIcon } from "@/components/SocialIcons";
import WhatsAppCta from "@/components/WhatsAppCta";
import HotelBookingModal from "@/components/HotelBookingModal";
import FlightBookingModal from "@/components/FlightBookingModal";
import TravelGuideModal from "@/components/TravelGuideModal";
import CabBookingModal from "@/components/CabBookingModal";
import { JsonLd, breadcrumbJsonLd } from "@/lib/structuredData";

const highlightIcons: Record<string, LucideIcon> = {
  Search,
  RefreshCcw,
  Users,
  Headset,
  BadgeCheck,
  Wallet,
  Handshake,
  CalendarClock,
  Sparkles,
  PlaneLanding,
  Route,
  MapPin,
  ShieldCheck,
  Compass,
  LayoutGrid,
  MessageCircle,
};

export async function generateStaticParams() {
  const services = await getAllServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};
  const title = `${service.name} | Snapingo`;
  return {
    title,
    description: service.overview,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title,
      description: service.overview,
      url: `/services/${service.slug}`,
      images: [{ url: service.image, width: 1200, height: 630, alt: service.name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: service.overview,
      images: [service.image],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const needsDestinations =
    slug === "hotels" || slug === "flights" || slug === "travel-guide" || slug === "cabs-transfers";
  const destinations = needsDestinations ? await getAllDestinations() : [];

  const waMessage = encodeURIComponent(
    `Hi Snapingo! I'd like to know more about your ${service.name} service. Can you help me?`
  );

  return (
    <>
      {service.slug === "hotels" && <HotelBookingModal destinations={destinations} />}
      {service.slug === "flights" && <FlightBookingModal destinations={destinations} />}
      {service.slug === "travel-guide" && <TravelGuideModal destinations={destinations} />}
      {service.slug === "cabs-transfers" && <CabBookingModal destinations={destinations} />}

      <JsonLd data={breadcrumbJsonLd([{ label: "Services", href: "/services" }, { label: service.name }])} />

      <DetailHero
        image={service.image}
        title={service.name}
        subtitle={service.tagline}
        animateImage
        breadcrumb={[{ label: "Services" }, { label: service.name }]}
      />

      <section className="py-16 sm:py-20">
        <div className="container-app grid grid-cols-1 gap-14 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
              About our {service.name} service
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-900 lg:max-w-2xl">
              {service.overview}
            </p>

            <div className="mt-10">
              <h3 className="font-heading text-xl font-bold text-ink-900">
                What&rsquo;s included
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {service.highlights.map((h) => {
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
          </div>

          <aside className="rounded-2xl border border-ink-100 bg-ink-50/60 p-6 lg:sticky lg:top-28 lg:self-start">
            <h3 className="font-heading text-lg font-bold text-ink-900">Get Started</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink-900">
              Tell us what you need and our team will get back to you on WhatsApp within a few
              hours with options and pricing.
            </p>
            <WhatsAppCta
              href={`https://wa.me/918700368575?text=${waMessage}`}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              <WhatsappIcon className="h-4.5 w-4.5" />
              Chat With Us
            </WhatsAppCta>
            <a
              href="tel:+918700368575"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-ink-800 transition hover:border-brand-400 hover:text-brand-600"
            >
              Talk to a Travel Expert
            </a>
          </aside>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-14 text-center shadow-brand sm:px-16 sm:py-16">
            <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
            <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl animate-float" />
            <div className="relative">
              <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold text-white sm:text-4xl">
                Ready to plan your trip?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white sm:text-base">
                Talk to a travel expert and get a custom plan built around your dates and budget.
              </p>
              <div className="mx-auto mt-8 flex w-max flex-col gap-3 sm:flex-row">
                <WhatsAppCta
                  href={`https://wa.me/918700368575?text=${waMessage}`}
                  className="flex items-center justify-center gap-2 rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink-800"
                >
                  <WhatsappIcon className="h-4 w-4" />
                  Chat With Us
                </WhatsAppCta>
                <Link
                  href="/packages"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5"
                >
                  Explore Packages
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
