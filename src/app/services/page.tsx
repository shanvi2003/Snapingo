import type { Metadata } from "next";
import { services } from "@/data/services";
import ServiceCard from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Our Services | Snapingo",
  description:
    "Flights, hotels and cabs & transfers booked through Snapingo's trusted partners, plus a self-guided way to plan your trip on our website.",
};

export default function ServicesPage() {
  return (
    <section className="bg-ink-50/60 pb-16 pt-28 sm:pb-20 sm:pt-32">
      <div className="container-app">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-heading text-3xl font-bold text-ink-900 sm:text-4xl">
            Our Services
          </h1>
          <p className="mt-3 text-base text-ink-900 sm:text-lg">
            Beyond holiday packages, we book the individual pieces of your trip too, through
            trusted partners, or help you plan it yourself right here on the website.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => (
            <ServiceCard key={service.slug} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
