import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAllFaqs } from "@/lib/content/faq";
import FaqAccordion from "@/components/FaqAccordion";
import { WhatsappIcon } from "@/components/SocialIcons";
import WhatsAppCta from "@/components/WhatsAppCta";
import { JsonLd, faqJsonLd } from "@/lib/structuredData";

export const metadata: Metadata = {
  title: "FAQs | Snapingo",
  description:
    "Answers to common questions about booking, payments, cancellations, refunds, visas and support for Snapingo holiday packages.",
  alternates: { canonical: "/faq" },
};

const waMessage = encodeURIComponent(
  "Hi Snapingo! I had a question that wasn't covered in your FAQ page."
);

export default async function FaqPage() {
  const faqs = await getAllFaqs();
  const allFaqItems = faqs.flatMap((c) => c.items);

  return (
    <>
      <JsonLd data={faqJsonLd(allFaqItems)} />

      <section className="bg-ink-50/60 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="container-app">
          <div className="mx-auto max-w-xl text-center">
            <h1 className="font-heading text-3xl font-bold text-ink-900 sm:text-4xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-3 text-base text-ink-900 sm:text-lg">
              Common questions about booking, payments, cancellations and travel documents.
              Can&apos;t find what you&apos;re looking for? Message us directly.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app max-w-3xl">
          <FaqAccordion categories={faqs} />
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="container-app">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-14 text-center shadow-brand sm:px-16 sm:py-16">
            <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
            <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl animate-float" />
            <div className="relative">
              <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold text-white sm:text-4xl">
                Still have a question?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white sm:text-base">
                Our travel experts are a message away and happy to help with anything not covered
                here.
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
                  href="/contact"
                  className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5"
                >
                  Contact Page
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
