import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { hotDealPackages } from "@/data/packages";
import PackageCard from "@/components/PackageCard";
import { WhatsappIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  title: "Hot Deals | Snapingo",
  description:
    "Limited-time holiday package deals, flat discounts and exclusive offers from Snapingo.",
};

const waMessage = encodeURIComponent(
  "Hi Snapingo! I'd like to know about your current Hot Deals."
);

export default function HotDealsPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -left-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl animate-float" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-gold-400/20 blur-3xl animate-float" />
        <div className="container-app relative">
          <div className="mx-auto max-w-xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
              <Flame className="h-3.5 w-3.5" />
              Limited Time
            </span>
            <h1 className="mt-4 font-heading text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Hot Deals
            </h1>
            <p className="mt-3 text-base text-white/90 sm:text-lg">
              Handpicked backpacking trips and getaways at their lowest prices, updated
              regularly. Grab them before they&apos;re gone.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-app">
          {hotDealPackages.length > 0 ? (
            <>
              <p className="text-sm font-semibold text-ink-900">
                {hotDealPackages.length} deal{hotDealPackages.length === 1 ? "" : "s"} live right
                now
              </p>

              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {hotDealPackages.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            </>
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl border border-ink-100 bg-ink-50/60 px-6 py-14 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
                <Flame className="h-7 w-7" />
              </span>
              <h2 className="font-heading text-xl font-bold text-ink-900">
                New deals dropping soon
              </h2>
              <p className="text-sm leading-relaxed text-ink-900">
                We&apos;re curating this week&apos;s best-priced packages. Message us on
                WhatsApp and we&apos;ll personally send you the latest deal for your dates.
              </p>
              <a
                href={`https://wa.me/918700368575?text=${waMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
              >
                <WhatsappIcon className="h-4 w-4" />
                Ask About Deals
              </a>
            </div>
          )}
        </div>
      </section>

      {hotDealPackages.length > 0 && (
        <section className="pb-16 sm:pb-20">
          <div className="container-app">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 px-6 py-14 text-center shadow-brand sm:px-16 sm:py-16">
              <div className="bg-noise pointer-events-none absolute inset-0 opacity-20" />
              <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl animate-float" />
              <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-gold-400/20 blur-3xl animate-float" />
              <div className="relative">
                <h2 className="mx-auto max-w-xl font-heading text-3xl font-bold text-white sm:text-4xl">
                  Not sure which deal fits your trip?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-white sm:text-base">
                  Tell us your dates and group size, our travel experts will match you with the
                  right package.
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
                    href="/packages"
                    className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5"
                  >
                    Browse All Packages
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
