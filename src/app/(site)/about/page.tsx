import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Compass,
  Handshake,
  MapPin,
} from "lucide-react";
import { WhatsappIcon } from "@/components/SocialIcons";
import WhatsAppCta from "@/components/WhatsAppCta";

export const metadata: Metadata = {
  title: "About Us | Snapingo",
  description:
    "Snapingo is a premium travel venture and unit of Snap Tours and Travel Pvt. Ltd., curating seamless, enriching travel experiences across India and around the globe.",
};

const pillars = [
  {
    icon: Compass,
    title: "Personalized Itineraries",
    desc: "Every trip built around you, whether it's an idyllic domestic getaway, a bespoke international vacation, or a corporate retreat.",
  },
  {
    icon: Handshake,
    title: "Trusted Backing",
    desc: "Backed by Snap Tours and Travel Pvt. Ltd., bringing reliable logistics and dependable support to every journey.",
  },
  {
    icon: MapPin,
    title: "Local Insights",
    desc: "On-ground knowledge and personalized support, so your journey stays smooth from departure to arrival.",
  },
  {
    icon: Building2,
    title: "Growing Into Hospitality",
    desc: "Establishing our own facilities, stays and travel amenities, built to set new benchmarks in comfort and service.",
  },
];

export default function AboutPage() {
  const waMessage = encodeURIComponent(
    "Hi Snapingo! I came across your About page and would like to plan a trip. Can you help me?"
  );

  return (
    <>
      <section className="relative flex h-[calc(35vh+4.5rem)] min-h-[340px] items-end overflow-hidden bg-ink-950 lg:h-[70vh] lg:min-h-[480px]">
        <Image
          src="/images/unsplash/1573843981267-be1999ff37cd.jpg"
          alt="Overwater villas in the Maldives at golden hour"
          fill
          loading="eager"
          fetchPriority="high"
          quality={85}
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" />

        <div className="container-app relative pb-16 pt-28 lg:pb-20">
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-[1.05] text-white sm:text-5xl md:text-6xl lg:text-7xl 3xl:max-w-4xl 3xl:text-8xl">
            Redefining Journeys, <span className="text-gradient-brand">Crafting Memories</span>
          </h1>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="container-app relative">
          <div className="mx-auto max-w-3xl text-center 3xl:max-w-4xl">
            <p className="font-heading text-3xl font-bold leading-snug text-ink-900 sm:text-4xl 3xl:text-6xl">
              Travel, to us, is never just about the destination.
            </p>
            <span className="mx-auto mt-4 block h-1 w-16 rounded-full bg-gradient-to-r from-brand-600 to-brand-300" />
            <p className="mx-auto mt-5 max-w-2xl text-xl leading-relaxed text-ink-900 3xl:max-w-3xl 3xl:text-2xl">
              It&rsquo;s the stories you create, the cultures you discover, and the moments
              that stay with you forever. Welcome to Snapingo, a premium travel venture and
              unit of Snap Tours and Travel Pvt. Ltd. As a modern Indian travel and tourism
              enterprise, we&rsquo;re dedicated to curating seamless, enriching, and
              unforgettable experiences, across India and around the globe.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink-50/60 py-16 sm:py-20">
        <div className="container-app grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl 3xl:text-6xl">
              Who We Are
            </h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-600 to-brand-300 3xl:h-1.5 3xl:w-20" />
            <p className="mt-5 text-lg leading-relaxed text-ink-900 3xl:text-xl">
              Snapingo was founded with a singular vision: to make world-class travel
              accessible, effortless, and deeply personal. Whether it&rsquo;s an idyllic
              domestic getaway, a bespoke international vacation, a cultural expedition, or a
              corporate retreat, we craft every itinerary with meticulous attention to
              detail.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-ink-900 3xl:text-xl">
              Backed by the expertise and trusted foundation of Snap Tours and Travel Pvt.
              Ltd., we bring together reliable logistics, local insights, and personalized
              support to ensure your journey is smooth from departure to arrival.
            </p>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 rounded-full bg-brand-400/30 blur-3xl animate-blob" />
            <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-gold-400/25 blur-3xl animate-float" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-brand ring-4 ring-white">
              <Image
                src="/images/unsplash/1539635278303-d4002c07eae3.jpg"
                alt="A group of friends laughing together on a mountain hike"
                fill
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="mx-auto max-w-xl text-center 3xl:max-w-2xl">
            <h2 className="font-heading text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl 3xl:text-6xl">
              Built Around Your Journey
            </h2>
            <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-600 to-brand-300 3xl:h-1.5 3xl:w-20" />
          </div>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group relative overflow-hidden rounded-2xl border border-ink-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-brand 3xl:p-8"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-600 via-brand-400 to-gold-400 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 text-brand-600 transition group-hover:from-brand-600 group-hover:to-brand-500 group-hover:text-white 3xl:h-14 3xl:w-14">
                  <p.icon className="h-5 w-5 3xl:h-7 3xl:w-7" />
                </span>
                <h3 className="mt-4 font-heading text-lg font-bold text-ink-900 3xl:text-xl">
                  {p.title}
                </h3>
                <p className="mt-1.5 text-base leading-relaxed text-ink-900 3xl:text-lg">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink-50/60 py-16 sm:py-20">
        <div className="container-app grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative lg:order-2">
            <div className="pointer-events-none absolute -left-6 -top-6 h-40 w-40 rounded-full bg-brand-400/30 blur-3xl animate-blob" />
            <div className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-gold-400/25 blur-3xl animate-float" />
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-brand ring-4 ring-white">
              <Image
                src="/images/unsplash/1566073771259-6a8506099945.jpg"
                alt="A luxury overwater resort at dusk"
                fill
                quality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
          <div className="lg:order-1">
            <h2 className="font-heading text-3xl font-bold text-ink-900 sm:text-4xl lg:text-5xl 3xl:text-6xl">
              Our Vision &amp; Expansion
            </h2>
            <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-brand-600 to-brand-300 3xl:h-1.5 3xl:w-20" />
            <p className="mt-5 text-lg leading-relaxed text-ink-900 3xl:text-xl">
              We are not just building itineraries; we are building ecosystems of comfort
              and luxury. As we expand, Snapingo is actively establishing its presence in
              the hospitality sector, developing world-class facilities, stays, and travel
              amenities designed to set new benchmarks in comfort, warmth, and service
              excellence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-14 text-center shadow-brand sm:px-16 sm:py-16">
            <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
            <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl animate-float" />
            <div className="relative">
              <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold text-white sm:text-4xl 3xl:max-w-2xl 3xl:text-5xl">
                Ready to start your journey with us?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-base text-white sm:text-lg 3xl:max-w-lg 3xl:text-xl">
                Talk to a travel expert and get a custom itinerary built around your dates
                and budget.
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
                  href="/destinations"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5"
                >
                  Explore Destinations
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
