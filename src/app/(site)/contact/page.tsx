import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import { getAllDestinations } from "@/lib/content/destinations";

export const metadata: Metadata = {
  title: "Contact Us | Snapingo",
  description:
    "Get in touch with Snapingo to plan your next trip. Tell us your destination and travel dates, our team replies within a few hours.",
  alternates: { canonical: "/contact" },
};

const address = "NX One, Plot No. 17, Tech Zone 4, Greater Noida West, Uttar Pradesh 201318";
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

export default async function ContactPage() {
  const destinations = await getAllDestinations();

  return (
    <>
      <section className="bg-white pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="container-app">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-heading text-3xl font-bold text-ink-900 sm:text-4xl">
              Let&rsquo;s plan your trip
            </h1>
            <p className="mt-3 text-base text-ink-900 sm:text-lg">
              Share a few details below and our travel team will reach out on WhatsApp within a
              few hours.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-0">
            <div className="flex flex-col gap-8 lg:border-r lg:border-ink-100 lg:pr-12">
              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-900">Phone</p>
                    <a
                      href="tel:+918700368575"
                      className="mt-1 block font-heading text-base font-bold text-ink-900 transition hover:text-brand-600"
                    >
                      +91 87003 68575
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <Mail className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-900">Email</p>
                    <a
                      href="mailto:info@snapingo.com"
                      className="mt-1 block font-heading text-base font-bold text-ink-900 transition hover:text-brand-600"
                    >
                      info@snapingo.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink-900">Address</p>
                    <p className="mt-1 font-heading text-base font-bold leading-snug text-ink-900">
                      {address}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl">
                <iframe
                  title="Snapingo office location"
                  src={mapSrc}
                  width="100%"
                  height="220"
                  loading="lazy"
                  className="block"
                />
              </div>
            </div>

            <div className="lg:pl-12">
              <ContactForm destinations={destinations} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
